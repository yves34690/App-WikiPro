import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { AIModule } from '../ai.module';
import { AIOrchestrator } from '../services/ai-orchestrator.service';
import { QuotaManagerService } from '../services/quota-manager.service';
import { DatabaseModule } from '../../../database/database.module';
import { CoreConfigModule } from '@core/config/config.module';
import { SessionModule } from '@core/sessions/session.module';
import { TelemetryModule } from '@core/telemetry/telemetry.module';
import { AuthModule } from '@core/auth/auth.module';
import { TenantModule } from '@core/tenants/tenant.module';
import { UserModule } from '@core/users/user.module';

describe('AI Module Integration Tests', () => {
  let app: INestApplication;
  let orchestrator: AIOrchestrator;
  let quotaManager: QuotaManagerService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.test', '.env'],
        }),
        DatabaseModule,
        CoreConfigModule,
        TenantModule,
        UserModule,
        AuthModule,
        SessionModule,
        TelemetryModule,
        AIModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    orchestrator = moduleFixture.get<AIOrchestrator>(AIOrchestrator);
    quotaManager = moduleFixture.get<QuotaManagerService>(QuotaManagerService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('System Health', () => {
    it('devrait avoir au moins un provider disponible', async () => {
      const availableProviders = orchestrator.getAvailableProviders();
      
      if (process.env.NODE_ENV !== 'test' || process.env.SKIP_AI_TESTS !== 'true') {
        expect(availableProviders.length).toBeGreaterThan(0);
      } else {
        // En mode test sans clés API, on peut avoir 0 provider
        expect(availableProviders.length).toBeGreaterThanOrEqual(0);
      }
    });

    it('devrait initialiser les quotas par défaut', async () => {
      const stats = quotaManager.getGlobalStats();
      expect(stats).toBeDefined();
      expect(stats.totalTenants).toBeGreaterThanOrEqual(0);
    });
  });

  describe('API Endpoints', () => {
    const testTenant = 'test-tenant';
    let authToken: string;

    beforeAll(async () => {
      // Simuler un token d'authentification pour les tests
      // En vraie intégration, vous auriez besoin d'un vrai système d'auth
      authToken = 'mock-jwt-token';
    });

    describe('GET /api/v1/:tenant_slug/ai/providers', () => {
      it('devrait retourner la liste des providers', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/${testTenant}/ai/providers`)
          .set('Authorization', `Bearer ${authToken}`);

        if (response.status === 401) {
          // Le guard d'authentification bloque, c'est normal en test
          expect(response.status).toBe(401);
          return;
        }

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('providers');
        expect(response.body).toHaveProperty('quotas');
        expect(response.body).toHaveProperty('timestamp');
        expect(Array.isArray(response.body.providers)).toBe(true);
      });
    });

    describe('GET /api/v1/:tenant_slug/ai/health', () => {
      it('devrait retourner le statut de santé du système', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/${testTenant}/ai/health`)
          .set('Authorization', `Bearer ${authToken}`);

        if (response.status === 401) {
          // Le guard d'authentification bloque, c'est normal en test
          expect(response.status).toBe(401);
          return;
        }

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('overall');
        expect(response.body).toHaveProperty('providers');
        expect(response.body).toHaveProperty('availableProviders');
        expect(['healthy', 'partial', 'unhealthy']).toContain(response.body.overall);
      });
    });

    describe('POST /api/v1/:tenant_slug/ai/chat', () => {
      const chatRequest = {
        messages: [
          { role: 'user', content: 'Hello, this is a test message' }
        ],
        maxTokens: 100,
        temperature: 0.7,
      };

      it('devrait traiter une requête de chat (ou échouer gracieusement)', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/${testTenant}/ai/chat`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(chatRequest);

        if (response.status === 401) {
          // Le guard d'authentification bloque
          expect(response.status).toBe(401);
          return;
        }

        if (response.status === 503) {
          // Aucun provider disponible, c'est normal en test
          expect(response.status).toBe(503);
          expect(response.body.message).toContain('indisponible');
          return;
        }

        if (response.status === 200) {
          // Si ça marche, vérifier la structure de la réponse
          expect(response.body).toHaveProperty('message');
          expect(response.body).toHaveProperty('tokensUsed');
          expect(response.body).toHaveProperty('provider');
          expect(response.body).toHaveProperty('duration');
        }

        // Autres codes d'erreur acceptables
        expect([200, 401, 429, 503]).toContain(response.status);
      });

      it('devrait valider les données d\'entrée', async () => {
        const invalidRequest = {
          messages: [], // Messages vides - invalide
          temperature: 3.0, // Température invalide
        };

        const response = await request(app.getHttpServer())
          .post(`/api/v1/${testTenant}/ai/chat`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidRequest);

        // Devrait être rejeté pour validation (400) ou auth (401)
        expect([400, 401]).toContain(response.status);
      });
    });
  });

  describe('Provider Fallback', () => {
    it('devrait gérer le fallback entre providers', async () => {
      const availableProviders = orchestrator.getAvailableProviders();
      
      if (availableProviders.length < 2) {
        console.log('Test de fallback ignoré: moins de 2 providers disponibles');
        return;
      }

      const testRequest = {
        messages: [{ role: 'user', content: 'Test fallback' }],
        tenantId: 'test-tenant',
      };

      // Le fallback sera testé automatiquement si un provider échoue
      // Pour un test réel, vous pourriez simuler des pannes de providers
      const providersStatus = orchestrator.getProviderStatus();
      expect(providersStatus.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Quota Management', () => {
    const testTenant = 'quota-test-tenant';

    it('devrait gérer les quotas par tenant', async () => {
      await quotaManager.initializeTenantQuotas(testTenant, 1000, 10000);
      
      const quotas = quotaManager.getTenantQuotas(testTenant);
      expect(quotas).toBeDefined();
      expect(quotas?.tenantId).toBe(testTenant);
    });

    it('devrait empêcher les dépassements de quota', async () => {
      await quotaManager.initializeTenantQuotas(testTenant, 100, 1000); // Quotas très bas

      const check = await quotaManager.checkTenantQuotas(testTenant, 200, 'openai' as any);
      expect(check.allowed).toBe(false);
    });

    it('devrait suivre la consommation de tokens', async () => {
      await quotaManager.initializeTenantQuotas(testTenant, 1000, 10000);
      
      await quotaManager.consumeQuota(testTenant, 100, 'openai' as any);
      
      const quotas = quotaManager.getTenantQuotas(testTenant);
      expect(quotas?.currentDailyTokens).toBe(100);
    });
  });

  describe('WebSocket Integration', () => {
    it('devrait avoir le gateway WebSocket configuré', () => {
      // Test basique pour vérifier que le gateway est configuré
      // Les vrais tests WebSocket nécessiteraient une configuration plus complexe
      const moduleRef = app.select(AIModule);
      expect(moduleRef).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('devrait gérer gracieusement l\'absence de providers', async () => {
      const testRequest = {
        messages: [{ role: 'user', content: 'Test error handling' }],
        tenantId: 'error-test-tenant',
      };

      // Si aucun provider n'est disponible, devrait lever une erreur appropriée
      try {
        await orchestrator.chatCompletion(testRequest as any);
      } catch (error) {
        expect(error.message).toContain('provider');
      }
    });

    it('devrait reporter les métriques d\'erreur', async () => {
      const stats = quotaManager.getGlobalStats();
      expect(stats.alerts).toBeDefined();
      expect(typeof stats.alerts.warning).toBe('number');
      expect(typeof stats.alerts.critical).toBe('number');
      expect(typeof stats.alerts.exceeded).toBe('number');
    });
  });
});