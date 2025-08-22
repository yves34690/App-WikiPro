/**
 * Index des DTOs pour le monitoring IA - TICKET-BACKEND-005
 */

// Tenant Stats DTOs
export * from './tenant-stats.dto';

// Global Usage DTOs
export * from './global-usage.dto';

// Cost Analytics DTOs
export * from './cost-analytics.dto';

// Performance Metrics DTOs
export * from './performance-metrics.dto';

// Export Metrics DTOs
export * from './export-metrics.dto';

// Quota Status DTOs
export * from './quota-status.dto';

// Types utilitaires
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface PaginationOptions {
  limit: number;
  offset: number;
}

export interface MetricFilter {
  providers?: string[];
  models?: string[];
  userIds?: string[];
  minValue?: number;
  maxValue?: number;
}

export interface DashboardMetrics {
  cost: number;
  performance: number;
  usage: number;
  quality: number;
}

export interface AlertConfig {
  enabled: boolean;
  thresholds: {
    warning: number;
    critical: number;
  };
  notifications: {
    email?: string[];
    webhook?: string;
    slack?: string;
  };
}

export interface CacheSettings {
  ttl: number;
  enabled: boolean;
  invalidateOnUpdate: boolean;
}