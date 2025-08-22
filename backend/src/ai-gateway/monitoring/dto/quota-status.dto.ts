import { IsUUID, IsOptional, IsString, IsEnum, IsNumber, IsBoolean } from 'class-validator';

/**
 * DTO pour le status des quotas en temps réel - TICKET-BACKEND-005
 */
export class QuotaStatusDto {
  tenantId: string;
  timestamp: Date;
  
  // Quotas globaux du tenant
  tenantQuotas: {
    dailyLimit: {
      limitUsd: number;
      usedUsd: number;
      remainingUsd: number;
      usagePercent: number;
      resetAt: Date;
      status: 'safe' | 'warning' | 'critical' | 'exceeded';
    };
    
    monthlyLimit: {
      limitUsd: number;
      usedUsd: number;
      remainingUsd: number;
      usagePercent: number;
      resetAt: Date;
      status: 'safe' | 'warning' | 'critical' | 'exceeded';
    };
    
    tokenLimit: {
      dailyLimit: number;
      usedTokens: number;
      remainingTokens: number;
      usagePercent: number;
      resetAt: Date;
      status: 'safe' | 'warning' | 'critical' | 'exceeded';
    };
    
    messageLimit: {
      dailyLimit: number;
      usedMessages: number;
      remainingMessages: number;
      usagePercent: number;
      resetAt: Date;
      status: 'safe' | 'warning' | 'critical' | 'exceeded';
    };
  };
  
  // Quotas par provider
  providerQuotas: Array<{
    provider: string;
    dailyQuota: {
      limit: number;
      used: number;
      remaining: number;
      usagePercent: number;
      status: 'safe' | 'warning' | 'critical' | 'exceeded';
    };
    
    rateLimit: {
      requestsPerMinute: number;
      currentRpm: number;
      remainingRpm: number;
      tokensPerMinute: number;
      currentTpm: number;
      remainingTpm: number;
      status: 'healthy' | 'throttled' | 'limited';
    };
    
    lastError?: {
      type: 'quota_exceeded' | 'rate_limit' | 'api_error';
      message: string;
      timestamp: Date;
    };
  }>;
  
  // Quotas par modèle
  modelQuotas: Array<{
    model: string;
    provider: string;
    dailyUsage: {
      cost: number;
      tokens: number;
      messages: number;
    };
    
    limits: {
      maxCostPerDay?: number;
      maxTokensPerDay?: number;
      maxMessagesPerDay?: number;
    };
    
    status: 'available' | 'limited' | 'unavailable';
    recommendation: 'optimal' | 'monitor' | 'switch';
  }>;
  
  // Alertes actives
  activeAlerts: Array<{
    type: 'quota_warning' | 'quota_exceeded' | 'rate_limit' | 'cost_spike';
    severity: 'info' | 'warning' | 'critical';
    provider?: string;
    model?: string;
    message: string;
    threshold: number;
    currentValue: number;
    triggeredAt: Date;
  }>;
  
  // Prédictions et recommandations
  predictions: {
    dailyUsageProjection: number;
    monthlyUsageProjection: number;
    quotaExhaustionEta?: Date;
    recommendedActions: Array<{
      action: 'increase_quota' | 'optimize_usage' | 'switch_provider' | 'add_limits';
      description: string;
      urgency: 'low' | 'medium' | 'high';
    }>;
  };
  
  // Historique récent
  recentUsage: Array<{
    timestamp: Date;
    costIncrement: number;
    tokenIncrement: number;
    messageIncrement: number;
    provider: string;
    model: string;
  }>;
  
  // Configuration des seuils
  thresholds: {
    warningPercent: number; // ex: 80%
    criticalPercent: number; // ex: 95%
    notificationEnabled: boolean;
    autoLimitEnabled: boolean;
  };
}

/**
 * DTO pour la configuration des quotas - TICKET-BACKEND-005
 */
export class QuotaConfigDto {
  @IsUUID()
  tenantId: string;

  // Limites globales
  @IsOptional()
  @IsNumber()
  dailyLimitUsd?: number;

  @IsOptional()
  @IsNumber()
  monthlyLimitUsd?: number;

  @IsOptional()
  @IsNumber()
  dailyTokenLimit?: number;

  @IsOptional()
  @IsNumber()
  dailyMessageLimit?: number;

  // Seuils d'alerte
  @IsOptional()
  @IsNumber()
  warningThresholdPercent?: number = 80;

  @IsOptional()
  @IsNumber()
  criticalThresholdPercent?: number = 95;

  // Configuration par provider
  @IsOptional()
  providerLimits?: Array<{
    provider: string;
    dailyLimitUsd: number;
    monthlyLimitUsd: number;
    rateLimit?: {
      requestsPerMinute: number;
      tokensPerMinute: number;
    };
  }>;

  // Configuration par modèle
  @IsOptional()
  modelLimits?: Array<{
    model: string;
    provider: string;
    maxCostPerDay?: number;
    maxTokensPerDay?: number;
    maxMessagesPerDay?: number;
    enabled: boolean;
  }>;

  // Notifications
  @IsOptional()
  @IsBoolean()
  enableNotifications?: boolean = true;

  @IsOptional()
  @IsString({ each: true })
  notificationEmails?: string[];

  @IsOptional()
  @IsString()
  webhookUrl?: string;

  // Actions automatiques
  @IsOptional()
  @IsBoolean()
  enableAutoLimits?: boolean = false;

  @IsOptional()
  @IsEnum(['block', 'throttle', 'switch_provider'])
  autoLimitAction?: 'block' | 'throttle' | 'switch_provider';
}

/**
 * DTO pour les requêtes de quota status - TICKET-BACKEND-005
 */
export class QuotaStatusQueryDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @IsOptional()
  @IsString({ each: true })
  providers?: string[];

  @IsOptional()
  @IsString({ each: true })
  models?: string[];

  @IsOptional()
  @IsBoolean()
  includeHistory?: boolean = false;

  @IsOptional()
  @IsBoolean()
  includePredictions?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeRecommendations?: boolean = true;
}

/**
 * DTO pour les alertes de quota - TICKET-BACKEND-005
 */
export class QuotaAlertDto {
  tenantId: string;
  alertId: string;
  type: 'quota_warning' | 'quota_exceeded' | 'rate_limit' | 'cost_spike' | 'usage_anomaly';
  severity: 'info' | 'warning' | 'critical';
  
  provider?: string;
  model?: string;
  
  title: string;
  message: string;
  
  threshold: number;
  currentValue: number;
  usagePercent: number;
  
  triggeredAt: Date;
  resolvedAt?: Date;
  
  // Actions recommandées
  recommendedActions: Array<{
    action: string;
    description: string;
    urgency: 'low' | 'medium' | 'high';
    autoExecutable: boolean;
  }>;
  
  // Impact estimé
  impact: {
    affectedUsers: number;
    blockedRequests: number;
    estimatedDowntime?: number;
  };
}

/**
 * DTO pour l'historique des quotas - TICKET-BACKEND-005
 */
export class QuotaHistoryDto {
  tenantId: string;
  startDate: Date;
  endDate: Date;
  
  // Évolution des quotas
  dailyUsage: Array<{
    date: string;
    totalCost: number;
    totalTokens: number;
    totalMessages: number;
    quotaUsagePercent: number;
    alerts: number;
  }>;
  
  // Événements marquants
  events: Array<{
    timestamp: Date;
    type: 'quota_exceeded' | 'limit_changed' | 'provider_switched' | 'alert_triggered';
    description: string;
    impact: 'low' | 'medium' | 'high';
    provider?: string;
    model?: string;
  }>;
  
  // Tendances
  trends: {
    usageGrowthRate: number;
    costGrowthRate: number;
    efficiency: number; // quota utilisé vs valeur générée
    recommendations: string[];
  };
}

/**
 * DTO pour les tests de configuration quota - TICKET-BACKEND-005
 */
export class TestQuotaConfigDto {
  @IsUUID()
  tenantId: string;

  // Configuration à tester
  config: QuotaConfigDto;

  // Scénarios de test
  @IsOptional()
  testScenarios?: Array<{
    name: string;
    description: string;
    simulatedUsage: {
      costPerDay: number;
      tokensPerDay: number;
      messagesPerDay: number;
    };
    expectedOutcome: 'allowed' | 'warning' | 'blocked';
  }>;

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean = true;
}

/**
 * DTO pour la réponse des tests quota - TICKET-BACKEND-005
 */
export class TestQuotaResultDto {
  success: boolean;
  
  testResults: Array<{
    scenario: string;
    passed: boolean;
    expectedOutcome: string;
    actualOutcome: string;
    details?: string;
  }>;
  
  configValidation: {
    valid: boolean;
    warnings: string[];
    errors: string[];
  };
  
  recommendations: Array<{
    type: 'optimization' | 'configuration' | 'monitoring';
    suggestion: string;
    impact: 'low' | 'medium' | 'high';
  }>;
}