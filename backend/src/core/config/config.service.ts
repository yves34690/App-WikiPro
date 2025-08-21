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

export interface AIConfig {
  // OpenAI Configuration
  openaiApiKey: string;
  openaiModel: string;

  // Gemini Configuration
  geminiApiKey: string;
  geminiModel: string;

  // Anthropic Configuration
  anthropicApiKey: string;
  anthropicModel: string;

  // Mistral Configuration
  mistralApiKey: string;
  mistralModel: string;

  // Global IA Parameters
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
      // OpenAI Configuration
      openaiApiKey: this.nestConfigService.get<string>('OPENAI_API_KEY', ''),
      openaiModel: this.nestConfigService.get<string>('OPENAI_MODEL', 'gpt-4o'),

      // Gemini Configuration
      geminiApiKey: this.nestConfigService.get<string>('GEMINI_API_KEY', ''),
      geminiModel: this.nestConfigService.get<string>('GEMINI_MODEL', 'gemini-2.5-flash-002'),

      // Anthropic Configuration
      anthropicApiKey: this.nestConfigService.get<string>('ANTHROPIC_API_KEY', ''),
      anthropicModel: this.nestConfigService.get<string>('ANTHROPIC_MODEL', 'claude-3-5-sonnet-20241022'),

      // Mistral Configuration
      mistralApiKey: this.nestConfigService.get<string>('MISTRAL_API_KEY', ''),
      mistralModel: this.nestConfigService.get<string>('MISTRAL_MODEL', 'mistral-large-latest'),

      // Global IA Parameters
      maxTokens: this.nestConfigService.get<number>('MAX_TOKENS', 2048),
      temperature: this.nestConfigService.get<number>('TEMPERATURE', 0.7),
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
