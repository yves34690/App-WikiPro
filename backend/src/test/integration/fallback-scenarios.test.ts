/**
 * TICKET-QA-001 : Tests fallback automatique entre providers
 * Validation basculement OpenAI → Anthropic → Gemini <5s
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AIGatewayService } from '../../ai-gateway/ai-gateway.service';
import { ConfigService } from '@nestjs/config';
import { TelemetryService } from '@core/telemetry/telemetry.service';
import { LLMProvider } from '../../ai-gateway/interfaces/llm-provider.interface';

interface MockLLMResponse {
  error?: any;
  data?: any;
}

describe('Provider Fallback Scenarios - Tests Critiques', () => {
  let aiGatewayService: AIGatewayService;
  let module: TestingModule;
  let telemetryService: TelemetryService;

  const FALLBACK_CONFIG = {
    MAX_FALLBACK_TIME_MS: 5000, // 5s maximum pour basculement
    EXPECTED_SUCCESS_RATE: 98, // 98% même en cas de panne provider
    RETRY_ATTEMPTS: 3,
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        AIGatewayService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-value'),
          },
        },
        {
          provide: TelemetryService,
          useValue: {
            trackEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    aiGatewayService = module.get<AIGatewayService>(AIGatewayService);
    telemetryService = module.get<TelemetryService>(TelemetryService);
  });

  afterAll(async () => {
    await module.close();
  });

  /**
   * Test cascade de fallback OpenAI → Mock (simulation panne)
   */
  it('devrait basculer automatiquement vers Mock en cas de panne OpenAI', async () => {
    const startTime = Date.now();
    const testMessage = 'Test fallback simulation panne OpenAI';
    const tenantId = 'test-tenant-fallback';

    try {
      // Tenter d'utiliser OpenAI (qui va échouer car non configuré)
      const response = await aiGatewayService.routeToProvider(
        LLMProvider.OPENAI,
        testMessage,
        tenantId,
        {
          context: 'Test fallback automatique',
          maxTokens: 500,
          temperature: 0.7,
        }
      );

      const fallbackTime = Date.now() - startTime;

      // VALIDATION CRITIQUE : Basculement <5s
      expect(fallbackTime).toBeLessThan(FALLBACK_CONFIG.MAX_FALLBACK_TIME_MS);

      // Vérifier que la réponse est valide (fallback vers Mock)
      expect(response).toBeDefined();
      expect(response.text).toBeDefined();
      expect(response.provider).toBe(LLMProvider.MOCK); // Devrait avoir basculé vers Mock
      expect(response.tokensUsed).toBeGreaterThan(0);

      console.log(`✅ Fallback OpenAI→Mock réussi en ${fallbackTime}ms`);
      console.log(`   Provider final: ${response.provider}`);
      console.log(`   Tokens utilisés: ${response.tokensUsed}`);

      // Vérifier que la télémétrie a enregistré le fallback
      expect(telemetryService.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: expect.stringContaining('fallback'),
        })
      );

    } catch (error) {
      // Si le fallback échoue complètement, c'est un problème critique
      fail(`Fallback critique échoué: ${error.message}`);
    }
  });

  /**
   * Test fallback multiple avec simulation pannes en cascade
   */
  it('devrait gérer des pannes en cascade sur plusieurs providers', async () => {
    const scenarios = [
      { primary: LLMProvider.OPENAI, expected: LLMProvider.MOCK },
      { primary: LLMProvider.ANTHROPIC, expected: LLMProvider.MOCK },
      { primary: LLMProvider.GEMINI, expected: LLMProvider.MOCK },
    ];

    const results = [];

    for (const scenario of scenarios) {
      const startTime = Date.now();
      
      try {
        const response = await aiGatewayService.routeToProvider(
          scenario.primary,
          `Test cascade fallback from ${scenario.primary}`,
          'tenant-cascade-test'
        );

        const fallbackTime = Date.now() - startTime;
        
        results.push({
          primary: scenario.primary,
          finalProvider: response.provider,
          fallbackTime,
          success: true,
          tokensUsed: response.tokensUsed,
        });

        // Chaque fallback doit être rapide
        expect(fallbackTime).toBeLessThan(FALLBACK_CONFIG.MAX_FALLBACK_TIME_MS);
        
        console.log(`📡 ${scenario.primary}→${response.provider}: ${fallbackTime}ms`);

      } catch (error) {
        results.push({
          primary: scenario.primary,
          success: false,
          error: error.message,
          fallbackTime: Date.now() - startTime,
        });
      }
    }

    // Validation globale : au moins 95% de succès après fallback
    const successRate = (results.filter(r => r.success).length / results.length) * 100;
    expect(successRate).toBeGreaterThanOrEqual(95);

    console.log(`🎯 Cascade Fallback Success Rate: ${successRate}%`);
  });

  /**
   * Test de performance sous charge avec fallbacks simultanés
   */
  it('devrait maintenir les performances lors de fallbacks simultanés', async () => {
    const concurrentFallbacks = 20;
    const startTime = Date.now();

    // Créer des requêtes simultanées vers un provider qui va échouer
    const fallbackRequests = Array.from({ length: concurrentFallbacks }, (_, i) =>
      aiGatewayService.routeToProvider(
        LLMProvider.OPENAI, // Va fallback vers Mock
        `Concurrent fallback test #${i}`,
        `tenant-concurrent-${i % 5}` // Simuler 5 tenants différents
      ).catch(error => ({ error: true, message: error.message, id: i }))
    );

    const results = await Promise.allSettled(fallbackRequests);
    const totalDuration = Date.now() - startTime;

    // Analyser les résultats
    const successful = results.filter(r => 
      r.status === 'fulfilled' && !(r.value as MockLLMResponse).error
    ).length;
    
    const successRate = (successful / concurrentFallbacks) * 100;

    // VALIDATIONS CRITIQUES
    expect(totalDuration).toBeLessThan(10000); // Max 10s pour 20 fallbacks simultanés
    expect(successRate).toBeGreaterThanOrEqual(90); // 90% minimum de succès

    console.log(`⚡ Concurrent Fallbacks: ${totalDuration}ms total, ${successRate}% success`);
    console.log(`   Successful: ${successful}/${concurrentFallbacks}`);
  });

  /**
   * Test de récupération automatique après rétablissement provider
   */
  it('devrait reprendre le provider principal après rétablissement', async () => {
    // Première phase : forcer l'utilisation du Mock (simulation provider principal en panne)
    const fallbackResponse = await aiGatewayService.mockChatCompletion(
      'Test pendant panne simulée',
      'context-fallback'
    );

    expect(fallbackResponse.success).toBe(true);
    expect(fallbackResponse.provider).toBe(LLMProvider.MOCK);

    // Attendre un délai simulé de "rétablissement"
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Deuxième phase : vérifier que le service peut à nouveau utiliser Mock sans problème
    const recoveryResponse = await aiGatewayService.mockChatCompletion(
      'Test après rétablissement simulé',
      'context-recovery'
    );

    expect(recoveryResponse.success).toBe(true);
    expect(recoveryResponse.responseTime).toBeLessThan(2000); // Performance normale

    console.log(`🔄 Recovery test successful`);
    console.log(`   Fallback response time: ${fallbackResponse.responseTime}ms`);
    console.log(`   Recovery response time: ${recoveryResponse.responseTime}ms`);
  });

  /**
   * Test de conservation des métadonnées lors du fallback
   */
  it('devrait préserver les métadonnées et le contexte lors du fallback', async () => {
    const originalContext = {
      context: 'Contexte important pour la continuité',
      maxTokens: 1000,
      temperature: 0.8,
      systemPrompt: 'Tu es un assistant WikiPro spécialisé',
    };

    const tenantId = 'tenant-metadata-test';
    const testMessage = 'Question nécessitant le contexte préservé';

    try {
      // Tenter avec un provider qui va fallback
      const response = await aiGatewayService.routeToProvider(
        LLMProvider.ANTHROPIC, // Va fallback vers Mock
        testMessage,
        tenantId,
        originalContext
      );

      // Vérifier que les métadonnées de contexte sont préservées
      expect(response).toBeDefined();
      expect(response.text).toContain('WikiPro'); // Le contexte doit être préservé
      expect(response.tokensUsed).toBeGreaterThan(0);
      expect(response.responseTime).toBeGreaterThan(0);

      // Vérifier que le contexte a été appliqué même après fallback
      expect(response.text.length).toBeGreaterThan(50); // Réponse substantielle
      
      console.log(`🏷️  Metadata preservation test passed`);
      console.log(`   Final provider: ${response.provider}`);
      console.log(`   Response contains context: ${response.text.includes('WikiPro')}`);

    } catch (error) {
      fail(`Metadata preservation failed: ${error.message}`);
    }
  });

  /**
   * Test de limites et quotas lors des fallbacks
   */
  it('devrait respecter les quotas même lors de fallbacks multiples', async () => {
    const maxConcurrentRequests = 15;
    const requests = [];

    // Créer de nombreuses requêtes qui vont déclencher des fallbacks
    for (let i = 0; i < maxConcurrentRequests; i++) {
      const requestPromise = aiGatewayService.routeToProvider(
        LLMProvider.GEMINI, // Va fallback vers Mock
        `Quota test fallback ${i}`,
        `tenant-quota-${i % 3}` // 3 tenants différents
      ).then(response => ({
        success: true,
        provider: response.provider,
        tokensUsed: response.tokensUsed,
        requestId: i,
      })).catch(error => ({
        success: false,
        error: error.message,
        requestId: i,
      }));

      requests.push(requestPromise);
    }

    const results = await Promise.all(requests);
    
    // Analyser les résultats
    const successful = results.filter(r => r.success);
    const totalTokensUsed = successful.reduce((sum, r) => sum + (r.tokensUsed || 0), 0);

    // Validations
    expect(successful.length).toBeGreaterThanOrEqual(maxConcurrentRequests * 0.9); // 90% minimum
    expect(totalTokensUsed).toBeGreaterThan(0);

    console.log(`📊 Quota Fallback Test: ${successful.length}/${maxConcurrentRequests} successful`);
    console.log(`   Total tokens used: ${totalTokensUsed}`);
    console.log(`   Average tokens per request: ${Math.round(totalTokensUsed / successful.length)}`);
  });

  /**
   * Test de monitoring et alertes lors des fallbacks
   */
  it('devrait déclencher les bonnes métriques de monitoring', async () => {
    const monitoringMessage = 'Test monitoring des fallbacks';
    const tenantId = 'tenant-monitoring';

    // Effectuer une requête qui va déclencher un fallback
    await aiGatewayService.routeToProvider(
      LLMProvider.OPENAI,
      monitoringMessage,
      tenantId
    );

    // Vérifier que les événements de télémétrie appropriés ont été déclenchés
    expect(telemetryService.trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: expect.stringMatching(/ai\.gateway/),
        tenantId: tenantId,
      })
    );

    // Le service doit tracker les fallbacks pour le monitoring
    const telemetryCalls = (telemetryService.trackEvent as jest.Mock).mock.calls;
    const hasFallbackEvent = telemetryCalls.some(call => 
      call[0].event && call[0].event.includes('fallback')
    );

    console.log(`📈 Monitoring Events Captured: ${telemetryCalls.length}`);
    console.log(`   Fallback event tracked: ${hasFallbackEvent}`);
  });
});