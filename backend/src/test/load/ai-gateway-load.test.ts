/**
 * TICKET-QA-001 : Tests de charge 100+ requêtes simultanées AIGateway
 * Validation performance <15s timeout global maintenu
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AIGatewayService } from '../../ai-gateway/ai-gateway.service';
import { ConfigService } from '@nestjs/config';
import { TelemetryService } from '@core/telemetry/telemetry.service';
import { LLMProvider } from '../../ai-gateway/interfaces/llm-provider.interface';

describe('AIGateway Load Tests - 100+ Requêtes Simultanées', () => {
  let aiGatewayService: AIGatewayService;
  let module: TestingModule;

  const LOAD_TEST_CONFIG = {
    CONCURRENT_REQUESTS: 100,
    MAX_DURATION_MS: 15000, // 15s timeout global EXIGENCE CRITIQUE
    EXPECTED_SUCCESS_RATE: 95, // 95% minimum de réussite
    MAX_RESPONSE_TIME_MS: 2000, // Réponse individuelle <2s
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
  });

  afterAll(async () => {
    await module.close();
  });

  /**
   * Test critique : 100 requêtes simultanées avec timeout global <15s
   */
  it('devrait gérer 100 requêtes simultanées en <15s', async () => {
    const startTime = Date.now();
    const requests: Promise<any>[] = [];
    const results = {
      success: 0,
      errors: 0,
      responseTimes: [] as number[],
    };

    // Générer 100 requêtes simultanées
    for (let i = 0; i < LOAD_TEST_CONFIG.CONCURRENT_REQUESTS; i++) {
      const requestPromise = aiGatewayService
        .mockChatCompletion(
          `Test de charge #${i} - Question business WikiPro`,
          `Contexte tenant de test ${i % 10}`
        )
        .then((response) => {
          const responseTime = Date.now() - startTime;
          results.responseTimes.push(responseTime);
          results.success++;
          return { success: true, responseTime, id: i };
        })
        .catch((error) => {
          results.errors++;
          return { success: false, error: error.message, id: i };
        });

      requests.push(requestPromise);
    }

    // Attendre toutes les requêtes avec timeout global
    const allResults = await Promise.allSettled(requests);
    const totalDuration = Date.now() - startTime;

    // VALIDATION CRITIQUE : Timeout global <15s
    expect(totalDuration).toBeLessThan(LOAD_TEST_CONFIG.MAX_DURATION_MS);

    // VALIDATION : Taux de succès ≥95%
    const successRate = (results.success / LOAD_TEST_CONFIG.CONCURRENT_REQUESTS) * 100;
    expect(successRate).toBeGreaterThanOrEqual(LOAD_TEST_CONFIG.EXPECTED_SUCCESS_RATE);

    // VALIDATION : Temps de réponse individuel <2s
    const avgResponseTime = results.responseTimes.reduce((a, b) => a + b, 0) / results.responseTimes.length;
    expect(avgResponseTime).toBeLessThan(LOAD_TEST_CONFIG.MAX_RESPONSE_TIME_MS);

    console.log(`🚀 LOAD TEST RESULTS:`);
    console.log(`   Total Duration: ${totalDuration}ms (limite: ${LOAD_TEST_CONFIG.MAX_DURATION_MS}ms)`);
    console.log(`   Success Rate: ${successRate}% (limite: ${LOAD_TEST_CONFIG.EXPECTED_SUCCESS_RATE}%)`);
    console.log(`   Avg Response Time: ${avgResponseTime}ms (limite: ${LOAD_TEST_CONFIG.MAX_RESPONSE_TIME_MS}ms)`);
    console.log(`   Concurrent Requests: ${LOAD_TEST_CONFIG.CONCURRENT_REQUESTS}`);
    console.log(`   Successful: ${results.success}, Errors: ${results.errors}`);
  });

  /**
   * Test escalier de charge progressive
   */
  it('devrait maintenir les performances avec charge croissante', async () => {
    const loadSteps = [10, 25, 50, 100];
    const performanceResults = [];

    for (const requestCount of loadSteps) {
      const startTime = Date.now();
      const requests = Array.from({ length: requestCount }, (_, i) =>
        aiGatewayService.mockChatCompletion(
          `Test escalier ${requestCount} req #${i}`,
          'contexte-test'
        )
      );

      try {
        await Promise.all(requests);
        const duration = Date.now() - startTime;
        const avgTime = duration / requestCount;

        performanceResults.push({
          requestCount,
          totalDuration: duration,
          avgResponseTime: avgTime,
        });

        // Vérifier que chaque étape respecte les limites
        expect(duration).toBeLessThan(LOAD_TEST_CONFIG.MAX_DURATION_MS);
        expect(avgTime).toBeLessThan(LOAD_TEST_CONFIG.MAX_RESPONSE_TIME_MS);

        console.log(`📊 Load Step ${requestCount}: ${duration}ms total, ${avgTime}ms avg`);
      } catch (error) {
        fail(`Échec à l'étape ${requestCount} requêtes: ${error.message}`);
      }
    }

    // Vérifier que les performances ne se dégradent pas drastiquement
    const degradationThreshold = 2; // Facteur maximum de dégradation acceptable
    const baselineAvg = performanceResults[0].avgResponseTime;
    const maxAvg = Math.max(...performanceResults.map(r => r.avgResponseTime));

    expect(maxAvg / baselineAvg).toBeLessThan(degradationThreshold);
  });

  /**
   * Test de résistance avec requêtes en burst
   */
  it('devrait résister aux pics de trafic (burst patterns)', async () => {
    const burstConfig = {
      burstSize: 50,
      burstCount: 3,
      intervalMs: 1000,
    };

    const allResults = [];

    for (let burst = 0; burst < burstConfig.burstCount; burst++) {
      const burstStart = Date.now();
      
      // Créer un burst de requêtes
      const burstRequests = Array.from({ length: burstConfig.burstSize }, (_, i) =>
        aiGatewayService.mockChatCompletion(
          `Burst ${burst + 1} requête #${i}`,
          'contexte-burst'
        )
      );

      try {
        const burstResults = await Promise.allSettled(burstRequests);
        const burstDuration = Date.now() - burstStart;
        
        const successCount = burstResults.filter(r => r.status === 'fulfilled').length;
        const successRate = (successCount / burstConfig.burstSize) * 100;

        allResults.push({
          burst: burst + 1,
          duration: burstDuration,
          successRate,
          successCount,
          totalRequests: burstConfig.burstSize,
        });

        // Valider chaque burst
        expect(burstDuration).toBeLessThan(LOAD_TEST_CONFIG.MAX_DURATION_MS);
        expect(successRate).toBeGreaterThanOrEqual(90); // Tolérance légèrement réduite pour burst

        console.log(`💥 Burst ${burst + 1}: ${burstDuration}ms, ${successRate}% success`);

        // Pause entre les bursts (sauf le dernier)
        if (burst < burstConfig.burstCount - 1) {
          await new Promise(resolve => setTimeout(resolve, burstConfig.intervalMs));
        }
      } catch (error) {
        fail(`Burst ${burst + 1} failed: ${error.message}`);
      }
    }

    // Validation globale des bursts
    const totalSuccessRate = allResults.reduce((sum, r) => sum + r.successRate, 0) / allResults.length;
    expect(totalSuccessRate).toBeGreaterThanOrEqual(90);

    console.log(`🎯 Burst Test Summary - Average Success Rate: ${totalSuccessRate}%`);
  });

  /**
   * Test de stabilité mémoire sous charge
   */
  it('devrait maintenir une utilisation mémoire stable sous charge', async () => {
    const initialMemory = process.memoryUsage();
    
    // Série de 5 vagues de 20 requêtes chacune
    for (let wave = 0; wave < 5; wave++) {
      const waveRequests = Array.from({ length: 20 }, (_, i) =>
        aiGatewayService.mockChatCompletion(
          `Memory test wave ${wave + 1} req #${i}`,
          'memory-test-context'
        )
      );

      await Promise.all(waveRequests);
      
      // Forcer le garbage collection si disponible
      if (global.gc) {
        global.gc();
      }

      const currentMemory = process.memoryUsage();
      const memoryIncrease = currentMemory.heapUsed - initialMemory.heapUsed;
      
      // La mémoire ne devrait pas augmenter de plus de 50MB
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);

      console.log(`🧠 Wave ${wave + 1} Memory: ${Math.round(memoryIncrease / 1024 / 1024)}MB increase`);
    }
  });

  /**
   * Test de récupération après erreur massive
   */
  it('devrait récupérer après une série d\'erreurs', async () => {
    // Simuler d'abord une série d'erreurs (en utilisant un provider inexistant)
    const errorRequests = Array.from({ length: 10 }, (_, i) =>
      aiGatewayService
        .routeToProvider(
          'INVALID_PROVIDER' as LLMProvider,
          `Error test ${i}`,
          'test-tenant'
        )
        .catch(() => ({ error: true, id: i }))
    );

    await Promise.allSettled(errorRequests);

    // Puis tester la récupération avec des requêtes normales
    const recoveryStart = Date.now();
    const recoveryRequests = Array.from({ length: 20 }, (_, i) =>
      aiGatewayService.mockChatCompletion(
        `Recovery test ${i}`,
        'recovery-context'
      )
    );

    const recoveryResults = await Promise.allSettled(recoveryRequests);
    const recoveryDuration = Date.now() - recoveryStart;

    // Le service doit récupérer rapidement
    expect(recoveryDuration).toBeLessThan(5000); // 5s max
    
    const successCount = recoveryResults.filter(r => r.status === 'fulfilled').length;
    const recoveryRate = (successCount / recoveryRequests.length) * 100;
    
    expect(recoveryRate).toBeGreaterThanOrEqual(95); // 95% de récupération

    console.log(`🔄 Recovery Test: ${recoveryDuration}ms, ${recoveryRate}% success rate`);
  });
});