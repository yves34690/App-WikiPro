import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  AIProviderType,
  ProviderMetrics,
} from '../providers/base-provider';

export interface TenantQuotas {
  tenantId: string;
  dailyTokenLimit: number;
  monthlyTokenLimit: number;
  dailyRequestLimit: number;
  monthlyRequestLimit: number;
  currentDailyTokens: number;
  currentMonthlyTokens: number;
  currentDailyRequests: number;
  currentMonthlyRequests: number;
  lastResetDaily: Date;
  lastResetMonthly: Date;
}

export interface ProviderQuotas {
  providerType: AIProviderType;
  globalDailyLimit: number;
  globalMonthlyLimit: number;
  currentGlobalDaily: number;
  currentGlobalMonthly: number;
  perTenantDailyLimit: number;
  perTenantMonthlyLimit: number;
  lastResetDaily: Date;
  lastResetMonthly: Date;
}

export interface QuotaAlert {
  type: 'warning' | 'critical' | 'exceeded';
  level: 'tenant' | 'provider' | 'global';
  threshold: number; // Pourcentage (ex: 80 pour 80%)
  current: number;
  limit: number;
  message: string;
  tenantId?: string;
  providerType?: AIProviderType;
  timestamp: Date;
}

@Injectable()
export class QuotaManagerService {
  private tenantQuotas: Map<string, TenantQuotas>;
  private providerQuotas: Map<AIProviderType, ProviderQuotas>;
  private quotaAlerts: QuotaAlert[];
  private readonly logger = new Logger(QuotaManagerService.name);

  // Configuration des seuils d'alerte
  private readonly alertThresholds = {
    warning: 75,  // 75%
    critical: 90, // 90%
  };

  constructor() {
    this.tenantQuotas = new Map();
    this.providerQuotas = new Map();
    this.quotaAlerts = [];
    
    this.initializeDefaultProviderQuotas();
  }

  // ===== GESTION DES QUOTAS TENANT =====

  async initializeTenantQuotas(
    tenantId: string,
    dailyTokenLimit: number = 50000,
    monthlyTokenLimit: number = 1000000,
    dailyRequestLimit: number = 1000,
    monthlyRequestLimit: number = 20000,
  ): Promise<TenantQuotas> {
    const now = new Date();
    
    const quotas: TenantQuotas = {
      tenantId,
      dailyTokenLimit,
      monthlyTokenLimit,
      dailyRequestLimit,
      monthlyRequestLimit,
      currentDailyTokens: 0,
      currentMonthlyTokens: 0,
      currentDailyRequests: 0,
      currentMonthlyRequests: 0,
      lastResetDaily: now,
      lastResetMonthly: now,
    };

    this.tenantQuotas.set(tenantId, quotas);
    this.logger.log(`📊 Quotas initialisés pour le tenant ${tenantId}`);
    
    return quotas;
  }

  async checkTenantQuotas(
    tenantId: string,
    tokensNeeded: number,
    providerType: AIProviderType,
  ): Promise<{ allowed: boolean; reason?: string }> {
    let quotas = this.tenantQuotas.get(tenantId);
    
    // Initialiser les quotas si ils n'existent pas
    if (!quotas) {
      quotas = await this.initializeTenantQuotas(tenantId);
    }

    // Vérifier les quotas quotidiens
    if (quotas.currentDailyTokens + tokensNeeded > quotas.dailyTokenLimit) {
      this.createAlert('exceeded', 'tenant', 100, 
        quotas.currentDailyTokens + tokensNeeded, quotas.dailyTokenLimit,
        `Quota quotidien dépassé pour le tenant ${tenantId}`, tenantId);
      
      return { allowed: false, reason: 'Daily token quota exceeded' };
    }

    if (quotas.currentDailyRequests >= quotas.dailyRequestLimit) {
      return { allowed: false, reason: 'Daily request quota exceeded' };
    }

    // Vérifier les quotas mensuels
    if (quotas.currentMonthlyTokens + tokensNeeded > quotas.monthlyTokenLimit) {
      this.createAlert('exceeded', 'tenant', 100,
        quotas.currentMonthlyTokens + tokensNeeded, quotas.monthlyTokenLimit,
        `Quota mensuel dépassé pour le tenant ${tenantId}`, tenantId);
      
      return { allowed: false, reason: 'Monthly token quota exceeded' };
    }

    if (quotas.currentMonthlyRequests >= quotas.monthlyRequestLimit) {
      return { allowed: false, reason: 'Monthly request quota exceeded' };
    }

    // Vérifier les quotas du provider
    const providerCheck = await this.checkProviderQuotas(tokensNeeded, providerType);
    if (!providerCheck.allowed) {
      return providerCheck;
    }

    return { allowed: true };
  }

  async consumeQuota(
    tenantId: string,
    tokensUsed: number,
    providerType: AIProviderType,
  ): Promise<void> {
    const quotas = this.tenantQuotas.get(tenantId);
    if (!quotas) {
      this.logger.warn(`⚠️ Quotas non trouvés pour le tenant ${tenantId}`);
      return;
    }

    // Mettre à jour les quotas tenant
    quotas.currentDailyTokens += tokensUsed;
    quotas.currentMonthlyTokens += tokensUsed;
    quotas.currentDailyRequests++;
    quotas.currentMonthlyRequests++;

    // Mettre à jour les quotas provider
    const providerQuotas = this.providerQuotas.get(providerType);
    if (providerQuotas) {
      providerQuotas.currentGlobalDaily += tokensUsed;
      providerQuotas.currentGlobalMonthly += tokensUsed;
    }

    // Vérifier les seuils d'alerte
    this.checkQuotaAlerts(quotas, providerType);
  }

  getTenantQuotas(tenantId: string): TenantQuotas | undefined {
    return this.tenantQuotas.get(tenantId);
  }

  // ===== GESTION DES QUOTAS PROVIDER =====

  private initializeDefaultProviderQuotas(): void {
    const providers = [
      {
        type: AIProviderType.OPENAI,
        globalDaily: 500000,
        globalMonthly: 10000000,
        perTenantDaily: 100000,
        perTenantMonthly: 1000000,
      },
      {
        type: AIProviderType.ANTHROPIC,
        globalDaily: 300000,
        globalMonthly: 6000000,
        perTenantDaily: 80000,
        perTenantMonthly: 800000,
      },
      {
        type: AIProviderType.GEMINI,
        globalDaily: 200000,
        globalMonthly: 4000000,
        perTenantDaily: 50000,
        perTenantMonthly: 500000,
      },
    ];

    const now = new Date();
    
    for (const config of providers) {
      this.providerQuotas.set(config.type, {
        providerType: config.type,
        globalDailyLimit: config.globalDaily,
        globalMonthlyLimit: config.globalMonthly,
        currentGlobalDaily: 0,
        currentGlobalMonthly: 0,
        perTenantDailyLimit: config.perTenantDaily,
        perTenantMonthlyLimit: config.perTenantMonthly,
        lastResetDaily: now,
        lastResetMonthly: now,
      });
    }
  }

  async checkProviderQuotas(
    tokensNeeded: number,
    providerType: AIProviderType,
  ): Promise<{ allowed: boolean; reason?: string }> {
    const quotas = this.providerQuotas.get(providerType);
    if (!quotas) {
      return { allowed: false, reason: 'Provider quotas not configured' };
    }

    // Vérifier les limites globales quotidiennes
    if (quotas.currentGlobalDaily + tokensNeeded > quotas.globalDailyLimit) {
      this.createAlert('exceeded', 'provider', 100,
        quotas.currentGlobalDaily + tokensNeeded, quotas.globalDailyLimit,
        `Quota global quotidien dépassé pour ${providerType}`, undefined, providerType);
      
      return { allowed: false, reason: 'Provider daily quota exceeded' };
    }

    // Vérifier les limites globales mensuelles
    if (quotas.currentGlobalMonthly + tokensNeeded > quotas.globalMonthlyLimit) {
      this.createAlert('exceeded', 'provider', 100,
        quotas.currentGlobalMonthly + tokensNeeded, quotas.globalMonthlyLimit,
        `Quota global mensuel dépassé pour ${providerType}`, undefined, providerType);
      
      return { allowed: false, reason: 'Provider monthly quota exceeded' };
    }

    return { allowed: true };
  }

  getProviderQuotas(providerType: AIProviderType): ProviderQuotas | undefined {
    return this.providerQuotas.get(providerType);
  }

  // ===== GESTION DES ALERTES =====

  private checkQuotaAlerts(quotas: TenantQuotas, providerType: AIProviderType): void {
    const now = new Date();
    
    // Alertes tenant - quotas quotidiens
    const dailyUsagePercent = (quotas.currentDailyTokens / quotas.dailyTokenLimit) * 100;
    if (dailyUsagePercent >= this.alertThresholds.critical) {
      this.createAlert('critical', 'tenant', dailyUsagePercent,
        quotas.currentDailyTokens, quotas.dailyTokenLimit,
        `Quota quotidien critique pour le tenant ${quotas.tenantId}`, quotas.tenantId);
    } else if (dailyUsagePercent >= this.alertThresholds.warning) {
      this.createAlert('warning', 'tenant', dailyUsagePercent,
        quotas.currentDailyTokens, quotas.dailyTokenLimit,
        `Quota quotidien en alerte pour le tenant ${quotas.tenantId}`, quotas.tenantId);
    }

    // Alertes tenant - quotas mensuels
    const monthlyUsagePercent = (quotas.currentMonthlyTokens / quotas.monthlyTokenLimit) * 100;
    if (monthlyUsagePercent >= this.alertThresholds.critical) {
      this.createAlert('critical', 'tenant', monthlyUsagePercent,
        quotas.currentMonthlyTokens, quotas.monthlyTokenLimit,
        `Quota mensuel critique pour le tenant ${quotas.tenantId}`, quotas.tenantId);
    } else if (monthlyUsagePercent >= this.alertThresholds.warning) {
      this.createAlert('warning', 'tenant', monthlyUsagePercent,
        quotas.currentMonthlyTokens, quotas.monthlyTokenLimit,
        `Quota mensuel en alerte pour le tenant ${quotas.tenantId}`, quotas.tenantId);
    }

    // Alertes provider
    const providerQuotas = this.providerQuotas.get(providerType);
    if (providerQuotas) {
      const providerDailyPercent = (providerQuotas.currentGlobalDaily / providerQuotas.globalDailyLimit) * 100;
      if (providerDailyPercent >= this.alertThresholds.critical) {
        this.createAlert('critical', 'provider', providerDailyPercent,
          providerQuotas.currentGlobalDaily, providerQuotas.globalDailyLimit,
          `Quota quotidien critique pour ${providerType}`, undefined, providerType);
      }
    }
  }

  private createAlert(
    type: 'warning' | 'critical' | 'exceeded',
    level: 'tenant' | 'provider' | 'global',
    threshold: number,
    current: number,
    limit: number,
    message: string,
    tenantId?: string,
    providerType?: AIProviderType,
  ): void {
    const alert: QuotaAlert = {
      type,
      level,
      threshold,
      current,
      limit,
      message,
      tenantId,
      providerType,
      timestamp: new Date(),
    };

    // Éviter les doublons d'alertes (même type pour le même objet dans les 5 dernières minutes)
    const recentSimilar = this.quotaAlerts.find(a => 
      a.type === type &&
      a.level === level &&
      a.tenantId === tenantId &&
      a.providerType === providerType &&
      (Date.now() - a.timestamp.getTime()) < 300000 // 5 minutes
    );

    if (!recentSimilar) {
      this.quotaAlerts.push(alert);
      this.logger.warn(`🚨 ${type.toUpperCase()} - ${message}`);

      // Garder seulement les 100 dernières alertes
      if (this.quotaAlerts.length > 100) {
        this.quotaAlerts = this.quotaAlerts.slice(-100);
      }
    }
  }

  getRecentAlerts(limit: number = 50): QuotaAlert[] {
    return this.quotaAlerts
      .slice(-limit)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // ===== TÂCHES CRON POUR RÉINITIALISATION DES QUOTAS =====

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyQuotas(): Promise<void> {
    this.logger.log('🔄 Réinitialisation des quotas quotidiens...');
    
    const now = new Date();
    
    // Réinitialiser les quotas tenant quotidiens
    for (const [tenantId, quotas] of this.tenantQuotas) {
      quotas.currentDailyTokens = 0;
      quotas.currentDailyRequests = 0;
      quotas.lastResetDaily = now;
    }

    // Réinitialiser les quotas provider quotidiens
    for (const [type, quotas] of this.providerQuotas) {
      quotas.currentGlobalDaily = 0;
      quotas.lastResetDaily = now;
    }

    this.logger.log(`✅ Quotas quotidiens réinitialisés pour ${this.tenantQuotas.size} tenant(s) et ${this.providerQuotas.size} provider(s)`);
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async resetMonthlyQuotas(): Promise<void> {
    this.logger.log('🔄 Réinitialisation des quotas mensuels...');
    
    const now = new Date();
    
    // Réinitialiser les quotas tenant mensuels
    for (const [tenantId, quotas] of this.tenantQuotas) {
      quotas.currentMonthlyTokens = 0;
      quotas.currentMonthlyRequests = 0;
      quotas.lastResetMonthly = now;
    }

    // Réinitialiser les quotas provider mensuels
    for (const [type, quotas] of this.providerQuotas) {
      quotas.currentGlobalMonthly = 0;
      quotas.lastResetMonthly = now;
    }

    this.logger.log(`✅ Quotas mensuels réinitialisés pour ${this.tenantQuotas.size} tenant(s) et ${this.providerQuotas.size} provider(s)`);
  }

  // ===== STATISTIQUES ET MONITORING =====

  getGlobalStats(): {
    totalTenants: number;
    totalDailyTokens: number;
    totalMonthlyTokens: number;
    providerStats: Map<AIProviderType, { daily: number; monthly: number }>;
    alerts: { warning: number; critical: number; exceeded: number };
  } {
    const stats = {
      totalTenants: this.tenantQuotas.size,
      totalDailyTokens: 0,
      totalMonthlyTokens: 0,
      providerStats: new Map(),
      alerts: { warning: 0, critical: 0, exceeded: 0 },
    };

    // Calculer les totaux tenant
    for (const quotas of this.tenantQuotas.values()) {
      stats.totalDailyTokens += quotas.currentDailyTokens;
      stats.totalMonthlyTokens += quotas.currentMonthlyTokens;
    }

    // Statistiques par provider
    for (const [type, quotas] of this.providerQuotas) {
      stats.providerStats.set(type, {
        daily: quotas.currentGlobalDaily,
        monthly: quotas.currentGlobalMonthly,
      });
    }

    // Compter les alertes récentes (dernières 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    for (const alert of this.quotaAlerts) {
      if (alert.timestamp > oneDayAgo) {
        stats.alerts[alert.type]++;
      }
    }

    return stats;
  }
}