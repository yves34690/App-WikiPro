export interface AIProvider {
  name: string;
  isHealthy(): Promise<boolean>;
  checkHealth(): Promise<ProviderHealthStatus>;
  generateResponse(prompt: string, options?: GenerationOptions): Promise<AIResponse>;
  getQuotaStatus(): Promise<QuotaInfo>;
  getConfiguration(): ProviderConfiguration;
}

export interface ProviderHealthStatus {
  healthy: boolean;
  latency: number;
  error?: string;
  details: {
    apiKeyValid: boolean;
    modelAvailable: boolean;
    quotaOk: boolean;
    responseTime: number;
  };
}

export interface GenerationOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
  timeout?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: 'stop' | 'length' | 'error';
  metadata: {
    provider: string;
    latency: number;
    timestamp: Date;
  };
}

export interface QuotaInfo {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  resetDate?: Date;
  status: 'ok' | 'warning' | 'critical' | 'exceeded';
}

export interface ProviderConfiguration {
  name: string;
  model: string;
  maxTokens: number;
  temperature: number;
  apiEndpoint: string;
  features: ProviderFeatures;
}

export interface ProviderFeatures {
  streaming: boolean;
  imageGeneration: boolean;
  functionCalling: boolean;
  codeGeneration: boolean;
  multimodal: boolean;
}

export interface ProviderError extends Error {
  provider: string;
  code: string;
  retryable: boolean;
  statusCode?: number;
  details?: any;
}