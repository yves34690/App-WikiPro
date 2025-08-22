export interface HealthCheckResult {
  provider: string;
  healthy: boolean;
  latency: number;
  timestamp: Date;
  error?: string;
  details?: {
    model: string;
    apiKeyValid: boolean;
    responseTime: number;
    quotaStatus?: string;
  };
}

export interface HealthCheckOptions {
  timeout?: number;
  includeQuota?: boolean;
  testMessage?: string;
}

export interface ProviderHealthMetrics {
  provider: string;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageLatency: number;
  lastSuccess: Date | null;
  lastFailure: Date | null;
  consecutiveFailures: number;
  uptime: number; // percentage
}

export interface AIHealthReport {
  timestamp: Date;
  overallHealth: 'healthy' | 'degraded' | 'unhealthy';
  activeProvider: string;
  providers: HealthCheckResult[];
  metrics: ProviderHealthMetrics[];
  recommendations?: string[];
  nextCheckIn: number; // milliseconds
}

export interface HealthAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  provider?: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  details?: any;
}

export interface QuotaStatus {
  provider: string;
  used: number;
  limit: number;
  percentage: number;
  resetDate?: Date;
  status: 'ok' | 'warning' | 'critical' | 'exceeded';
}