/**
 * TICKET-PERFORMANCE-001 - Configuration Alertes
 * Configuration des seuils et règles d'alerte
 * Objectif: Surveillance proactive des performances
 */

// Seuils d'alerte système
const ALERT_THRESHOLDS = {
  // Performance API
  api: {
    latency: {
      warning: 2000,    // 2s
      critical: 5000    // 5s
    },
    errorRate: {
      warning: 5,       // 5%
      critical: 10      // 10%
    },
    throughput: {
      warning: 10,      // 10 req/s minimum
      critical: 5       // 5 req/s minimum
    }
  },
  
  // Ressources système
  system: {
    memory: {
      warning: 80,      // 80%
      critical: 90      // 90%
    },
    cpu: {
      warning: 70,      // 70%
      critical: 85      // 85%
    },
    disk: {
      warning: 80,      // 80%
      critical: 95      // 95%
    }
  },
  
  // Streaming IA
  streaming: {
    firstResponse: {
      warning: 500,     // 500ms
      critical: 1000    // 1s
    },
    connectionLoss: {
      warning: 3,       // 3 déconnexions/min
      critical: 5       // 5 déconnexions/min
    }
  },
  
  // Base de données
  database: {
    queryTime: {
      warning: 100,     // 100ms
      critical: 200     // 200ms
    },
    connections: {
      warning: 80,      // 80% du pool
      critical: 95      // 95% du pool
    },
    rls: {
      warning: 50,      // 50ms pour isolation
      critical: 100     // 100ms pour isolation
    }
  },
  
  // Providers IA
  aiProviders: {
    quota: {
      warning: 80,      // 80% quota consommé
      critical: 95      // 95% quota consommé
    },
    availability: {
      warning: 95,      // 95% uptime minimum
      critical: 90      // 90% uptime minimum
    },
    fallback: {
      warning: 10,      // 10% de fallbacks
      critical: 25      // 25% de fallbacks
    }
  }
};

// Types d'alertes
const ALERT_TYPES = {
  PERFORMANCE: 'performance',
  RELIABILITY: 'reliability',
  RESOURCE: 'resource',
  SECURITY: 'security',
  BUSINESS: 'business'
};

// Niveaux de sévérité
const SEVERITY_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
  EMERGENCY: 'emergency'
};

class AlertsManager {
  constructor() {
    this.activeAlerts = new Map();
    this.alertHistory = [];
    this.suppressions = new Map();
    this.escalations = new Map();
  }

  // Vérification des seuils API
  checkAPIThresholds(endpoint, metrics) {
    const alerts = [];
    
    if (!metrics || metrics.length === 0) return alerts;
    
    const latencies = metrics.filter(m => m.success).map(m => m.latency);
    const errors = metrics.filter(m => !m.success);
    
    if (latencies.length > 0) {
      const p95 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];
      const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      
      // Alerte latence P95
      if (p95 > ALERT_THRESHOLDS.api.latency.critical) {
        alerts.push(this.createAlert({
          type: ALERT_TYPES.PERFORMANCE,
          severity: SEVERITY_LEVELS.CRITICAL,
          source: 'api_latency',
          endpoint,
          message: `Latence P95 critique: ${Math.round(p95)}ms`,
          value: Math.round(p95),
          threshold: ALERT_THRESHOLDS.api.latency.critical,
          impact: 'Dégradation sévère expérience utilisateur'
        }));
      } else if (p95 > ALERT_THRESHOLDS.api.latency.warning) {
        alerts.push(this.createAlert({
          type: ALERT_TYPES.PERFORMANCE,
          severity: SEVERITY_LEVELS.WARNING,
          source: 'api_latency',
          endpoint,
          message: `Latence P95 élevée: ${Math.round(p95)}ms`,
          value: Math.round(p95),
          threshold: ALERT_THRESHOLDS.api.latency.warning,
          impact: 'Ralentissement perceptible'
        }));
      }
      
      // Alerte latence moyenne
      if (avg > ALERT_THRESHOLDS.api.latency.warning) {
        alerts.push(this.createAlert({
          type: ALERT_TYPES.PERFORMANCE,
          severity: SEVERITY_LEVELS.WARNING,
          source: 'api_latency_avg',
          endpoint,
          message: `Latence moyenne élevée: ${Math.round(avg)}ms`,
          value: Math.round(avg),
          threshold: ALERT_THRESHOLDS.api.latency.warning,
          impact: 'Performance générale dégradée'
        }));
      }
    }
    
    // Alerte taux d'erreur
    if (metrics.length > 0) {
      const errorRate = (errors.length / metrics.length) * 100;
      
      if (errorRate > ALERT_THRESHOLDS.api.errorRate.critical) {
        alerts.push(this.createAlert({
          type: ALERT_TYPES.RELIABILITY,
          severity: SEVERITY_LEVELS.CRITICAL,
          source: 'api_errors',
          endpoint,
          message: `Taux d'erreur critique: ${errorRate.toFixed(2)}%`,
          value: errorRate.toFixed(2),
          threshold: ALERT_THRESHOLDS.api.errorRate.critical,
          impact: 'Service potentiellement indisponible'
        }));
      } else if (errorRate > ALERT_THRESHOLDS.api.errorRate.warning) {
        alerts.push(this.createAlert({
          type: ALERT_TYPES.RELIABILITY,
          severity: SEVERITY_LEVELS.WARNING,
          source: 'api_errors',
          endpoint,
          message: `Taux d'erreur élevé: ${errorRate.toFixed(2)}%`,
          value: errorRate.toFixed(2),
          threshold: ALERT_THRESHOLDS.api.errorRate.warning,
          impact: 'Fiabilité compromise'
        }));
      }
    }
    
    return alerts;
  }

  // Vérification seuils système
  checkSystemThresholds(systemMetrics) {
    const alerts = [];
    
    if (!systemMetrics || !systemMetrics.current) return alerts;
    
    const current = systemMetrics.current;
    
    // Alerte mémoire
    const memoryUsage = parseFloat(current.memory.usage);
    if (memoryUsage > ALERT_THRESHOLDS.system.memory.critical) {
      alerts.push(this.createAlert({
        type: ALERT_TYPES.RESOURCE,
        severity: SEVERITY_LEVELS.CRITICAL,
        source: 'system_memory',
        message: `Mémoire critique: ${memoryUsage.toFixed(2)}%`,
        value: memoryUsage.toFixed(2),
        threshold: ALERT_THRESHOLDS.system.memory.critical,
        impact: 'Risque de crash système'
      }));
    } else if (memoryUsage > ALERT_THRESHOLDS.system.memory.warning) {
      alerts.push(this.createAlert({
        type: ALERT_TYPES.RESOURCE,
        severity: SEVERITY_LEVELS.WARNING,
        source: 'system_memory',
        message: `Mémoire élevée: ${memoryUsage.toFixed(2)}%`,
        value: memoryUsage.toFixed(2),
        threshold: ALERT_THRESHOLDS.system.memory.warning,
        impact: 'Performance réduite possible'
      }));
    }
    
    // Alerte CPU (load average)
    if (current.cpu && current.cpu.loadAverage && current.cpu.loadAverage.length > 0) {
      const load1min = current.cpu.loadAverage[0];
      const cpuUsage = (load1min / current.cpu.cores) * 100;
      
      if (cpuUsage > ALERT_THRESHOLDS.system.cpu.critical) {
        alerts.push(this.createAlert({
          type: ALERT_TYPES.RESOURCE,
          severity: SEVERITY_LEVELS.CRITICAL,
          source: 'system_cpu',
          message: `CPU critique: ${cpuUsage.toFixed(2)}%`,
          value: cpuUsage.toFixed(2),
          threshold: ALERT_THRESHOLDS.system.cpu.critical,
          impact: 'Système surchargé'
        }));
      } else if (cpuUsage > ALERT_THRESHOLDS.system.cpu.warning) {
        alerts.push(this.createAlert({
          type: ALERT_TYPES.RESOURCE,
          severity: SEVERITY_LEVELS.WARNING,
          source: 'system_cpu',
          message: `CPU élevé: ${cpuUsage.toFixed(2)}%`,
          value: cpuUsage.toFixed(2),
          threshold: ALERT_THRESHOLDS.system.cpu.warning,
          impact: 'Ralentissement possible'
        }));
      }
    }
    
    return alerts;
  }

  // Vérification providers IA
  checkAIProvidersThresholds(aiMetrics, providerStats) {
    const alerts = [];
    
    // Vérifier disponibilité providers
    if (providerStats && providerStats.providers) {
      const availableProviders = Object.values(providerStats.providers)
        .filter(p => p.available).length;
      const totalProviders = Object.keys(providerStats.providers).length;
      
      const availabilityRate = (availableProviders / totalProviders) * 100;
      
      if (availabilityRate < ALERT_THRESHOLDS.aiProviders.availability.critical) {
        alerts.push(this.createAlert({
          type: ALERT_TYPES.RELIABILITY,
          severity: SEVERITY_LEVELS.CRITICAL,
          source: 'ai_availability',
          message: `Disponibilité IA critique: ${availabilityRate.toFixed(2)}%`,
          value: availabilityRate.toFixed(2),
          threshold: ALERT_THRESHOLDS.aiProviders.availability.critical,
          impact: 'Service IA compromis'
        }));
      } else if (availabilityRate < ALERT_THRESHOLDS.aiProviders.availability.warning) {
        alerts.push(this.createAlert({
          type: ALERT_TYPES.RELIABILITY,
          severity: SEVERITY_LEVELS.WARNING,
          source: 'ai_availability',
          message: `Disponibilité IA réduite: ${availabilityRate.toFixed(2)}%`,
          value: availabilityRate.toFixed(2),
          threshold: ALERT_THRESHOLDS.aiProviders.availability.warning,
          impact: 'Redondance réduite'
        }));
      }
    }
    
    return alerts;
  }

  // Création d'une alerte
  createAlert(alertData) {
    const alert = {
      id: this.generateAlertId(),
      timestamp: Date.now(),
      ...alertData
    };
    
    // Vérifier suppression
    const suppressionKey = `${alert.source}_${alert.endpoint || 'global'}`;
    if (this.suppressions.has(suppressionKey)) {
      const suppression = this.suppressions.get(suppressionKey);
      if (Date.now() < suppression.until) {
        return null; // Alerte supprimée
      } else {
        this.suppressions.delete(suppressionKey); // Suppression expirée
      }
    }
    
    // Ajouter aux alertes actives
    this.activeAlerts.set(alert.id, alert);
    
    // Ajouter à l'historique
    this.alertHistory.push(alert);
    
    // Limiter l'historique
    if (this.alertHistory.length > 1000) {
      this.alertHistory.shift();
    }
    
    return alert;
  }

  // Génération ID unique pour alerte
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Résolution d'alerte
  resolveAlert(alertId, resolution = 'Auto-resolved') {
    if (this.activeAlerts.has(alertId)) {
      const alert = this.activeAlerts.get(alertId);
      alert.resolvedAt = Date.now();
      alert.resolution = resolution;
      this.activeAlerts.delete(alertId);
      return true;
    }
    return false;
  }

  // Suppression temporaire alertes
  suppressAlerts(source, endpoint = null, durationMs = 300000) { // 5 min par défaut
    const key = `${source}_${endpoint || 'global'}`;
    this.suppressions.set(key, {
      until: Date.now() + durationMs,
      reason: 'Manual suppression'
    });
  }

  // Analyse tendances alertes
  analyzeAlertTrends(timeWindowMs = 3600000) { // 1 heure par défaut
    const cutoff = Date.now() - timeWindowMs;
    const recentAlerts = this.alertHistory.filter(a => a.timestamp > cutoff);
    
    const analysis = {
      total: recentAlerts.length,
      bySeverity: {},
      byType: {},
      bySource: {},
      topEndpoints: {},
      escalationNeeded: []
    };
    
    // Groupements
    recentAlerts.forEach(alert => {
      // Par sévérité
      analysis.bySeverity[alert.severity] = (analysis.bySeverity[alert.severity] || 0) + 1;
      
      // Par type
      analysis.byType[alert.type] = (analysis.byType[alert.type] || 0) + 1;
      
      // Par source
      analysis.bySource[alert.source] = (analysis.bySource[alert.source] || 0) + 1;
      
      // Par endpoint
      if (alert.endpoint) {
        analysis.topEndpoints[alert.endpoint] = (analysis.topEndpoints[alert.endpoint] || 0) + 1;
      }
      
      // Escalation nécessaire ?
      if (alert.severity === SEVERITY_LEVELS.CRITICAL && !alert.resolvedAt) {
        analysis.escalationNeeded.push(alert);
      }
    });
    
    return analysis;
  }

  // Rapport d'alertes
  generateAlertsReport() {
    const trends = this.analyzeAlertTrends();
    
    return {
      summary: {
        activeAlerts: this.activeAlerts.size,
        recentAlerts: trends.total,
        suppressedSources: this.suppressions.size,
        escalationNeeded: trends.escalationNeeded.length
      },
      active: Array.from(this.activeAlerts.values()),
      trends,
      configuration: {
        thresholds: ALERT_THRESHOLDS,
        alertTypes: ALERT_TYPES,
        severityLevels: SEVERITY_LEVELS
      }
    };
  }

  // Affichage rapport alertes
  printAlertsReport() {
    const report = this.generateAlertsReport();
    
    console.log('\n' + '='.repeat(80));
    console.log('🚨 RAPPORT SYSTÈME D\'ALERTES');
    console.log('='.repeat(80));
    
    console.log('\n📊 RÉSUMÉ:');
    console.log(`  • Alertes actives: ${report.summary.activeAlerts}`);
    console.log(`  • Alertes récentes (1h): ${report.summary.recentAlerts}`);
    console.log(`  • Sources supprimées: ${report.summary.suppressedSources}`);
    console.log(`  • Escalations nécessaires: ${report.summary.escalationNeeded}`);
    
    if (report.active.length > 0) {
      console.log('\n🔴 ALERTES ACTIVES:');
      report.active.forEach(alert => {
        const age = Math.round((Date.now() - alert.timestamp) / 1000);
        const emoji = alert.severity === SEVERITY_LEVELS.CRITICAL ? '🔴' : '🟡';
        console.log(`  ${emoji} [${alert.severity.toUpperCase()}] ${alert.message}`);
        console.log(`    Source: ${alert.source} | Endpoint: ${alert.endpoint || 'N/A'} | Age: ${age}s`);
        console.log(`    Impact: ${alert.impact}`);
      });
    }
    
    if (report.trends.total > 0) {
      console.log('\n📈 TENDANCES (1h):');
      console.log(`  • Par sévérité:`);
      Object.keys(report.trends.bySeverity).forEach(severity => {
        console.log(`    ${severity}: ${report.trends.bySeverity[severity]}`);
      });
      
      console.log(`  • Par type:`);
      Object.keys(report.trends.byType).forEach(type => {
        console.log(`    ${type}: ${report.trends.byType[type]}`);
      });
      
      if (Object.keys(report.trends.topEndpoints).length > 0) {
        console.log(`  • Endpoints les plus problématiques:`);
        const sortedEndpoints = Object.entries(report.trends.topEndpoints)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5);
        sortedEndpoints.forEach(([endpoint, count]) => {
          console.log(`    ${endpoint}: ${count} alertes`);
        });
      }
    }
    
    console.log('\n⚙️ CONFIGURATION:');
    console.log(`  • Seuils API latence: Warning=${ALERT_THRESHOLDS.api.latency.warning}ms, Critical=${ALERT_THRESHOLDS.api.latency.critical}ms`);
    console.log(`  • Seuils mémoire: Warning=${ALERT_THRESHOLDS.system.memory.warning}%, Critical=${ALERT_THRESHOLDS.system.memory.critical}%`);
    console.log(`  • Seuils CPU: Warning=${ALERT_THRESHOLDS.system.cpu.warning}%, Critical=${ALERT_THRESHOLDS.system.cpu.critical}%`);
    
    console.log('\n='.repeat(80));
  }
}

module.exports = {
  AlertsManager,
  ALERT_THRESHOLDS,
  ALERT_TYPES,
  SEVERITY_LEVELS
};