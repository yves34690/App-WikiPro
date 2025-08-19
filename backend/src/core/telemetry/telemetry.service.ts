import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@core/config/config.service';

export interface TelemetryEvent {
  event: string;
  tenantId: string;
  userId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface Metric {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp: Date;
}

@Injectable()
export class TelemetryService {
  private readonly logger = new Logger(TelemetryService.name);
  private readonly events: TelemetryEvent[] = [];
  private readonly metrics: Map<string, Metric[]> = new Map();

  constructor(private configService: ConfigService) {
    if (this.configService.telemetry.enabled) {
      this.logger.log('Service de télémétrie activé');
    } else {
      this.logger.log('Service de télémétrie désactivé');
    }
  }

  trackEvent(event: Omit<TelemetryEvent, 'timestamp'>): void {
    const telemetryEvent: TelemetryEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.events.push(telemetryEvent);

    if (this.configService.telemetry.enabled) {
      this.logger.debug(`Événement tracé: ${event.event} pour le tenant ${event.tenantId}`);
      // TODO: Envoyer à un service externe (OpenTelemetry, etc.)
    }

    // Garder seulement les 1000 derniers événements en mémoire
    if (this.events.length > 1000) {
      this.events.shift();
    }
  }

  recordMetric(metric: Omit<Metric, 'timestamp'>): void {
    const metricWithTimestamp: Metric = {
      ...metric,
      timestamp: new Date(),
    };

    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }

    const metricArray = this.metrics.get(metric.name)!;
    metricArray.push(metricWithTimestamp);

    if (this.configService.telemetry.enabled) {
      this.logger.debug(`Métrique enregistrée: ${metric.name} = ${metric.value}`);
    }

    // Garder seulement les 100 dernières valeurs par métrique
    if (metricArray.length > 100) {
      metricArray.shift();
    }
  }

  // Méthodes de commodité pour les événements courants
  trackUserLogin(tenantId: string, userId: string): void {
    this.trackEvent({
      event: 'user.login',
      tenantId,
      userId,
    });
  }

  trackApiCall(tenantId: string, endpoint: string, method: string, responseTime: number, statusCode: number): void {
    this.trackEvent({
      event: 'api.call',
      tenantId,
      metadata: {
        endpoint,
        method,
        responseTime,
        statusCode,
      },
    });

    this.recordMetric({
      name: 'api.response_time',
      value: responseTime,
      tags: {
        endpoint,
        method,
        status: statusCode.toString(),
        tenant: tenantId,
      },
    });
  }

  trackAiProviderCall(tenantId: string, provider: string, model: string, tokensUsed: number, responseTime: number): void {
    this.trackEvent({
      event: 'ai.provider.call',
      tenantId,
      metadata: {
        provider,
        model,
        tokensUsed,
        responseTime,
      },
    });

    this.recordMetric({
      name: 'ai.tokens_used',
      value: tokensUsed,
      tags: {
        provider,
        model,
        tenant: tenantId,
      },
    });

    this.recordMetric({
      name: 'ai.response_time',
      value: responseTime,
      tags: {
        provider,
        model,
        tenant: tenantId,
      },
    });
  }

  // Méthodes pour récupérer les données (pour debugging/monitoring)
  getRecentEvents(limit: number = 50): TelemetryEvent[] {
    return this.events.slice(-limit);
  }

  getMetrics(metricName: string, limit: number = 50): Metric[] {
    const metrics = this.metrics.get(metricName);
    if (!metrics) return [];
    return metrics.slice(-limit);
  }

  getAllMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  getSystemMetrics(): { totalEvents: number; totalMetrics: number; uptime: number } {
    return {
      totalEvents: this.events.length,
      totalMetrics: Array.from(this.metrics.values()).reduce((sum, arr) => sum + arr.length, 0),
      uptime: process.uptime(),
    };
  }
}