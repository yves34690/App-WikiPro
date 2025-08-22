export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  providers: ProviderStatus[];
  checks: HealthCheck[];
  lastUpdated: Date;
  metadata?: {
    uptime: number;
    totalRequests: number;
    errorRate: number;
    averageResponseTime: number;
  };
}

export interface ProviderStatus {
  provider: string;
  status: 'available' | 'degraded' | 'unavailable';
  enabled: boolean;
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
  apiKeyValid?: boolean;
  rateLimitStatus?: {
    remaining: number;
    resetTime: Date;
  };
  capabilities?: string[];
  metadata?: Record<string, any>;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  timestamp: Date;
  responseTime?: number;
  details?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  requestsPerSecond: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  successRate: number;
  timeWindow: string;
  timestamp: Date;
}

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost?: number;
  requestsByProvider: Record<string, number>;
  tokensByProvider: Record<string, number>;
  costByProvider?: Record<string, number>;
  period: {
    start: Date;
    end: Date;
  };
}

export interface AlertThreshold {
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq';
  severity: 'info' | 'warn' | 'error' | 'critical';
  enabled: boolean;
}