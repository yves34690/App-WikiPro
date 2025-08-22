import { Injectable, Logger } from '@nestjs/common';
import {
  AIProvider,
  ProviderHealthStatus,
  GenerationOptions,
  AIResponse,
  QuotaInfo,
  ProviderConfiguration,
  ProviderError,
} from './base-provider.interface';
import { AIProviderConfig } from '../config/ai-config.interface';

@Injectable()
export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  private readonly logger = new Logger(GeminiProvider.name);
  private lastHealthCheck: ProviderHealthStatus | null = null;
  private requestCount = 0;

  constructor(private config: AIProviderConfig) {
    this.logger.log(`🤖 Gemini Provider initialisé (modèle: ${config.model})`);
  }

  /**
   * Vérifie si le provider est en bonne santé (rapide)
   */
  async isHealthy(): Promise<boolean> {
    try {
      // Vérification rapide des prérequis
      if (!this.config.apiKey || this.config.apiKey.length < 10) {
        return false;
      }

      // Si on a un health check récent (< 5 minutes), on l'utilise
      if (this.lastHealthCheck) {
        const age = Date.now() - this.lastHealthCheck.details.responseTime;
        if (age < 5 * 60 * 1000) { // 5 minutes
          return this.lastHealthCheck.healthy;
        }
      }

      // Sinon health check complet
      const health = await this.checkHealth();
      return health.healthy;
    } catch (error) {
      this.logger.error('Erreur health check rapide Gemini:', error);
      return false;
    }
  }

  /**
   * Health check complet avec détails
   */
  async checkHealth(): Promise<ProviderHealthStatus> {
    const startTime = Date.now();
    
    try {
      this.logger.debug('🩺 Health check Gemini en cours...');

      // Validation de la clé API
      const apiKeyValid = this.validateApiKey();
      if (!apiKeyValid) {
        return this.createHealthStatus(false, startTime, 'Clé API Gemini invalide');
      }

      // Simulation d'un appel API
      await this.simulateApiCall();

      // Vérification du quota
      const quotaStatus = await this.getQuotaStatus();
      const quotaOk = quotaStatus.status !== 'exceeded';

      const result: ProviderHealthStatus = {
        healthy: true,
        latency: Date.now() - startTime,
        details: {
          apiKeyValid: true,
          modelAvailable: true,
          quotaOk,
          responseTime: Date.now() - startTime,
        },
      };

      this.lastHealthCheck = result;
      this.logger.debug(`✅ Gemini health check OK (${result.latency}ms)`);
      
      return result;

    } catch (error) {
      const result = this.createHealthStatus(false, startTime, error.message);
      this.lastHealthCheck = result;
      this.logger.warn(`❌ Gemini health check KO: ${error.message}`);
      return result;
    }
  }

  /**
   * Génère une réponse IA
   */
  async generateResponse(
    prompt: string,
    options: GenerationOptions = {}
  ): Promise<AIResponse> {
    const startTime = Date.now();
    this.requestCount++;

    try {
      this.logger.debug(`🧠 Génération Gemini (requête #${this.requestCount})`);

      // Validation des paramètres
      if (!prompt?.trim()) {
        throw this.createError('INVALID_PROMPT', 'Prompt vide ou invalide', false);
      }

      // Simulation de la génération
      const response = await this.simulateGeneration(prompt, options);
      
      const latency = Date.now() - startTime;
      this.logger.debug(`✅ Réponse Gemini générée en ${latency}ms`);

      return {
        content: response.content,
        usage: response.usage,
        model: options.model || this.config.model,
        finishReason: 'stop',
        metadata: {
          provider: this.name,
          latency,
          timestamp: new Date(),
        },
      };

    } catch (error) {
      const latency = Date.now() - startTime;
      this.logger.error(`💥 Erreur génération Gemini (${latency}ms):`, error.message);
      throw error;
    }
  }

  /**
   * Retourne le statut du quota
   */
  async getQuotaStatus(): Promise<QuotaInfo> {
    try {
      // Simulation du quota basé sur le nombre de requêtes (Gemini gratuit puis payant)
      const used = this.requestCount * 0.005; // $0.005 par requête simulée (moins cher)
      const limit = 100; // $100 de limite simulée
      
      return {
        used,
        limit,
        remaining: limit - used,
        percentage: (used / limit) * 100,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        status: used >= limit ? 'exceeded' : 
                used >= limit * 0.9 ? 'critical' :
                used >= limit * 0.8 ? 'warning' : 'ok',
      };
    } catch (error) {
      this.logger.error('Erreur récupération quota Gemini:', error);
      throw this.createError('QUOTA_ERROR', 'Impossible de récupérer le quota', true);
    }
  }

  /**
   * Retourne la configuration du provider
   */
  getConfiguration(): ProviderConfiguration {
    return {
      name: this.name,
      model: this.config.model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      apiEndpoint: 'https://generativelanguage.googleapis.com/v1',
      features: {
        streaming: true,
        imageGeneration: false,
        functionCalling: true,
        codeGeneration: true,
        multimodal: true,
      },
    };
  }

  // === MÉTHODES PRIVÉES ===

  private validateApiKey(): boolean {
    const pattern = /^AI[a-zA-Z0-9_-]{35,}$/;
    return pattern.test(this.config.apiKey);
  }

  private async simulateApiCall(): Promise<void> {
    // Simulation d'un appel API avec latence réaliste (Gemini très rapide)
    const latency = 150 + Math.random() * 500; // 150-650ms
    await new Promise(resolve => setTimeout(resolve, latency));
    
    // Simulation d'erreurs occasionnelles (2% de chance, Google très stable)
    if (Math.random() < 0.02) {
      throw new Error('Quota exceeded for this minute');
    }
  }

  private async simulateGeneration(
    prompt: string,
    options: GenerationOptions
  ): Promise<{
    content: string;
    usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    // Simulation de génération avec latence réaliste (Gemini très rapide)
    const baseLatency = 800;
    const tokenLatency = Math.max(30, (options.maxTokens || this.config.maxTokens) * 8);
    const totalLatency = baseLatency + tokenLatency;
    
    await new Promise(resolve => setTimeout(resolve, totalLatency));

    // Simulation du contenu généré
    const promptTokens = Math.ceil(prompt.length / 4); // ~4 chars par token
    const completionTokens = Math.min(
      options.maxTokens || this.config.maxTokens,
      180 + Math.random() * 320 // Gemini concis mais précis
    );

    const content = this.generateSimulatedContent(prompt, completionTokens);

    return {
      content,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
    };
  }

  private generateSimulatedContent(prompt: string, tokens: number): string {
    const baseResponse = `Réponse optimisée Gemini pour: "${prompt.substring(0, 50)}..."`;
    
    // Gemini style - réponses rapides, précises et bien structurées
    const topics = [
      'Réponse directe:',
      'Informations complémentaires:',
      'Considérations techniques:',
      'Résumé:'
    ];

    const additionalContent = topics
      .slice(0, Math.min(3, Math.floor(tokens / 60)))
      .map((topic, i) => {
        const content = Array(Math.floor(tokens / topics.length / 12))
          .fill(0)
          .map((_, j) => `Information précise ${i + 1}.${j + 1} optimisée par Gemini.`)
          .join(' ');
        return `${topic}\n${content}`;
      })
      .join('\n\n');

    return `${baseResponse}\n\n${additionalContent}`;
  }

  private createHealthStatus(
    healthy: boolean,
    startTime: number,
    error?: string
  ): ProviderHealthStatus {
    return {
      healthy,
      latency: Date.now() - startTime,
      error,
      details: {
        apiKeyValid: this.validateApiKey(),
        modelAvailable: healthy,
        quotaOk: healthy,
        responseTime: Date.now() - startTime,
      },
    };
  }

  private createError(
    code: string,
    message: string,
    retryable: boolean,
    statusCode?: number
  ): ProviderError {
    const error = new Error(message) as ProviderError;
    error.provider = this.name;
    error.code = code;
    error.retryable = retryable;
    error.statusCode = statusCode;
    return error;
  }
}