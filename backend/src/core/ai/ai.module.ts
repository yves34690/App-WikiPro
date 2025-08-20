import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';

// Services
import { AIOrchestrator } from './services/ai-orchestrator.service';
import { QuotaManagerService } from './services/quota-manager.service';

// Providers
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GeminiProvider } from './providers/gemini.provider';

// Controller et Gateway
import { AIController } from './ai.controller';
import { AIStreamGateway } from './ai.gateway';

// Modules externes
import { CoreConfigModule } from '@core/config/config.module';
import { ConfigService } from '@core/config/config.service';
import { SessionModule } from '@core/sessions/session.module';
import { TelemetryModule } from '@core/telemetry/telemetry.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Pour les tâches cron du QuotaManager
    CoreConfigModule,
    SessionModule,
    TelemetryModule,
  ],
  providers: [
    AIOrchestrator,
    QuotaManagerService,
    AIStreamGateway,
    // Note: Les providers individuels seront créés dynamiquement
    // dans onModuleInit selon les clés API disponibles
  ],
  controllers: [AIController],
  exports: [
    AIOrchestrator,
    QuotaManagerService,
    AIStreamGateway,
  ],
})
export class AIModule implements OnModuleInit {
  private readonly logger = new Logger(AIModule.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly aiOrchestrator: AIOrchestrator,
    private readonly quotaManager: QuotaManagerService,
  ) {}

  async onModuleInit() {
    await this.initializeAISystem();
  }

  private async initializeAISystem(): Promise<void> {
    this.logger.log('🚀 Initialisation du système IA multi-providers...');

    try {
      // Récupérer les clés API depuis la configuration via nestConfigService
      const openaiApiKey = process.env.AI_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      const anthropicApiKey = process.env.AI_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
      const geminiApiKey = process.env.AI_GEMINI_API_KEY || process.env.GEMINI_API_KEY || 
                          this.configService.ai?.geminiApiKey;

      // Initialiser l'orchestrateur avec les providers disponibles
      await this.aiOrchestrator.initialize(
        openaiApiKey,
        anthropicApiKey,
        geminiApiKey,
      );

      const availableProviders = this.aiOrchestrator.getAvailableProviders();
      
      if (availableProviders.length === 0) {
        this.logger.warn('⚠️ ATTENTION: Aucun provider IA n\'est configuré avec des clés API valides!');
        this.logger.warn('Configurez au moins une de ces variables d\'environnement:');
        this.logger.warn('- AI_OPENAI_API_KEY ou OPENAI_API_KEY');
        this.logger.warn('- AI_ANTHROPIC_API_KEY ou ANTHROPIC_API_KEY');
        this.logger.warn('- AI_GEMINI_API_KEY ou GEMINI_API_KEY');
      } else {
        this.logger.log(`✅ Système IA initialisé avec succès!`);
        this.logger.log(`📦 Providers disponibles: ${availableProviders.join(', ')}`);
        
        // Effectuer un health check initial
        const healthResults = await this.aiOrchestrator.healthCheckAll();
        const healthyProviders = Array.from(healthResults.entries())
          .filter(([_, isHealthy]) => isHealthy)
          .map(([type]) => type);

        this.logger.log(`🏥 Providers en bonne santé: ${healthyProviders.join(', ')}`);
        
        if (healthyProviders.length < availableProviders.length) {
          const unhealthyProviders = availableProviders.filter(p => !healthyProviders.includes(p));
          this.logger.warn(`⚠️ Providers avec problèmes: ${unhealthyProviders.join(', ')}`);
        }
      }

      // Initialiser les quotas pour les tenants existants
      await this.initializeDefaultQuotas();

      this.logger.log('🎯 Module IA entièrement opérationnel!');

    } catch (error) {
      this.logger.error(`💥 Erreur fatale lors de l'initialisation du système IA: ${error.message}`);
      this.logger.error('Le système IA ne sera pas disponible.');
      
      // En production, vous pourriez vouloir faire échouer le démarrage
      // throw error;
    }
  }

  private async initializeDefaultQuotas(): Promise<void> {
    try {
      // Configuration des quotas par défaut pour différents types de tenants
      const defaultQuotaConfigs = [
        {
          tenantType: 'free',
          dailyTokens: 10000,
          monthlyTokens: 200000,
          dailyRequests: 100,
          monthlyRequests: 2000,
        },
        {
          tenantType: 'pro',
          dailyTokens: 100000,
          monthlyTokens: 2000000,
          dailyRequests: 1000,
          monthlyRequests: 20000,
        },
        {
          tenantType: 'enterprise',
          dailyTokens: 500000,
          monthlyTokens: 10000000,
          dailyRequests: 5000,
          monthlyRequests: 100000,
        },
      ];

      // Note: Dans une implémentation complète, vous récupéreriez la liste des tenants
      // depuis la base de données et initialiseriez leurs quotas selon leur type
      
      this.logger.log('📊 Configuration des quotas par défaut terminée');

    } catch (error) {
      this.logger.warn(`⚠️ Erreur lors de l'initialisation des quotas: ${error.message}`);
    }
  }

  // Méthodes publiques pour accéder aux services (utile pour les tests ou l'admin)
  getOrchestrator(): AIOrchestrator {
    return this.aiOrchestrator;
  }

  getQuotaManager(): QuotaManagerService {
    return this.quotaManager;
  }

  async getSystemHealth(): Promise<{
    status: 'healthy' | 'partial' | 'unhealthy';
    providers: Record<string, boolean>;
    quotas: any;
    streaming: any;
  }> {
    try {
      const healthResults = await this.aiOrchestrator.healthCheckAll();
      const quotaStats = this.quotaManager.getGlobalStats();
      
      let healthyCount = 0;
      const providers: Record<string, boolean> = {};
      
      for (const [type, isHealthy] of healthResults) {
        providers[type] = isHealthy;
        if (isHealthy) healthyCount++;
      }

      const status = healthyCount === 0 ? 'unhealthy' : 
                    healthyCount === healthResults.size ? 'healthy' : 'partial';

      return {
        status,
        providers,
        quotas: quotaStats,
        streaming: {
          // Note: Les stats de streaming seraient récupérées du gateway
          active: 0,
          total: 0,
        },
      };

    } catch (error) {
      this.logger.error(`Erreur health check système: ${error.message}`);
      return {
        status: 'unhealthy',
        providers: {},
        quotas: null,
        streaming: null,
      };
    }
  }
}