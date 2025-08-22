import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface SecurityConfig {
  jwtSecret: string;
  jwtExpiration: string;
}

export interface AIProviderConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface AIGatewayConfig {
  mode: 'development' | 'production' | 'test';
  defaultProvider: 'openai' | 'anthropic' | 'gemini';
  fallbackEnabled: boolean;
  timeoutGlobal: number;
  retryMax: number;
  retryDelay: number;
}

export interface AIQuotasConfig {
  tenantMonthlyLimit: number;
  globalDailyLimit: number;
  alertThreshold1: number;
  alertThreshold2: number;
}

export interface AIHealthConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
}

export interface AILoggingConfig {
  level: 'error' | 'warn' | 'info' | 'debug';
  metricsEnabled: boolean;
  debugMode: boolean;
}

export interface AIConfig {
  // Providers
  openai: AIProviderConfig;
  anthropic: AIProviderConfig;
  gemini: AIProviderConfig;
  
  // Gateway Configuration
  gateway: AIGatewayConfig;
  
  // Quotas & Limits
  quotas: AIQuotasConfig;
  
  // Health Checks
  health: AIHealthConfig;
  
  // Logging & Monitoring
  logging: AILoggingConfig;
  
  // Deprecated - backward compatibility
  openaiApiKey: string;
  openaiModel: string;
  geminiApiKey: string;
  geminiModel: string;
  anthropicApiKey: string;
  anthropicModel: string;
  mistralApiKey: string;
  mistralModel: string;
  maxTokens: number;
  temperature: number;
}

export interface TelemetryConfig {
  enabled: boolean;
  endpoint?: string;
}

@Injectable()
export class ConfigService {
  constructor(private nestConfigService: NestConfigService) {}

  get(key: string): string {
    return this.nestConfigService.get<string>(key);
  }

  get port(): number {
    return this.nestConfigService.get<number>('PORT', 3001);
  }

  get nodeEnv(): string {
    return this.nestConfigService.get<string>('NODE_ENV', 'development');
  }

  get corsOrigins(): string[] {
    const origins = this.nestConfigService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
    return origins.split(',');
  }

  get database(): DatabaseConfig {
    return {
      host: this.nestConfigService.get<string>('DB_HOST', 'localhost'),
      port: this.nestConfigService.get<number>('DB_PORT', 5432),
      username: this.nestConfigService.get<string>('DB_USERNAME', 'postgres'),
      password: this.nestConfigService.get<string>('DB_PASSWORD', 'password'),
      database: this.nestConfigService.get<string>('DB_DATABASE', 'wikipro'),
    };
  }

  get security(): SecurityConfig {
    return {
      jwtSecret: this.nestConfigService.get<string>('JWT_SECRET', 'default-secret-change-in-production'),
      jwtExpiration: this.nestConfigService.get<string>('JWT_EXPIRATION_TIME', '24h'),
    };
  }

  get ai(): AIConfig {
    return {
      // Providers Configuration
      openai: {
        apiKey: this.nestConfigService.get<string>('OPENAI_API_KEY', ''),
        model: this.nestConfigService.get<string>('OPENAI_MODEL', 'gpt-4-turbo-preview'),
        maxTokens: this.nestConfigService.get<number>('OPENAI_MAX_TOKENS', 4000),
        temperature: this.nestConfigService.get<number>('OPENAI_TEMPERATURE', 0.7),
      },
      anthropic: {
        apiKey: this.nestConfigService.get<string>('ANTHROPIC_API_KEY', ''),
        model: this.nestConfigService.get<string>('ANTHROPIC_MODEL', 'claude-3-sonnet-20240229'),
        maxTokens: this.nestConfigService.get<number>('ANTHROPIC_MAX_TOKENS', 4000),
        temperature: this.nestConfigService.get<number>('ANTHROPIC_TEMPERATURE', 0.7),
      },
      gemini: {
        apiKey: this.nestConfigService.get<string>('GOOGLE_AI_API_KEY', ''),
        model: this.nestConfigService.get<string>('GEMINI_MODEL', 'gemini-pro'),
        maxTokens: this.nestConfigService.get<number>('GEMINI_MAX_TOKENS', 4000),
        temperature: this.nestConfigService.get<number>('GEMINI_TEMPERATURE', 0.7),
      },
      
      // Gateway Configuration
      gateway: {
        mode: this.nestConfigService.get<'development' | 'production' | 'test'>('AI_MODE', 'development'),
        defaultProvider: this.nestConfigService.get<'openai' | 'anthropic' | 'gemini'>('AI_DEFAULT_PROVIDER', 'openai'),
        fallbackEnabled: this.nestConfigService.get<boolean>('AI_FALLBACK_ENABLED', true),
        timeoutGlobal: this.nestConfigService.get<number>('AI_TIMEOUT_GLOBAL', 15000),
        retryMax: this.nestConfigService.get<number>('AI_RETRY_MAX', 3),
        retryDelay: this.nestConfigService.get<number>('AI_RETRY_DELAY', 1000),
      },
      
      // Quotas & Limits
      quotas: {
        tenantMonthlyLimit: this.nestConfigService.get<number>('AI_TENANT_MONTHLY_LIMIT', 50.00),
        globalDailyLimit: this.nestConfigService.get<number>('AI_GLOBAL_DAILY_LIMIT', 500.00),
        alertThreshold1: this.nestConfigService.get<number>('AI_ALERT_THRESHOLD_1', 80),
        alertThreshold2: this.nestConfigService.get<number>('AI_ALERT_THRESHOLD_2', 95),
      },
      
      // Health Checks
      health: {
        enabled: this.nestConfigService.get<boolean>('AI_HEALTH_CHECK_ENABLED', true),
        interval: this.nestConfigService.get<number>('AI_HEALTH_CHECK_INTERVAL', 300000),
        timeout: this.nestConfigService.get<number>('AI_HEALTH_CHECK_TIMEOUT', 5000),
      },
      
      // Logging & Monitoring
      logging: {
        level: this.nestConfigService.get<'error' | 'warn' | 'info' | 'debug'>('AI_LOG_LEVEL', 'info'),
        metricsEnabled: this.nestConfigService.get<boolean>('AI_METRICS_ENABLED', true),
        debugMode: this.nestConfigService.get<boolean>('AI_DEBUG_MODE', false),
      },
      
      // Backward compatibility - deprecated
      openaiApiKey: this.nestConfigService.get<string>('OPENAI_API_KEY', ''),
      openaiModel: this.nestConfigService.get<string>('OPENAI_MODEL', 'gpt-4-turbo-preview'),
      geminiApiKey: this.nestConfigService.get<string>('GOOGLE_AI_API_KEY', ''),
      geminiModel: this.nestConfigService.get<string>('GEMINI_MODEL', 'gemini-pro'),
      anthropicApiKey: this.nestConfigService.get<string>('ANTHROPIC_API_KEY', ''),
      anthropicModel: this.nestConfigService.get<string>('ANTHROPIC_MODEL', 'claude-3-sonnet-20240229'),
      mistralApiKey: this.nestConfigService.get<string>('MISTRAL_API_KEY', ''),
      mistralModel: this.nestConfigService.get<string>('MISTRAL_MODEL', 'mistral-large-latest'),
      maxTokens: this.nestConfigService.get<number>('OPENAI_MAX_TOKENS', 4000),
      temperature: this.nestConfigService.get<number>('OPENAI_TEMPERATURE', 0.7),
    };
  }

  get telemetry(): TelemetryConfig {
    return {
      enabled: this.nestConfigService.get<boolean>('TELEMETRY_ENABLED', false),
      endpoint: this.nestConfigService.get<string>('TELEMETRY_ENDPOINT'),
    };
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  // Compatibilité avec l'ancien format
  get jwtSecret(): string {
    return this.security.jwtSecret;
  }

  get jwtExpirationTime(): string {
    return this.security.jwtExpiration;
  }

  get geminiApiKey(): string {
    return this.ai.geminiApiKey;
  }
}
