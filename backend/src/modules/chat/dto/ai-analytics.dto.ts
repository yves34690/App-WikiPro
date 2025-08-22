import { IsString, IsUUID, IsOptional, IsNumber, IsDateString, IsArray, IsEnum, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Énumération pour les périodes d'analytics - TICKET-BACKEND-002
 */
export enum AnalyticsPeriod {
  LAST_24H = 'last_24h',
  LAST_7D = 'last_7d',
  LAST_30D = 'last_30d',
  LAST_90D = 'last_90d',
  CUSTOM = 'custom'
}

/**
 * Énumération pour les métriques d'analytics - TICKET-BACKEND-002
 */
export enum AnalyticsMetric {
  COST = 'cost',
  TOKENS = 'tokens',
  RESPONSE_TIME = 'response_time',
  CONFIDENCE = 'confidence',
  MESSAGE_COUNT = 'message_count'
}

/**
 * DTO pour les requêtes d'analytics IA - TICKET-BACKEND-002
 */
export class AIAnalyticsQueryDto {
  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsEnum(AnalyticsPeriod)
  period: AnalyticsPeriod;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aiProviders?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aiModels?: string[];

  @IsOptional()
  @IsEnum(AnalyticsMetric)
  groupBy?: AnalyticsMetric;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 100;
}

/**
 * DTO pour les métriques de coût IA - TICKET-BACKEND-002
 */
export class CostMetricsDto {
  totalCostUsd: number;
  avgCostPerMessage: number;
  avgCostPerToken: number;
  costByProvider: Array<{
    provider: string;
    totalCost: number;
    messageCount: number;
    percentage: number;
  }>;
  costByModel: Array<{
    model: string;
    totalCost: number;
    messageCount: number;
    avgCostPerMessage: number;
  }>;
  costTrend: Array<{
    date: string;
    totalCost: number;
    messageCount: number;
  }>;
}

/**
 * DTO pour les métriques de performance IA - TICKET-BACKEND-002
 */
export class PerformanceMetricsDto {
  avgResponseTimeMs: number;
  medianResponseTimeMs: number;
  p95ResponseTimeMs: number;
  avgConfidenceScore: number;
  
  performanceByProvider: Array<{
    provider: string;
    avgResponseTime: number;
    avgConfidenceScore: number;
    messageCount: number;
  }>;
  
  performanceByModel: Array<{
    model: string;
    avgResponseTime: number;
    avgConfidenceScore: number;
    messageCount: number;
  }>;
  
  performanceTrend: Array<{
    date: string;
    avgResponseTime: number;
    avgConfidenceScore: number;
  }>;
}

/**
 * DTO pour les métriques d'usage IA - TICKET-BACKEND-002
 */
export class UsageMetricsDto {
  totalMessages: number;
  totalTokens: number;
  totalConversations: number;
  avgTokensPerMessage: number;
  
  usageByProvider: Array<{
    provider: string;
    messageCount: number;
    tokenCount: number;
    conversationCount: number;
    marketShare: number;
  }>;
  
  usageByModel: Array<{
    model: string;
    messageCount: number;
    tokenCount: number;
    avgTokensPerMessage: number;
  }>;
  
  usageTrend: Array<{
    date: string;
    messageCount: number;
    tokenCount: number;
    conversationCount: number;
  }>;
}

/**
 * DTO pour les analytics IA complets - TICKET-BACKEND-002
 */
export class AIAnalyticsResponseDto {
  tenantId: string;
  userId?: string;
  period: AnalyticsPeriod;
  startDate: Date;
  endDate: Date;
  
  // Métriques principales
  costMetrics: CostMetricsDto;
  performanceMetrics: PerformanceMetricsDto;
  usageMetrics: UsageMetricsDto;
  
  // Insights et alertes
  insights: Array<{
    type: 'cost_spike' | 'performance_drop' | 'usage_increase' | 'model_recommendation';
    severity: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    value?: number;
    threshold?: number;
  }>;
  
  // Recommandations
  recommendations: Array<{
    type: 'cost_optimization' | 'performance_improvement' | 'model_switch';
    title: string;
    description: string;
    estimatedSaving?: number;
    confidence: number;
  }>;
}

/**
 * DTO pour les alertes de coût IA - TICKET-BACKEND-002
 */
export class CostAlertDto {
  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsNumber()
  @Min(0)
  dailyThresholdUsd: number;

  @IsNumber()
  @Min(0)
  monthlyThresholdUsd: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notificationEmails?: string[];

  @IsOptional()
  @IsString()
  webhookUrl?: string;
}

/**
 * DTO pour l'export des données analytics - TICKET-BACKEND-002
 */
export class ExportAnalyticsDto {
  @IsEnum(AnalyticsPeriod)
  period: AnalyticsPeriod;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsEnum(['csv', 'json', 'xlsx'])
  format: 'csv' | 'json' | 'xlsx';

  @IsArray()
  @IsEnum(AnalyticsMetric, { each: true })
  metrics: AnalyticsMetric[];

  @IsOptional()
  @IsBoolean()
  includeRawData?: boolean = false;
}