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
  bcryptRounds: number;
}

export interface AiConfig {
  geminiApiKey: string;
  geminiModel: string;
  maxTokens: number;
  temperature: number;
}

export interface TelemetryConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  environment: string;
}

@Injectable()
export class ConfigService {
  constructor(private nestConfigService: NestConfigService) {}

  get port(): number {
    return this.nestConfigService.get<number>('PORT', 3001);
  }

  get nodeEnv(): string {
    return this.nestConfigService.get<string>('NODE_ENV', 'development');
  }

  get corsOrigins(): string[] {
    const origins = this.nestConfigService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
    return origins.split(',').map(origin => origin.trim());
  }

  get database(): DatabaseConfig {
    return {
      host: this.nestConfigService.get<string>('DB_HOST', 'localhost'),
      port: this.nestConfigService.get<number>('DB_PORT', 5432),
      username: this.nestConfigService.get<string>('DB_USERNAME', 'postgres'),
      password: this.nestConfigService.get<string>('DB_PASSWORD', ''),
      database: this.nestConfigService.get<string>('DB_DATABASE', 'wikipro'),
    };
  }

  get security(): SecurityConfig {
    return {
      jwtSecret: this.nestConfigService.get<string>('JWT_SECRET', 'dev-secret-change-in-production'),
      jwtExpiration: this.nestConfigService.get<string>('JWT_EXPIRATION', '24h'),
      bcryptRounds: this.nestConfigService.get<number>('BCRYPT_ROUNDS', 12),
    };
  }

  get ai(): AiConfig {
    return {
      geminiApiKey: this.nestConfigService.get<string>('GEMINI_API_KEY', ''),
      geminiModel: this.nestConfigService.get<string>('GEMINI_MODEL', 'gemini-2.5-flash-002'),
      maxTokens: this.nestConfigService.get<number>('AI_MAX_TOKENS', 4096),
      temperature: this.nestConfigService.get<number>('AI_TEMPERATURE', 0.7),
    };
  }

  get telemetry(): TelemetryConfig {
    return {
      enabled: this.nestConfigService.get<boolean>('TELEMETRY_ENABLED', false),
      endpoint: this.nestConfigService.get<string>('TELEMETRY_ENDPOINT'),
      apiKey: this.nestConfigService.get<string>('TELEMETRY_API_KEY'),
      environment: this.nodeEnv,
    };
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
}