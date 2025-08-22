import { IsOptional, IsNumber, IsString, IsEnum, IsDateString, Min, Max } from 'class-validator';

/**
 * DTO pour les métriques d'usage global admin - TICKET-BACKEND-005
 */
export class GlobalUsageDto {
  period: string;
  startDate: Date;
  endDate: Date;
  
  // Métriques globales cross-tenant
  totalCostUsd: number;
  totalTokens: number;
  totalMessages: number;
  totalConversations: number;
  totalTenants: number;
  activeTenants: number;
  
  // Moyennes globales
  avgCostPerTenant: number;
  avgMessagesPerTenant: number;
  avgConversationsPerTenant: number;
  avgCostPerMessage: number;
  avgResponseTimeMs: number;
  
  // Top tenants par coût
  topTenantsByCost: Array<{
    tenantId: string;
    tenantName?: string;
    totalCost: number;
    messageCount: number;
    conversationCount: number;
    growth: number;
    lastActivity: Date;
  }>;
  
  // Top tenants par usage
  topTenantsByUsage: Array<{
    tenantId: string;
    tenantName?: string;
    messageCount: number;
    conversationCount: number;
    totalTokens: number;
    avgTokensPerMessage: number;
    lastActivity: Date;
  }>;
  
  // Répartition par provider (global)
  globalProviderBreakdown: Array<{
    provider: string;
    totalCost: number;
    messageCount: number;
    tenantCount: number;
    avgResponseTime: number;
    reliability: number;
    marketShare: number;
  }>;
  
  // Répartition par modèle (global)
  globalModelBreakdown: Array<{
    model: string;
    provider: string;
    totalCost: number;
    messageCount: number;
    tenantCount: number;
    avgCostPerMessage: number;
    usage: number;
  }>;
  
  // Tendances temporelles globales
  globalCostTrend: Array<{
    date: string;
    totalCost: number;
    messageCount: number;
    activeTenants: number;
    avgResponseTime: number;
  }>;
  
  // Croissance et métriques business
  growth: {
    costGrowthPercent: number;
    usageGrowthPercent: number;
    newTenantsCount: number;
    churnedTenantsCount: number;
    monthOverMonthGrowth: number;
  };
  
  // Performance système
  systemPerformance: {
    avgResponseTime: number;
    p95ResponseTime: number;
    errorRate: number;
    uptime: number;
    cacheHitRate: number;
  };
  
  // Alertes système
  systemAlerts: Array<{
    type: 'high_cost' | 'performance_issue' | 'quota_exceeded' | 'error_spike';
    severity: 'warning' | 'critical';
    tenantId?: string;
    message: string;
    value: number;
    threshold: number;
    detectedAt: Date;
  }>;
  
  // Projections globales
  projections: {
    nextMonthCost: number;
    nextMonthUsage: number;
    nextMonthTenants: number;
    annualCostEstimate: number;
  };
}

/**
 * DTO pour les requêtes d'usage global - TICKET-BACKEND-005
 */
export class GlobalUsageQueryDto {
  @IsOptional()
  @IsEnum(['last_24h', 'last_7d', 'last_30d', 'last_90d', 'custom'])
  period?: string = 'last_30d';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(100)
  topTenantsLimit?: number = 20;

  @IsOptional()
  @IsString({ each: true })
  includeProviders?: string[];

  @IsOptional()
  @IsString({ each: true })
  includeMetrics?: string[] = ['cost', 'usage', 'performance', 'growth'];

  @IsOptional()
  @IsString({ each: true })
  tenantFilter?: string[];
}

/**
 * DTO pour export usage global en CSV/JSON - TICKET-BACKEND-005
 */
export class ExportGlobalUsageDto {
  @IsEnum(['csv', 'json', 'xlsx'])
  format: 'csv' | 'json' | 'xlsx';

  @IsEnum(['last_24h', 'last_7d', 'last_30d', 'last_90d', 'custom'])
  period: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString({ each: true })
  includeMetrics?: string[] = ['tenants', 'providers', 'models', 'trends', 'performance'];

  @IsOptional()
  @IsString({ each: true })
  tenantFilter?: string[];
}