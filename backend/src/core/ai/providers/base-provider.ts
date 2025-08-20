import { Injectable } from '@nestjs/common';

// Enums pour les types et statuts
export enum AIProviderType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic', 
  GEMINI = 'gemini',
}

export enum ProviderStatus {
  AVAILABLE = 'available',
  RATE_LIMITED = 'rate_limited',
  ERROR = 'error',
  QUOTA_EXCEEDED = 'quota_exceeded',
  MAINTENANCE = 'maintenance',
}

// Interfaces pour les messages et réponses
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
  stream?: boolean;
  sessionId?: string;
  tenantId: string;
  preferredProvider?: AIProviderType;
}

export interface ChatResponse {
  message: ChatMessage;
  tokensUsed: number;
  finishReason: 'stop' | 'length' | 'content_filter' | 'function_call';
  provider: AIProviderType;
  duration: number;
  metadata?: Record<string, any>;
}

export interface StreamChunk {
  content: string;
  delta: string;
  isComplete: boolean;
  tokensUsed?: number;
  finishReason?: string;
}

// Interface pour les métriques de provider
export interface ProviderMetrics {
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageLatency: number;
  dailyTokens: number;
  monthlyTokens: number;
  errorRate: number;
  lastUpdated: Date;
}

// Interface pour la configuration des providers
export interface ProviderConfig {
  enabled: boolean;
  priority: number;
  maxTokensPerRequest: number;
  maxRequestsPerMinute: number;
  dailyTokenLimit: number;
  monthlyTokenLimit: number;
  timeout: number;
  retryAttempts: number;
  fallbackEnabled: boolean;
  models: string[];
  metadata?: Record<string, any>;
}

// Interface pour les événements de streaming
export interface StreamEvents {
  onStart?: (data: { sessionId: string; provider: AIProviderType }) => void;
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: (response: ChatResponse) => void;
  onError?: (error: Error, fallback?: AIProviderType) => void;
}

// BaseProvider abstraite
@Injectable()
export abstract class BaseProvider {
  abstract readonly type: AIProviderType;
  abstract readonly name: string;
  protected config: ProviderConfig;
  protected metrics: ProviderMetrics;
  protected status: ProviderStatus;

  constructor() {
    this.status = ProviderStatus.AVAILABLE;
    this.initializeMetrics();
  }

  // Méthodes abstraites que chaque provider doit implémenter
  abstract initialize(): Promise<void>;
  abstract chatCompletion(request: ChatRequest): Promise<ChatResponse>;
  abstract chatCompletionStream(request: ChatRequest, events: StreamEvents): Promise<void>;
  abstract healthCheck(): Promise<boolean>;

  // Méthodes communes
  getStatus(): ProviderStatus {
    return this.status;
  }

  getMetrics(): ProviderMetrics {
    return { ...this.metrics };
  }

  getConfig(): ProviderConfig {
    return { ...this.config };
  }

  isAvailable(): boolean {
    return this.status === ProviderStatus.AVAILABLE && this.config.enabled;
  }

  canHandleRequest(tokensNeeded: number): boolean {
    if (!this.isAvailable()) return false;
    
    // Vérifier les limites de tokens
    if (tokensNeeded > this.config.maxTokensPerRequest) return false;
    if (this.metrics.dailyTokens + tokensNeeded > this.config.dailyTokenLimit) return false;
    if (this.metrics.monthlyTokens + tokensNeeded > this.config.monthlyTokenLimit) return false;

    return true;
  }

  // Méthodes utilitaires protégées
  protected setStatus(status: ProviderStatus): void {
    this.status = status;
  }

  protected updateMetrics(
    tokensUsed: number,
    latency: number,
    isError: boolean = false
  ): void {
    this.metrics.requestCount++;
    this.metrics.dailyTokens += tokensUsed;
    this.metrics.monthlyTokens += tokensUsed;
    
    if (isError) {
      this.metrics.errorCount++;
    } else {
      this.metrics.successCount++;
    }

    // Calcul de la latence moyenne
    const totalRequests = this.metrics.requestCount;
    this.metrics.averageLatency = 
      ((this.metrics.averageLatency * (totalRequests - 1)) + latency) / totalRequests;

    // Calcul du taux d'erreur
    this.metrics.errorRate = this.metrics.errorCount / this.metrics.requestCount;
    
    this.metrics.lastUpdated = new Date();
  }

  protected handleProviderError(error: any, context: string): Error {
    console.error(`[${this.name}] Erreur dans ${context}:`, error);
    
    // Déterminer le statut selon le type d'erreur
    if (error.status === 429 || error.code === 'rate_limit_exceeded') {
      this.setStatus(ProviderStatus.RATE_LIMITED);
    } else if (error.status === 402 || error.code === 'quota_exceeded') {
      this.setStatus(ProviderStatus.QUOTA_EXCEEDED);
    } else if (error.status >= 500) {
      this.setStatus(ProviderStatus.ERROR);
    }

    // Mettre à jour les métriques
    this.updateMetrics(0, 0, true);

    return new Error(`${this.name} ${context}: ${error.message || error}`);
  }

  protected validateRequest(request: ChatRequest): void {
    if (!request) {
      throw new Error('Chat request is required');
    }
    if (!request.tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!request.messages || request.messages.length === 0) {
      throw new Error('Messages array is required and cannot be empty');
    }
    if (request.temperature && (request.temperature < 0 || request.temperature > 2)) {
      throw new Error('Temperature must be between 0 and 2');
    }
  }

  protected sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content.trim().substring(0, 50000), // Limite à 50k caractères
      metadata: msg.metadata,
    }));
  }

  private initializeMetrics(): void {
    this.metrics = {
      requestCount: 0,
      successCount: 0,
      errorCount: 0,
      averageLatency: 0,
      dailyTokens: 0,
      monthlyTokens: 0,
      errorRate: 0,
      lastUpdated: new Date(),
    };
  }

  // Méthode pour réinitialiser les quotas quotidiens
  resetDailyQuotas(): void {
    this.metrics.dailyTokens = 0;
  }

  // Méthode pour réinitialiser les quotas mensuels
  resetMonthlyQuotas(): void {
    this.metrics.monthlyTokens = 0;
  }
}