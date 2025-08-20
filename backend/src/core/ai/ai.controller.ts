import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  HttpException,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/auth/guards/jwt-auth.guard';
import { TenantGuard } from '@core/auth/guards/tenant.guard';
import { AIOrchestrator } from './services/ai-orchestrator.service';
import { QuotaManagerService } from './services/quota-manager.service';
import { AIStreamGateway } from './ai.gateway';
import { SessionService } from '@core/sessions/session.service';
import { CreateConversationDto } from '@core/sessions/dto';
import {
  ChatRequestDto,
  ProviderStatusDto,
  ProviderMetricsDto,
} from './dto';
import {
  AIProviderType,
  ChatRequest,
  ChatResponse,
} from './providers/base-provider';
import { AIProvider } from '@core/sessions/entities/session.entity';

@ApiTags('IA - Intelligence Artificielle')
@Controller('api/v1/:tenant_slug/ai')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class AIController {
  private readonly logger = new Logger(AIController.name);

  constructor(
    private readonly aiOrchestrator: AIOrchestrator,
    private readonly quotaManager: QuotaManagerService,
    private readonly streamGateway: AIStreamGateway,
    private readonly sessionService: SessionService,
  ) {}

  @Post('chat')
  @ApiOperation({
    summary: 'Chat synchrone avec IA',
    description: 'Envoie un message à l\'IA et reçoit une réponse complète. Supporte le fallback automatique entre providers.',
  })
  @ApiHeader({
    name: 'X-Preferred-Provider',
    description: 'Provider IA préféré (openai, anthropic, gemini)',
    required: false,
  })
  @ApiParam({
    name: 'tenant_slug',
    description: 'Slug du tenant',
  })
  @ApiResponse({
    status: 200,
    description: 'Réponse de l\'IA reçue avec succès',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'object',
          properties: {
            role: { type: 'string', example: 'assistant' },
            content: { type: 'string', example: 'Voici ma réponse...' },
          },
        },
        tokensUsed: { type: 'number', example: 150 },
        finishReason: { type: 'string', example: 'stop' },
        provider: { type: 'string', example: 'openai' },
        duration: { type: 'number', example: 1250 },
        sessionId: { type: 'string', example: 'uuid' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Quota dépassé',
  })
  @ApiResponse({
    status: 503,
    description: 'Tous les providers IA sont indisponibles',
  })
  async chatCompletion(
    @Param('tenant_slug') tenantSlug: string,
    @Body() chatRequest: ChatRequestDto,
    @Headers('x-preferred-provider') preferredProvider?: string,
    @Headers('x-user-id') userId?: string,
  ): Promise<{
    message: any;
    tokensUsed: number;
    finishReason: string;
    provider: string;
    duration: number;
    sessionId?: string;
  }> {
    try {
      this.logger.log(`💬 Chat request pour tenant ${tenantSlug} (${chatRequest.messages.length} messages)`);

      // Validation du provider préféré
      let providerType: AIProviderType | undefined;
      if (preferredProvider) {
        if (Object.values(AIProviderType).includes(preferredProvider as AIProviderType)) {
          providerType = preferredProvider as AIProviderType;
        } else {
          throw new HttpException(
            `Provider invalide: ${preferredProvider}. Providers supportés: ${Object.values(AIProviderType).join(', ')}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      // Construire la requête pour l'orchestrateur
      const request: ChatRequest = {
        messages: chatRequest.messages,
        maxTokens: chatRequest.maxTokens,
        temperature: chatRequest.temperature,
        stopSequences: chatRequest.stopSequences,
        stream: false,
        sessionId: chatRequest.sessionId,
        tenantId: tenantSlug,
        preferredProvider: providerType,
      };

      // Estimation des tokens pour vérification préalable des quotas
      const estimatedTokens = this.estimateTokens(request.messages);
      
      // Vérification des quotas
      const quotaCheck = await this.quotaManager.checkTenantQuotas(
        tenantSlug,
        estimatedTokens,
        providerType || AIProviderType.OPENAI,
      );

      if (!quotaCheck.allowed) {
        throw new HttpException(
          `Quota dépassé: ${quotaCheck.reason}`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Exécuter la requête
      const startTime = Date.now();
      const response: ChatResponse = await this.aiOrchestrator.chatCompletion(request);
      const duration = Date.now() - startTime;

      // Consommer les quotas
      await this.quotaManager.consumeQuota(
        tenantSlug,
        response.tokensUsed,
        response.provider,
      );

      // Persister dans une session si spécifiée
      let persistedSessionId: string | undefined;
      if (chatRequest.sessionId && userId) {
        try {
          // D'abord créer la conversation avec le message utilisateur
          const conversationDto = new CreateConversationDto({
            message: chatRequest.messages[chatRequest.messages.length - 1]?.content || '',
            metadata: {
              temperature: chatRequest.temperature,
              maxTokens: chatRequest.maxTokens,
              provider: response.provider,
              aiResponse: response.message.content,
              tokensUsed: response.tokensUsed,
              finishReason: response.finishReason,
              duration: response.duration,
            },
          });
          
          const conversation = await this.sessionService.createConversation(
            chatRequest.sessionId,
            conversationDto,
          );

          // TODO: Puis mettre à jour la conversation avec la réponse IA
          // Cette fonctionnalité devra être ajoutée au SessionService
          
          persistedSessionId = chatRequest.sessionId;
        } catch (sessionError) {
          this.logger.warn(`⚠️ Échec sauvegarde session: ${sessionError.message}`);
        }
      }

      this.logger.log(`✅ Chat terminé en ${duration}ms avec ${response.provider} (${response.tokensUsed} tokens)`);

      return {
        message: response.message,
        tokensUsed: response.tokensUsed,
        finishReason: response.finishReason,
        provider: response.provider,
        duration: response.duration,
        sessionId: persistedSessionId,
      };

    } catch (error) {
      this.logger.error(`❌ Erreur chat completion: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }

      // Vérifier le type d'erreur pour le status HTTP approprié
      if (error.message.includes('quota') || error.message.includes('limit')) {
        throw new HttpException(error.message, HttpStatus.TOO_MANY_REQUESTS);
      }

      if (error.message.includes('indisponible') || error.message.includes('unavailable')) {
        throw new HttpException(error.message, HttpStatus.SERVICE_UNAVAILABLE);
      }

      throw new HttpException(
        'Erreur interne lors du traitement de votre demande',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('providers')
  @ApiOperation({
    summary: 'Statut des providers IA',
    description: 'Récupère la liste des providers disponibles avec leurs métriques et quotas.',
  })
  @ApiParam({
    name: 'tenant_slug',
    description: 'Slug du tenant',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des providers avec leurs statuts',
    schema: {
      type: 'object',
      properties: {
        providers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', example: 'openai' },
              name: { type: 'string', example: 'OpenAI GPT' },
              status: { type: 'string', example: 'available' },
              available: { type: 'boolean', example: true },
              config: { type: 'object' },
              metrics: { type: 'object' },
              quotas: { type: 'object' },
            },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getProvidersStatus(
    @Param('tenant_slug') tenantSlug: string,
  ): Promise<{
    providers: any[];
    quotas: any;
    timestamp: Date;
  }> {
    try {
      this.logger.debug(`📊 Récupération statut providers pour ${tenantSlug}`);

      // Récupérer le statut des providers
      const providersStatus = this.aiOrchestrator.getProviderStatus();
      const availableProviders = this.aiOrchestrator.getAvailableProviders();

      // Construire la réponse
      const providers = Array.from(providersStatus.entries()).map(([type, data]) => {
        const providerQuotas = this.quotaManager.getProviderQuotas(type);
        
        return {
          type,
          name: data.provider.name,
          status: data.provider.getStatus(),
          available: data.provider.isAvailable(),
          config: {
            enabled: data.provider.getConfig().enabled,
            priority: data.provider.getConfig().priority,
            maxTokensPerRequest: data.provider.getConfig().maxTokensPerRequest,
            models: data.provider.getConfig().models,
          },
          metrics: data.provider.getMetrics(),
          quotas: providerQuotas ? {
            dailyLimit: providerQuotas.globalDailyLimit,
            monthlyLimit: providerQuotas.globalMonthlyLimit,
            currentDaily: providerQuotas.currentGlobalDaily,
            currentMonthly: providerQuotas.currentGlobalMonthly,
            dailyUsagePercent: Math.round((providerQuotas.currentGlobalDaily / providerQuotas.globalDailyLimit) * 100),
            monthlyUsagePercent: Math.round((providerQuotas.currentGlobalMonthly / providerQuotas.globalMonthlyLimit) * 100),
          } : null,
        };
      });

      // Quotas du tenant
      const tenantQuotas = this.quotaManager.getTenantQuotas(tenantSlug);
      
      return {
        providers,
        quotas: {
          tenant: tenantQuotas ? {
            dailyTokens: {
              current: tenantQuotas.currentDailyTokens,
              limit: tenantQuotas.dailyTokenLimit,
              usagePercent: Math.round((tenantQuotas.currentDailyTokens / tenantQuotas.dailyTokenLimit) * 100),
            },
            monthlyTokens: {
              current: tenantQuotas.currentMonthlyTokens,
              limit: tenantQuotas.monthlyTokenLimit,
              usagePercent: Math.round((tenantQuotas.currentMonthlyTokens / tenantQuotas.monthlyTokenLimit) * 100),
            },
            dailyRequests: {
              current: tenantQuotas.currentDailyRequests,
              limit: tenantQuotas.dailyRequestLimit,
              usagePercent: Math.round((tenantQuotas.currentDailyRequests / tenantQuotas.dailyRequestLimit) * 100),
            },
          } : null,
          alerts: this.quotaManager.getRecentAlerts(5),
        },
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error(`❌ Erreur récupération providers: ${error.message}`);
      throw new HttpException(
        'Erreur lors de la récupération du statut des providers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health check des providers IA',
    description: 'Vérifie la santé de tous les providers IA disponibles.',
  })
  @ApiParam({
    name: 'tenant_slug',
    description: 'Slug du tenant',
  })
  @ApiResponse({
    status: 200,
    description: 'Résultats du health check',
    schema: {
      type: 'object',
      properties: {
        overall: { type: 'string', example: 'healthy' },
        providers: {
          type: 'object',
          additionalProperties: { type: 'boolean' },
        },
        availableProviders: {
          type: 'array',
          items: { type: 'string' },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  async healthCheck(
    @Param('tenant_slug') tenantSlug: string,
  ): Promise<{
    overall: string;
    providers: Record<string, boolean>;
    availableProviders: string[];
    timestamp: Date;
  }> {
    try {
      this.logger.debug(`🏥 Health check pour ${tenantSlug}`);

      const healthResults = await this.aiOrchestrator.healthCheckAll();
      const availableProviders = this.aiOrchestrator.getAvailableProviders();

      const providers: Record<string, boolean> = {};
      let healthyCount = 0;

      for (const [type, isHealthy] of healthResults) {
        providers[type] = isHealthy;
        if (isHealthy) healthyCount++;
      }

      const overall = healthyCount > 0 ? 
        (healthyCount === healthResults.size ? 'healthy' : 'partial') : 
        'unhealthy';

      return {
        overall,
        providers,
        availableProviders,
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error(`❌ Erreur health check: ${error.message}`);
      throw new HttpException(
        'Erreur lors du health check',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Statistiques du système IA',
    description: 'Récupère les statistiques globales du système IA (quotas, streaming, etc.).',
  })
  @ApiParam({
    name: 'tenant_slug',
    description: 'Slug du tenant',
  })
  async getStats(
    @Param('tenant_slug') tenantSlug: string,
  ): Promise<{
    quotas: any;
    streaming: any;
    providers: any;
    timestamp: Date;
  }> {
    try {
      const quotaStats = this.quotaManager.getGlobalStats();
      const streamStats = this.streamGateway.getStats();
      const providersStatus = this.aiOrchestrator.getProviderStatus();

      return {
        quotas: quotaStats,
        streaming: streamStats,
        providers: {
          total: providersStatus.size,
          available: this.aiOrchestrator.getAvailableProviders().length,
        },
        timestamp: new Date(),
      };

    } catch (error) {
      this.logger.error(`❌ Erreur récupération stats: ${error.message}`);
      throw new HttpException(
        'Erreur lors de la récupération des statistiques',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===== MÉTHODES UTILITAIRES PRIVÉES =====

  private estimateTokens(messages: any[]): number {
    const totalChars = messages.reduce((total, msg) => total + (msg.content?.length || 0), 0);
    return Math.ceil(totalChars / 4);
  }

  private mapProviderToEnum(providerType: AIProviderType): AIProvider {
    switch (providerType) {
      case AIProviderType.OPENAI: return AIProvider.OPENAI;
      case AIProviderType.ANTHROPIC: return AIProvider.ANTHROPIC;
      case AIProviderType.GEMINI: return AIProvider.GEMINI;
      default: return AIProvider.OPENAI;
    }
  }
}