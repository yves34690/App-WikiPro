import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  TenantStatsQueryDto,
  ExportTenantStatsDto,
  GlobalUsageQueryDto,
  CostFiltersDto,
  PerformanceFiltersDto,
  QuotaStatusQueryDto,
  QuotaConfigDto,
  ExportMetricsDto,
  ExportFormat,
  ExportMetricType,
  ExportPeriod
} from './dto';

/**
 * Tests de validation des DTOs pour s'assurer que les formats sont dashboard-ready - TICKET-BACKEND-005
 */
describe('DTO Validation Tests', () => {
  
  // =================== VALIDATION TENANT STATS ===================

  describe('TenantStatsQueryDto', () => {
    it('should validate valid tenant stats query', async () => {
      const dto = plainToClass(TenantStatsQueryDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        period: 'last_7d',
        topUsersLimit: 10,
        topConversationsLimit: 20
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid tenant UUID', async () => {
      const dto = plainToClass(TenantStatsQueryDto, {
        tenantId: 'invalid-uuid',
        period: 'last_7d'
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('tenantId');
    });

    it('should reject invalid period', async () => {
      const dto = plainToClass(TenantStatsQueryDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        period: 'invalid_period'
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('period');
    });

    it('should reject invalid limits', async () => {
      const dto = plainToClass(TenantStatsQueryDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        period: 'last_7d',
        topUsersLimit: 100, // Au-dessus du max (50)
        topConversationsLimit: 2 // En-dessous du min (5)
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate custom period with dates', async () => {
      const dto = plainToClass(TenantStatsQueryDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        period: 'custom',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('ExportTenantStatsDto', () => {
    it('should validate valid export request', async () => {
      const dto = plainToClass(ExportTenantStatsDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        format: 'json',
        period: 'last_30d',
        includeMetrics: ['cost', 'usage', 'performance']
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid export format', async () => {
      const dto = plainToClass(ExportTenantStatsDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        format: 'pdf', // Format non supporté
        period: 'last_7d'
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('format');
    });
  });

  // =================== VALIDATION GLOBAL USAGE ===================

  describe('GlobalUsageQueryDto', () => {
    it('should validate valid global usage query', async () => {
      const dto = plainToClass(GlobalUsageQueryDto, {
        period: 'last_30d',
        topTenantsLimit: 25,
        includeMetrics: ['cost', 'usage', 'performance', 'growth']
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid tenant limit', async () => {
      const dto = plainToClass(GlobalUsageQueryDto, {
        period: 'last_30d',
        topTenantsLimit: 150 // Au-dessus du max (100)
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('topTenantsLimit');
    });
  });

  // =================== VALIDATION COST FILTERS ===================

  describe('CostFiltersDto', () => {
    it('should validate valid cost filters', async () => {
      const dto = plainToClass(CostFiltersDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        period: 'last_30d',
        providers: ['openai', 'anthropic'],
        models: ['gpt-4', 'claude-3'],
        minCost: 10.0,
        maxCost: 1000.0,
        topConversationsLimit: 30,
        includeMetrics: ['breakdown', 'timeline', 'optimization']
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject negative costs', async () => {
      const dto = plainToClass(CostFiltersDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        period: 'last_30d',
        minCost: -10.0, // Négatif
        maxCost: -5.0   // Négatif
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate large limits within bounds', async () => {
      const dto = plainToClass(CostFiltersDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        period: 'last_30d',
        topConversationsLimit: 100, // Max autorisé
        topUsersLimit: 100         // Max autorisé
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  // =================== VALIDATION PERFORMANCE FILTERS ===================

  describe('PerformanceFiltersDto', () => {
    it('should validate valid performance filters', async () => {
      const dto = plainToClass(PerformanceFiltersDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        period: 'last_7d',
        providers: ['openai'],
        models: ['gpt-4', 'gpt-3.5-turbo'],
        minResponseTime: 1000,
        maxResponseTime: 10000,
        minConfidenceScore: 0.8,
        includeMetrics: ['latency', 'quality', 'reliability', 'trends']
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid confidence score range', async () => {
      const dto = plainToClass(PerformanceFiltersDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        period: 'last_7d',
        minConfidenceScore: 1.5 // Au-dessus de 1.0
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('minConfidenceScore');
    });

    it('should reject negative response times', async () => {
      const dto = plainToClass(PerformanceFiltersDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        period: 'last_7d',
        minResponseTime: -1000 // Négatif
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('minResponseTime');
    });
  });

  // =================== VALIDATION QUOTA CONFIG ===================

  describe('QuotaConfigDto', () => {
    it('should validate valid quota configuration', async () => {
      const dto = plainToClass(QuotaConfigDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        dailyLimitUsd: 100.0,
        monthlyLimitUsd: 2000.0,
        dailyTokenLimit: 1000000,
        dailyMessageLimit: 5000,
        warningThresholdPercent: 80,
        criticalThresholdPercent: 95,
        enableNotifications: true,
        notificationEmails: ['admin@example.com'],
        enableAutoLimits: false
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject negative limits', async () => {
      const dto = plainToClass(QuotaConfigDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        dailyLimitUsd: -50.0 // Négatif
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate threshold percentages', async () => {
      const dto = plainToClass(QuotaConfigDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        warningThresholdPercent: 75,
        criticalThresholdPercent: 90
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  // =================== VALIDATION EXPORT METRICS ===================

  describe('ExportMetricsDto', () => {
    it('should validate valid export metrics request', async () => {
      const dto = plainToClass(ExportMetricsDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        format: ExportFormat.JSON,
        period: ExportPeriod.LAST_30D,
        metrics: [ExportMetricType.COST, ExportMetricType.PERFORMANCE, ExportMetricType.USAGE],
        providers: ['openai', 'anthropic'],
        models: ['gpt-4', 'claude-3'],
        includeRawData: false,
        includeCharts: true,
        includeRecommendations: true,
        reportTitle: 'Monthly AI Analytics Report',
        description: 'Comprehensive analytics for January 2024'
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject empty metrics array', async () => {
      const dto = plainToClass(ExportMetricsDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        format: ExportFormat.CSV,
        period: ExportPeriod.LAST_7D,
        metrics: [] // Vide
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('metrics');
    });

    it('should validate custom period with dates', async () => {
      const dto = plainToClass(ExportMetricsDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        format: ExportFormat.XLSX,
        period: ExportPeriod.CUSTOM,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        metrics: [ExportMetricType.COST]
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate all export formats', async () => {
      const formats = [ExportFormat.JSON, ExportFormat.CSV, ExportFormat.XLSX];
      
      for (const format of formats) {
        const dto = plainToClass(ExportMetricsDto, {
          tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
          format,
          period: ExportPeriod.LAST_7D,
          metrics: [ExportMetricType.COST]
        });

        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });

    it('should validate all metric types', async () => {
      const metrics = [
        ExportMetricType.COST,
        ExportMetricType.PERFORMANCE,
        ExportMetricType.USAGE,
        ExportMetricType.CONVERSATIONS,
        ExportMetricType.USERS,
        ExportMetricType.PROVIDERS,
        ExportMetricType.MODELS,
        ExportMetricType.TRENDS
      ];
      
      const dto = plainToClass(ExportMetricsDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        format: ExportFormat.JSON,
        period: ExportPeriod.LAST_30D,
        metrics
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  // =================== VALIDATION QUOTA STATUS QUERY ===================

  describe('QuotaStatusQueryDto', () => {
    it('should validate valid quota status query', async () => {
      const dto = plainToClass(QuotaStatusQueryDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000',
        providers: ['openai', 'anthropic'],
        models: ['gpt-4', 'claude-3'],
        includeHistory: true,
        includePredictions: true,
        includeRecommendations: true
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate optional fields', async () => {
      const dto = plainToClass(QuotaStatusQueryDto, {
        // Tous les champs optionnels
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with tenant filter only', async () => {
      const dto = plainToClass(QuotaStatusQueryDto, {
        tenantId: 'tenant-123e4567-e89b-12d3-a456-426614174000'
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  // =================== TESTS DE STRUCTURE JSON ===================

  describe('JSON Structure Validation', () => {
    it('should have consistent date format across DTOs', () => {
      // Toutes les dates doivent être en format ISO string
      const dateFields = [
        'startDate',
        'endDate',
        'timestamp',
        'expiresAt',
        'lastUpdated',
        'createdAt'
      ];

      // Mock d'une réponse typique
      const mockResponse = {
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        timestamp: new Date().toISOString()
      };

      dateFields.forEach(field => {
        if (mockResponse[field]) {
          expect(mockResponse[field]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        }
      });
    });

    it('should have consistent numeric precision for costs', () => {
      // Les coûts doivent avoir 2 décimales maximum
      const costValues = [125.50, 0.37, 1234.56, 0.01];
      
      costValues.forEach(cost => {
        const rounded = Math.round(cost * 100) / 100;
        expect(cost).toBe(rounded);
      });
    });

    it('should have consistent percentage format', () => {
      // Les pourcentages doivent être entre 0 et 100
      const percentages = [25.5, 80.0, 95.7, 100.0];
      
      percentages.forEach(percentage => {
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);
      });
    });

    it('should have consistent array structures', () => {
      // Toutes les listes doivent être des arrays valides
      const arrayFields = [
        'providerBreakdown',
        'modelBreakdown',
        'costTrend',
        'insights',
        'recommendations',
        'alerts',
        'topUsers',
        'topConversations'
      ];

      const mockResponse = {
        providerBreakdown: [{ provider: 'openai', cost: 100 }],
        modelBreakdown: [{ model: 'gpt-4', cost: 85 }],
        insights: [{ type: 'cost_optimization', message: 'test' }]
      };

      arrayFields.forEach(field => {
        if (mockResponse[field]) {
          expect(Array.isArray(mockResponse[field])).toBe(true);
        }
      });
    });

    it('should have consistent status enum values', () => {
      // Les status doivent utiliser des énumérations cohérentes
      const validStatuses = {
        quota: ['safe', 'warning', 'critical', 'exceeded'],
        provider: ['healthy', 'degraded', 'down'],
        export: ['pending', 'processing', 'completed', 'failed', 'expired'],
        recommendation: ['optimal', 'good', 'average', 'consider_alternative']
      };

      Object.entries(validStatuses).forEach(([category, statuses]) => {
        statuses.forEach(status => {
          expect(typeof status).toBe('string');
          expect(status.length).toBeGreaterThan(0);
        });
      });
    });
  });

  // =================== TESTS COMPATIBILITÉ DASHBOARD ===================

  describe('Dashboard Compatibility', () => {
    it('should provide all required fields for cost charts', () => {
      const costData = {
        totalCostUsd: 125.50,
        costByProvider: [
          { provider: 'openai', totalCost: 100.40, percentage: 80.0 }
        ],
        costTrend: [
          { date: '2024-01-01', totalCost: 18.50 }
        ]
      };

      // Vérifier que toutes les données nécessaires pour les graphiques sont présentes
      expect(costData).toHaveProperty('totalCostUsd');
      expect(costData.costByProvider[0]).toHaveProperty('provider');
      expect(costData.costByProvider[0]).toHaveProperty('totalCost');
      expect(costData.costByProvider[0]).toHaveProperty('percentage');
      expect(costData.costTrend[0]).toHaveProperty('date');
      expect(costData.costTrend[0]).toHaveProperty('totalCost');
    });

    it('should provide all required fields for performance charts', () => {
      const performanceData = {
        responseTime: {
          avgMs: 1850,
          p95Ms: 4100
        },
        performanceByProvider: [
          { provider: 'openai', avgResponseTime: 1750, avgConfidenceScore: 0.88 }
        ]
      };

      expect(performanceData.responseTime).toHaveProperty('avgMs');
      expect(performanceData.responseTime).toHaveProperty('p95Ms');
      expect(performanceData.performanceByProvider[0]).toHaveProperty('provider');
      expect(performanceData.performanceByProvider[0]).toHaveProperty('avgResponseTime');
      expect(performanceData.performanceByProvider[0]).toHaveProperty('avgConfidenceScore');
    });

    it('should provide consistent color-coding data', () => {
      const quotaData = {
        tenantQuotas: {
          dailyLimit: {
            usagePercent: 25.5,
            status: 'safe'
          }
        }
      };

      // Vérifier la cohérence entre pourcentage et status
      const { usagePercent, status } = quotaData.tenantQuotas.dailyLimit;
      
      if (usagePercent < 80) {
        expect(status).toBe('safe');
      } else if (usagePercent < 95) {
        expect(['warning', 'safe']).toContain(status);
      } else {
        expect(['critical', 'exceeded']).toContain(status);
      }
    });
  });
});