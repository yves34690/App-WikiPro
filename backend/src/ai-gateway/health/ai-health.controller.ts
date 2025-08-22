import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AIHealthService } from './ai-health.service';
import { AIConfigService } from '../config/ai-config.service';
import {
  AIHealthReport,
  HealthCheckResult,
  ProviderHealthMetrics,
  HealthAlert,
  QuotaStatus,
} from './ai-health.interface';

@Controller('api/ai')
export class AIHealthController {
  private readonly logger = new Logger(AIHealthController.name);

  constructor(
    private aiHealthService: AIHealthService,
    private aiConfigService: AIConfigService,
  ) {}

  /**
   * GET /api/ai/health
   * Retourne le rapport de santé global
   */
  @Get('health')
  async getHealth(
    @Query('force') force?: string
  ): Promise<{
    status: string;
    data: AIHealthReport | null;
    timestamp: Date;
  }> {
    try {
      let report: AIHealthReport | null;

      if (force === 'true') {
        this.logger.log('🔄 Health check forcé via API');
        report = await this.aiHealthService.forceHealthCheck();
      } else {
        report = this.aiHealthService.getLastHealthReport();
      }

      return {
        status: 'success',
        data: report,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Erreur lors du health check:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Erreur lors du health check',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/ai/health/summary
   * Retourne un résumé de santé simplifié
   */
  @Get('health/summary')
  getHealthSummary(): {
    status: string;
    data: {
      status: string;
      activeProvider: string;
      availableProviders: number;
      alerts: number;
    };
  } {
    return {
      status: 'success',
      data: this.aiHealthService.getHealthSummary(),
    };
  }

  /**
   * GET /api/ai/providers
   * Retourne la liste des providers et leur statut
   */
  @Get('providers')
  getProviders(): {
    status: string;
    data: {
      providers: Array<{
        name: string;
        enabled: boolean;
        model: string;
        priority: number;
        isDefault: boolean;
      }>;
      activeProvider: string;
      configuration: {
        fallbackEnabled: boolean;
        mode: string;
      };
    };
  } {
    const config = this.aiConfigService.getConfiguration();
    const status = this.aiConfigService.getStatus();

    const providers = Object.values(config.providers).map(provider => ({
      name: provider.name,
      enabled: provider.enabled,
      model: provider.model,
      priority: provider.priority,
      isDefault: provider.name === config.gateway.defaultProvider,
    }));

    return {
      status: 'success',
      data: {
        providers,
        activeProvider: status.activeProvider,
        configuration: {
          fallbackEnabled: config.gateway.fallbackEnabled,
          mode: config.gateway.mode,
        },
      },
    };
  }

  /**
   * GET /api/ai/providers/:name/health
   * Retourne le statut de santé d'un provider spécifique
   */
  @Get('providers/:name/health')
  async getProviderHealth(
    @Param('name') name: string,
    @Query('force') force?: string
  ): Promise<{
    status: string;
    data: HealthCheckResult | null;
  }> {
    const availableProviders = this.aiConfigService.getAvailableProviders();
    
    if (!availableProviders.includes(name)) {
      throw new HttpException(
        {
          status: 'error',
          message: `Provider '${name}' non trouvé`,
          availableProviders,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      let result: HealthCheckResult | null = null;

      if (force === 'true') {
        this.logger.log(`🔄 Health check forcé pour provider: ${name}`);
        result = await this.aiHealthService.checkProviderHealth(name);
      } else {
        const report = this.aiHealthService.getLastHealthReport();
        if (report) {
          result = report.providers.find(p => p.provider === name) || null;
        }
      }

      return {
        status: 'success',
        data: result,
      };
    } catch (error) {
      this.logger.error(`Erreur health check provider ${name}:`, error);
      throw new HttpException(
        {
          status: 'error',
          message: `Erreur lors du health check de ${name}`,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/ai/providers/:name/metrics
   * Retourne les métriques d'un provider
   */
  @Get('providers/:name/metrics')
  getProviderMetrics(
    @Param('name') name: string
  ): {
    status: string;
    data: ProviderHealthMetrics | null;
  } {
    const availableProviders = this.aiConfigService.getAvailableProviders();
    
    if (!availableProviders.includes(name)) {
      throw new HttpException(
        {
          status: 'error',
          message: `Provider '${name}' non trouvé`,
          availableProviders,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const metrics = this.aiHealthService.getProviderMetrics(name);

    return {
      status: 'success',
      data: metrics,
    };
  }

  /**
   * GET /api/ai/providers/:name/quota
   * Retourne le statut de quota d'un provider
   */
  @Get('providers/:name/quota')
  async getProviderQuota(
    @Param('name') name: string
  ): Promise<{
    status: string;
    data: QuotaStatus | null;
  }> {
    const availableProviders = this.aiConfigService.getAvailableProviders();
    
    if (!availableProviders.includes(name)) {
      throw new HttpException(
        {
          status: 'error',
          message: `Provider '${name}' non trouvé`,
          availableProviders,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const quota = await this.aiHealthService.getProviderQuotaStatus(name);
      
      return {
        status: 'success',
        data: quota,
      };
    } catch (error) {
      this.logger.error(`Erreur quota provider ${name}:`, error);
      throw new HttpException(
        {
          status: 'error',
          message: `Erreur lors de la récupération du quota de ${name}`,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /api/ai/metrics
   * Retourne toutes les métriques
   */
  @Get('metrics')
  getMetrics(): {
    status: string;
    data: {
      providers: ProviderHealthMetrics[];
      global: {
        totalProviders: number;
        enabledProviders: number;
        healthyProviders: number;
        averageLatency: number;
        totalChecks: number;
        overallUptime: number;
      };
    };
  } {
    const metrics = this.aiHealthService.getAllMetrics();
    
    // Calcul des métriques globales
    const enabledCount = metrics.filter(m => m.totalChecks > 0).length;
    const healthyCount = metrics.filter(m => m.uptime > 90).length;
    const totalChecks = metrics.reduce((sum, m) => sum + m.totalChecks, 0);
    const totalSuccessful = metrics.reduce((sum, m) => sum + m.successfulChecks, 0);
    const averageLatency = metrics.reduce((sum, m) => sum + m.averageLatency, 0) / metrics.length || 0;
    const overallUptime = totalChecks > 0 ? (totalSuccessful / totalChecks) * 100 : 0;

    return {
      status: 'success',
      data: {
        providers: metrics,
        global: {
          totalProviders: metrics.length,
          enabledProviders: enabledCount,
          healthyProviders: healthyCount,
          averageLatency: Math.round(averageLatency),
          totalChecks,
          overallUptime: Math.round(overallUptime * 100) / 100,
        },
      },
    };
  }

  /**
   * GET /api/ai/alerts
   * Retourne les alertes
   */
  @Get('alerts')
  getAlerts(
    @Query('active') activeOnly?: string
  ): {
    status: string;
    data: HealthAlert[];
  } {
    const alerts = activeOnly === 'true' 
      ? this.aiHealthService.getActiveAlerts()
      : this.aiHealthService.getAllAlerts();

    return {
      status: 'success',
      data: alerts,
    };
  }

  /**
   * POST /api/ai/alerts/:id/resolve
   * Marque une alerte comme résolue
   */
  @Post('alerts/:id/resolve')
  resolveAlert(
    @Param('id') alertId: string
  ): {
    status: string;
    message: string;
  } {
    const resolved = this.aiHealthService.resolveAlert(alertId);
    
    if (!resolved) {
      throw new HttpException(
        {
          status: 'error',
          message: `Alerte '${alertId}' non trouvée`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      status: 'success',
      message: `Alerte ${alertId} marquée comme résolue`,
    };
  }

  /**
   * POST /api/ai/providers/:name/enable
   * Active/désactive un provider
   */
  @Post('providers/:name/enable')
  enableProvider(
    @Param('name') name: string,
    @Query('enabled') enabled?: string
  ): {
    status: string;
    message: string;
  } {
    const availableProviders = this.aiConfigService.getAvailableProviders();
    
    if (!availableProviders.includes(name)) {
      throw new HttpException(
        {
          status: 'error',
          message: `Provider '${name}' non trouvé`,
          availableProviders,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const shouldEnable = enabled !== 'false';
    const success = this.aiConfigService.setProviderEnabled(name, shouldEnable);
    
    if (!success) {
      throw new HttpException(
        {
          status: 'error',
          message: `Impossible de modifier le statut du provider '${name}'`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      status: 'success',
      message: `Provider ${name} ${shouldEnable ? 'activé' : 'désactivé'}`,
    };
  }

  /**
   * POST /api/ai/providers/:name/activate
   * Change le provider actif
   */
  @Post('providers/:name/activate')
  activateProvider(
    @Param('name') name: string
  ): {
    status: string;
    message: string;
  } {
    const availableProviders = this.aiConfigService.getAvailableProviders();
    
    if (!availableProviders.includes(name)) {
      throw new HttpException(
        {
          status: 'error',
          message: `Provider '${name}' non trouvé`,
          availableProviders,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const success = this.aiConfigService.setActiveProvider(name);
    
    if (!success) {
      throw new HttpException(
        {
          status: 'error',
          message: `Impossible d'activer le provider '${name}' (peut-être désactivé)`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      status: 'success',
      message: `Provider actif changé vers: ${name}`,
    };
  }
}