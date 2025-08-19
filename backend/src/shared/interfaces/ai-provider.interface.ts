import { BaseProvider, ProviderCapabilities } from './provider.interface';

export interface TextGenerationRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
  systemPrompt?: string;
}

export interface TextGenerationResponse {
  text: string;
  tokensUsed: number;
  finishReason: 'stop' | 'length' | 'content_filter' | 'function_call';
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
  stopSequences?: string[];
  functions?: Function[];
}

export interface ChatCompletionResponse {
  message: ChatMessage;
  tokensUsed: number;
  finishReason: 'stop' | 'length' | 'content_filter' | 'function_call';
  functionCall?: {
    name: string;
    arguments: Record<string, any>;
  };
  metadata?: Record<string, any>;
}

export interface EmbeddingRequest {
  text: string;
  model?: string;
}

export interface EmbeddingResponse {
  embedding: number[];
  tokensUsed: number;
  metadata?: Record<string, any>;
}

export interface StreamingTextGenerationRequest extends TextGenerationRequest {
  onChunk?: (chunk: string) => void;
  onComplete?: (response: TextGenerationResponse) => void;
  onError?: (error: Error) => void;
}

export abstract class BaseAiProvider extends BaseProvider {
  abstract readonly capabilities: ProviderCapabilities;

  // Méthodes obligatoires pour les providers IA
  abstract generateText(
    tenantId: string,
    request: TextGenerationRequest
  ): Promise<TextGenerationResponse>;

  // Méthodes optionnelles selon les capabilities
  async chatCompletion?(
    tenantId: string,
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    if (!this.capabilities.chatCompletion) {
      throw new Error(`Provider ${this.name} ne supporte pas le chat completion`);
    }
    throw new Error('Method not implemented');
  }

  async generateEmbedding?(
    tenantId: string,
    request: EmbeddingRequest
  ): Promise<EmbeddingResponse> {
    if (!this.capabilities.embedding) {
      throw new Error(`Provider ${this.name} ne supporte pas les embeddings`);
    }
    throw new Error('Method not implemented');
  }

  async generateTextStream?(
    tenantId: string,
    request: StreamingTextGenerationRequest
  ): Promise<void> {
    if (!this.capabilities.streaming) {
      throw new Error(`Provider ${this.name} ne supporte pas le streaming`);
    }
    throw new Error('Method not implemented');
  }

  // Méthodes utilitaires pour les providers IA
  protected validateRequest(request: any): void {
    if (!request) {
      throw new Error('Request is required');
    }
  }

  protected validateTenant(tenantId: string): void {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
  }

  protected sanitizePrompt(prompt: string): string {
    // Nettoyage basique du prompt
    return prompt.trim().substring(0, 10000); // Limite à 10k caractères
  }

  protected handleError(error: any, context: string): never {
    const message = error?.message || 'Unknown error';
    const errorWithContext = new Error(`${context}: ${message}`);
    
    // Mettre à jour les métriques d'erreur
    this.updateMetrics(0, 0, true);
    
    throw errorWithContext;
  }
}