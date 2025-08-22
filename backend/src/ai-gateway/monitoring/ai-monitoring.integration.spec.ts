import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@core/redis/redis.module';
import { AIMonitoringModule } from './ai-monitoring.module';

/**
 * Tests d'intégration pour valider le routing et les formats JSON - TICKET-BACKEND-005
 */
describe('AIMonitoring Integration Tests', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;

  const mockTenantId = 'tenant-123e4567-e89b-12d3-a456-426614174000';
  const mockExportId = 'export-123';

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        // Configuration TypeORM pour les tests
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TEST_DATABASE_HOST || 'localhost',
          port: parseInt(process.env.TEST_DATABASE_PORT) || 5433,
          username: process.env.TEST_DATABASE_USERNAME || 'test_user',
          password: process.env.TEST_DATABASE_PASSWORD || 'test_password',
          database: process.env.TEST_DATABASE_NAME || 'test_db',
          synchronize: true,
          dropSchema: true,
          autoLoadEntities: true,
        }),
        RedisModule,
        AIMonitoringModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await moduleRef.close();
  });

  // =================== TESTS ROUTING API ===================

  describe('API Routing Validation', () => {
    it('should respond to GET /ai/stats/:tenantId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/ai/stats/${mockTenantId}`)
        .query({ period: 'last_7d' })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.tenantId).toBe(mockTenantId);
    });

    it('should respond to GET /ai/costs', async () => {
      const response = await request(app.getHttpServer())
        .get('/ai/costs')
        .query({ 
          tenantId: mockTenantId,
          period: 'last_30d' 
        })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.tenantId).toBe(mockTenantId);
    });

    it('should respond to GET /ai/performance', async () => {
      const response = await request(app.getHttpServer())
        .get('/ai/performance')
        .query({ 
          tenantId: mockTenantId,
          period: 'last_7d' 
        })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.tenantId).toBe(mockTenantId);
    });

    it('should respond to GET /ai/performance/realtime', async () => {
      const response = await request(app.getHttpServer())
        .get('/ai/performance/realtime')
        .query({ tenantId: mockTenantId })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.current).toBeDefined();
    });

    it('should respond to GET /ai/quotas', async () => {
      const response = await request(app.getHttpServer())
        .get('/ai/quotas')
        .query({ tenantId: mockTenantId })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.tenantId).toBe(mockTenantId);
      expect(response.body.tenantQuotas).toBeDefined();
    });

    it('should respond to GET /ai/dashboard/:tenantId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/ai/dashboard/${mockTenantId}`)
        .query({ period: 'last_7d' })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.summary).toBeDefined();
      expect(response.body.trends).toBeDefined();
      expect(response.body.lastUpdated).toBeDefined();
    });
  });

  // =================== TESTS FORMATS JSON DASHBOARD-READY ===================

  describe('JSON Format Validation', () => {
    it('should return valid TenantAIStatsDto format', async () => {
      const response = await request(app.getHttpServer())
        .get(`/ai/stats/${mockTenantId}`)
        .query({ period: 'last_7d' })
        .expect(200);

      const stats = response.body;

      // Vérifier la structure obligatoire
      expect(stats).toHaveProperty('tenantId');
      expect(stats).toHaveProperty('period');
      expect(stats).toHaveProperty('startDate');
      expect(stats).toHaveProperty('endDate');
      expect(stats).toHaveProperty('totalCostUsd');
      expect(stats).toHaveProperty('totalTokens');
      expect(stats).toHaveProperty('totalMessages');
      expect(stats).toHaveProperty('totalConversations');
      
      // Vérifier les moyennes
      expect(stats).toHaveProperty('avgCostPerConversation');
      expect(stats).toHaveProperty('avgCostPerMessage');
      expect(stats).toHaveProperty('avgTokensPerMessage');
      expect(stats).toHaveProperty('avgResponseTimeMs');
      expect(stats).toHaveProperty('avgConfidenceScore');
      
      // Vérifier les breakdowns
      expect(stats).toHaveProperty('providerBreakdown');
      expect(Array.isArray(stats.providerBreakdown)).toBe(true);
      expect(stats).toHaveProperty('modelBreakdown');
      expect(Array.isArray(stats.modelBreakdown)).toBe(true);
      
      // Vérifier les insights et projections
      expect(stats).toHaveProperty('insights');
      expect(Array.isArray(stats.insights)).toBe(true);
      expect(stats).toHaveProperty('potentialSavings');
      expect(stats).toHaveProperty('projections');

      // Vérifier les types de données
      expect(typeof stats.totalCostUsd).toBe('number');
      expect(typeof stats.totalMessages).toBe('number');
      expect(typeof stats.avgResponseTimeMs).toBe('number');
    });

    it('should return valid CostAnalyticsDto format', async () => {
      const response = await request(app.getHttpServer())
        .get('/ai/costs')
        .query({ 
          tenantId: mockTenantId,
          period: 'last_30d' 
        })
        .expect(200);

      const analytics = response.body;

      // Vérifier la structure obligatoire
      expect(analytics).toHaveProperty('tenantId');
      expect(analytics).toHaveProperty('period');
      expect(analytics).toHaveProperty('totalCostUsd');
      expect(analytics).toHaveProperty('avgCostPerDay');
      expect(analytics).toHaveProperty('avgCostPerMessage');
      
      // Vérifier les breakdowns
      expect(analytics).toHaveProperty('providerCostBreakdown');
      expect(Array.isArray(analytics.providerCostBreakdown)).toBe(true);
      expect(analytics).toHaveProperty('modelCostBreakdown');
      expect(Array.isArray(analytics.modelCostBreakdown)).toBe(true);
      
      // Vérifier les patterns et tops
      expect(analytics).toHaveProperty('hourlyCostPattern');
      expect(Array.isArray(analytics.hourlyCostPattern)).toBe(true);
      expect(analytics).toHaveProperty('topCostConversations');
      expect(Array.isArray(analytics.topCostConversations)).toBe(true);
      
      // Vérifier l'optimisation et benchmarks
      expect(analytics).toHaveProperty('costOptimization');
      expect(analytics.costOptimization).toHaveProperty('potentialSavings');
      expect(analytics).toHaveProperty('benchmarks');
      expect(analytics).toHaveProperty('projections');
    });

    it('should return valid PerformanceMetricsDto format', async () => {
      const response = await request(app.getHttpServer())
        .get('/ai/performance')
        .query({ 
          tenantId: mockTenantId,
          period: 'last_7d' 
        })
        .expect(200);

      const metrics = response.body;

      // Vérifier la structure obligatoire
      expect(metrics).toHaveProperty('tenantId');
      expect(metrics).toHaveProperty('period');
      
      // Vérifier les métriques de temps de réponse
      expect(metrics).toHaveProperty('responseTime');
      expect(metrics.responseTime).toHaveProperty('avgMs');
      expect(metrics.responseTime).toHaveProperty('medianMs');
      expect(metrics.responseTime).toHaveProperty('p95Ms');
      
      // Vérifier les métriques de qualité
      expect(metrics).toHaveProperty('quality');
      expect(metrics.quality).toHaveProperty('avgConfidenceScore');
      expect(metrics.quality).toHaveProperty('userSatisfactionRate');
      
      // Vérifier les métriques de fiabilité
      expect(metrics).toHaveProperty('reliability');
      expect(metrics.reliability).toHaveProperty('successRate');
      expect(metrics.reliability).toHaveProperty('errorRate');
      
      // Vérifier les performances par provider/modèle
      expect(metrics).toHaveProperty('providerPerformance');
      expect(Array.isArray(metrics.providerPerformance)).toBe(true);
      expect(metrics).toHaveProperty('modelPerformance');
      expect(Array.isArray(metrics.modelPerformance)).toBe(true);
      
      // Vérifier les benchmarks et recommandations
      expect(metrics).toHaveProperty('benchmarks');
      expect(metrics).toHaveProperty('optimizationRecommendations');
      expect(Array.isArray(metrics.optimizationRecommendations)).toBe(true);
    });

    it('should return valid QuotaStatusDto format', async () => {
      const response = await request(app.getHttpServer())
        .get('/ai/quotas')
        .query({ tenantId: mockTenantId })
        .expect(200);

      const quota = response.body;

      // Vérifier la structure obligatoire
      expect(quota).toHaveProperty('tenantId');
      expect(quota).toHaveProperty('timestamp');
      
      // Vérifier les quotas tenant
      expect(quota).toHaveProperty('tenantQuotas');
      expect(quota.tenantQuotas).toHaveProperty('dailyLimit');
      expect(quota.tenantQuotas).toHaveProperty('monthlyLimit');
      expect(quota.tenantQuotas).toHaveProperty('tokenLimit');
      expect(quota.tenantQuotas).toHaveProperty('messageLimit');
      
      // Vérifier la structure des limites
      expect(quota.tenantQuotas.dailyLimit).toHaveProperty('limitUsd');
      expect(quota.tenantQuotas.dailyLimit).toHaveProperty('usedUsd');
      expect(quota.tenantQuotas.dailyLimit).toHaveProperty('remainingUsd');
      expect(quota.tenantQuotas.dailyLimit).toHaveProperty('usagePercent');
      expect(quota.tenantQuotas.dailyLimit).toHaveProperty('status');
      
      // Vérifier les quotas par provider et modèle
      expect(quota).toHaveProperty('providerQuotas');
      expect(Array.isArray(quota.providerQuotas)).toBe(true);
      expect(quota).toHaveProperty('modelQuotas');
      expect(Array.isArray(quota.modelQuotas)).toBe(true);
      
      // Vérifier les prédictions
      expect(quota).toHaveProperty('predictions');
      expect(quota.predictions).toHaveProperty('dailyUsageProjection');
      expect(quota.predictions).toHaveProperty('monthlyUsageProjection');
    });

    it('should return valid RealTimePerformanceDto format', async () => {
      const response = await request(app.getHttpServer())
        .get('/ai/performance/realtime')
        .query({ tenantId: mockTenantId })
        .expect(200);

      const realtime = response.body;

      // Vérifier la structure obligatoire
      expect(realtime).toHaveProperty('timestamp');
      expect(realtime).toHaveProperty('current');
      expect(realtime).toHaveProperty('last5min');
      expect(realtime).toHaveProperty('providerStatus');
      
      // Vérifier les métriques actuelles
      expect(realtime.current).toHaveProperty('activeConversations');
      expect(realtime.current).toHaveProperty('messagesPerMinute');
      expect(realtime.current).toHaveProperty('avgResponseTime');
      expect(realtime.current).toHaveProperty('currentErrorRate');
      expect(realtime.current).toHaveProperty('activeProviders');
      expect(Array.isArray(realtime.current.activeProviders)).toBe(true);
      
      // Vérifier les métriques des 5 dernières minutes
      expect(realtime.last5min).toHaveProperty('messageCount');
      expect(realtime.last5min).toHaveProperty('avgResponseTime');
      expect(realtime.last5min).toHaveProperty('errorCount');
      expect(realtime.last5min).toHaveProperty('uniqueUsers');
      
      // Vérifier le status des providers
      expect(Array.isArray(realtime.providerStatus)).toBe(true);
      if (realtime.providerStatus.length > 0) {
        const provider = realtime.providerStatus[0];
        expect(provider).toHaveProperty('provider');
        expect(provider).toHaveProperty('status');
        expect(provider).toHaveProperty('responseTime');
        expect(provider).toHaveProperty('errorRate');
      }
    });
  });

  // =================== TESTS EXPORT CSV/JSON ===================

  describe('Export Format Validation', () => {
    it('should export tenant stats as JSON', async () => {
      const response = await request(app.getHttpServer())
        .post(`/ai/stats/${mockTenantId}/export`)
        .send({
          tenantId: mockTenantId,
          format: 'json',
          period: 'last_7d'
        })
        .expect(200);

      // Vérifier les headers de téléchargement
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.json');
      
      // Vérifier que la réponse est un JSON valide
      expect(response.body).toBeDefined();
      expect(typeof response.body).toBe('object');
    });

    it('should export tenant stats as CSV', async () => {
      const response = await request(app.getHttpServer())
        .post(`/ai/stats/${mockTenantId}/export`)
        .send({
          tenantId: mockTenantId,
          format: 'csv',
          period: 'last_7d'
        })
        .expect(200);

      // Vérifier les headers de téléchargement
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.csv');
      
      // Vérifier que la réponse est du CSV valide
      expect(typeof response.text).toBe('string');
      expect(response.text).toContain('tenant_id');
      expect(response.text).toContain(','); // Séparateur CSV
    });

    it('should create export and return download URL', async () => {
      const response = await request(app.getHttpServer())
        .post('/ai/export')
        .send({
          tenantId: mockTenantId,
          format: 'json',
          period: 'last_7d',
          metrics: ['cost', 'performance']
        })
        .expect(200);

      // Vérifier la structure de la réponse
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('exportId');
      expect(response.body).toHaveProperty('fileName');
      expect(response.body).toHaveProperty('downloadUrl');
      expect(response.body).toHaveProperty('expiresAt');
      
      // Vérifier les métadonnées
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.metadata).toHaveProperty('tenantId');
      expect(response.body.metadata.tenantId).toBe(mockTenantId);
      expect(response.body.metadata).toHaveProperty('format');
      expect(response.body.metadata.format).toBe('json');
      
      // Vérifier le résumé
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary).toHaveProperty('totalCost');
      expect(response.body.summary).toHaveProperty('totalMessages');
    });

    it('should get export status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/ai/export/${mockExportId}/status`)
        .expect(200);

      // Vérifier la structure de la réponse
      expect(response.body).toHaveProperty('exportId');
      expect(response.body.exportId).toBe(mockExportId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('progress');
      expect(response.body).toHaveProperty('startedAt');
      expect(response.body).toHaveProperty('metadata');
    });
  });

  // =================== TESTS PERFORMANCE <1s ===================

  describe('Performance Validation', () => {
    it('should respond to dashboard summary in <1s', async () => {
      const startTime = Date.now();
      
      await request(app.getHttpServer())
        .get(`/ai/dashboard/${mockTenantId}`)
        .query({ period: 'last_7d' })
        .expect(200);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000); // <1s
    });

    it('should respond to real-time performance in <500ms', async () => {
      const startTime = Date.now();
      
      await request(app.getHttpServer())
        .get('/ai/performance/realtime')
        .query({ tenantId: mockTenantId })
        .expect(200);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(500); // <500ms pour temps réel
    });

    it('should handle multiple concurrent requests efficiently', async () => {
      const startTime = Date.now();
      
      // Lancer 5 requêtes en parallèle
      const promises = Array.from({ length: 5 }, () =>
        request(app.getHttpServer())
          .get(`/ai/stats/${mockTenantId}`)
          .query({ period: 'last_7d' })
          .expect(200)
      );
      
      await Promise.all(promises);
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(2000); // Toutes les requêtes en <2s
    });
  });

  // =================== TESTS SÉCURITÉ ===================

  describe('Security Validation', () => {
    it('should require admin access for global usage', async () => {
      await request(app.getHttpServer())
        .get('/ai/usage')
        .query({ period: 'last_30d' })
        .expect(403); // Forbidden sans admin access
    });

    it('should accept global usage with admin header', async () => {
      await request(app.getHttpServer())
        .get('/ai/usage')
        .query({ period: 'last_30d' })
        .set('X-Admin-Access', 'true')
        .expect(200);
    });

    it('should validate tenant UUID format', async () => {
      await request(app.getHttpServer())
        .get('/ai/stats/invalid-uuid')
        .query({ period: 'last_7d' })
        .expect(400); // Bad Request pour UUID invalide
    });

    it('should validate required query parameters', async () => {
      await request(app.getHttpServer())
        .get('/ai/costs')
        // Pas de tenantId fourni
        .expect(400); // Bad Request
    });
  });

  // =================== TESTS GESTION D'ERREURS ===================

  describe('Error Handling Validation', () => {
    it('should handle invalid period parameter', async () => {
      await request(app.getHttpServer())
        .get(`/ai/stats/${mockTenantId}`)
        .query({ period: 'invalid_period' })
        .expect(400);
    });

    it('should handle non-existent conversation ID', async () => {
      const invalidConvId = 'conv-00000000-0000-0000-0000-000000000000';
      
      await request(app.getHttpServer())
        .get(`/ai/costs/${invalidConvId}`)
        .query({ tenantId: mockTenantId })
        .expect(404); // Not Found
    });

    it('should handle unsupported export format', async () => {
      await request(app.getHttpServer())
        .post(`/ai/stats/${mockTenantId}/export`)
        .send({
          tenantId: mockTenantId,
          format: 'pdf', // Format non supporté
          period: 'last_7d'
        })
        .expect(500); // Internal Server Error
    });

    it('should return proper error format', async () => {
      const response = await request(app.getHttpServer())
        .get('/ai/costs')
        .expect(400);

      // Vérifier que l'erreur a un format cohérent
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('statusCode');
      expect(response.body.statusCode).toBe(400);
    });
  });
});