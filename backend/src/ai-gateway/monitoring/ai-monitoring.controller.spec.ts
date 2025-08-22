import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AIMonitoringController } from './ai-monitoring.controller';
import { AIAnalyticsService } from './ai-analytics.service';
import {
  TenantAIStatsDto,
  GlobalUsageDto,
  CostAnalyticsDto,
  PerformanceMetricsDto,
  QuotaStatusDto,
  ExportResponseDto,
  RealTimePerformanceDto
} from './dto';

/**
 * Tests complets pour AIMonitoringController - TICKET-BACKEND-005
 */
describe('AIMonitoringController', () => {
  let controller: AIMonitoringController;
  let analyticsService: jest.Mocked<AIAnalyticsService>;

  // Données de test
  const mockTenantId = 'tenant-123e4567-e89b-12d3-a456-426614174000';
  const mockExportId = 'export-123';

  const mockTenantStats: TenantAIStatsDto = {
    tenantId: mockTenantId,
    period: 'last_7d',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-07'),
    totalCostUsd: 125.50,
    totalTokens: 450000,
    totalMessages: 340,
    totalConversations: 45,
    avgCostPerConversation: 2.79,
    avgCostPerMessage: 0.37,
    avgTokensPerMessage: 1323,
    avgResponseTimeMs: 1850,
    avgConfidenceScore: 0.87,
    providerBreakdown: [
      {
        provider: 'openai',
        totalCost: 100.40,
        messageCount: 280,
        conversationCount: 35,
        avgResponseTime: 1750,
        avgConfidenceScore: 0.88,
        marketShare: 82.4,
        reliability: 0.96
      }
    ],
    modelBreakdown: [
      {
        model: 'gpt-4',
        provider: 'openai',
        totalCost: 85.20,
        messageCount: 200,
        avgCostPerMessage: 0.426,
        avgTokensPerMessage: 1456,
        avgConfidenceScore: 0.89,
        usage: 58.8
      }
    ],
    costTrend: [
      {
        date: '2024-01-01',
        totalCost: 18.50,
        messageCount: 50,
        conversationCount: 8,
        avgResponseTime: 1920
      }
    ],
    topUsersByUsage: [],
    topConversationsByCost: [],
    insights: [
      {
        type: 'cost_optimization',
        severity: 'medium',
        title: 'Optimisation possible',
        description: 'Réduction de coût possible avec cache intelligent',
        value: 15.5,
        recommendation: 'Implémenter cache pour 15% d\'économies'
      }
    ],
    potentialSavings: {
      cacheOptimization: 12.55,
      modelOptimization: 18.83,
      promptOptimization: 6.28,
      total: 37.66
    },
    projections: {
      monthlyCostEstimate: 543.42,
      growthRate: 15.5,
      nextMonthEstimate: 627.75
    }
  };

  const mockGlobalUsage: GlobalUsageDto = {
    period: 'last_30d',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-30'),
    totalCostUsd: 2450.75,
    totalTokens: 8900000,
    totalMessages: 6750,
    totalConversations: 890,
    totalTenants: 25,
    activeTenants: 23,
    avgCostPerTenant: 106.55,
    avgMessagesPerTenant: 270,
    avgConversationsPerTenant: 35.6,
    avgCostPerMessage: 0.36,
    avgResponseTimeMs: 1725,
    topTenantsByCost: [],
    topTenantsByUsage: [],
    globalProviderBreakdown: [],
    globalModelBreakdown: [],
    globalCostTrend: [],
    growth: {
      costGrowthPercent: 23.5,
      usageGrowthPercent: 28.2,
      newTenantsCount: 3,
      churnedTenantsCount: 1,
      monthOverMonthGrowth: 18.7
    },
    systemPerformance: {
      avgResponseTime: 1725,
      p95ResponseTime: 4200,
      errorRate: 0.015,
      uptime: 99.95,
      cacheHitRate: 0.72
    },
    systemAlerts: [],
    projections: {
      nextMonthCost: 2940.90,
      nextMonthUsage: 8640,
      nextMonthTenants: 27,
      annualCostEstimate: 32000
    }
  };

  const mockCostAnalytics: CostAnalyticsDto = {
    tenantId: mockTenantId,
    period: 'last_30d',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-30'),
    totalCostUsd: 425.80,
    avgCostPerDay: 14.19,
    avgCostPerMessage: 0.38,
    avgCostPerToken: 0.0000095,
    avgCostPerConversation: 2.85,
    providerCostBreakdown: [],
    modelCostBreakdown: [],
    costTimeline: [],
    hourlyCostPattern: [],
    topCostConversations: [],
    topCostUsers: [],
    costOptimization: {
      potentialSavings: 85.16,
      cacheOptimizationSavings: 34.06,
      modelOptimizationSavings: 51.10,
      promptOptimizationSavings: 21.29,
      recommendations: []
    },
    benchmarks: {
      industryAvgCostPerMessage: 0.42,
      comparisonToIndustry: 9.5,
      comparisonToPreviousPeriod: -7.2,
      efficiency: 0.88
    },
    costAlerts: [],
    projections: {
      nextWeekCost: 468.38,
      nextMonthCost: 1916.10,
      quarterlyProjection: 5538.40,
      annualProjection: 22125.60,
      confidenceLevel: 0.87
    }
  };

  const mockPerformanceMetrics: PerformanceMetricsDto = {
    tenantId: mockTenantId,
    period: 'last_7d',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-07'),
    responseTime: {
      avgMs: 1850,
      medianMs: 1650,
      p50Ms: 1650,
      p90Ms: 3200,
      p95Ms: 4100,
      p99Ms: 6800,
      minMs: 450,
      maxMs: 12000
    },
    quality: {
      avgConfidenceScore: 0.87,
      medianConfidenceScore: 0.89,
      highConfidenceRate: 0.78,
      lowConfidenceRate: 0.08,
      avgUserRating: 4.3,
      userSatisfactionRate: 0.89
    },
    reliability: {
      successRate: 0.985,
      errorRate: 0.015,
      timeoutRate: 0.003,
      retryRate: 0.008,
      uptime: 99.97
    },
    providerPerformance: [],
    modelPerformance: [],
    performanceTrend: [],
    hourlyPerformance: [],
    performanceExtremes: {
      bestPerformingConversations: [],
      worstPerformingConversations: []
    },
    userPerformanceAnalysis: [],
    performanceAlerts: [],
    benchmarks: {
      industryAvgResponseTime: 2200,
      industryAvgConfidenceScore: 0.82,
      comparisonToIndustry: {
        responseTime: 15.9,
        quality: 6.1,
        reliability: 3.2
      },
      comparisonToPreviousPeriod: {
        responseTime: -8.5,
        quality: 4.2,
        reliability: 1.8
      }
    },
    optimizationRecommendations: [],
    insights: []
  };

  const mockQuotaStatus: QuotaStatusDto = {
    tenantId: mockTenantId,
    timestamp: new Date(),
    tenantQuotas: {
      dailyLimit: {
        limitUsd: 100,
        usedUsd: 45.80,
        remainingUsd: 54.20,
        usagePercent: 45.8,
        resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'safe'
      },
      monthlyLimit: {
        limitUsd: 2000,
        usedUsd: 875.40,
        remainingUsd: 1124.60,
        usagePercent: 43.8,
        resetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'safe'
      },
      tokenLimit: {
        dailyLimit: 1000000,
        usedTokens: 456000,
        remainingTokens: 544000,
        usagePercent: 45.6,
        resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'safe'
      },
      messageLimit: {
        dailyLimit: 5000,
        usedMessages: 1240,
        remainingMessages: 3760,
        usagePercent: 24.8,
        resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'safe'
      }
    },
    providerQuotas: [],
    modelQuotas: [],
    activeAlerts: [],
    predictions: {
      dailyUsageProjection: 92.15,
      monthlyUsageProjection: 1850.75,
      recommendedActions: []
    },
    recentUsage: [],
    thresholds: {
      warningPercent: 80,
      criticalPercent: 95,
      notificationEnabled: true,
      autoLimitEnabled: false
    }
  };

  const mockRealTimePerformance: RealTimePerformanceDto = {
    timestamp: new Date(),
    current: {
      activeConversations: 12,
      messagesPerMinute: 8.5,
      avgResponseTime: 1650,
      currentErrorRate: 0.012,
      activeProviders: ['openai', 'anthropic']
    },
    last5min: {
      messageCount: 42,
      avgResponseTime: 1720,
      errorCount: 1,
      uniqueUsers: 18
    },
    activeAlerts: [],
    providerStatus: [
      {
        provider: 'openai',
        status: 'healthy',
        responseTime: 1580,
        errorRate: 0.008,
        lastCheck: new Date()
      }
    ]
  };

  beforeEach(async () => {
    const mockAnalyticsService = {
      getTenantStats: jest.fn(),
      exportTenantStats: jest.fn(),
      getGlobalUsage: jest.fn(),
      exportGlobalUsage: jest.fn(),
      getCostAnalytics: jest.fn(),
      getConversationCostAnalysis: jest.fn(),
      exportCostAnalytics: jest.fn(),
      getPerformanceMetrics: jest.fn(),
      getRealTimePerformance: jest.fn(),
      exportPerformanceMetrics: jest.fn(),
      getQuotaStatus: jest.fn(),
      updateQuotaConfig: jest.fn(),
      testQuotaConfig: jest.fn(),
      testProviderConfiguration: jest.fn(),
      exportMetrics: jest.fn(),
      getExportStatus: jest.fn(),
      downloadExport: jest.fn(),
      getDashboardSummary: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AIMonitoringController],
      providers: [
        {
          provide: AIAnalyticsService,
          useValue: mockAnalyticsService
        }
      ]
    }).compile();

    controller = module.get<AIMonitoringController>(AIMonitoringController);
    analyticsService = module.get(AIAnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // =================== TESTS ANALYTICS TENANT ===================

  describe('getTenantStats', () => {
    it('should return tenant stats successfully', async () => {
      analyticsService.getTenantStats.mockResolvedValue(mockTenantStats);

      const result = await controller.getTenantStats(mockTenantId, {
        tenantId: mockTenantId,
        period: 'last_7d'
      });

      expect(result).toEqual(mockTenantStats);
      expect(analyticsService.getTenantStats).toHaveBeenCalledWith({
        tenantId: mockTenantId,
        period: 'last_7d'
      });
    });

    it('should handle service errors gracefully', async () => {
      analyticsService.getTenantStats.mockRejectedValue(new Error('Service error'));

      await expect(
        controller.getTenantStats(mockTenantId, {
          tenantId: mockTenantId,
          period: 'last_7d'
        })
      ).rejects.toThrow(HttpException);
    });

    it('should validate period parameter', async () => {
      analyticsService.getTenantStats.mockResolvedValue(mockTenantStats);

      await controller.getTenantStats(mockTenantId, {
        tenantId: mockTenantId,
        period: 'last_30d',
        startDate: '2024-01-01',
        endDate: '2024-01-30'
      });

      expect(analyticsService.getTenantStats).toHaveBeenCalledWith({
        tenantId: mockTenantId,
        period: 'last_30d',
        startDate: '2024-01-01',
        endDate: '2024-01-30'
      });
    });
  });

  describe('exportTenantStats', () => {
    it('should export tenant stats as JSON', async () => {
      const mockExportResult = {
        fileName: 'tenant-stats.json',
        data: mockTenantStats,
        contentType: 'application/json'
      };

      analyticsService.exportTenantStats.mockResolvedValue(mockExportResult);

      const mockResponse = {
        setHeader: jest.fn(),
        json: jest.fn(),
        send: jest.fn()
      } as unknown as Response;

      await controller.exportTenantStats(
        mockTenantId,
        {
          tenantId: mockTenantId,
          format: 'json',
          period: 'last_7d'
        },
        mockResponse
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json; charset=utf-8');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="tenant-stats.json"');
      expect(mockResponse.json).toHaveBeenCalledWith(mockTenantStats);
    });

    it('should export tenant stats as CSV', async () => {
      const mockExportResult = {
        fileName: 'tenant-stats.csv',
        data: 'csv,data,here',
        contentType: 'text/csv'
      };

      analyticsService.exportTenantStats.mockResolvedValue(mockExportResult);

      const mockResponse = {
        setHeader: jest.fn(),
        json: jest.fn(),
        send: jest.fn()
      } as unknown as Response;

      await controller.exportTenantStats(
        mockTenantId,
        {
          tenantId: mockTenantId,
          format: 'csv',
          period: 'last_7d'
        },
        mockResponse
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
      expect(mockResponse.send).toHaveBeenCalledWith('csv,data,here');
    });
  });

  // =================== TESTS USAGE GLOBAL ===================

  describe('getGlobalUsage', () => {
    it('should return global usage with admin access', async () => {
      analyticsService.getGlobalUsage.mockResolvedValue(mockGlobalUsage);

      const result = await controller.getGlobalUsage(
        { period: 'last_30d' },
        'true'
      );

      expect(result).toEqual(mockGlobalUsage);
      expect(analyticsService.getGlobalUsage).toHaveBeenCalledWith({ period: 'last_30d' });
    });

    it('should reject access without admin permissions', async () => {
      await expect(
        controller.getGlobalUsage({ period: 'last_30d' }, 'false')
      ).rejects.toThrow(HttpException);

      expect(analyticsService.getGlobalUsage).not.toHaveBeenCalled();
    });

    it('should reject access without admin header', async () => {
      await expect(
        controller.getGlobalUsage({ period: 'last_30d' })
      ).rejects.toThrow(HttpException);
    });
  });

  // =================== TESTS ANALYSE COÛTS ===================

  describe('getCostAnalytics', () => {
    it('should return cost analytics successfully', async () => {
      analyticsService.getCostAnalytics.mockResolvedValue(mockCostAnalytics);

      const filters = {
        tenantId: mockTenantId,
        period: 'last_30d'
      };

      const result = await controller.getCostAnalytics(filters);

      expect(result).toEqual(mockCostAnalytics);
      expect(analyticsService.getCostAnalytics).toHaveBeenCalledWith(filters);
    });

    it('should handle cost analytics with custom date range', async () => {
      analyticsService.getCostAnalytics.mockResolvedValue(mockCostAnalytics);

      const filters = {
        tenantId: mockTenantId,
        period: 'custom',
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        providers: ['openai', 'anthropic'],
        topConversationsLimit: 25
      };

      await controller.getCostAnalytics(filters);

      expect(analyticsService.getCostAnalytics).toHaveBeenCalledWith(filters);
    });
  });

  describe('getConversationCostAnalysis', () => {
    it('should return conversation cost analysis', async () => {
      const conversationId = 'conv-123';
      const mockConversationAnalysis = {
        conversationId,
        title: 'Test Conversation',
        userId: 'user-123',
        tenantId: mockTenantId,
        totalCost: 12.45,
        messageCount: 8,
        avgCostPerMessage: 1.56,
        messageBreakdown: [],
        costProgression: [],
        efficiency: {
          costEfficiency: 0.85,
          speedEfficiency: 0.92,
          qualityEfficiency: 0.88
        },
        recommendations: []
      };

      analyticsService.getConversationCostAnalysis.mockResolvedValue(mockConversationAnalysis);

      const result = await controller.getConversationCostAnalysis(conversationId, mockTenantId);

      expect(result).toEqual(mockConversationAnalysis);
      expect(analyticsService.getConversationCostAnalysis).toHaveBeenCalledWith(conversationId, mockTenantId);
    });
  });

  // =================== TESTS MÉTRIQUES PERFORMANCE ===================

  describe('getPerformanceMetrics', () => {
    it('should return performance metrics successfully', async () => {
      analyticsService.getPerformanceMetrics.mockResolvedValue(mockPerformanceMetrics);

      const filters = {
        tenantId: mockTenantId,
        period: 'last_7d'
      };

      const result = await controller.getPerformanceMetrics(filters);

      expect(result).toEqual(mockPerformanceMetrics);
      expect(analyticsService.getPerformanceMetrics).toHaveBeenCalledWith(filters);
    });

    it('should handle performance filters', async () => {
      analyticsService.getPerformanceMetrics.mockResolvedValue(mockPerformanceMetrics);

      const filters = {
        tenantId: mockTenantId,
        period: 'last_30d',
        providers: ['openai'],
        models: ['gpt-4', 'gpt-3.5-turbo'],
        minResponseTime: 1000,
        maxResponseTime: 5000,
        minConfidenceScore: 0.7
      };

      await controller.getPerformanceMetrics(filters);

      expect(analyticsService.getPerformanceMetrics).toHaveBeenCalledWith(filters);
    });
  });

  describe('getRealTimePerformance', () => {
    it('should return real-time performance metrics', async () => {
      analyticsService.getRealTimePerformance.mockResolvedValue(mockRealTimePerformance);

      const result = await controller.getRealTimePerformance(mockTenantId);

      expect(result).toEqual(mockRealTimePerformance);
      expect(analyticsService.getRealTimePerformance).toHaveBeenCalledWith(mockTenantId);
    });

    it('should work without tenant filter for global metrics', async () => {
      analyticsService.getRealTimePerformance.mockResolvedValue(mockRealTimePerformance);

      await controller.getRealTimePerformance();

      expect(analyticsService.getRealTimePerformance).toHaveBeenCalledWith(undefined);
    });
  });

  // =================== TESTS QUOTAS ===================

  describe('getQuotaStatus', () => {
    it('should return quota status successfully', async () => {
      analyticsService.getQuotaStatus.mockResolvedValue(mockQuotaStatus);

      const query = { tenantId: mockTenantId };
      const result = await controller.getQuotaStatus(query);

      expect(result).toEqual(mockQuotaStatus);
      expect(analyticsService.getQuotaStatus).toHaveBeenCalledWith(query);
    });

    it('should handle quota filters', async () => {
      analyticsService.getQuotaStatus.mockResolvedValue(mockQuotaStatus);

      const query = {
        tenantId: mockTenantId,
        providers: ['openai', 'anthropic'],
        models: ['gpt-4'],
        includeHistory: true,
        includePredictions: false
      };

      await controller.getQuotaStatus(query);

      expect(analyticsService.getQuotaStatus).toHaveBeenCalledWith(query);
    });
  });

  describe('updateQuotaConfig', () => {
    it('should update quota configuration successfully', async () => {
      analyticsService.updateQuotaConfig.mockResolvedValue(undefined);

      const config = {
        tenantId: mockTenantId,
        dailyLimitUsd: 150,
        monthlyLimitUsd: 3000,
        warningThresholdPercent: 85,
        criticalThresholdPercent: 95,
        enableNotifications: true
      };

      const result = await controller.updateQuotaConfig(config);

      expect(result).toEqual({
        success: true,
        message: 'Configuration des quotas mise à jour avec succès'
      });
      expect(analyticsService.updateQuotaConfig).toHaveBeenCalledWith(config);
    });

    it('should handle quota config update errors', async () => {
      analyticsService.updateQuotaConfig.mockRejectedValue(new Error('Config error'));

      const config = {
        tenantId: mockTenantId,
        dailyLimitUsd: 150
      };

      await expect(controller.updateQuotaConfig(config)).rejects.toThrow(HttpException);
    });
  });

  describe('testQuotaConfig', () => {
    it('should test quota configuration successfully', async () => {
      const mockTestResult = {
        success: true,
        testResults: [
          {
            scenario: 'normal_usage',
            passed: true,
            expectedOutcome: 'allowed',
            actualOutcome: 'allowed'
          }
        ],
        configValidation: {
          valid: true,
          warnings: [],
          errors: []
        },
        recommendations: []
      };

      analyticsService.testQuotaConfig.mockResolvedValue(mockTestResult);

      const testDto = {
        tenantId: mockTenantId,
        config: {
          tenantId: mockTenantId,
          dailyLimitUsd: 100
        },
        testScenarios: [
          {
            name: 'normal_usage',
            description: 'Test usage normal',
            simulatedUsage: {
              costPerDay: 50,
              tokensPerDay: 100000,
              messagesPerDay: 500
            },
            expectedOutcome: 'allowed' as const
          }
        ],
        dryRun: true
      };

      const result = await controller.testQuotaConfig(testDto);

      expect(result).toEqual(mockTestResult);
      expect(analyticsService.testQuotaConfig).toHaveBeenCalledWith(testDto);
    });
  });

  // =================== TESTS CONFIGURATION ET TESTS ===================

  describe('testProviderConfiguration', () => {
    it('should test provider configuration successfully', async () => {
      const mockTestResult = {
        provider: 'openai',
        status: 'success' as const,
        responseTime: 150,
        message: 'Provider openai configuré et accessible',
        details: {
          model: 'gpt-4',
          latency: 150,
          apiVersion: '2024-01'
        }
      };

      analyticsService.testProviderConfiguration.mockResolvedValue(mockTestResult);

      const testConfig = {
        provider: 'openai',
        tenantId: mockTenantId,
        model: 'gpt-4'
      };

      const result = await controller.testProviderConfiguration(testConfig);

      expect(result).toEqual(mockTestResult);
      expect(analyticsService.testProviderConfiguration).toHaveBeenCalledWith('openai', mockTenantId, 'gpt-4');
    });

    it('should handle provider test failure', async () => {
      const mockTestResult = {
        provider: 'invalid-provider',
        status: 'error' as const,
        message: 'Erreur de connexion au provider invalid-provider: API key invalid',
        details: { error: 'API key invalid' }
      };

      analyticsService.testProviderConfiguration.mockResolvedValue(mockTestResult);

      const testConfig = {
        provider: 'invalid-provider',
        tenantId: mockTenantId
      };

      const result = await controller.testProviderConfiguration(testConfig);

      expect(result).toEqual(mockTestResult);
    });
  });

  // =================== TESTS EXPORTS GÉNÉRIQUES ===================

  describe('exportMetrics', () => {
    it('should create export successfully', async () => {
      const mockExportResponse: ExportResponseDto = {
        success: true,
        exportId: mockExportId,
        fileName: 'metrics-export.json',
        fileSize: 2048,
        downloadUrl: `/api/ai/export/${mockExportId}/download`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        metadata: {
          tenantId: mockTenantId,
          format: 'json',
          period: 'last_7d',
          metricsIncluded: ['cost', 'performance'],
          recordCount: 150,
          generatedAt: new Date()
        },
        summary: {
          totalCost: 125.50,
          totalMessages: 340,
          totalConversations: 45,
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-07')
          },
          topProvider: 'openai',
          topModel: 'gpt-4'
        }
      };

      analyticsService.exportMetrics.mockResolvedValue(mockExportResponse);

      const exportDto = {
        tenantId: mockTenantId,
        format: 'json' as const,
        period: 'last_7d' as const,
        metrics: ['cost', 'performance'] as const,
        includeRecommendations: true
      };

      const result = await controller.exportMetrics(exportDto);

      expect(result).toEqual(mockExportResponse);
      expect(analyticsService.exportMetrics).toHaveBeenCalledWith(exportDto);
    });
  });

  describe('getExportStatus', () => {
    it('should return export status', async () => {
      const mockExportStatus = {
        exportId: mockExportId,
        status: 'completed' as const,
        progress: 100,
        startedAt: new Date(Date.now() - 60000),
        completedAt: new Date(),
        metadata: {
          tenantId: mockTenantId,
          format: 'json' as const,
          metrics: ['cost'] as const
        },
        result: {
          fileName: 'export.json',
          fileSize: 1024,
          downloadUrl: `/api/ai/export/${mockExportId}/download`,
          recordCount: 100,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      };

      analyticsService.getExportStatus.mockResolvedValue(mockExportStatus);

      const result = await controller.getExportStatus(mockExportId);

      expect(result).toEqual(mockExportStatus);
      expect(analyticsService.getExportStatus).toHaveBeenCalledWith(mockExportId);
    });
  });

  describe('downloadExport', () => {
    it('should download export file', async () => {
      const mockDownloadData = {
        fileName: 'export.json',
        contentType: 'application/json',
        data: { test: 'data' }
      };

      analyticsService.downloadExport.mockResolvedValue(mockDownloadData);

      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn()
      } as unknown as Response;

      await controller.downloadExport(mockExportId, mockResponse);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="export.json"');
      expect(mockResponse.send).toHaveBeenCalledWith({ test: 'data' });
    });
  });

  // =================== TESTS DASHBOARD SUMMARY ===================

  describe('getDashboardSummary', () => {
    it('should return dashboard summary successfully', async () => {
      const mockDashboardSummary = {
        summary: {
          totalCost: 125.50,
          totalMessages: 340,
          avgResponseTime: 1850,
          successRate: 98.5
        },
        trends: [
          { date: '2024-01-01', totalCost: 18.50, messageCount: 50 }
        ],
        alerts: [],
        topProviders: [
          { provider: 'openai', totalCost: 100.40, messageCount: 280 }
        ],
        topModels: [
          { model: 'gpt-4', totalCost: 85.20, messageCount: 200 }
        ],
        lastUpdated: new Date()
      };

      analyticsService.getDashboardSummary.mockResolvedValue(mockDashboardSummary);

      const result = await controller.getDashboardSummary(mockTenantId, 'last_7d');

      expect(result).toEqual(mockDashboardSummary);
      expect(analyticsService.getDashboardSummary).toHaveBeenCalledWith(mockTenantId, 'last_7d');
    });

    it('should use default period when not specified', async () => {
      const mockDashboardSummary = {
        summary: { totalCost: 0, totalMessages: 0, avgResponseTime: 0, successRate: 0 },
        trends: [],
        alerts: [],
        topProviders: [],
        topModels: [],
        lastUpdated: new Date()
      };

      analyticsService.getDashboardSummary.mockResolvedValue(mockDashboardSummary);

      await controller.getDashboardSummary(mockTenantId);

      expect(analyticsService.getDashboardSummary).toHaveBeenCalledWith(mockTenantId, 'last_7d');
    });
  });

  // =================== TESTS CONTENT TYPE HELPER ===================

  describe('getContentType private method', () => {
    it('should return correct content types', () => {
      // Test via export methods qui utilisent getContentType
      expect(controller['getContentType']('csv')).toBe('text/csv; charset=utf-8');
      expect(controller['getContentType']('json')).toBe('application/json; charset=utf-8');
      expect(controller['getContentType']('xlsx')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(controller['getContentType']('unknown')).toBe('application/octet-stream');
    });
  });

  // =================== TESTS D'ERREUR GLOBAUX ===================

  describe('error handling', () => {
    it('should handle service unavailable errors', async () => {
      analyticsService.getTenantStats.mockRejectedValue(new Error('Service unavailable'));

      await expect(
        controller.getTenantStats(mockTenantId, { tenantId: mockTenantId, period: 'last_7d' })
      ).rejects.toThrow(HttpException);
    });

    it('should handle invalid tenant ID', async () => {
      const invalidTenantId = 'invalid-id';
      analyticsService.getTenantStats.mockRejectedValue(new Error('Invalid tenant ID'));

      await expect(
        controller.getTenantStats(invalidTenantId, { tenantId: invalidTenantId, period: 'last_7d' })
      ).rejects.toThrow(HttpException);
    });

    it('should handle timeout errors', async () => {
      analyticsService.getPerformanceMetrics.mockRejectedValue(new Error('Request timeout'));

      await expect(
        controller.getPerformanceMetrics({ tenantId: mockTenantId, period: 'last_7d' })
      ).rejects.toThrow(HttpException);
    });
  });
});