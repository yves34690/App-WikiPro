import { plainToClass, Transform } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsBoolean, validateSync, Min, Max } from 'class-validator';

export class EnvironmentVariables {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1000)
  @Max(65535)
  PORT = 3001;

  @IsOptional()
  @IsString()
  NODE_ENV = 'development';

  @IsOptional()
  @IsString()
  CORS_ORIGIN = 'http://localhost:3000';

  @IsOptional()
  @IsString()
  DB_HOST = 'localhost';

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  DB_PORT = 5432;

  @IsOptional()
  @IsString()
  DB_USERNAME = 'postgres';

  @IsOptional()
  @IsString()
  DB_PASSWORD = '';

  @IsOptional()
  @IsString()
  DB_DATABASE = 'wikipro';

  @IsOptional()
  @IsString()
  JWT_SECRET = 'dev-secret-change-in-production';

  @IsOptional()
  @IsString()
  JWT_EXPIRATION = '24h';

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(4)
  @Max(16)
  BCRYPT_ROUNDS = 12;

  @IsOptional()
  @IsString()
  GEMINI_API_KEY = '';

  @IsOptional()
  @IsString()
  GEMINI_MODEL = 'gemini-2.5-flash-002';

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(100)
  @Max(8192)
  AI_MAX_TOKENS = 4096;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  @Min(0)
  @Max(2)
  AI_TEMPERATURE = 0.7;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  TELEMETRY_ENABLED = false;

  @IsOptional()
  @IsString()
  TELEMETRY_ENDPOINT?: string;

  @IsOptional()
  @IsString()
  TELEMETRY_API_KEY?: string;
}

export function configValidation(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Configuration validation error: ${errors.toString()}`);
  }

  return validatedConfig;
}