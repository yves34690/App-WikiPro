import { IsOptional, IsUUID, IsString, IsEnum, IsDateString, IsArray, IsBoolean } from 'class-validator';

/**
 * Énumérations pour l'export - TICKET-BACKEND-005
 */
export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  XLSX = 'xlsx'
}

export enum ExportMetricType {
  COST = 'cost',
  PERFORMANCE = 'performance',
  USAGE = 'usage',
  CONVERSATIONS = 'conversations',
  USERS = 'users',
  PROVIDERS = 'providers',
  MODELS = 'models',
  TRENDS = 'trends'
}

export enum ExportPeriod {
  LAST_24H = 'last_24h',
  LAST_7D = 'last_7d',
  LAST_30D = 'last_30d',
  LAST_90D = 'last_90d',
  CUSTOM = 'custom'
}

/**
 * DTO pour les exports de métriques - TICKET-BACKEND-005
 */
export class ExportMetricsDto {
  @IsUUID()
  tenantId: string;

  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsEnum(ExportPeriod)
  period: ExportPeriod;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsArray()
  @IsEnum(ExportMetricType, { each: true })
  metrics: ExportMetricType[];

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
  @IsBoolean()
  includeRawData?: boolean = false;

  @IsOptional()
  @IsBoolean()
  includeCharts?: boolean = false;

  @IsOptional()
  @IsBoolean()
  includeRecommendations?: boolean = true;

  @IsOptional()
  @IsString()
  reportTitle?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO pour la réponse d'export - TICKET-BACKEND-005
 */
export class ExportResponseDto {
  success: boolean;
  exportId: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  expiresAt: Date;
  
  // Métadonnées de l'export
  metadata: {
    tenantId: string;
    format: ExportFormat;
    period: ExportPeriod;
    metricsIncluded: ExportMetricType[];
    recordCount: number;
    generatedAt: Date;
    generatedBy?: string;
  };
  
  // Résumé des données exportées
  summary: {
    totalCost?: number;
    totalMessages?: number;
    totalConversations?: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    topProvider?: string;
    topModel?: string;
  };
}

/**
 * DTO pour l'export en lot (batch) - TICKET-BACKEND-005
 */
export class BatchExportDto {
  @IsArray()
  exports: ExportMetricsDto[];

  @IsOptional()
  @IsString()
  batchName?: string;

  @IsOptional()
  @IsString()
  notificationEmail?: string;

  @IsOptional()
  @IsBoolean()
  compressFiles?: boolean = true;
}

/**
 * DTO pour la configuration d'export automatique - TICKET-BACKEND-005
 */
export class ScheduledExportDto {
  @IsUUID()
  tenantId: string;

  @IsString()
  name: string;

  @IsString()
  description?: string;

  @IsEnum(['daily', 'weekly', 'monthly'])
  frequency: 'daily' | 'weekly' | 'monthly';

  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsArray()
  @IsEnum(ExportMetricType, { each: true })
  metrics: ExportMetricType[];

  @IsOptional()
  @IsString({ each: true })
  providers?: string[];

  @IsOptional()
  @IsString({ each: true })
  models?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @IsOptional()
  @IsString()
  webhookUrl?: string;

  @IsOptional()
  @IsBoolean()
  includeRecommendations?: boolean = true;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

/**
 * DTO pour le status d'export - TICKET-BACKEND-005
 */
export class ExportStatusDto {
  exportId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  progress: number; // 0-100
  
  startedAt: Date;
  completedAt?: Date;
  
  metadata: {
    tenantId: string;
    format: ExportFormat;
    metrics: ExportMetricType[];
    estimatedSize?: number;
  };
  
  result?: {
    fileName: string;
    fileSize: number;
    downloadUrl: string;
    recordCount: number;
    expiresAt: Date;
  };
  
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * DTO pour les templates d'export - TICKET-BACKEND-005
 */
export class ExportTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsArray()
  @IsEnum(ExportMetricType, { each: true })
  defaultMetrics: ExportMetricType[];

  @IsOptional()
  @IsString({ each: true })
  defaultProviders?: string[];

  @IsOptional()
  @IsEnum(ExportPeriod)
  defaultPeriod?: ExportPeriod;

  @IsOptional()
  @IsBoolean()
  includeCharts?: boolean = false;

  @IsOptional()
  @IsBoolean()
  includeRecommendations?: boolean = true;

  // Configuration avancée pour le template
  advanced?: {
    customColumns?: string[];
    filters?: Record<string, any>;
    formatting?: Record<string, any>;
    charts?: Array<{
      type: string;
      title: string;
      metrics: string[];
    }>;
  };
}

/**
 * DTO pour les rapports personnalisés - TICKET-BACKEND-005
 */
export class CustomReportDto {
  @IsUUID()
  tenantId: string;

  @IsString()
  reportName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsEnum(ExportPeriod)
  period: ExportPeriod;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  // Sections du rapport
  sections: Array<{
    title: string;
    type: 'summary' | 'chart' | 'table' | 'text';
    metrics: ExportMetricType[];
    config?: Record<string, any>;
  }>;

  // Filtres avancés
  filters?: {
    providers?: string[];
    models?: string[];
    userIds?: string[];
    conversationIds?: string[];
    minCost?: number;
    maxCost?: number;
    minResponseTime?: number;
    maxResponseTime?: number;
  };

  // Options de présentation
  presentation?: {
    includeExecutiveSummary?: boolean;
    includeRecommendations?: boolean;
    includeCharts?: boolean;
    theme?: 'default' | 'corporate' | 'minimal';
    logo?: string;
  };
}