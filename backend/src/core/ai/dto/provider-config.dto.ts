import { IsBoolean, IsNumber, IsArray, IsString, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AIProviderType, ProviderStatus } from '../providers/base-provider';

export class ProviderConfigDto {
  @ApiProperty({
    description: 'Provider activé ou non',
  })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    description: 'Priorité du provider (plus élevé = priorité plus haute)',
    minimum: 1,
    maximum: 10,
  })
  @IsNumber()
  @Min(1)
  @Max(10)
  priority: number;

  @ApiProperty({
    description: 'Nombre maximum de tokens par requête',
    minimum: 1,
    maximum: 8192,
  })
  @IsNumber()
  @Min(1)
  @Max(8192)
  maxTokensPerRequest: number;

  @ApiProperty({
    description: 'Limite de requêtes par minute',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  maxRequestsPerMinute: number;

  @ApiProperty({
    description: 'Limite quotidienne de tokens',
    minimum: 1000,
  })
  @IsNumber()
  @Min(1000)
  dailyTokenLimit: number;

  @ApiProperty({
    description: 'Limite mensuelle de tokens',
    minimum: 10000,
  })
  @IsNumber()
  @Min(10000)
  monthlyTokenLimit: number;

  @ApiProperty({
    description: 'Timeout en millisecondes',
    minimum: 5000,
    maximum: 60000,
  })
  @IsNumber()
  @Min(5000)
  @Max(60000)
  timeout: number;

  @ApiProperty({
    description: 'Nombre de tentatives de retry',
    minimum: 0,
    maximum: 5,
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  retryAttempts: number;

  @ApiProperty({
    description: 'Fallback automatique activé',
  })
  @IsBoolean()
  fallbackEnabled: boolean;

  @ApiProperty({
    type: [String],
    description: 'Liste des modèles supportés',
  })
  @IsArray()
  @IsString({ each: true })
  models: string[];

  @ApiPropertyOptional({
    description: 'Métadonnées supplémentaires',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ProviderStatusDto {
  @ApiProperty({
    enum: AIProviderType,
    description: 'Type de provider',
  })
  @IsEnum(AIProviderType)
  type: AIProviderType;

  @ApiProperty({
    description: 'Nom du provider',
  })
  @IsString()
  name: string;

  @ApiProperty({
    enum: ProviderStatus,
    description: 'Statut actuel du provider',
  })
  @IsEnum(ProviderStatus)
  status: ProviderStatus;

  @ApiProperty({
    description: 'Provider disponible pour les requêtes',
  })
  @IsBoolean()
  available: boolean;

  @ApiProperty({
    description: 'Configuration du provider',
  })
  config: ProviderConfigDto;

  @ApiProperty({
    description: 'Métriques du provider',
  })
  metrics: ProviderMetricsDto;
}

export class ProviderMetricsDto {
  @ApiProperty({
    description: 'Nombre total de requêtes',
  })
  @IsNumber()
  requestCount: number;

  @ApiProperty({
    description: 'Nombre de requêtes réussies',
  })
  @IsNumber()
  successCount: number;

  @ApiProperty({
    description: 'Nombre d\'erreurs',
  })
  @IsNumber()
  errorCount: number;

  @ApiProperty({
    description: 'Latence moyenne en ms',
  })
  @IsNumber()
  averageLatency: number;

  @ApiProperty({
    description: 'Tokens utilisés aujourd\'hui',
  })
  @IsNumber()
  dailyTokens: number;

  @ApiProperty({
    description: 'Tokens utilisés ce mois',
  })
  @IsNumber()
  monthlyTokens: number;

  @ApiProperty({
    description: 'Taux d\'erreur (0-1)',
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  errorRate: number;

  @ApiProperty({
    description: 'Dernière mise à jour des métriques',
  })
  lastUpdated: Date;
}