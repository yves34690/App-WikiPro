import { Test, TestingModule } from '@nestjs/testing';
import { AIAnalyticsService } from './ai-analytics.service';
import { MessageService } from '@modules/chat/services/message.service';
import { ConversationService } from '@modules/chat/services/conversation.service';
import { AIGatewayService } from '../ai-gateway.service';
import { RedisService } from '@core/redis/redis.service';
import {
  TenantStatsQueryDto,
  CostFiltersDto,
  PerformanceFiltersDto,
  QuotaStatusQueryDto
} from './dto';

/**
 * Tests complets pour AIAnalyticsService - TICKET-BACKEND-005
 */
describe('AIAnalyticsService', () => {
  let service: AIAnalyticsService;
  let messageService: jest.Mocked<MessageService>;
  let conversationService: jest.Mocked<ConversationService>;
  let aiGatewayService: jest.Mocked<AIGatewayService>;
  let redisService: jest.Mocked<RedisService>;

  const mockTenantId = 'tenant-123e4567-e89b-12d3-a456-426614174000';
  const mockConversationId = 'conv-123e4567-e89b-12d3-a456-426614174001';

  // Mock data
  const mockCostMetrics = {
    totalCostUsd: 125.50,
    avgCostPerMessage: 0.37,
    avgCostPerToken: 0.0000095,
    costByProvider: [
      {
        provider: 'openai',
        totalCost: 100.40,
        messageCount: 280,
        percentage: 80.0
      }
    ],
    costByModel: [
      {
        model: 'gpt-4',
        totalCost: 85.20,
        messageCount: 200,
        avgCostPerMessage: 0.426
      }
    ],
    costTrend: [
      {
        date: '2024-01-01',
        totalCost: 18.50,
        messageCount: 50
      }
    ]
  };

  const mockPerformanceMetrics = {
    avgResponseTimeMs: 1850,
    medianResponseTimeMs: 1650,
    p95ResponseTimeMs: 4100,
    avgConfidenceScore: 0.87,
    performanceByProvider: [
      {
        provider: 'openai',
        avgResponseTime: 1750,
        avgConfidenceScore: 0.88,
        messageCount: 280
      }
    ],
    performanceByModel: [
      {
        model: 'gpt-4',
        avgResponseTime: 1650,
        avgConfidenceScore: 0.89,
        messageCount: 200
      }
    ],
    performanceTrend: [
      {
        date: '2024-01-01',
        avgResponseTime: 1920,
        avgConfidenceScore: 0.85
      }
    ]
  };

  const mockUsageMetrics = {
    totalMessages: 340,
    totalTokens: 450000,
    totalConversations: 45,
    avgTokensPerMessage: 1323,
    usageByProvider: [
      {
        provider: 'openai',
        messageCount: 280,
        tokenCount: 370000,
        conversationCount: 35,
        marketShare: 82.4
      }
    ],
    usageByModel: [],
    usageTrend: []
  };

  const mockConversationAnalytics = {
    tenantId: mockTenantId,
    userId: undefined,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-07'),
    totalConversations: 45,
    totalMessages: 340,
    totalTokens: 450000,
    totalCostUsd: 125.50,
    avgMessagesPerConversation: 7.56,
    avgCostPerConversation: 2.79,
    avgResponseTime: 1850,
    avgConfidenceScore: 0.87,
    providerBreakdown: [],
    modelBreakdown: [],
    dailyStats: []
  };

  beforeEach(async () => {
    const mockMessageService = {
      getCostMetrics: jest.fn(),
      getPerformanceMetrics: jest.fn(),
      getUsageMetrics: jest.fn(),
      getStreamingStats: jest.fn()
    };

    const mockConversationService = {
      getTenantAnalytics: jest.fn(),
      getTopCostConversations: jest.fn(),
      getConversationById: jest.fn(),
      getConversationMessages: jest.fn()
    };

    const mockAIGatewayService = {
      // Mock methods si nécessaire
    };

    const mockRedisService = {
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIAnalyticsService,
        {
          provide: MessageService,
          useValue: mockMessageService
        },
        {
          provide: ConversationService,
          useValue: mockConversationService
        },
        {
          provide: AIGatewayService,
          useValue: mockAIGatewayService
        },
        {
          provide: RedisService,
          useValue: mockRedisService
        }
      ]
    }).compile();

    service = module.get<AIAnalyticsService>(AIAnalyticsService);
    messageService = module.get(MessageService);
    conversationService = module.get(ConversationService);
    aiGatewayService = module.get(AIGatewayService);
    redisService = module.get(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =================== TESTS TENANT STATS ===================

  describe('getTenantStats', () => {
    const mockQuery: TenantStatsQueryDto = {
      tenantId: mockTenantId,
      period: 'last_7d'
    };

    beforeEach(() => {
      messageService.getCostMetrics.mockResolvedValue(mockCostMetrics);
      messageService.getPerformanceMetrics.mockResolvedValue(mockPerformanceMetrics);
      messageService.getUsageMetrics.mockResolvedValue(mockUsageMetrics);
      conversationService.getTenantAnalytics.mockResolvedValue(mockConversationAnalytics);
      conversationService.getTopCostConversations.mockResolvedValue([]);
    });

    it('should return cached data when available', async () => {
      const cachedData = { cached: true };
      redisService.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getTenantStats(mockQuery);

      expect(result).toEqual(cachedData);
      expect(redisService.get).toHaveBeenCalled();
      expect(messageService.getCostMetrics).not.toHaveBeenCalled();
    });

    it('should calculate and cache tenant stats when not cached', async () => {
      redisService.get.mockResolvedValue(null);

      const result = await service.getTenantStats(mockQuery);

      expect(result).toBeDefined();
      expect(result.tenantId).toBe(mockTenantId);
      expect(result.period).toBe('last_7d');
      expect(result.totalCostUsd).toBe(125.50);
      expect(result.totalMessages).toBe(340);
      expect(result.totalConversations).toBe(45);

      // Vérifier que le cache a été mis à jour
      expect(redisService.setex).toHaveBeenCalled();

      // Vérifier que tous les services ont été appelés
      expect(messageService.getCostMetrics).toHaveBeenCalledWith(
        mockTenantId,
        expect.any(Date),
        expect.any(Date)
      );
      expect(messageService.getPerformanceMetrics).toHaveBeenCalled();
      expect(messageService.getUsageMetrics).toHaveBeenCalled();
      expect(conversationService.getTenantAnalytics).toHaveBeenCalled();
    });

    it('should handle different periods correctly', async () => {
      redisService.get.mockResolvedValue(null);

      const queries = [
        { ...mockQuery, period: 'last_24h' },
        { ...mockQuery, period: 'last_30d' },
        { ...mockQuery, period: 'last_90d' },
        { ...mockQuery, period: 'custom', startDate: '2024-01-01', endDate: '2024-01-31' }
      ];

      for (const query of queries) {
        await service.getTenantStats(query);
        expect(messageService.getCostMetrics).toHaveBeenCalledWith(
          mockTenantId,
          expect.any(Date),
          expect.any(Date)
        );
      }
    });

    it('should calculate provider breakdown correctly', async () => {
      redisService.get.mockResolvedValue(null);

      const result = await service.getTenantStats(mockQuery);

      expect(result.providerBreakdown).toBeDefined();
      expect(result.providerBreakdown.length).toBeGreaterThan(0);
      
      const provider = result.providerBreakdown[0];
      expect(provider).toHaveProperty('provider');
      expect(provider).toHaveProperty('totalCost');
      expect(provider).toHaveProperty('messageCount');
      expect(provider).toHaveProperty('avgResponseTime');
      expect(provider).toHaveProperty('reliability');
    });

    it('should calculate potential savings', async () => {
      redisService.get.mockResolvedValue(null);

      const result = await service.getTenantStats(mockQuery);

      expect(result.potentialSavings).toBeDefined();
      expect(result.potentialSavings.total).toBeGreaterThan(0);
      expect(result.potentialSavings.cacheOptimization).toBeGreaterThan(0);
      expect(result.potentialSavings.modelOptimization).toBeGreaterThan(0);
    });

    it('should calculate projections', async () => {
      redisService.get.mockResolvedValue(null);

      const result = await service.getTenantStats(mockQuery);

      expect(result.projections).toBeDefined();
      expect(result.projections.monthlyCostEstimate).toBeGreaterThan(0);
      expect(result.projections.growthRate).toBeDefined();
      expect(result.projections.nextMonthEstimate).toBeGreaterThan(0);
    });

    it('should handle service errors gracefully', async () => {
      redisService.get.mockResolvedValue(null);
      messageService.getCostMetrics.mockRejectedValue(new Error('Service error'));

      await expect(service.getTenantStats(mockQuery)).rejects.toThrow('Service error');
    });
  });

  describe('exportTenantStats', () => {
    it('should export tenant stats as JSON', async () => {
      const mockStats = {
        tenantId: mockTenantId,
        totalCostUsd: 125.50,
        period: 'last_7d'
      };

      jest.spyOn(service, 'getTenantStats').mockResolvedValue(mockStats as any);

      const exportDto = {
        tenantId: mockTenantId,
        format: 'json' as const,
        period: 'last_7d' as const
      };

      const result = await service.exportTenantStats(exportDto);

      expect(result.fileName).toContain('.json');
      expect(result.data).toEqual(mockStats);
      expect(result.contentType).toBe('application/json');
    });

    it('should export tenant stats as CSV', async () => {
      const mockStats = {
        tenantId: mockTenantId,
        totalCostUsd: 125.50,
        totalMessages: 340,
        avgResponseTimeMs: 1850,
        period: 'last_7d'
      };

      jest.spyOn(service, 'getTenantStats').mockResolvedValue(mockStats as any);

      const exportDto = {
        tenantId: mockTenantId,
        format: 'csv' as const,
        period: 'last_7d' as const
      };

      const result = await service.exportTenantStats(exportDto);

      expect(result.fileName).toContain('.csv');
      expect(result.contentType).toBe('text/csv');
      expect(typeof result.data).toBe('string');
      expect(result.data).toContain('tenant_id');
    });

    it('should reject unsupported export formats', async () => {
      const exportDto = {
        tenantId: mockTenantId,
        format: 'xlsx' as const,
        period: 'last_7d' as const
      };

      await expect(service.exportTenantStats(exportDto)).rejects.toThrow('Export XLSX pas encore implémenté');
    });
  });

  // =================== TESTS GLOBAL USAGE ===================

  describe('getGlobalUsage', () => {
    it('should return cached global usage when available', async () => {
      const cachedData = { cached: true };
      redisService.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getGlobalUsage({ period: 'last_30d' });

      expect(result).toEqual(cachedData);
    });

    it('should calculate global usage when not cached', async () => {
      redisService.get.mockResolvedValue(null);

      const result = await service.getGlobalUsage({ period: 'last_30d' });

      expect(result).toBeDefined();
      expect(result.period).toBe('last_30d');
      expect(result.totalTenants).toBeGreaterThanOrEqual(0);
      expect(result.activeTenants).toBeGreaterThanOrEqual(0);
      expect(redisService.setex).toHaveBeenCalled();
    });
  });

  // =================== TESTS COST ANALYTICS ===================

  describe('getCostAnalytics', () => {
    const mockFilters: CostFiltersDto = {
      tenantId: mockTenantId,
      period: 'last_30d'
    };

    it('should return cached cost analytics when available', async () => {
      const cachedData = { cached: true };
      redisService.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getCostAnalytics(mockFilters);

      expect(result).toEqual(cachedData);
    });

    it('should calculate cost analytics when not cached', async () => {
      redisService.get.mockResolvedValue(null);
      messageService.getCostMetrics.mockResolvedValue(mockCostMetrics);
      conversationService.getTopCostConversations.mockResolvedValue([]);

      const result = await service.getCostAnalytics(mockFilters);

      expect(result).toBeDefined();
      expect(result.tenantId).toBe(mockTenantId);
      expect(result.totalCostUsd).toBe(125.50);
      expect(result.avgCostPerMessage).toBe(0.37);
      expect(result.providerCostBreakdown).toBeDefined();
      expect(result.modelCostBreakdown).toBeDefined();
      expect(result.costOptimization).toBeDefined();
    });

    it('should handle cost filters correctly', async () => {
      redisService.get.mockResolvedValue(null);
      messageService.getCostMetrics.mockResolvedValue(mockCostMetrics);
      conversationService.getTopCostConversations.mockResolvedValue([]);

      const filtersWithOptions = {
        ...mockFilters,
        providers: ['openai', 'anthropic'],
        models: ['gpt-4'],
        topConversationsLimit: 25,
        topUsersLimit: 15
      };

      const result = await service.getCostAnalytics(filtersWithOptions);

      expect(result).toBeDefined();
      expect(conversationService.getTopCostConversations).toHaveBeenCalledWith(
        mockTenantId,
        25
      );
    });
  });

  describe('getConversationCostAnalysis', () => {
    it('should return cached analysis when available', async () => {
      const cachedData = { cached: true };
      redisService.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getConversationCostAnalysis(mockConversationId, mockTenantId);

      expect(result).toEqual(cachedData);
    });

    it('should calculate conversation cost analysis when not cached', async () => {
      const mockConversation = {
        id: mockConversationId,
        title: 'Test Conversation',
        user_id: 'user-123',
        created_at: new Date(),
        last_message_at: new Date()
      };

      const mockMessages = [
        {
          id: 'msg-1',
          role: 'user',
          cost_usd: 0,
          token_count: 50,
          response_time_ms: null,
          created_at: new Date(),
          ai_provider: null,
          ai_model: null
        },
        {
          id: 'msg-2',
          role: 'assistant',
          cost_usd: 12.45,
          token_count: 1200,
          response_time_ms: 1850,
          created_at: new Date(),
          ai_provider: 'openai',
          ai_model: 'gpt-4'
        }
      ];

      redisService.get.mockResolvedValue(null);
      conversationService.getConversationById.mockResolvedValue(mockConversation as any);
      conversationService.getConversationMessages.mockResolvedValue(mockMessages as any);

      const result = await service.getConversationCostAnalysis(mockConversationId, mockTenantId);

      expect(result).toBeDefined();
      expect(result.conversationId).toBe(mockConversationId);
      expect(result.title).toBe('Test Conversation');
      expect(result.totalCost).toBe(12.45);
      expect(result.messageCount).toBe(2);
      expect(result.messageBreakdown).toHaveLength(2);
      expect(result.costProgression).toHaveLength(2);
      expect(result.efficiency).toBeDefined();
    });

    it('should throw error for non-existent conversation', async () => {
      redisService.get.mockResolvedValue(null);
      conversationService.getConversationById.mockResolvedValue(null);

      await expect(
        service.getConversationCostAnalysis('invalid-id', mockTenantId)
      ).rejects.toThrow('Conversation non trouvée');
    });
  });

  // =================== TESTS PERFORMANCE METRICS ===================

  describe('getPerformanceMetrics', () => {
    const mockFilters: PerformanceFiltersDto = {
      tenantId: mockTenantId,
      period: 'last_7d'
    };

    it('should return cached performance metrics when available', async () => {
      const cachedData = { cached: true };
      redisService.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getPerformanceMetrics(mockFilters);

      expect(result).toEqual(cachedData);
    });

    it('should calculate performance metrics when not cached', async () => {
      redisService.get.mockResolvedValue(null);
      messageService.getPerformanceMetrics.mockResolvedValue(mockPerformanceMetrics);

      const result = await service.getPerformanceMetrics(mockFilters);

      expect(result).toBeDefined();
      expect(result.tenantId).toBe(mockTenantId);
      expect(result.responseTime).toBeDefined();
      expect(result.responseTime.avgMs).toBe(1850);
      expect(result.quality).toBeDefined();
      expect(result.reliability).toBeDefined();
      expect(result.providerPerformance).toBeDefined();
      expect(result.benchmarks).toBeDefined();
    });

    it('should handle performance filters', async () => {
      redisService.get.mockResolvedValue(null);
      messageService.getPerformanceMetrics.mockResolvedValue(mockPerformanceMetrics);

      const filtersWithOptions = {
        ...mockFilters,
        providers: ['openai'],
        models: ['gpt-4'],
        minResponseTime: 1000,
        maxResponseTime: 5000,
        minConfidenceScore: 0.8
      };

      const result = await service.getPerformanceMetrics(filtersWithOptions);

      expect(result).toBeDefined();
      expect(messageService.getPerformanceMetrics).toHaveBeenCalledWith(
        mockTenantId,
        expect.any(Date),
        expect.any(Date)
      );
    });
  });

  describe('getRealTimePerformance', () => {
    it('should return cached real-time metrics when available', async () => {
      const cachedData = { cached: true };
      redisService.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getRealTimePerformance(mockTenantId);

      expect(result).toEqual(cachedData);
    });

    it('should calculate real-time performance when not cached', async () => {
      const mockStreamingStats = {
        active_sessions: 5,
        providers: { openai: 3, anthropic: 2 },
        avg_session_duration: 30000,
        total_chunks_processed: 150
      };

      redisService.get.mockResolvedValue(null);
      messageService.getStreamingStats.mockReturnValue(mockStreamingStats);

      const result = await service.getRealTimePerformance(mockTenantId);

      expect(result).toBeDefined();
      expect(result.current.activeConversations).toBe(5);
      expect(result.current.activeProviders).toContain('openai');
      expect(result.current.activeProviders).toContain('anthropic');
      expect(result.providerStatus).toBeDefined();
    });
  });

  // =================== TESTS QUOTAS ===================

  describe('getQuotaStatus', () => {
    const mockQuery: QuotaStatusQueryDto = {
      tenantId: mockTenantId
    };

    it('should return cached quota status when available', async () => {
      const cachedData = { cached: true };
      redisService.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getQuotaStatus(mockQuery);

      expect(result).toEqual(cachedData);
    });

    it('should calculate quota status when not cached', async () => {
      redisService.get.mockResolvedValue(null);

      const result = await service.getQuotaStatus(mockQuery);

      expect(result).toBeDefined();
      expect(result.tenantId).toBe(mockTenantId);
      expect(result.tenantQuotas).toBeDefined();
      expect(result.tenantQuotas.dailyLimit).toBeDefined();
      expect(result.tenantQuotas.monthlyLimit).toBeDefined();
      expect(result.providerQuotas).toBeDefined();
      expect(result.modelQuotas).toBeDefined();
    });
  });

  describe('updateQuotaConfig', () => {
    it('should update quota configuration', async () => {
      const config = {
        tenantId: mockTenantId,
        dailyLimitUsd: 150,
        monthlyLimitUsd: 3000
      };

      await expect(service.updateQuotaConfig(config)).resolves.not.toThrow();
      
      // Vérifier que le cache a été invalidé
      expect(redisService.del).toHaveBeenCalledWith(`quota_status:${mockTenantId}`);
    });
  });

  describe('testQuotaConfig', () => {
    it('should test quota configuration successfully', async () => {
      const testDto = {
        tenantId: mockTenantId,
        config: {
          tenantId: mockTenantId,
          dailyLimitUsd: 100
        },
        testScenarios: [
          {
            name: 'normal_usage',
            description: 'Test normal',
            simulatedUsage: {
              costPerDay: 50,
              tokensPerDay: 100000,
              messagesPerDay: 500
            },
            expectedOutcome: 'allowed' as const
          }
        ]
      };

      const result = await service.testQuotaConfig(testDto);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.testResults).toBeDefined();
      expect(result.configValidation).toBeDefined();
    });
  });

  describe('testProviderConfiguration', () => {
    it('should test provider configuration successfully', async () => {
      const result = await service.testProviderConfiguration('openai', mockTenantId, 'gpt-4');

      expect(result).toBeDefined();
      expect(result.provider).toBe('openai');
      expect(result.status).toBe('success');
      expect(result.responseTime).toBeGreaterThan(0);
      expect(result.message).toContain('configuré et accessible');
    });

    it('should handle provider test errors', async () => {
      // Mock une erreur pour simuler un échec de test
      jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
        throw new Error('Connection failed');
      });

      const result = await service.testProviderConfiguration('invalid-provider', mockTenantId);

      expect(result.status).toBe('error');
      expect(result.message).toContain('Erreur de connexion');
    });
  });

  // =================== TESTS DASHBOARD SUMMARY ===================

  describe('getDashboardSummary', () => {
    it('should return cached dashboard summary when available', async () => {
      const cachedData = { cached: true };
      redisService.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getDashboardSummary(mockTenantId, 'last_7d');

      expect(result).toEqual(cachedData);
    });

    it('should calculate dashboard summary when not cached', async () => {
      redisService.get.mockResolvedValue(null);
      messageService.getCostMetrics.mockResolvedValue(mockCostMetrics);
      messageService.getUsageMetrics.mockResolvedValue(mockUsageMetrics);
      messageService.getPerformanceMetrics.mockResolvedValue(mockPerformanceMetrics);

      const result = await service.getDashboardSummary(mockTenantId, 'last_7d');

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.totalCost).toBe(125.50);
      expect(result.summary.totalMessages).toBe(340);
      expect(result.summary.avgResponseTime).toBe(1850);
      expect(result.trends).toBeDefined();
      expect(result.topProviders).toBeDefined();
      expect(result.topModels).toBeDefined();
    });

    it('should use default period when not specified', async () => {
      redisService.get.mockResolvedValue(null);
      messageService.getCostMetrics.mockResolvedValue(mockCostMetrics);
      messageService.getUsageMetrics.mockResolvedValue(mockUsageMetrics);
      messageService.getPerformanceMetrics.mockResolvedValue(mockPerformanceMetrics);

      const result = await service.getDashboardSummary(mockTenantId);

      expect(result).toBeDefined();
      expect(messageService.getCostMetrics).toHaveBeenCalled();
    });
  });

  // =================== TESTS EXPORTS ===================

  describe('exportMetrics', () => {
    it('should create export successfully', async () => {
      const exportDto = {
        tenantId: mockTenantId,
        format: 'json' as const,
        period: 'last_7d' as const,
        metrics: ['cost', 'performance'] as const
      };

      const result = await service.exportMetrics(exportDto);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.exportId).toBeDefined();
      expect(result.fileName).toContain('.json');
      expect(result.downloadUrl).toContain('/download');
      expect(result.metadata.tenantId).toBe(mockTenantId);
    });
  });

  describe('getExportStatus', () => {
    it('should return export status', async () => {
      const exportId = 'export-123';
      const result = await service.getExportStatus(exportId);

      expect(result).toBeDefined();
      expect(result.exportId).toBe(exportId);
      expect(result.status).toBe('completed');
      expect(result.progress).toBe(100);
    });
  });

  describe('downloadExport', () => {
    it('should return download data', async () => {
      const exportId = 'export-123';
      const result = await service.downloadExport(exportId);

      expect(result).toBeDefined();
      expect(result.fileName).toContain(exportId);
      expect(result.contentType).toBe('application/json');
      expect(result.data).toBeDefined();
    });
  });

  // =================== TESTS MÉTHODES UTILITAIRES ===================

  describe('utility methods', () => {
    it('should parse periods correctly', () => {
      const periods = ['last_24h', 'last_7d', 'last_30d', 'last_90d'];
      
      for (const period of periods) {
        const result = service['parsePeriod'](period);
        expect(result.startDate).toBeInstanceOf(Date);
        expect(result.endDate).toBeInstanceOf(Date);
        expect(result.startDate.getTime()).toBeLessThan(result.endDate.getTime());
      }
    });

    it('should parse custom period correctly', () => {
      const result = service['parsePeriod']('custom', '2024-01-01', '2024-01-31');
      expect(result.startDate).toEqual(new Date('2024-01-01'));
      expect(result.endDate).toEqual(new Date('2024-01-31'));
    });

    it('should throw error for custom period without dates', () => {
      expect(() => service['parsePeriod']('custom')).toThrow('startDate requis pour période custom');
    });

    it('should calculate days between dates correctly', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-08');
      const days = service['getDaysBetween'](start, end);
      expect(days).toBe(7);
    });

    it('should calculate provider reliability', () => {
      const provider = { avgResponseTime: 2000, messageCount: 100 };
      const reliability = service['calculateProviderReliability'](provider);
      expect(reliability).toBeGreaterThan(0);
      expect(reliability).toBeLessThanOrEqual(1);
    });

    it('should generate next day reset correctly', () => {
      const nextReset = service['getNextDayReset']();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      expect(nextReset.getTime()).toBeCloseTo(tomorrow.getTime(), -1000);
    });

    it('should generate next month reset correctly', () => {
      const nextReset = service['getNextMonthReset']();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);
      
      expect(nextReset.getTime()).toBeCloseTo(nextMonth.getTime(), -1000);
    });
  });

  // =================== TESTS GESTION D'ERREURS ===================

  describe('error handling', () => {
    it('should handle Redis connection errors gracefully', async () => {
      redisService.get.mockRejectedValue(new Error('Redis connection failed'));
      messageService.getCostMetrics.mockResolvedValue(mockCostMetrics);
      messageService.getPerformanceMetrics.mockResolvedValue(mockPerformanceMetrics);
      messageService.getUsageMetrics.mockResolvedValue(mockUsageMetrics);
      conversationService.getTenantAnalytics.mockResolvedValue(mockConversationAnalytics);
      conversationService.getTopCostConversations.mockResolvedValue([]);

      // Le service devrait continuer à fonctionner même si Redis échoue
      const result = await service.getTenantStats({
        tenantId: mockTenantId,
        period: 'last_7d'
      });

      expect(result).toBeDefined();
    });

    it('should handle service timeouts', async () => {
      redisService.get.mockResolvedValue(null);
      messageService.getCostMetrics.mockImplementation(() => 
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
      );

      await expect(service.getTenantStats({
        tenantId: mockTenantId,
        period: 'last_7d'
      })).rejects.toThrow('Timeout');
    });

    it('should handle invalid tenant IDs', async () => {
      redisService.get.mockResolvedValue(null);
      messageService.getCostMetrics.mockRejectedValue(new Error('Tenant not found'));

      await expect(service.getTenantStats({
        tenantId: 'invalid-tenant',
        period: 'last_7d'
      })).rejects.toThrow('Tenant not found');
    });
  });

  // =================== TESTS DE PERFORMANCE ===================

  describe('performance', () => {
    it('should complete getTenantStats within reasonable time', async () => {
      redisService.get.mockResolvedValue(null);
      messageService.getCostMetrics.mockResolvedValue(mockCostMetrics);
      messageService.getPerformanceMetrics.mockResolvedValue(mockPerformanceMetrics);
      messageService.getUsageMetrics.mockResolvedValue(mockUsageMetrics);
      conversationService.getTenantAnalytics.mockResolvedValue(mockConversationAnalytics);
      conversationService.getTopCostConversations.mockResolvedValue([]);

      const startTime = Date.now();
      await service.getTenantStats({
        tenantId: mockTenantId,
        period: 'last_7d'
      });
      const duration = Date.now() - startTime;

      // Test que l'opération se termine en moins de 2 secondes (mocked)
      expect(duration).toBeLessThan(2000);
    });

    it('should use cache to improve performance', async () => {
      const cachedData = { cached: true };
      redisService.get.mockResolvedValue(JSON.stringify(cachedData));

      const startTime = Date.now();
      await service.getTenantStats({
        tenantId: mockTenantId,
        period: 'last_7d'
      });
      const duration = Date.now() - startTime;

      // Avec cache, devrait être très rapide
      expect(duration).toBeLessThan(100);
      expect(messageService.getCostMetrics).not.toHaveBeenCalled();
    });
  });
});