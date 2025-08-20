import { Injectable, Logger } from '@nestjs/common';
import {
  BaseProvider,
  AIProviderType,
  ChatRequest,
  ChatResponse,
  StreamEvents,
  ProviderStatus,
} from '../providers/base-provider';
import { OpenAIProvider } from '../providers/openai.provider';
import { AnthropicProvider } from '../providers/anthropic.provider';
import { GeminiProvider } from '../providers/gemini.provider';

export interface FallbackConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number;
  preferredOrder: AIProviderType[];
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
}

export interface ProviderStats {
  provider: AIProviderType;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  lastError?: string;
  circuitBreakerOpen: boolean;
  lastCircuitBreakerTrip?: Date;
}

@Injectable()
export class AIOrchestrator {
  private providers: Map<AIProviderType, BaseProvider>;
  private providerStats: Map<AIProviderType, ProviderStats>;
  private readonly logger = new Logger(AIOrchestrator.name);

  private readonly fallbackConfig: FallbackConfig = {
    enabled: true,
    maxRetries: 3,
    retryDelay: 1000, // 1 seconde
    preferredOrder: [AIProviderType.OPENAI, AIProviderType.ANTHROPIC, AIProviderType.GEMINI],
    circuitBreakerThreshold: 5, // 5 erreurs consécutives
    circuitBreakerTimeout: 60000, // 1 minute
  };

  constructor() {
    this.providers = new Map();
    this.providerStats = new Map();
  }

  async initialize(
    openaiApiKey?: string,
    anthropicApiKey?: string,
    geminiApiKey?: string,
  ): Promise<void> {
    this.logger.log('🚀 Initialisation de l\'orchestrateur IA...');

    const providerPromises: Promise<void>[] = [];

    // Initialiser OpenAI si la clé est fournie
    if (openaiApiKey) {
      const openaiProvider = new OpenAIProvider(openaiApiKey);
      this.providers.set(AIProviderType.OPENAI, openaiProvider);
      this.initializeProviderStats(AIProviderType.OPENAI);
      providerPromises.push(this.safeInitializeProvider(openaiProvider));
    }

    // Initialiser Anthropic si la clé est fournie
    if (anthropicApiKey) {
      const anthropicProvider = new AnthropicProvider(anthropicApiKey);
      this.providers.set(AIProviderType.ANTHROPIC, anthropicProvider);
      this.initializeProviderStats(AIProviderType.ANTHROPIC);
      providerPromises.push(this.safeInitializeProvider(anthropicProvider));
    }

    // Initialiser Gemini si la clé est fournie
    if (geminiApiKey) {
      const geminiProvider = new GeminiProvider(geminiApiKey);
      this.providers.set(AIProviderType.GEMINI, geminiProvider);
      this.initializeProviderStats(AIProviderType.GEMINI);
      providerPromises.push(this.safeInitializeProvider(geminiProvider));
    }

    // Attendre l'initialisation de tous les providers
    await Promise.allSettled(providerPromises);

    const availableProviders = this.getAvailableProviders();
    this.logger.log(`✅ Orchestrateur IA initialisé avec ${availableProviders.length} provider(s) disponible(s): ${availableProviders.join(', ')}`);
  }

  async chatCompletion(request: ChatRequest): Promise<ChatResponse> {
    const preferredProvider = request.preferredProvider;
    const orderedProviders = this.getOrderedProviders(preferredProvider);

    if (orderedProviders.length === 0) {
      throw new Error('Aucun provider IA disponible');
    }

    let lastError: Error | null = null;
    let attemptCount = 0;

    for (const providerType of orderedProviders) {
      const provider = this.providers.get(providerType);
      if (!provider) continue;

      // Vérifier le circuit breaker
      if (this.isCircuitBreakerOpen(providerType)) {
        this.logger.warn(`⚡ Circuit breaker ouvert pour ${providerType}, passage au suivant`);
        continue;
      }

      attemptCount++;
      
      try {
        this.logger.debug(`🎯 Tentative ${attemptCount} avec ${providerType}`);
        
        const startTime = Date.now();
        const response = await provider.chatCompletion(request);
        const duration = Date.now() - startTime;

        // Mettre à jour les statistiques de succès
        this.updateProviderStats(providerType, duration, false);
        
        this.logger.log(`✅ Chat completion réussi avec ${providerType} en ${duration}ms`);
        return response;

      } catch (error) {
        lastError = error;
        const duration = Date.now();
        
        // Mettre à jour les statistiques d'erreur
        this.updateProviderStats(providerType, duration, true, error.message);
        
        this.logger.warn(`❌ Erreur avec ${providerType}: ${error.message}`);

        // Vérifier si on doit activer le circuit breaker
        this.checkCircuitBreaker(providerType);

        // Si c'est le dernier provider ou si le fallback est désactivé, on lève l'erreur
        if (!this.fallbackConfig.enabled || attemptCount >= this.fallbackConfig.maxRetries) {
          break;
        }

        // Délai avant le prochain essai
        if (this.fallbackConfig.retryDelay > 0) {
          await this.delay(this.fallbackConfig.retryDelay);
        }
      }
    }

    // Tous les providers ont échoué
    this.logger.error(`💥 Tous les providers IA ont échoué après ${attemptCount} tentative(s)`);
    throw lastError || new Error('Tous les providers IA sont indisponibles');
  }

  async chatCompletionStream(
    request: ChatRequest,
    events: StreamEvents,
  ): Promise<void> {
    const preferredProvider = request.preferredProvider;
    const orderedProviders = this.getOrderedProviders(preferredProvider);

    if (orderedProviders.length === 0) {
      const error = new Error('Aucun provider IA disponible');
      events.onError?.(error);
      throw error;
    }

    let lastError: Error | null = null;
    let attemptCount = 0;

    // Wrapper des événements pour gérer le fallback
    const wrappedEvents: StreamEvents = {
      onStart: events.onStart,
      onChunk: events.onChunk,
      onComplete: events.onComplete,
      onError: (error: Error, fallback?: AIProviderType) => {
        lastError = error;
        
        // Si un fallback est suggéré, essayer le prochain provider
        if (fallback && this.fallbackConfig.enabled) {
          this.logger.warn(`🔄 Fallback vers ${fallback} suggéré`);
          // Note: Dans une implémentation complète, on relancerait le stream
          // avec le provider suivant
        }
        
        events.onError?.(error, fallback);
      },
    };

    for (const providerType of orderedProviders) {
      const provider = this.providers.get(providerType);
      if (!provider) continue;

      // Vérifier le circuit breaker
      if (this.isCircuitBreakerOpen(providerType)) {
        this.logger.warn(`⚡ Circuit breaker ouvert pour ${providerType}, passage au suivant`);
        continue;
      }

      attemptCount++;

      try {
        this.logger.debug(`🎯 Stream tentative ${attemptCount} avec ${providerType}`);
        
        const startTime = Date.now();
        await provider.chatCompletionStream(request, wrappedEvents);
        const duration = Date.now() - startTime;

        // Mettre à jour les statistiques de succès
        this.updateProviderStats(providerType, duration, false);
        
        this.logger.log(`✅ Stream réussi avec ${providerType}`);
        return; // Succès, sortir de la boucle

      } catch (error) {
        lastError = error;
        const duration = Date.now();
        
        // Mettre à jour les statistiques d'erreur
        this.updateProviderStats(providerType, duration, true, error.message);
        
        this.logger.warn(`❌ Erreur stream avec ${providerType}: ${error.message}`);

        // Vérifier si on doit activer le circuit breaker
        this.checkCircuitBreaker(providerType);

        // Si c'est le dernier provider ou si le fallback est désactivé, on lève l'erreur
        if (!this.fallbackConfig.enabled || attemptCount >= this.fallbackConfig.maxRetries) {
          break;
        }

        // Délai avant le prochain essai
        if (this.fallbackConfig.retryDelay > 0) {
          await this.delay(this.fallbackConfig.retryDelay);
        }
      }
    }

    // Tous les providers ont échoué
    this.logger.error(`💥 Tous les providers stream ont échoué après ${attemptCount} tentative(s)`);
    const finalError = lastError || new Error('Tous les providers IA sont indisponibles');
    events.onError?.(finalError);
    throw finalError;
  }

  getAvailableProviders(): AIProviderType[] {
    return Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.isAvailable())
      .map(([type]) => type);
  }

  getProviderStatus(): Map<AIProviderType, { provider: BaseProvider; stats: ProviderStats }> {
    const status = new Map();
    
    for (const [type, provider] of this.providers) {
      const stats = this.providerStats.get(type);
      if (stats) {
        status.set(type, { provider, stats });
      }
    }
    
    return status;
  }

  async healthCheckAll(): Promise<Map<AIProviderType, boolean>> {
    const results = new Map<AIProviderType, boolean>();
    
    const healthPromises = Array.from(this.providers.entries()).map(async ([type, provider]) => {
      try {
        const isHealthy = await provider.healthCheck();
        results.set(type, isHealthy);
        
        if (!isHealthy) {
          this.updateProviderStats(type, 0, true, 'Health check failed');
        }
        
        return { type, isHealthy };
      } catch (error) {
        results.set(type, false);
        this.updateProviderStats(type, 0, true, `Health check error: ${error.message}`);
        return { type, isHealthy: false };
      }
    });

    await Promise.allSettled(healthPromises);
    return results;
  }

  private getOrderedProviders(preferredProvider?: AIProviderType): AIProviderType[] {
    const availableProviders = this.getAvailableProviders();
    
    if (!preferredProvider) {
      // Utiliser l'ordre de priorité configuré
      return this.fallbackConfig.preferredOrder.filter(type => availableProviders.includes(type));
    }

    // Mettre le provider préféré en premier
    const ordered = [preferredProvider];
    for (const type of this.fallbackConfig.preferredOrder) {
      if (type !== preferredProvider && availableProviders.includes(type)) {
        ordered.push(type);
      }
    }
    
    return ordered.filter(type => availableProviders.includes(type));
  }

  private async safeInitializeProvider(provider: BaseProvider): Promise<void> {
    try {
      await provider.initialize();
    } catch (error) {
      this.logger.warn(`⚠️ Échec de l'initialisation du provider ${provider.name}: ${error.message}`);
    }
  }

  private initializeProviderStats(providerType: AIProviderType): void {
    this.providerStats.set(providerType, {
      provider: providerType,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      circuitBreakerOpen: false,
    });
  }

  private updateProviderStats(
    providerType: AIProviderType,
    duration: number,
    isError: boolean,
    errorMessage?: string,
  ): void {
    const stats = this.providerStats.get(providerType);
    if (!stats) return;

    stats.totalRequests++;
    
    if (isError) {
      stats.failedRequests++;
      stats.lastError = errorMessage;
    } else {
      stats.successfulRequests++;
      
      // Calcul de la latence moyenne
      const totalRequests = stats.successfulRequests;
      stats.averageLatency = ((stats.averageLatency * (totalRequests - 1)) + duration) / totalRequests;
    }
  }

  private isCircuitBreakerOpen(providerType: AIProviderType): boolean {
    const stats = this.providerStats.get(providerType);
    if (!stats) return false;

    // Vérifier si le circuit breaker doit être réinitialisé
    if (stats.circuitBreakerOpen && stats.lastCircuitBreakerTrip) {
      const now = new Date();
      const timeSinceTrip = now.getTime() - stats.lastCircuitBreakerTrip.getTime();
      
      if (timeSinceTrip > this.fallbackConfig.circuitBreakerTimeout) {
        stats.circuitBreakerOpen = false;
        this.logger.log(`🔄 Circuit breaker réinitialisé pour ${providerType}`);
      }
    }

    return stats.circuitBreakerOpen;
  }

  private checkCircuitBreaker(providerType: AIProviderType): void {
    const stats = this.providerStats.get(providerType);
    if (!stats || stats.circuitBreakerOpen) return;

    // Calculer le taux d'erreur sur les dernières requêtes
    const recentRequests = Math.min(stats.totalRequests, this.fallbackConfig.circuitBreakerThreshold);
    const recentFailures = Math.min(stats.failedRequests, this.fallbackConfig.circuitBreakerThreshold);

    if (recentRequests >= this.fallbackConfig.circuitBreakerThreshold && 
        recentFailures >= this.fallbackConfig.circuitBreakerThreshold) {
      
      stats.circuitBreakerOpen = true;
      stats.lastCircuitBreakerTrip = new Date();
      
      this.logger.warn(`⚡ Circuit breaker activé pour ${providerType} après ${recentFailures} erreurs`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}