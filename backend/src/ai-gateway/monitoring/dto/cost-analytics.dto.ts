import { IsOptional, IsUUID, IsString, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';

/**
 * DTO pour l'analyse détaillée des coûts - TICKET-BACKEND-005
 */
export class CostAnalyticsDto {
  tenantId: string;
  period: string;
  startDate: Date;
  endDate: Date;
  
  // Coûts totaux et moyennes
  totalCostUsd: number;
  avgCostPerDay: number;
  avgCostPerMessage: number;
  avgCostPerToken: number;
  avgCostPerConversation: number;
  
  // Breakdown détaillé par provider
  providerCostBreakdown: Array<{
    provider: string;
    totalCost: number;
    messageCount: number;
    avgCostPerMessage: number;
    costPercentage: number;
    tokenCost: number;
    avgTokensPerMessage: number;
    efficiency: number; // coût/performance ratio
  }>;
  
  // Breakdown détaillé par modèle
  modelCostBreakdown: Array<{
    model: string;
    provider: string;
    totalCost: number;
    messageCount: number;
    avgCostPerMessage: number;
    promptTokensCost: number;
    completionTokensCost: number;
    costPercentage: number;
    recommendation: 'optimal' | 'expensive' | 'consider_alternative';
  }>;
  
  // Analyse temporelle des coûts
  costTimeline: Array<{
    date: string;
    totalCost: number;
    messageCount: number;
    avgCostPerMessage: number;
    topProvider: string;
    topModel: string;
    dailyGrowth: number;
  }>;
  
  // Analyse par heure (pour optimisation)
  hourlyCostPattern: Array<{
    hour: number;
    avgCost: number;
    messageCount: number;
    peakProvider: string;
  }>;
  
  // Top conversations par coût
  topCostConversations: Array<{
    conversationId: string;
    title: string;
    totalCost: number;
    messageCount: number;
    avgCostPerMessage: number;
    userId: string;
    provider: string;
    model: string;
    startDate: Date;
    endDate: Date;
  }>;
  
  // Top utilisateurs par coût
  topCostUsers: Array<{
    userId: string;
    userName?: string;
    totalCost: number;
    messageCount: number;
    conversationCount: number;
    avgCostPerMessage: number;
    favoriteProvider: string;
    favoriteModel: string;
  }>;
  
  // Optimisation et recommandations
  costOptimization: {
    potentialSavings: number;
    cacheOptimizationSavings: number;
    modelOptimizationSavings: number;
    promptOptimizationSavings: number;
    
    recommendations: Array<{
      type: 'model_switch' | 'prompt_optimization' | 'cache_strategy' | 'usage_pattern';
      title: string;
      description: string;
      estimatedSaving: number;
      confidence: number;
      implementation: string;
    }>;
  };
  
  // Comparaisons et benchmarks
  benchmarks: {
    industryAvgCostPerMessage: number;
    comparisonToIndustry: number; // pourcentage vs moyenne industrie
    comparisonToPreviousPeriod: number;
    efficiency: number; // coût vs qualité
  };
  
  // Alertes et seuils
  costAlerts: Array<{
    type: 'daily_threshold' | 'monthly_threshold' | 'spike_detected' | 'unusual_pattern';
    severity: 'info' | 'warning' | 'critical';
    message: string;
    currentValue: number;
    threshold: number;
    detectedAt: Date;
  }>;
  
  // Projections et prédictions
  projections: {
    nextWeekCost: number;
    nextMonthCost: number;
    quarterlyProjection: number;
    annualProjection: number;
    confidenceLevel: number;
  };
}

/**
 * DTO pour les filtres d'analyse des coûts - TICKET-BACKEND-005
 */
export class CostFiltersDto {
  @IsUUID()
  tenantId: string;

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
  @IsString({ each: true })
  providers?: string[];

  @IsOptional()
  @IsString({ each: true })
  models?: string[];

  @IsOptional()
  @IsString({ each: true })
  userIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(100)
  topConversationsLimit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(100)
  topUsersLimit?: number = 20;

  @IsOptional()
  @IsString({ each: true })
  includeMetrics?: string[] = ['breakdown', 'timeline', 'optimization', 'projections'];
}

/**
 * DTO pour l'analyse de coût par conversation - TICKET-BACKEND-005
 */
export class ConversationCostAnalysisDto {
  conversationId: string;
  title: string;
  userId: string;
  tenantId: string;
  
  totalCost: number;
  messageCount: number;
  avgCostPerMessage: number;
  
  // Breakdown par message
  messageBreakdown: Array<{
    messageId: string;
    role: 'user' | 'assistant';
    provider: string;
    model: string;
    cost: number;
    tokenCount: number;
    responseTime: number;
    timestamp: Date;
  }>;
  
  // Progression des coûts
  costProgression: Array<{
    messageIndex: number;
    cumulativeCost: number;
    incrementalCost: number;
    provider: string;
    model: string;
  }>;
  
  // Efficacité
  efficiency: {
    costEfficiency: number; // coût vs longueur réponse
    speedEfficiency: number; // coût vs vitesse
    qualityEfficiency: number; // coût vs note utilisateur
  };
  
  // Recommandations
  recommendations: Array<{
    type: 'model_optimization' | 'prompt_optimization' | 'conversation_strategy';
    suggestion: string;
    estimatedSaving: number;
  }>;
}

/**
 * DTO pour export analyse coûts - TICKET-BACKEND-005
 */
export class ExportCostAnalyticsDto {
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
  includeBreakdowns?: string[] = ['provider', 'model', 'conversation', 'user', 'timeline'];

  @IsOptional()
  @IsString({ each: true })
  includeRecommendations?: boolean = true;
}