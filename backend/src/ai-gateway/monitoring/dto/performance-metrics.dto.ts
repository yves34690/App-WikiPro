import { IsOptional, IsUUID, IsString, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';

/**
 * DTO pour les métriques de performance IA - TICKET-BACKEND-005
 */
export class PerformanceMetricsDto {
  tenantId: string;
  period: string;
  startDate: Date;
  endDate: Date;
  
  // Métriques de latence
  responseTime: {
    avgMs: number;
    medianMs: number;
    p50Ms: number;
    p90Ms: number;
    p95Ms: number;
    p99Ms: number;
    minMs: number;
    maxMs: number;
  };
  
  // Métriques de qualité
  quality: {
    avgConfidenceScore: number;
    medianConfidenceScore: number;
    highConfidenceRate: number; // >0.8
    lowConfidenceRate: number;  // <0.5
    avgUserRating: number;
    userSatisfactionRate: number;
  };
  
  // Métriques de fiabilité
  reliability: {
    successRate: number;
    errorRate: number;
    timeoutRate: number;
    retryRate: number;
    uptime: number;
  };
  
  // Performance par provider
  providerPerformance: Array<{
    provider: string;
    avgResponseTime: number;
    p95ResponseTime: number;
    avgConfidenceScore: number;
    successRate: number;
    errorRate: number;
    messageCount: number;
    reliability: number;
    costEfficiency: number; // performance/coût ratio
  }>;
  
  // Performance par modèle
  modelPerformance: Array<{
    model: string;
    provider: string;
    avgResponseTime: number;
    p95ResponseTime: number;
    avgConfidenceScore: number;
    avgUserRating: number;
    successRate: number;
    messageCount: number;
    efficiency: number;
    recommendation: 'excellent' | 'good' | 'average' | 'consider_alternative';
  }>;
  
  // Tendances temporelles de performance
  performanceTrend: Array<{
    date: string;
    avgResponseTime: number;
    avgConfidenceScore: number;
    successRate: number;
    messageCount: number;
    errorCount: number;
  }>;
  
  // Performance par heure (patterns d'usage)
  hourlyPerformance: Array<{
    hour: number;
    avgResponseTime: number;
    messageCount: number;
    errorRate: number;
    peakLoad: boolean;
  }>;
  
  // Conversations avec meilleures/pires performances
  performanceExtremes: {
    bestPerformingConversations: Array<{
      conversationId: string;
      title: string;
      avgResponseTime: number;
      avgConfidenceScore: number;
      messageCount: number;
      userId: string;
    }>;
    
    worstPerformingConversations: Array<{
      conversationId: string;
      title: string;
      avgResponseTime: number;
      avgConfidenceScore: number;
      errorCount: number;
      userId: string;
      issues: string[];
    }>;
  };
  
  // Utilisateurs avec performance exceptionnelle/problématique
  userPerformanceAnalysis: Array<{
    userId: string;
    userName?: string;
    avgResponseTime: number;
    avgConfidenceScore: number;
    messageCount: number;
    conversationCount: number;
    errorRate: number;
    satisfactionRate: number;
    performanceCategory: 'excellent' | 'good' | 'average' | 'poor';
  }>;
  
  // Alertes de performance
  performanceAlerts: Array<{
    type: 'high_latency' | 'low_confidence' | 'high_error_rate' | 'degraded_performance';
    severity: 'warning' | 'critical';
    provider?: string;
    model?: string;
    message: string;
    currentValue: number;
    threshold: number;
    detectedAt: Date;
    affectedMessages: number;
  }>;
  
  // Benchmarks et comparaisons
  benchmarks: {
    industryAvgResponseTime: number;
    industryAvgConfidenceScore: number;
    comparisonToIndustry: {
      responseTime: number; // % vs industrie
      quality: number;
      reliability: number;
    };
    comparisonToPreviousPeriod: {
      responseTime: number;
      quality: number;
      reliability: number;
    };
  };
  
  // Recommandations d'optimisation
  optimizationRecommendations: Array<{
    type: 'infrastructure' | 'model_selection' | 'prompt_optimization' | 'caching' | 'load_balancing';
    title: string;
    description: string;
    expectedImprovement: string;
    implementationEffort: 'low' | 'medium' | 'high';
    priority: 'low' | 'medium' | 'high' | 'critical';
  }>;
  
  // Insights de performance
  insights: Array<{
    type: 'pattern_detected' | 'anomaly_detected' | 'optimization_opportunity' | 'performance_regression';
    title: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
    confidence: number;
    actionRequired: boolean;
  }>;
}

/**
 * DTO pour les filtres de performance - TICKET-BACKEND-005
 */
export class PerformanceFiltersDto {
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
  providers?: string[];

  @IsOptional()
  @IsString({ each: true })
  models?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minResponseTime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxResponseTime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  minConfidenceScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(50)
  topConversationsLimit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(50)
  topUsersLimit?: number = 10;

  @IsOptional()
  @IsString({ each: true })
  includeMetrics?: string[] = ['latency', 'quality', 'reliability', 'trends'];
}

/**
 * DTO pour les métriques de performance temps réel - TICKET-BACKEND-005
 */
export class RealTimePerformanceDto {
  timestamp: Date;
  
  // Métriques instantanées
  current: {
    activeConversations: number;
    messagesPerMinute: number;
    avgResponseTime: number;
    currentErrorRate: number;
    activeProviders: string[];
  };
  
  // Métriques dernières 5 minutes
  last5min: {
    messageCount: number;
    avgResponseTime: number;
    errorCount: number;
    uniqueUsers: number;
  };
  
  // Alertes temps réel
  activeAlerts: Array<{
    type: string;
    severity: 'warning' | 'critical';
    message: string;
    startedAt: Date;
  }>;
  
  // Status par provider
  providerStatus: Array<{
    provider: string;
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    errorRate: number;
    lastCheck: Date;
  }>;
}

/**
 * DTO pour export métriques performance - TICKET-BACKEND-005
 */
export class ExportPerformanceMetricsDto {
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
  includeMetrics?: string[] = ['latency', 'quality', 'reliability', 'providers', 'models', 'trends'];

  @IsOptional()
  @IsString({ each: true })
  includeRecommendations?: boolean = true;
}