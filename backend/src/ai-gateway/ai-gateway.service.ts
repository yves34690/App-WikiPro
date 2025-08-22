import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { 
  LLMProvider, 
  LLMRequest, 
  LLMResponse, 
  ProviderRouting,
  ProviderConfiguration 
} from './interfaces/llm-provider.interface';
import { 
  AIResponse, 
  RAGResponse, 
  RAGDocument,
  ChatContextResponse 
} from './interfaces/ai-response.interface';
import { 
  HealthStatus, 
  ProviderStatus, 
  PerformanceMetrics,
  UsageStats 
} from './interfaces/health.interface';
import { BaseAIGatewayProvider } from './providers/base.provider';
import { MockProvider } from './providers/mock.provider';
import { TelemetryService } from '@core/telemetry/telemetry.service';

@Injectable()
export class AIGatewayService {
  private readonly logger = new Logger(AIGatewayService.name);
  private readonly providers = new Map<LLMProvider, BaseAIGatewayProvider>();
  private readonly providerRouting: ProviderRouting[] = [];
  private readonly usageStats: UsageStats = {
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    requestsByProvider: {},
    tokensByProvider: {},
    costByProvider: {},
    period: {
      start: new Date(),
      end: new Date(),
    },
  };

  constructor(
    private configService: ConfigService,
    private telemetryService: TelemetryService,
  ) {
    this.initializeProviders();
  }

  /**
   * Mock intelligent pour développement
   */
  async mockChatCompletion(message: string, context?: string): Promise<AIResponse> {
    this.logger.log(`Mock chat completion demandé: ${message.substring(0, 50)}...`);
    
    const startTime = Date.now();
    const mockProvider = this.providers.get(LLMProvider.MOCK);
    
    if (!mockProvider) {
      throw new Error('MockProvider non disponible');
    }

    try {
      const request: LLMRequest = {
        prompt: message,
        context,
        tenantId: 'mock-tenant',
        maxTokens: 1000,
        temperature: 0.7,
      };

      const response = await mockProvider.processRequest(request);
      
      // Convertir en AIResponse
      const aiResponse: AIResponse = {
        success: true,
        content: response.text,
        tokensUsed: response.tokensUsed,
        responseTime: Date.now() - startTime,
        provider: response.provider,
        model: response.model,
        confidence: response.metadata?.confidenceScore,
        metadata: {
          temperature: request.temperature,
          maxTokens: request.maxTokens,
          finishReason: response.finishReason,
          ...response.metadata,
        },
      };

      // Mettre à jour les statistiques
      this.updateUsageStats(response.provider, response.tokensUsed);
      
      // Télémétrie
      this.telemetryService.trackEvent({
        event: 'ai.gateway.mock.completion',
        tenantId: 'mock-tenant',
        metadata: {
          responseTime: aiResponse.responseTime,
          tokensUsed: aiResponse.tokensUsed,
          success: true,
        },
      });

      return aiResponse;
    } catch (error) {
      this.logger.error(`Erreur mock completion: ${error.message}`, error.stack);
      
      this.telemetryService.trackEvent({
        event: 'ai.gateway.mock.error',
        tenantId: 'mock-tenant',
        metadata: {
          error: error.message,
          responseTime: Date.now() - startTime,
        },
      });

      throw error;
    }
  }

  /**
   * Router multi-LLM avec fallback automatique
   */
  async routeToProvider(
    provider: LLMProvider, 
    prompt: string, 
    tenantId: string = 'default',
    options?: {
      context?: string;
      maxTokens?: number;
      temperature?: number;
      systemPrompt?: string;
    }
  ): Promise<LLMResponse> {
    this.logger.log(`Routing vers ${provider} pour tenant ${tenantId}`);
    
    const targetProvider = this.providers.get(provider);
    if (!targetProvider) {
      throw new NotFoundException(`Provider ${provider} non trouvé`);
    }

    const request: LLMRequest = {
      prompt,
      tenantId,
      context: options?.context,
      maxTokens: options?.maxTokens || 1000,
      temperature: options?.temperature || 0.7,
      systemPrompt: options?.systemPrompt,
    };

    try {
      const response = await targetProvider.processRequest(request);
      
      // Mettre à jour les statistiques
      this.updateUsageStats(provider, response.tokensUsed);
      
      // Télémétrie
      this.telemetryService.trackEvent({
        event: 'ai.gateway.route.success',
        tenantId,
        metadata: {
          provider: provider,
          responseTime: response.responseTime,
          tokensUsed: response.tokensUsed,
        },
      });

      return response;
    } catch (error) {
      this.logger.error(`Erreur provider ${provider}: ${error.message}`);
      
      // Tentative de fallback
      const fallbackProvider = this.getFallbackProvider(provider);
      if (fallbackProvider && fallbackProvider !== provider) {
        this.logger.warn(`Tentative de fallback vers ${fallbackProvider}`);
        return this.routeToProvider(fallbackProvider, prompt, tenantId, options);
      }
      
      this.telemetryService.trackEvent({
        event: 'ai.gateway.route.error',
        tenantId,
        metadata: {
          provider: provider,
          error: error.message,
        },
      });

      throw error;
    }
  }

  /**
   * Validation des clés API et configuration
   */
  async validateAPIKeys(): Promise<HealthStatus> {
    this.logger.log('Validation des clés API et configuration');
    
    const providerStatuses: ProviderStatus[] = [];
    let overallHealth: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    for (const [providerName, provider] of this.providers) {
      try {
        const status = await provider.healthCheck();
        providerStatuses.push(status);
        
        if (status.status === 'degraded') {
          overallHealth = 'degraded';
        } else if (status.status === 'unavailable' && overallHealth !== 'degraded') {
          overallHealth = 'unhealthy';
        }
      } catch (error) {
        this.logger.error(`Health check failed for ${providerName}: ${error.message}`);
        providerStatuses.push({
          provider: providerName,
          status: 'unavailable',
          enabled: false,
          responseTime: -1,
          errorRate: 100,
          lastCheck: new Date(),
          metadata: { error: error.message },
        });
        overallHealth = 'unhealthy';
      }
    }

    const healthStatus: HealthStatus = {
      overall: overallHealth,
      providers: providerStatuses,
      checks: [
        {
          name: 'providers-availability',
          status: overallHealth === 'healthy' ? 'pass' : 'warn',
          timestamp: new Date(),
          details: `${providerStatuses.filter(p => p.status === 'available').length}/${providerStatuses.length} providers disponibles`,
        }
      ],
      lastUpdated: new Date(),
      metadata: {
        uptime: process.uptime(),
        totalRequests: this.usageStats.totalRequests,
        errorRate: this.calculateOverallErrorRate(),
        averageResponseTime: this.calculateAverageResponseTime(),
      },
    };

    return healthStatus;
  }

  /**
   * Statut des providers
   */
  async getProviderStatus(): Promise<ProviderStatus[]> {
    const statuses: ProviderStatus[] = [];
    
    for (const [providerName, provider] of this.providers) {
      try {
        const status = await provider.healthCheck();
        statuses.push(status);
      } catch (error) {
        statuses.push({
          provider: providerName,
          status: 'unavailable',
          enabled: false,
          responseTime: -1,
          errorRate: 100,
          lastCheck: new Date(),
          metadata: { error: error.message },
        });
      }
    }
    
    return statuses;
  }

  /**
   * Foundation RAG (préparation pipeline)
   */
  async mockRAGQuery(query: string, tenantId: string): Promise<RAGResponse> {
    this.logger.log(`Mock RAG query pour tenant ${tenantId}: ${query.substring(0, 50)}...`);
    
    const startTime = Date.now();
    
    // Simulation de documents pertinents
    const mockDocuments: RAGDocument[] = [
      {
        id: 'doc-001',
        title: 'Processus WikiPro - Gestion des connaissances',
        content: 'Document de référence sur les processus de gestion des connaissances...',
        score: 0.95,
        source: 'knowledge-base',
        metadata: {
          type: 'processus',
          category: 'gestion-connaissances',
          lastModified: new Date(),
        },
      },
      {
        id: 'doc-002',
        title: 'Méthodologie d\'analyse des données',
        content: 'Guide méthodologique pour l\'analyse et l\'interprétation des données...',
        score: 0.87,
        source: 'methodology-docs',
        metadata: {
          type: 'methodologie',
          category: 'analyse-donnees',
          lastModified: new Date(),
        },
      },
      {
        id: 'doc-003',
        title: 'Référentiel des compétences organisationnelles',
        content: 'Cartographie complète des compétences et expertises disponibles...',
        score: 0.82,
        source: 'competency-matrix',
        metadata: {
          type: 'competences',
          category: 'ressources-humaines',
          lastModified: new Date(),
        },
      },
    ];

    // Générer une réponse basée sur les documents mockés
    const mockProvider = this.providers.get(LLMProvider.MOCK);
    if (!mockProvider) {
      throw new Error('MockProvider non disponible pour RAG');
    }

    try {
      const ragContext = mockDocuments
        .map(doc => `[${doc.title}] ${doc.content.substring(0, 200)}...`)
        .join('\n\n');

      const response = await mockProvider.processRequest({
        prompt: query,
        context: ragContext,
        tenantId,
        maxTokens: 1500,
        temperature: 0.3,
        systemPrompt: 'Vous êtes un assistant IA spécialisé dans WikiPro. Utilisez les documents fournis pour répondre précisément à la question.',
      });

      const ragResponse: RAGResponse = {
        success: true,
        answer: response.text,
        relevantDocuments: mockDocuments,
        confidence: Math.random() * 0.3 + 0.7, // 70-100%
        tokensUsed: response.tokensUsed,
        responseTime: Date.now() - startTime,
        query,
        tenantId,
        metadata: {
          searchStrategy: 'mock-vector-search',
          embeddingModel: 'mock-embeddings-v1',
          retrievalScore: 0.88,
        },
      };

      // Télémétrie RAG
      this.telemetryService.trackEvent({
        event: 'ai.gateway.rag.query',
        tenantId,
        metadata: {
          documentsRetrieved: mockDocuments.length,
          confidence: ragResponse.confidence,
          responseTime: ragResponse.responseTime,
          tokensUsed: ragResponse.tokensUsed,
        },
      });

      return ragResponse;
    } catch (error) {
      this.logger.error(`Erreur RAG query: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Obtenir les métriques de performance
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics[]> {
    const metrics: PerformanceMetrics[] = [];
    
    for (const [providerName, provider] of this.providers) {
      const providerMetrics = provider.getMetrics();
      metrics.push({
        ...providerMetrics,
        requestsPerSecond: this.usageStats.requestsByProvider[providerName] || 0,
      });
    }
    
    return metrics;
  }

  /**
   * Obtenir les statistiques d'utilisation
   */
  getUsageStats(): UsageStats {
    return {
      ...this.usageStats,
      period: {
        ...this.usageStats.period,
        end: new Date(),
      },
    };
  }

  /**
   * Configuration et routing des providers
   */
  configureProviderRouting(routing: ProviderRouting[]): void {
    this.providerRouting.length = 0;
    this.providerRouting.push(...routing.sort((a, b) => b.priority - a.priority));
    this.logger.log(`Configuration de routing mise à jour: ${routing.length} règles`);
  }

  /**
   * Initialisation des providers
   */
  private async initializeProviders(): Promise<void> {
    this.logger.log('Initialisation des providers AI Gateway');

    // Initialiser le MockProvider par défaut
    const mockProvider = new MockProvider();
    await mockProvider.initialize();
    this.providers.set(LLMProvider.MOCK, mockProvider);

    // TODO: Initialiser d'autres providers selon la configuration
    // Ce sera étendu dans les prochains sprints

    this.logger.log(`${this.providers.size} providers initialisés`);
  }

  private getFallbackProvider(currentProvider: LLMProvider): LLMProvider | null {
    // Logique de fallback simple - utiliser MOCK en dernier recours
    if (currentProvider !== LLMProvider.MOCK) {
      return LLMProvider.MOCK;
    }
    return null;
  }

  private updateUsageStats(provider: LLMProvider, tokens: number): void {
    this.usageStats.totalRequests++;
    this.usageStats.totalTokens += tokens;
    
    const providerKey = provider.toString();
    this.usageStats.requestsByProvider[providerKey] = 
      (this.usageStats.requestsByProvider[providerKey] || 0) + 1;
    this.usageStats.tokensByProvider[providerKey] = 
      (this.usageStats.tokensByProvider[providerKey] || 0) + tokens;
  }

  private calculateOverallErrorRate(): number {
    let totalErrors = 0;
    let totalRequests = 0;
    
    for (const provider of this.providers.values()) {
      const metrics = provider.getMetrics();
      totalErrors += (metrics.errorRate / 100) * this.usageStats.totalRequests;
      totalRequests += this.usageStats.totalRequests;
    }
    
    return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
  }

  private calculateAverageResponseTime(): number {
    let totalTime = 0;
    let count = 0;
    
    for (const provider of this.providers.values()) {
      const metrics = provider.getMetrics();
      if (metrics.averageResponseTime > 0) {
        totalTime += metrics.averageResponseTime;
        count++;
      }
    }
    
    return count > 0 ? totalTime / count : 0;
  }
}