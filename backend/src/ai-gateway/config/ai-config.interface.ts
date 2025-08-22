export interface AIProviderConfig {
  name: string;
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  enabled: boolean;
  priority: number; // 1 = highest priority
}

export interface AIGatewaySettings {
  mode: 'development' | 'production' | 'test';
  defaultProvider: string;
  fallbackEnabled: boolean;
  timeoutGlobal: number;
  retryMax: number;
  retryDelay: number;
}

export interface AIQuotasSettings {
  tenantMonthlyLimit: number;
  globalDailyLimit: number;
  alertThreshold1: number;
  alertThreshold2: number;
}

export interface AIHealthSettings {
  enabled: boolean;
  interval: number;
  timeout: number;
}

export interface AILoggingSettings {
  level: 'error' | 'warn' | 'info' | 'debug';
  metricsEnabled: boolean;
  debugMode: boolean;
}

export interface AIGatewayConfig {
  providers: Record<string, AIProviderConfig>;
  gateway: AIGatewaySettings;
  quotas: AIQuotasSettings;
  health: AIHealthSettings;
  logging: AILoggingSettings;
}

export interface ProviderStatus {
  name: string;
  enabled: boolean;
  healthy: boolean;
  lastCheck: Date;
  latency: number;
  errorCount: number;
  quotaUsed: number;
}

export interface AIGatewayStatus {
  isHealthy: boolean;
  activeProvider: string;
  providers: ProviderStatus[];
  lastHealthCheck: Date;
  totalRequests: number;
  totalErrors: number;
}

export interface ProviderValidationResult {
  isValid: boolean;
  provider: string;
  errors: string[];
  warnings: string[];
}

export interface ConfigValidationResult {
  isValid: boolean;
  providers: ProviderValidationResult[];
  errors: string[];
  warnings: string[];
}