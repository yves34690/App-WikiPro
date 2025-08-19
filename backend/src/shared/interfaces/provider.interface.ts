export interface ProviderConfig {
  name: string;
  version: string;
  enabled: boolean;
  priority: number;
  metadata?: Record<string, any>;
}

export interface ProviderCapabilities {
  textGeneration?: boolean;
  imageGeneration?: boolean;
  embedding?: boolean;
  chatCompletion?: boolean;
  functionCalling?: boolean;
  streaming?: boolean;
}

export interface ProviderMetrics {
  totalCalls: number;
  totalTokens: number;
  averageLatency: number;
  errorRate: number;
  lastUsed?: Date;
}

export abstract class BaseProvider {
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly capabilities: ProviderCapabilities;

  public config: ProviderConfig;
  protected metrics: ProviderMetrics = {
    totalCalls: 0,
    totalTokens: 0,
    averageLatency: 0,
    errorRate: 0,
  };

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract healthCheck(): Promise<boolean>;
  abstract getMetrics(): ProviderMetrics;

  get isEnabled(): boolean {
    return this.config.enabled;
  }

  get priority(): number {
    return this.config.priority;
  }

  protected updateMetrics(responseTime: number, tokensUsed: number = 0, isError: boolean = false): void {
    this.metrics.totalCalls++;
    this.metrics.totalTokens += tokensUsed;
    this.metrics.lastUsed = new Date();

    // Calcul de la latence moyenne (moyenne mobile)
    this.metrics.averageLatency = 
      (this.metrics.averageLatency * (this.metrics.totalCalls - 1) + responseTime) / this.metrics.totalCalls;

    // Calcul du taux d'erreur
    if (isError) {
      const previousErrors = this.metrics.errorRate * (this.metrics.totalCalls - 1);
      this.metrics.errorRate = (previousErrors + 1) / this.metrics.totalCalls;
    } else {
      const previousErrors = this.metrics.errorRate * (this.metrics.totalCalls - 1);
      this.metrics.errorRate = previousErrors / this.metrics.totalCalls;
    }
  }
}