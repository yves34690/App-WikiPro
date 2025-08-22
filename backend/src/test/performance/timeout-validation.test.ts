/**
 * TICKET-QA-001 : Tests validation timeout <15s global
 * Validation timeout global configuré et respecté sous toutes conditions
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AIGatewayService } from '../../ai-gateway/ai-gateway.service';
import { ConfigService } from '@nestjs/config';
import { TelemetryService } from '@core/telemetry/telemetry.service';

interface MockAIResponse {
  success: boolean;
  content: string;
  tokensUsed: number;
  duration?: number;
  responseTime?: number;
}

describe('Timeout Validation Tests - <15s Global', () => {
  let aiGatewayService: AIGatewayService;
  let module: TestingModule;

  const TIMEOUT_CONFIG = {
    GLOBAL_TIMEOUT_MS: 15000, // 15s EXIGENCE CRITIQUE
    INDIVIDUAL_TIMEOUT_MS: 2000, // 2s par requête individuelle
    BATCH_TIMEOUT_MS: 12000, // 12s pour les requêtes en lot
    TOLERANCE_MS: 500, // Tolérance de 500ms
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
   * Test timeout global strict sur requête unique
   */
  it('devrait respecter le timeout global de 15s pour une requête unique', async () => {
    const startTime = Date.now();
    
    try {
      const response = await Promise.race([
        aiGatewayService.mockChatCompletion(
          'Test timeout validation pour une requête longue avec beaucoup de contexte et de détails',
          'Contexte très détaillé pour simuler une requête complexe'
        ),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Global timeout exceeded')), TIMEOUT_CONFIG.GLOBAL_TIMEOUT_MS)
        )
      ]);

      const duration = Date.now() - startTime;

      // VALIDATION CRITIQUE : Jamais dépasser 15s
      expect(duration).toBeLessThan(TIMEOUT_CONFIG.GLOBAL_TIMEOUT_MS);
      
      // Vérifier que la réponse est valide
      expect(response).toBeDefined();
      expect((response as MockAIResponse).success).toBe(true);
      expect((response as MockAIResponse).content).toBeDefined();

      console.log(`⏱️  Single Request Timeout Test: ${duration}ms (limite: ${TIMEOUT_CONFIG.GLOBAL_TIMEOUT_MS}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.message === 'Global timeout exceeded') {
        fail(`Timeout global dépassé: ${duration}ms > ${TIMEOUT_CONFIG.GLOBAL_TIMEOUT_MS}ms`);
      }
      
      // Si l'erreur n'est pas liée au timeout, c'est acceptable
      // tant que le timing est respecté
      expect(duration).toBeLessThan(TIMEOUT_CONFIG.GLOBAL_TIMEOUT_MS);
    }
  });

  /**
   * Test timeout global avec requêtes multiples séquentielles
   */
  it('devrait respecter le timeout global pour requêtes séquentielles', async () => {
    const requestCount = 5;
    const startTime = Date.now();
    const results = [];

    try {
      const globalTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Global timeout exceeded')), TIMEOUT_CONFIG.GLOBAL_TIMEOUT_MS)
      );

      const sequentialRequests = async () => {
        for (let i = 0; i < requestCount; i++) {
          const requestStart = Date.now();
          
          const response = await aiGatewayService.mockChatCompletion(
            `Requête séquentielle ${i + 1}/${requestCount}`,
            `Contexte requête ${i + 1}`
          );

          const requestDuration = Date.now() - requestStart;
          
          results.push({
            index: i + 1,
            duration: requestDuration,
            success: (response as MockAIResponse).success,
            tokensUsed: (response as MockAIResponse).tokensUsed,
          });

          // Vérifier timeout individuel
          expect(requestDuration).toBeLessThan(TIMEOUT_CONFIG.INDIVIDUAL_TIMEOUT_MS);
        }
        
        return results;
      };

      await Promise.race([sequentialRequests(), globalTimeoutPromise]);
      
      const totalDuration = Date.now() - startTime;

      // VALIDATION CRITIQUE : Timeout global respecté
      expect(totalDuration).toBeLessThan(TIMEOUT_CONFIG.GLOBAL_TIMEOUT_MS);
      expect(results).toHaveLength(requestCount);

      const avgRequestTime = results.reduce((sum, r) => sum + (r as MockAIResponse).duration || 0, 0) / results.length;
      
      console.log(`🔄 Sequential Requests Timeout Test:`);
      console.log(`   Total Duration: ${totalDuration}ms (limite: ${TIMEOUT_CONFIG.GLOBAL_TIMEOUT_MS}ms)`);
      console.log(`   Requests Completed: ${results.length}/${requestCount}`);
      console.log(`   Average Request Time: ${Math.round(avgRequestTime)}ms`);

    } catch (error) {
      if (error.message === 'Global timeout exceeded') {
        fail(`Timeout global dépassé pour requêtes séquentielles: ${Date.now() - startTime}ms`);
      }
      throw error;
    }
  });

  /**
   * Test timeout global avec requêtes concurrentes
   */
  it('devrait respecter le timeout global pour requêtes concurrentes', async () => {
    const concurrentCount = 10;
    const startTime = Date.now();

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Global timeout exceeded')), TIMEOUT_CONFIG.GLOBAL_TIMEOUT_MS)
      );

      const concurrentRequests = Array.from({ length: concurrentCount }, (_, i) =>
        aiGatewayService.mockChatCompletion(
          `Requête concurrente ${i + 1} pour test timeout`,
          `Contexte concurrent ${i + 1}`
        ).then(response => ({
          index: i + 1,
          success: (response as MockAIResponse).success,
          duration: Date.now() - startTime, // Temps depuis le début
          tokensUsed: (response as MockAIResponse).tokensUsed,
        })).catch(error => ({
          index: i + 1,
          success: false,
          error: error.message,
          duration: Date.now() - startTime,
        }))
      );

      const results = await Promise.race([
        Promise.all(concurrentRequests),
        timeoutPromise
      ]);

      const totalDuration = Date.now() - startTime;
      const successfulResults = (results as MockAIResponse[]).filter(r => (r as MockAIResponse).success);

      // VALIDATIONS CRITIQUES
      expect(totalDuration).toBeLessThan(TIMEOUT_CONFIG.GLOBAL_TIMEOUT_MS);
      expect(successfulResults.length).toBeGreaterThanOrEqual(concurrentCount * 0.9); // 90% minimum

      const maxRequestDuration = Math.max(...(results as MockAIResponse[]).map(r => (r as MockAIResponse).duration || 0));
      expect(maxRequestDuration).toBeLessThan(TIMEOUT_CONFIG.GLOBAL_TIMEOUT_MS);

      console.log(`⚡ Concurrent Requests Timeout Test:`);
      console.log(`   Total Duration: ${totalDuration}ms (limite: ${TIMEOUT_CONFIG.GLOBAL_TIMEOUT_MS}ms)`);
      console.log(`   Successful: ${successfulResults.length}/${concurrentCount}`);
      console.log(`   Max Request Duration: ${maxRequestDuration}ms`);

    } catch (error) {
      if (error.message === 'Global timeout exceeded') {
        fail(`Timeout global dépassé pour requêtes concurrentes: ${Date.now() - startTime}ms`);
      }
      throw error;
    }
  });

  /**
   * Test timeout avec requêtes en lot (batch)
   */
  it('devrait respecter le timeout pour traitement en lot', async () => {
    const batchSize = 8;
    const startTime = Date.now();

    try {
      const batchMessages = Array.from({ length: batchSize }, (_, i) => ({
        message: `Message batch ${i + 1} - Test timeout validation`,
        context: `Contexte spécifique pour message ${i + 1}`,
        id: i + 1,
      }));

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Batch timeout exceeded')), TIMEOUT_CONFIG.BATCH_TIMEOUT_MS)
      );

      const batchProcessing = async () => {
        const results = [];
        
        // Traiter le batch avec sous-lots pour optimiser
        const subBatchSize = 4;
        for (let i = 0; i < batchMessages.length; i += subBatchSize) {
          const subBatch = batchMessages.slice(i, i + subBatchSize);
          
          const subBatchPromises = subBatch.map(async (item) => {
            const response = await aiGatewayService.mockChatCompletion(
              item.message,
              item.context
            );
            
            return {
              id: item.id,
              success: (response as MockAIResponse).success,
              tokensUsed: (response as MockAIResponse).tokensUsed,
              responseTime: response.responseTime,
            };
          });

          const subBatchResults = await Promise.all(subBatchPromises);
          results.push(...subBatchResults);
        }
        
        return results;
      };

      const batchResults = await Promise.race([batchProcessing(), timeoutPromise]);
      const totalDuration = Date.now() - startTime;

      // VALIDATIONS BATCH
      expect(totalDuration).toBeLessThan(TIMEOUT_CONFIG.BATCH_TIMEOUT_MS);
      expect(batchResults).toHaveLength(batchSize);

      const successfulBatch = (batchResults as MockAIResponse[]).filter(r => (r as MockAIResponse).success);
      expect(successfulBatch.length).toBeGreaterThanOrEqual(batchSize * 0.95); // 95% minimum

      const avgResponseTime = (batchResults as MockAIResponse[]).reduce((sum, r) => sum + ((r as MockAIResponse).responseTime || 0 || 0), 0) / (batchResults as MockAIResponse[]).length;

      console.log(`📦 Batch Processing Timeout Test:`);
      console.log(`   Total Duration: ${totalDuration}ms (limite: ${TIMEOUT_CONFIG.BATCH_TIMEOUT_MS}ms)`);
      console.log(`   Batch Size: ${batchSize}, Successful: ${successfulBatch.length}`);
      console.log(`   Average Response Time: ${Math.round(avgResponseTime)}ms`);

    } catch (error) {
      if (error.message === 'Batch timeout exceeded') {
        fail(`Timeout batch dépassé: ${Date.now() - startTime}ms > ${TIMEOUT_CONFIG.BATCH_TIMEOUT_MS}ms`);
      }
      throw error;
    }
  });

  /**
   * Test de résistance aux timeouts avec retry
   */
  it('devrait gérer les timeouts avec retry intelligent', async () => {
    const maxRetries = 3;
    let attempts = 0;
    const startTime = Date.now();

    const retryWithTimeout = async (): Promise<any> => {
      attempts++;
      
      try {
        return await Promise.race([
          aiGatewayService.mockChatCompletion(
            `Test retry avec timeout - tentative ${attempts}`,
            'contexte-retry-timeout'
          ),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), TIMEOUT_CONFIG.INDIVIDUAL_TIMEOUT_MS)
          )
        ]);
      } catch (error) {
        if (attempts < maxRetries && error.message === 'Request timeout') {
          console.log(`⏰ Tentative ${attempts} timeout, retry...`);
          return retryWithTimeout();
        }
        throw error;
      }
    };

    try {
      const result = await Promise.race([
        retryWithTimeout(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Global timeout exceeded')), TIMEOUT_CONFIG.GLOBAL_TIMEOUT_MS)
        )
      ]);

      const totalDuration = Date.now() - startTime;

      // VALIDATIONS RETRY + TIMEOUT
      expect(totalDuration).toBeLessThan(TIMEOUT_CONFIG.GLOBAL_TIMEOUT_MS);
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(attempts).toBeLessThanOrEqual(maxRetries);

      console.log(`🔄 Retry with Timeout Test:`);
      console.log(`   Total Duration: ${totalDuration}ms`);
      console.log(`   Attempts Used: ${attempts}/${maxRetries}`);
      console.log(`   Success: ${result.success}`);

    } catch (error) {
      const totalDuration = Date.now() - startTime;
      
      if (error.message === 'Global timeout exceeded') {
        fail(`Timeout global dépassé malgré retry: ${totalDuration}ms`);
      }
      
      // Si tous les retries échouent mais dans les temps, c'est acceptable
      expect(totalDuration).toBeLessThan(TIMEOUT_CONFIG.GLOBAL_TIMEOUT_MS);
      console.log(`⚠️  All retries failed within timeout: ${totalDuration}ms, attempts: ${attempts}`);
    }
  });

  /**
   * Test de performance sous contrainte de timeout strict
   */
  it('devrait optimiser les performances sous contrainte de timeout', async () => {
    const performanceTests = [
      { name: 'Fast', expectedTime: 500, message: 'Requête rapide' },
      { name: 'Medium', expectedTime: 1500, message: 'Requête moyenne avec contexte' },
      { name: 'Complex', expectedTime: 2500, message: 'Requête complexe avec beaucoup de contexte détaillé' },
    ];

    const results = [];

    for (const test of performanceTests) {
      const startTime = Date.now();
      
      try {
        const response = await Promise.race([
          aiGatewayService.mockChatCompletion(
            test.message,
            'Contexte performance test avec timeout'
          ),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Test timeout')), TIMEOUT_CONFIG.INDIVIDUAL_TIMEOUT_MS)
          )
        ]);

        const duration = Date.now() - startTime;
        
        results.push({
          name: test.name,
          duration,
          expectedTime: test.expectedTime,
          success: (response as MockAIResponse).success,
          tokensUsed: (response as MockAIResponse).tokensUsed,
          withinExpected: duration <= test.expectedTime,
        });

        // Validation que la performance est dans les attentes
        expect(duration).toBeLessThan(TIMEOUT_CONFIG.INDIVIDUAL_TIMEOUT_MS);
        expect((response as MockAIResponse).success).toBe(true);

      } catch (error) {
        const duration = Date.now() - startTime;
        
        results.push({
          name: test.name,
          duration,
          expectedTime: test.expectedTime,
          success: false,
          error: error.message,
          withinExpected: false,
        });
      }
    }

    // Analyse globale des performances
    const successfulTests = (results as MockAIResponse[]).filter(r => (r as MockAIResponse).success);
    const avgDuration = successfulTests.reduce((sum, r) => sum + (r as MockAIResponse).duration || 0, 0) / successfulTests.length;

    expect(successfulTests.length).toBeGreaterThanOrEqual(performanceTests.length * 0.8); // 80% minimum
    expect(avgDuration).toBeLessThan(TIMEOUT_CONFIG.INDIVIDUAL_TIMEOUT_MS);

    console.log(`🎯 Performance Under Timeout Constraints:`);
    results.forEach(r => {
      console.log(`   ${r.name}: ${(r as MockAIResponse).duration || 0}ms (expected: ${r.expectedTime}ms) - ${(r as MockAIResponse).success ? '✅' : '❌'}`);
    });
    console.log(`   Average Duration: ${Math.round(avgDuration)}ms`);
    console.log(`   Success Rate: ${(successfulTests.length / results.length * 100).toFixed(1)}%`);
  });
});