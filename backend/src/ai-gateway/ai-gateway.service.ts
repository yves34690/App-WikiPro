import { Injectable, Logger, Inject } from '@nestjs/common';

/**
 * Service principal AI Gateway - TICKET-BACKEND-007
 * Orchestre les providers IA et gère les requêtes
 */
@Injectable()
export class AIGatewayService {
  private readonly logger = new Logger(AIGatewayService.name);

  constructor(
    @Inject('AI_PROVIDERS') private readonly aiProviders: Map<string, any>
  ) {
    this.logger.log(`🤖 AIGatewayService initialisé avec ${this.aiProviders.size} providers`);
  }

  /**
   * Obtenir la liste des providers disponibles
   */
  getAvailableProviders(): string[] {
    return Array.from(this.aiProviders.keys());
  }

  /**
   * Obtenir un provider spécifique
   */
  getProvider(providerName: string) {
    const provider = this.aiProviders.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} non trouvé`);
    }
    return provider;
  }

  /**
   * Envoyer une requête à un provider spécifique
   */
  async sendRequest(providerName: string, request: {
    messages: Array<{ role: string; content: string }>;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  }) {
    try {
      const provider = this.getProvider(providerName);
      
      this.logger.debug(`📤 Envoi requête vers ${providerName}`, {
        messagesCount: request.messages.length,
        model: request.model,
      });

      const response = await provider.sendMessage(request);
      
      this.logger.debug(`📥 Réponse reçue de ${providerName}`);
      return {
        provider: providerName,
        response,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`❌ Erreur requête ${providerName}:`, error);
      throw error;
    }
  }

  /**
   * Envoi avec fallback automatique
   */
  async sendRequestWithFallback(request: {
    messages: Array<{ role: string; content: string }>;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    preferredProvider?: string;
  }) {
    const providers = this.getAvailableProviders();
    
    // Essayer le provider préféré en premier
    if (request.preferredProvider && providers.includes(request.preferredProvider)) {
      try {
        return await this.sendRequest(request.preferredProvider, request);
      } catch (error) {
        this.logger.warn(`⚠️ Provider préféré ${request.preferredProvider} en échec, fallback...`);
      }
    }

    // Essayer les autres providers
    for (const providerName of providers) {
      if (providerName === request.preferredProvider) continue;
      
      try {
        this.logger.debug(`🔄 Tentative fallback vers ${providerName}`);
        return await this.sendRequest(providerName, request);
      } catch (error) {
        this.logger.warn(`⚠️ Provider ${providerName} en échec:`, error.message);
        continue;
      }
    }

    throw new Error('Tous les providers IA sont indisponibles');
  }

  /**
   * Health check de tous les providers
   */
  async healthCheck() {
    const results = new Map();
    
    for (const [name, provider] of this.aiProviders) {
      try {
        const startTime = Date.now();
        await provider.healthCheck?.() || { status: 'unknown' };
        const responseTime = Date.now() - startTime;
        
        results.set(name, {
          status: 'healthy',
          responseTime,
          timestamp: new Date(),
        });
      } catch (error) {
        results.set(name, {
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date(),
        });
      }
    }

    const healthyCount = Array.from(results.values()).filter(r => r.status === 'healthy').length;
    
    return {
      overall: healthyCount > 0 ? 'healthy' : 'unhealthy',
      providers: Object.fromEntries(results),
      summary: {
        total: this.aiProviders.size,
        healthy: healthyCount,
        unhealthy: this.aiProviders.size - healthyCount,
      },
    };
  }

  /**
   * Obtenir les statistiques d'usage
   */
  async getUsageStats(tenantId?: string) {
    // Mock de statistiques pour les tests
    const stats = {
      tenantId: tenantId || 'global',
      totalRequests: Math.floor(Math.random() * 10000) + 1000,
      successfulRequests: Math.floor(Math.random() * 9000) + 900,
      failedRequests: Math.floor(Math.random() * 100) + 10,
      averageResponseTime: Math.floor(Math.random() * 2000) + 500,
      providerDistribution: {},
      modelDistribution: {},
      period: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date(),
      },
    };

    // Répartition par provider
    for (const providerName of this.getAvailableProviders()) {
      stats.providerDistribution[providerName] = Math.floor(Math.random() * 1000) + 100;
    }

    this.logger.debug(`📊 Stats générées pour tenant ${tenantId || 'global'}`);
    return stats;
  }

  /**
   * Obtenir les modèles disponibles par provider
   */
  async getAvailableModels() {
    const models = {};
    
    for (const [name, provider] of this.aiProviders) {
      try {
        models[name] = provider.getAvailableModels?.() || ['default'];
      } catch (error) {
        this.logger.warn(`⚠️ Impossible d'obtenir les modèles de ${name}:`, error.message);
        models[name] = [];
      }
    }

    return models;
  }

  /**
   * Estimer le coût d'une requête
   */
  async estimateRequestCost(providerName: string, request: {
    messages: Array<{ role: string; content: string }>;
    model?: string;
  }) {
    try {
      const provider = this.getProvider(providerName);
      
      if (provider.estimateCost) {
        return await provider.estimateCost(request);
      }

      // Estimation basique basée sur le nombre de tokens approximatif
      const totalChars = request.messages.reduce((sum, msg) => sum + msg.content.length, 0);
      const estimatedTokens = Math.ceil(totalChars / 4); // Approximation: 4 chars = 1 token
      
      return {
        provider: providerName,
        estimatedTokens,
        estimatedCostUSD: estimatedTokens * 0.00002, // Prix approximatif
        model: request.model || 'default',
      };
    } catch (error) {
      this.logger.error(`❌ Erreur estimation coût ${providerName}:`, error);
      return {
        provider: providerName,
        error: error.message,
        estimatedCostUSD: 0,
      };
    }
  }
}