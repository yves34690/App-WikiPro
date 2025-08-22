export enum LLMProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GEMINI = 'gemini',
  MISTRAL = 'mistral',
  MOCK = 'mock',
}

export interface LLMResponse {
  text: string;
  tokensUsed: number;
  finishReason: 'stop' | 'length' | 'content_filter' | 'function_call';
  provider: LLMProvider;
  model?: string;
  responseTime: number;
  metadata?: Record<string, any>;
}

export interface LLMRequest {
  prompt: string;
  context?: string;
  tenantId: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  stream?: boolean;
}

export interface ProviderRouting {
  provider: LLMProvider;
  model?: string;
  priority: number;
  enabled: boolean;
  fallbackProvider?: LLMProvider;
}

export interface ProviderConfiguration {
  provider: LLMProvider;
  apiKey?: string;
  baseURL?: string;
  defaultModel?: string;
  maxRetries: number;
  timeoutMs: number;
  rateLimits?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}