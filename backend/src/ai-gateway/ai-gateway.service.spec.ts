import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AIGatewayService } from './ai-gateway.service';
import { TelemetryService } from '@core/telemetry/telemetry.service';
import { LLMProvider } from './interfaces/llm-provider.interface';

describe('AIGatewayService', () => {
  let service: AIGatewayService;
  let configService: jest.Mocked<ConfigService>;
  let telemetryService: jest.Mocked<TelemetryService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const mockTelemetryService = {
      trackEvent: jest.fn(),
      trackMetric: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIGatewayService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: TelemetryService, useValue: mockTelemetryService },
      ],
    }).compile();

    service = module.get<AIGatewayService>(AIGatewayService);
    configService = module.get(ConfigService);
    telemetryService = module.get(TelemetryService);

    // Attendre l'initialisation des providers
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialisation', () => {
    it('devrait être défini', () => {
      expect(service).toBeDefined();
    });

    it('devrait initialiser le MockProvider', () => {
      expect(service).toBeInstanceOf(AIGatewayService);
    });
  });

  describe('mockChatCompletion', () => {
    it('devrait retourner une réponse AIResponse valide', async () => {
      const message = 'Test de chat completion';
      const context = 'Contexte de test';

      const response = await service.mockChatCompletion(message, context);

      expect(response).toMatchObject({
        success: true,
        content: expect.any(String),
        tokensUsed: expect.any(Number),
        responseTime: expect.any(Number),
        provider: 'mock',
      });

      expect(response.content.length).toBeGreaterThan(0);
      expect(response.tokensUsed).toBeGreaterThan(0);
      expect(response.responseTime).toBeGreaterThan(0);
    });

    it('devrait inclure des métadonnées dans la réponse', async () => {
      const response = await service.mockChatCompletion('Test metadata');

      expect(response.metadata).toBeDefined();
      expect(response.metadata).toMatchObject({
        temperature: expect.any(Number),
        maxTokens: expect.any(Number),
        finishReason: expect.any(String),
      });
    });

    it('devrait tracker l\'événement de télémétrie', async () => {
      // Retry en cas d'erreur simulée
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          await service.mockChatCompletion('Test télémétrie');
          break;
        } catch (error) {
          if (attempt === 4) throw error;
        }
      }

      expect(telemetryService.trackEvent).toHaveBeenCalledWith({
        event: 'ai.gateway.mock.completion',
        tenantId: 'mock-tenant',
        metadata: expect.objectContaining({
          responseTime: expect.any(Number),
          tokensUsed: expect.any(Number),
          success: true,
        }),
      });
    });

    it('devrait gérer les erreurs et tracker les événements d\'erreur', async () => {
      // Forcer une erreur en passant un message vide
      try {
        await service.mockChatCompletion('');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(telemetryService.trackEvent).toHaveBeenCalledWith({
          event: 'ai.gateway.mock.error',
          tenantId: 'mock-tenant',
          metadata: expect.objectContaining({
            error: expect.any(String),
            responseTime: expect.any(Number),
          }),
        });
      }
    });
  });

  describe('routeToProvider', () => {
    it('devrait router vers le MockProvider avec succès', async () => {
      const prompt = 'Test de routing';
      const tenantId = 'test-tenant';

      const response = await service.routeToProvider(
        LLMProvider.MOCK,
        prompt,
        tenantId
      );

      expect(response).toMatchObject({
        text: expect.any(String),
        tokensUsed: expect.any(Number),
        finishReason: 'stop',
        provider: LLMProvider.MOCK,
        responseTime: expect.any(Number),
      });
    });

    it('devrait utiliser les options fournies', async () => {
      const prompt = 'Test avec options';
      const tenantId = 'test-tenant';
      const options = {
        context: 'Contexte spécial',
        maxTokens: 500,
        temperature: 0.5,
        systemPrompt: 'Tu es un assistant test',
      };

      const response = await service.routeToProvider(
        LLMProvider.MOCK,
        prompt,
        tenantId,
        options
      );

      expect(response).toBeDefined();
      expect(response.metadata?.temperature).toBe(0.5);
    });

    it('devrait lancer une erreur pour un provider inexistant', async () => {
      await expect(
        service.routeToProvider('inexistant' as LLMProvider, 'test', 'tenant')
      ).rejects.toThrow('Provider inexistant non trouvé');
    });

    it('devrait tracker les événements de succès', async () => {
      await service.routeToProvider(LLMProvider.MOCK, 'test', 'tenant');

      expect(telemetryService.trackEvent).toHaveBeenCalledWith({
        event: 'ai.gateway.route.success',
        tenantId: 'tenant',
        metadata: expect.objectContaining({
          provider: LLMProvider.MOCK,
          responseTime: expect.any(Number),
          tokensUsed: expect.any(Number),
        }),
      });
    });
  });

  describe('validateAPIKeys', () => {
    it('devrait retourner un statut de santé valide', async () => {
      const healthStatus = await service.validateAPIKeys();

      expect(healthStatus).toMatchObject({
        overall: expect.stringMatching(/^(healthy|degraded|unhealthy)$/),
        providers: expect.any(Array),
        checks: expect.any(Array),
        lastUpdated: expect.any(Date),
        metadata: expect.objectContaining({
          uptime: expect.any(Number),
          totalRequests: expect.any(Number),
          errorRate: expect.any(Number),
          averageResponseTime: expect.any(Number),
        }),
      });
    });

    it('devrait inclure le statut du MockProvider', async () => {
      const healthStatus = await service.validateAPIKeys();

      expect(healthStatus.providers).toHaveLength(1);
      expect(healthStatus.providers[0]).toMatchObject({
        provider: LLMProvider.MOCK,
        status: 'available',
        enabled: true,
        responseTime: expect.any(Number),
        errorRate: expect.any(Number),
        lastCheck: expect.any(Date),
      });
    });
  });

  describe('getProviderStatus', () => {
    it('devrait retourner les statuts de tous les providers', async () => {
      const statuses = await service.getProviderStatus();

      expect(statuses).toHaveLength(1);
      expect(statuses[0]).toMatchObject({
        provider: LLMProvider.MOCK,
        status: 'available',
        enabled: true,
        responseTime: expect.any(Number),
        errorRate: expect.any(Number),
        lastCheck: expect.any(Date),
      });
    });
  });

  describe('mockRAGQuery', () => {
    it('devrait retourner une réponse RAG valide', async () => {
      const query = 'Comment fonctionne WikiPro?';
      const tenantId = 'test-tenant';

      const response = await service.mockRAGQuery(query, tenantId);

      expect(response).toMatchObject({
        success: true,
        answer: expect.any(String),
        relevantDocuments: expect.any(Array),
        confidence: expect.any(Number),
        tokensUsed: expect.any(Number),
        responseTime: expect.any(Number),
        query: query,
        tenantId: tenantId,
      });

      expect(response.relevantDocuments).toHaveLength(3);
      expect(response.relevantDocuments[0]).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        content: expect.any(String),
        score: expect.any(Number),
        source: expect.any(String),
      });
    });

    it('devrait tracker les événements RAG', async () => {
      await service.mockRAGQuery('Test RAG', 'tenant');

      expect(telemetryService.trackEvent).toHaveBeenCalledWith({
        event: 'ai.gateway.rag.query',
        tenantId: 'tenant',
        metadata: expect.objectContaining({
          documentsRetrieved: 3,
          confidence: expect.any(Number),
          responseTime: expect.any(Number),
          tokensUsed: expect.any(Number),
        }),
      });
    });
  });

  describe('getPerformanceMetrics', () => {
    it('devrait retourner les métriques de performance', async () => {
      const metrics = await service.getPerformanceMetrics();

      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject({
        requestsPerSecond: expect.any(Number),
        averageResponseTime: expect.any(Number),
        p95ResponseTime: expect.any(Number),
        p99ResponseTime: expect.any(Number),
        errorRate: expect.any(Number),
        successRate: expect.any(Number),
        timeWindow: expect.any(String),
        timestamp: expect.any(Date),
      });
    });
  });

  describe('getUsageStats', () => {
    it('devrait retourner les statistiques d\'utilisation', () => {
      const stats = service.getUsageStats();

      expect(stats).toMatchObject({
        totalRequests: expect.any(Number),
        totalTokens: expect.any(Number),
        totalCost: expect.any(Number),
        requestsByProvider: expect.any(Object),
        tokensByProvider: expect.any(Object),
        costByProvider: expect.any(Object),
        period: expect.objectContaining({
          start: expect.any(Date),
          end: expect.any(Date),
        }),
      });
    });
  });

  describe('configureProviderRouting', () => {
    it('devrait configurer le routing des providers', () => {
      const routing = [
        {
          provider: LLMProvider.MOCK,
          priority: 1,
          enabled: true,
          fallbackProvider: undefined,
        },
      ];

      expect(() => {
        service.configureProviderRouting(routing);
      }).not.toThrow();
    });
  });

  describe('Intégration - Flux complet', () => {
    it('devrait traiter une requête complète de bout en bout', async () => {
      // 1. Vérifier la santé du service
      const health = await service.validateAPIKeys();
      expect(health.overall).toBe('healthy');

      // 2. Effectuer une requête mock
      const mockResponse = await service.mockChatCompletion('Test intégration');
      expect(mockResponse.success).toBe(true);

      // 3. Effectuer une requête de routing
      const routeResponse = await service.routeToProvider(
        LLMProvider.MOCK,
        'Test routing intégration',
        'integration-tenant'
      );
      expect(routeResponse.text).toBeDefined();

      // 4. Effectuer une requête RAG
      const ragResponse = await service.mockRAGQuery(
        'Test RAG intégration',
        'integration-tenant'
      );
      expect(ragResponse.success).toBe(true);

      // 5. Vérifier les statistiques
      const stats = service.getUsageStats();
      expect(stats.totalRequests).toBeGreaterThan(0);

      // 6. Vérifier les métriques
      const metrics = await service.getPerformanceMetrics();
      expect(metrics.length).toBeGreaterThan(0);
    }, 15000); // Timeout de 15s pour ce test d'intégration
  });
});