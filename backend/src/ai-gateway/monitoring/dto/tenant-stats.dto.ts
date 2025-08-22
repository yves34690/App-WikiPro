import { IsUUID, IsOptional, IsString, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';

/**
 * DTO pour les statistiques détaillées d'un tenant - TICKET-BACKEND-005
 */
export class TenantAIStatsDto {
  tenantId: string;
  period: string;
  startDate: Date;
  endDate: Date;
  
  // Métriques business principales
  totalCostUsd: number;
  totalTokens: number;
  totalMessages: number;
  totalConversations: number;
  
  // Moyennes et efficacité
  avgCostPerConversation: number;
  avgCostPerMessage: number;
  avgTokensPerMessage: number;
  avgResponseTimeMs: number;
  avgConfidenceScore: number;
  
  // Répartition par provider
  providerBreakdown: Array<{
    provider: string;
    totalCost: number;
    messageCount: number;
    conversationCount: number;
    avgResponseTime: number;
    avgConfidenceScore: number;
    marketShare: number;
    reliability: number;
  }>;
  
  // Répartition par modèle
  modelBreakdown: Array<{
    model: string;
    provider: string;
    totalCost: number;
    messageCount: number;
    avgCostPerMessage: number;
    avgTokensPerMessage: number;
    avgConfidenceScore: number;
    usage: number;
  }>;
  
  // Tendances temporelles
  costTrend: Array<{
    date: string;
    totalCost: number;
    messageCount: number;
    conversationCount: number;
    avgResponseTime: number;
  }>;
  
  // Utilisation par utilisateur (top 10)
  topUsersByUsage: Array<{
    userId: string;
    userName?: string;
    totalCost: number;
    messageCount: number;
    conversationCount: number;
    lastActivity: Date;
  }>;
  
  // Conversations les plus coûteuses
  topConversationsByCost: Array<{
    conversationId: string;
    title: string;
    totalCost: number;
    messageCount: number;
    userId: string;
    createdAt: Date;
  }>;
  
  // Insights et alertes
  insights: Array<{
    type: 'cost_spike' | 'performance_drop' | 'usage_increase' | 'model_recommendation' | 'cost_optimization';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    value?: number;
    threshold?: number;
    recommendation?: string;
  }>;
  
  // Économies potentielles
  potentialSavings: {
    cacheOptimization: number;
    modelOptimization: number;
    promptOptimization: number;
    total: number;
  };
  
  // Projections
  projections: {
    monthlyCostEstimate: number;
    growthRate: number;
    nextMonthEstimate: number;
  };
}

/**
 * DTO pour les requêtes de statistiques tenant - TICKET-BACKEND-005
 */
export class TenantStatsQueryDto {
  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsEnum(['last_24h', 'last_7d', 'last_30d', 'last_90d', 'custom'])
  period?: string = 'last_7d';

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString({ each: true })
  includeProviders?: string[];

  @IsOptional()
  @IsString({ each: true })
  includeModels?: string[];

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(50)
  topUsersLimit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(50)
  topConversationsLimit?: number = 10;
}

/**
 * DTO pour export tenant stats en CSV/JSON - TICKET-BACKEND-005
 */
export class ExportTenantStatsDto {
  @IsUUID()
  tenantId: string;

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
  includeMetrics?: string[] = ['cost', 'usage', 'performance', 'trends'];
}