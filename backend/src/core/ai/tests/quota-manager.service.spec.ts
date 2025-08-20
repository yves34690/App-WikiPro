import { Test, TestingModule } from '@nestjs/testing';
import { QuotaManagerService } from '../services/quota-manager.service';
import { AIProviderType } from '../providers/base-provider';

describe('QuotaManagerService', () => {
  let service: QuotaManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuotaManagerService],
    }).compile();

    service = module.get<QuotaManagerService>(QuotaManagerService);
  });

  describe('tenant quotas', () => {
    const tenantId = 'test-tenant';

    it('devrait initialiser les quotas d\'un tenant', async () => {
      const quotas = await service.initializeTenantQuotas(
        tenantId,
        10000,  // dailyTokenLimit
        100000, // monthlyTokenLimit
        100,    // dailyRequestLimit
        1000,   // monthlyRequestLimit
      );

      expect(quotas).toBeDefined();
      expect(quotas.tenantId).toBe(tenantId);
      expect(quotas.dailyTokenLimit).toBe(10000);
      expect(quotas.currentDailyTokens).toBe(0);
    });

    it('devrait vérifier les quotas avant utilisation', async () => {
      await service.initializeTenantQuotas(tenantId, 1000, 10000, 10, 100);

      // Devrait être autorisé dans les limites
      const check1 = await service.checkTenantQuotas(tenantId, 500, AIProviderType.OPENAI);
      expect(check1.allowed).toBe(true);

      // Devrait être refusé si ça dépasse les quotas
      const check2 = await service.checkTenantQuotas(tenantId, 1500, AIProviderType.OPENAI);
      expect(check2.allowed).toBe(false);
      expect(check2.reason).toContain('Daily token quota exceeded');
    });

    it('devrait consommer les quotas correctement', async () => {
      await service.initializeTenantQuotas(tenantId, 1000, 10000, 10, 100);

      await service.consumeQuota(tenantId, 300, AIProviderType.OPENAI);

      const quotas = service.getTenantQuotas(tenantId);
      expect(quotas?.currentDailyTokens).toBe(300);
      expect(quotas?.currentMonthlyTokens).toBe(300);
      expect(quotas?.currentDailyRequests).toBe(1);
      expect(quotas?.currentMonthlyRequests).toBe(1);
    });

    it('devrait créer des alertes quand les seuils sont atteints', async () => {
      await service.initializeTenantQuotas(tenantId, 1000, 10000, 10, 100);

      // Consommer 80% du quota quotidien (devrait déclencher une alerte warning)
      await service.consumeQuota(tenantId, 800, AIProviderType.OPENAI);

      const alerts = service.getRecentAlerts(10);
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some(a => a.type === 'warning')).toBe(true);
    });
  });

  describe('provider quotas', () => {
    it('devrait vérifier les quotas des providers', async () => {
      // Les quotas providers sont initialisés par défaut
      const check = await service.checkProviderQuotas(100, AIProviderType.OPENAI);
      expect(check.allowed).toBe(true);
    });

    it('devrait retourner les quotas d\'un provider', () => {
      const quotas = service.getProviderQuotas(AIProviderType.OPENAI);
      expect(quotas).toBeDefined();
      expect(quotas?.providerType).toBe(AIProviderType.OPENAI);
      expect(quotas?.globalDailyLimit).toBeGreaterThan(0);
    });

    it('devrait empêcher l\'utilisation si le provider dépasse ses quotas', async () => {
      const quotas = service.getProviderQuotas(AIProviderType.OPENAI);
      if (quotas) {
        // Simuler l'épuisement du quota
        quotas.currentGlobalDaily = quotas.globalDailyLimit;

        const check = await service.checkProviderQuotas(100, AIProviderType.OPENAI);
        expect(check.allowed).toBe(false);
        expect(check.reason).toContain('Provider daily quota exceeded');
      }
    });
  });

  describe('alerts', () => {
    const tenantId = 'alert-test-tenant';

    it('devrait créer des alertes de différents types', async () => {
      await service.initializeTenantQuotas(tenantId, 1000, 10000, 10, 100);

      // Déclencher des alertes à différents seuils
      await service.consumeQuota(tenantId, 750, AIProviderType.OPENAI); // 75% - warning
      await service.consumeQuota(tenantId, 150, AIProviderType.OPENAI); // 90% - critical

      const alerts = service.getRecentAlerts(10);
      
      expect(alerts.some(a => a.type === 'warning')).toBe(true);
      expect(alerts.some(a => a.type === 'critical')).toBe(true);
    });

    it('devrait éviter les doublons d\'alertes', async () => {
      await service.initializeTenantQuotas(tenantId, 1000, 10000, 10, 100);

      // Déclencher plusieurs fois le même type d'alerte
      await service.consumeQuota(tenantId, 800, AIProviderType.OPENAI);
      await service.consumeQuota(tenantId, 50, AIProviderType.OPENAI);

      const alerts = service.getRecentAlerts(10);
      const warningAlerts = alerts.filter(a => a.type === 'warning' && a.tenantId === tenantId);
      
      // Ne devrait pas avoir de doublons récents
      expect(warningAlerts.length).toBeLessThanOrEqual(2);
    });
  });

  describe('statistics', () => {
    it('devrait retourner les statistiques globales', async () => {
      const tenantId1 = 'stats-tenant-1';
      const tenantId2 = 'stats-tenant-2';

      await service.initializeTenantQuotas(tenantId1, 1000, 10000);
      await service.initializeTenantQuotas(tenantId2, 2000, 20000);

      await service.consumeQuota(tenantId1, 500, AIProviderType.OPENAI);
      await service.consumeQuota(tenantId2, 300, AIProviderType.ANTHROPIC);

      const stats = service.getGlobalStats();

      expect(stats.totalTenants).toBeGreaterThanOrEqual(2);
      expect(stats.totalDailyTokens).toBeGreaterThanOrEqual(800);
      expect(stats.providerStats.size).toBeGreaterThan(0);
    });
  });

  describe('quota reset', () => {
    it('devrait réinitialiser les quotas quotidiens', async () => {
      const tenantId = 'reset-test-tenant';
      await service.initializeTenantQuotas(tenantId, 1000, 10000);
      await service.consumeQuota(tenantId, 500, AIProviderType.OPENAI);

      // Vérifier que les quotas sont consommés
      const quotasBefore = service.getTenantQuotas(tenantId);
      expect(quotasBefore?.currentDailyTokens).toBe(500);

      // Réinitialiser
      await service.resetDailyQuotas();

      // Vérifier que les quotas quotidiens sont réinitialisés
      const quotasAfter = service.getTenantQuotas(tenantId);
      expect(quotasAfter?.currentDailyTokens).toBe(0);
      expect(quotasAfter?.currentMonthlyTokens).toBe(500); // Les mensuels restent
    });

    it('devrait réinitialiser les quotas mensuels', async () => {
      const tenantId = 'monthly-reset-tenant';
      await service.initializeTenantQuotas(tenantId, 1000, 10000);
      await service.consumeQuota(tenantId, 500, AIProviderType.OPENAI);

      // Réinitialiser les quotas mensuels
      await service.resetMonthlyQuotas();

      const quotas = service.getTenantQuotas(tenantId);
      expect(quotas?.currentMonthlyTokens).toBe(0);
      expect(quotas?.currentMonthlyRequests).toBe(0);
    });
  });
});