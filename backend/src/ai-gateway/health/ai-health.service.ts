import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { AIConfigService } from '../config/ai-config.service';
import {
  HealthCheckResult,
  HealthCheckOptions,
  ProviderHealthMetrics,
  AIHealthReport,
  HealthAlert,
  QuotaStatus
} from './ai-health.interface';

@Injectable()
export class AIHealthService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AIHealthService.name);
  private healthCheckInterval: NodeJS.Timeout;
  private metrics: Map<string, ProviderHealthMetrics> = new Map();
  private alerts: HealthAlert[] = [];
  private lastHealthReport: AIHealthReport;

  constructor(private aiConfigService: AIConfigService) {}

  async onModuleInit() {
    this.logger.log('🏥 Initialisation AIHealthService...');
    
    if (!this.aiConfigService.areHealthChecksEnabled()) {
      this.logger.warn('⚠️ Health checks désactivés dans la configuration');
      return;
    }

    // Initialisation des métriques
    this.initializeMetrics();

    // Premier health check
    await this.performHealthCheck();

    // Démarrage des health checks périodiques
    this.startPeriodicHealthChecks();

    this.logger.log('✅ AIHealthService initialisé avec succès');
  }

  onModuleDestroy() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.logger.log('🛑 Health checks périodiques arrêtés');
    }
  }

  /**
   * Initialise les métriques pour tous les providers
   */
  private initializeMetrics(): void {
    const providers = this.aiConfigService.getAvailableProviders();
    
    providers.forEach(provider => {
      this.metrics.set(provider, {
        provider,
        totalChecks: 0,
        successfulChecks: 0,
        failedChecks: 0,
        averageLatency: 0,
        lastSuccess: null,
        lastFailure: null,
        consecutiveFailures: 0,
        uptime: 0,
      });
    });

    this.logger.log(`📊 Métriques initialisées pour ${providers.length} providers`);
  }

  /**
   * Démarre les health checks périodiques
   */
  private startPeriodicHealthChecks(): void {
    const config = this.aiConfigService.getConfiguration();
    const interval = config.health.interval;

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        this.logger.error('Erreur lors du health check périodique:', error);
      }
    }, interval);

    this.logger.log(`⏰ Health checks démarrés (intervalle: ${interval / 1000}s)`);
  }

  /**
   * Effectue un health check complet
   */
  async performHealthCheck(options: HealthCheckOptions = {}): Promise<AIHealthReport> {
    const startTime = Date.now();
    this.logger.debug('🔍 Démarrage health check complet...');

    const config = this.aiConfigService.getConfiguration();
    const enabledProviders = this.aiConfigService.getEnabledProviders();
    
    // Tests de santé de tous les providers
    const healthResults = await Promise.allSettled(
      enabledProviders.map(provider => 
        this.checkProviderHealth(provider.name, options)
      )
    );

    // Traitement des résultats
    const providers: HealthCheckResult[] = [];
    const recommendations: string[] = [];

    healthResults.forEach((result, index) => {
      const providerName = enabledProviders[index].name;
      
      if (result.status === 'fulfilled') {
        providers.push(result.value);
        this.updateMetrics(result.value);
      } else {
        // Erreur lors du test
        const errorResult: HealthCheckResult = {
          provider: providerName,
          healthy: false,
          latency: 0,
          timestamp: new Date(),
          error: result.reason?.message || 'Erreur inconnue',
        };
        providers.push(errorResult);
        this.updateMetrics(errorResult);
      }
    });

    // Détermination de la santé globale
    const overallHealth = this.determineOverallHealth(providers);
    
    // Vérification du provider actif
    const activeProvider = this.aiConfigService.getStatus().activeProvider;
    const activeProviderHealth = providers.find(p => p.provider === activeProvider);
    
    // Recommandations automatiques
    if (activeProviderHealth && !activeProviderHealth.healthy) {
      recommendations.push(`Provider actif '${activeProvider}' non disponible - basculement recommandé`);
    }

    // Génération du rapport
    const report: AIHealthReport = {
      timestamp: new Date(),
      overallHealth,
      activeProvider,
      providers,
      metrics: Array.from(this.metrics.values()),
      recommendations,
      nextCheckIn: config.health.interval,
    };

    this.lastHealthReport = report;
    
    const duration = Date.now() - startTime;
    this.logger.log(`✅ Health check terminé en ${duration}ms - Status: ${overallHealth}`);

    // Gestion des alertes
    await this.processHealthAlerts(report);

    return report;
  }

  /**
   * Teste la santé d'un provider spécifique
   */
  async checkProviderHealth(
    providerName: string,
    options: HealthCheckOptions = {}
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const config = this.aiConfigService.getConfiguration();
    const timeout = options.timeout || config.health.timeout;

    try {
      this.logger.debug(`🩺 Test santé provider: ${providerName}`);

      // Simulation d'un test de santé (stub)
      const result = await this.performProviderHealthCheck(providerName, timeout);
      
      const latency = Date.now() - startTime;
      
      return {
        provider: providerName,
        healthy: result.healthy,
        latency,
        timestamp: new Date(),
        error: result.error,
        details: {
          model: result.model,
          apiKeyValid: result.apiKeyValid,
          responseTime: latency,
          quotaStatus: result.quotaStatus,
        },
      };

    } catch (error) {
      const latency = Date.now() - startTime;
      
      return {
        provider: providerName,
        healthy: false,
        latency,
        timestamp: new Date(),
        error: error.message,
      };
    }
  }

  /**
   * Simulation du test de santé d'un provider (stub)
   */
  private async performProviderHealthCheck(
    providerName: string,
    timeout: number
  ): Promise<{
    healthy: boolean;
    error?: string;
    model: string;
    apiKeyValid: boolean;
    quotaStatus: string;
  }> {
    const providerConfig = this.aiConfigService.getProviderConfig(providerName);
    if (!providerConfig) {
      throw new Error(`Provider ${providerName} non configuré`);
    }

    // Simulation avec timeout
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    // Simulation des résultats basée sur la configuration
    const isHealthy = providerConfig.apiKey.length > 10; // Simulation simple
    
    return {
      healthy: isHealthy,
      error: isHealthy ? undefined : 'Clé API invalide ou service indisponible',
      model: providerConfig.model,
      apiKeyValid: providerConfig.apiKey.length > 10,
      quotaStatus: 'ok',
    };
  }

  /**
   * Met à jour les métriques d'un provider
   */
  private updateMetrics(result: HealthCheckResult): void {
    const metrics = this.metrics.get(result.provider);
    if (!metrics) return;

    metrics.totalChecks++;
    
    if (result.healthy) {
      metrics.successfulChecks++;
      metrics.lastSuccess = result.timestamp;
      metrics.consecutiveFailures = 0;
    } else {
      metrics.failedChecks++;
      metrics.lastFailure = result.timestamp;
      metrics.consecutiveFailures++;
    }

    // Calcul de la latence moyenne
    const totalLatency = metrics.averageLatency * (metrics.totalChecks - 1) + result.latency;
    metrics.averageLatency = totalLatency / metrics.totalChecks;

    // Calcul de l'uptime
    metrics.uptime = (metrics.successfulChecks / metrics.totalChecks) * 100;

    this.metrics.set(result.provider, metrics);
  }

  /**
   * Détermine la santé globale du système
   */
  private determineOverallHealth(providers: HealthCheckResult[]): 'healthy' | 'degraded' | 'unhealthy' {
    const healthyCount = providers.filter(p => p.healthy).length;
    const totalCount = providers.length;

    if (healthyCount === 0) return 'unhealthy';
    if (healthyCount === totalCount) return 'healthy';
    return 'degraded';
  }

  /**
   * Traite les alertes basées sur le rapport de santé
   */
  private async processHealthAlerts(report: AIHealthReport): Promise<void> {
    // Alerte si le provider actif est down
    const activeProvider = report.providers.find(p => p.provider === report.activeProvider);
    if (activeProvider && !activeProvider.healthy) {
      this.createAlert({
        level: 'critical',
        provider: activeProvider.provider,
        message: `Provider actif '${activeProvider.provider}' indisponible`,
        details: { error: activeProvider.error, latency: activeProvider.latency },
      });
    }

    // Alerte si plus de 50% des providers sont down
    const healthyCount = report.providers.filter(p => p.healthy).length;
    const healthyPercentage = (healthyCount / report.providers.length) * 100;
    
    if (healthyPercentage < 50) {
      this.createAlert({
        level: 'error',
        message: `Seulement ${healthyPercentage.toFixed(1)}% des providers sont disponibles`,
        details: { healthyCount, totalCount: report.providers.length },
      });
    }

    // Nettoyage des anciennes alertes résolues
    this.cleanupOldAlerts();
  }

  /**
   * Crée une nouvelle alerte
   */
  private createAlert(alert: Omit<HealthAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const newAlert: HealthAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      ...alert,
    };

    this.alerts.push(newAlert);
    
    // Log de l'alerte
    const logMethod = alert.level === 'critical' ? 'error' : 
                     alert.level === 'error' ? 'error' : 
                     alert.level === 'warning' ? 'warn' : 'log';
    
    this.logger[logMethod](`🚨 [${alert.level.toUpperCase()}] ${alert.message}`);
  }

  /**
   * Nettoie les anciennes alertes
   */
  private cleanupOldAlerts(): void {
    const maxAge = 24 * 60 * 60 * 1000; // 24 heures
    const now = Date.now();
    
    this.alerts = this.alerts.filter(alert => {
      const age = now - alert.timestamp.getTime();
      return age < maxAge;
    });
  }

  // === PUBLIC API ===

  /**
   * Retourne le dernier rapport de santé
   */
  getLastHealthReport(): AIHealthReport | null {
    return this.lastHealthReport || null;
  }

  /**
   * Retourne les métriques d'un provider
   */
  getProviderMetrics(provider: string): ProviderHealthMetrics | null {
    return this.metrics.get(provider) || null;
  }

  /**
   * Retourne toutes les métriques
   */
  getAllMetrics(): ProviderHealthMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Retourne les alertes actives
   */
  getActiveAlerts(): HealthAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Retourne toutes les alertes
   */
  getAllAlerts(): HealthAlert[] {
    return [...this.alerts];
  }

  /**
   * Marque une alerte comme résolue
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.logger.log(`✅ Alerte ${alertId} marquée comme résolue`);
      return true;
    }
    return false;
  }

  /**
   * Force un health check immédiat
   */
  async forceHealthCheck(): Promise<AIHealthReport> {
    this.logger.log('⚡ Health check forcé demandé');
    return this.performHealthCheck();
  }

  /**
   * Retourne le statut de quota d'un provider (stub)
   */
  async getProviderQuotaStatus(provider: string): Promise<QuotaStatus | null> {
    const providerConfig = this.aiConfigService.getProviderConfig(provider);
    if (!providerConfig) return null;

    // Simulation du quota
    return {
      provider,
      used: Math.random() * 100,
      limit: 100,
      percentage: Math.random() * 100,
      status: 'ok',
    };
  }

  /**
   * Retourne un résumé de santé simple
   */
  getHealthSummary(): {
    status: string;
    activeProvider: string;
    availableProviders: number;
    alerts: number;
  } {
    const report = this.lastHealthReport;
    if (!report) {
      return {
        status: 'unknown',
        activeProvider: 'none',
        availableProviders: 0,
        alerts: 0,
      };
    }

    return {
      status: report.overallHealth,
      activeProvider: report.activeProvider,
      availableProviders: report.providers.filter(p => p.healthy).length,
      alerts: this.getActiveAlerts().length,
    };
  }
}