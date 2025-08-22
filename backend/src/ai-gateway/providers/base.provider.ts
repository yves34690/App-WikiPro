import { Logger } from '@nestjs/common';
import { LLMProvider, LLMRequest, LLMResponse, ProviderConfiguration } from '../interfaces/llm-provider.interface';
import { ProviderStatus, PerformanceMetrics } from '../interfaces/health.interface';

export abstract class BaseAIGatewayProvider {
  protected readonly logger = new Logger(this.constructor.name);
  protected config: ProviderConfiguration;
  
  protected metrics: PerformanceMetrics = {
    requestsPerSecond: 0,
    averageResponseTime: 0,
    p95ResponseTime: 0,
    p99ResponseTime: 0,
    errorRate: 0,
    successRate: 100,
    timeWindow: '1m',
    timestamp: new Date(),
  };

  protected responseTimes: number[] = [];
  protected totalRequests = 0;
  protected totalErrors = 0;

  constructor(
    public readonly provider: LLMProvider,
    config: ProviderConfiguration,
  ) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract generateResponse(request: LLMRequest): Promise<LLMResponse>;
  abstract healthCheck(): Promise<ProviderStatus>;

  async processRequest(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    this.totalRequests++;
    
    try {
      this.validateRequest(request);
      const response = await this.generateResponse(request);
      
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, false);
      
      return {
        ...response,
        provider: this.provider,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.totalErrors++;
      this.updateMetrics(responseTime, true);
      
      this.logger.error(`Error in ${this.provider} provider: ${error.message}`, error.stack);
      throw error;
    }
  }

  protected validateRequest(request: LLMRequest): void {
    if (!request.prompt || request.prompt.trim().length === 0) {
      throw new Error('Le prompt ne peut pas être vide');
    }

    if (!request.tenantId || request.tenantId.trim().length === 0) {
      throw new Error('Le tenant ID est requis');
    }

    if (request.maxTokens && request.maxTokens <= 0) {
      throw new Error('maxTokens doit être supérieur à 0');
    }

    if (request.temperature && (request.temperature < 0 || request.temperature > 2)) {
      throw new Error('temperature doit être entre 0 et 2');
    }
  }

  protected updateMetrics(responseTime: number, isError: boolean): void {
    this.responseTimes.push(responseTime);
    
    // Garder seulement les 1000 dernières réponses pour les métriques
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }

    // Calculer les métriques
    const sortedTimes = [...this.responseTimes].sort((a, b) => a - b);
    this.metrics.averageResponseTime = sortedTimes.reduce((a, b) => a + b, 0) / sortedTimes.length;
    this.metrics.p95ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
    this.metrics.p99ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;
    
    this.metrics.errorRate = (this.totalErrors / this.totalRequests) * 100;
    this.metrics.successRate = 100 - this.metrics.errorRate;
    this.metrics.timestamp = new Date();
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getConfiguration(): ProviderConfiguration {
    // Retourner la config sans les clés sensibles
    const { apiKey, ...safeConfig } = this.config;
    return {
      ...safeConfig,
      apiKey: apiKey ? '***masked***' : undefined,
    };
  }

  protected async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = this.config.timeoutMs,
  ): Promise<T> {
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout après ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  protected async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = this.config.maxRetries,
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Attendre avant le prochain essai (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        this.logger.warn(`Tentative ${attempt + 1}/${maxRetries + 1} échouée pour ${this.provider}: ${error.message}`);
      }
    }
    
    throw lastError;
  }
}