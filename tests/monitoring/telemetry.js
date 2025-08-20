/**
 * TICKET-PERFORMANCE-001 - Monitoring Télémétrique
 * Système de télémétrie et collecte métriques
 * Objectif: Monitoring temps réel des performances
 */

const axios = require('axios');
const { performance } = require('perf_hooks');
const os = require('os');

const BASE_URL = 'http://localhost:3001';

class TelemetryMonitor {
  constructor() {
    this.metrics = {
      api: new Map(),
      system: new Map(),
      ai: new Map(),
      database: new Map(),
      errors: []
    };
    this.startTime = performance.now();
    this.isMonitoring = false;
    this.intervalId = null;
  }

  // Collecte métriques système
  collectSystemMetrics() {
    const now = Date.now();
    const uptime = performance.now() - this.startTime;
    
    const systemData = {
      timestamp: now,
      uptime: Math.round(uptime),
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown',
        loadAverage: os.loadavg()
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptime: os.uptime()
      }
    };

    this.metrics.system.set(now, systemData);
    
    // Garder seulement les 100 dernières mesures
    if (this.metrics.system.size > 100) {
      const oldestKey = Math.min(...this.metrics.system.keys());
      this.metrics.system.delete(oldestKey);
    }

    return systemData;
  }

  // Test de latence API
  async measureAPILatency(endpoint, method = 'GET', data = null, headers = {}) {
    const startTime = performance.now();
    const timestamp = Date.now();
    
    try {
      let response;
      
      if (method === 'GET') {
        response = await axios.get(`${BASE_URL}${endpoint}`, { headers });
      } else if (method === 'POST') {
        response = await axios.post(`${BASE_URL}${endpoint}`, data, { headers });
      }
      
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      const metricData = {
        timestamp,
        endpoint,
        method,
        latency: Math.round(latency),
        statusCode: response.status,
        success: true,
        responseSize: JSON.stringify(response.data).length
      };
      
      // Stocker la métrique
      if (!this.metrics.api.has(endpoint)) {
        this.metrics.api.set(endpoint, []);
      }
      
      const endpointMetrics = this.metrics.api.get(endpoint);
      endpointMetrics.push(metricData);
      
      // Limiter à 50 mesures par endpoint
      if (endpointMetrics.length > 50) {
        endpointMetrics.shift();
      }
      
      return metricData;
      
    } catch (error) {
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      const errorData = {
        timestamp,
        endpoint,
        method,
        latency: Math.round(latency),
        statusCode: error.response?.status || 0,
        success: false,
        error: error.message
      };
      
      this.metrics.errors.push(errorData);
      
      // Limiter les erreurs stockées
      if (this.metrics.errors.length > 100) {
        this.metrics.errors.shift();
      }
      
      return errorData;
    }
  }

  // Métriques télémétrie backend
  async collectBackendTelemetry() {
    try {
      const telemetryData = await this.measureAPILatency('/telemetry/metrics');
      
      if (telemetryData.success) {
        const response = await axios.get(`${BASE_URL}/telemetry/metrics`);
        const backendMetrics = response.data || [];
        
        const timestamp = Date.now();
        this.metrics.database.set(timestamp, {
          timestamp,
          metricsCount: backendMetrics.length,
          telemetryLatency: telemetryData.latency,
          backendData: backendMetrics.slice(0, 10) // Limiter les données stockées
        });
      }
      
      return telemetryData;
    } catch (error) {
      console.error('Erreur collecte télémétrie backend:', error.message);
      return null;
    }
  }

  // Métriques santé IA
  async collectAIMetrics(authToken) {
    try {
      const aiHealthData = await this.measureAPILatency(
        `/api/v1/demo-company/ai/health`,
        'GET',
        null,
        { Authorization: `Bearer ${authToken}` }
      );
      
      if (aiHealthData.success) {
        const response = await axios.get(`${BASE_URL}/api/v1/demo-company/ai/health`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        
        const timestamp = Date.now();
        this.metrics.ai.set(timestamp, {
          timestamp,
          healthLatency: aiHealthData.latency,
          providersStatus: response.data?.providers || {},
          healthData: response.data
        });
      }
      
      return aiHealthData;
    } catch (error) {
      console.error('Erreur collecte métriques IA:', error.message);
      return null;
    }
  }

  // Démarrage monitoring continu
  startMonitoring(authToken = null, interval = 5000) {
    if (this.isMonitoring) {
      console.log('⚠️ Monitoring déjà en cours');
      return;
    }

    console.log(`🔄 Démarrage monitoring (intervalle: ${interval}ms)`);
    this.isMonitoring = true;
    
    this.intervalId = setInterval(async () => {
      try {
        // Métriques système
        this.collectSystemMetrics();
        
        // Métriques API de base
        await this.measureAPILatency('/ping');
        await this.measureAPILatency('/api/auth/health');
        await this.collectBackendTelemetry();
        
        // Métriques IA si token disponible
        if (authToken) {
          await this.collectAIMetrics(authToken);
        }
        
        // Log périodique
        const totalMetrics = this.getTotalMetricsCount();
        if (totalMetrics % 10 === 0) {
          console.log(`📊 Monitoring actif - ${totalMetrics} métriques collectées`);
        }
        
      } catch (error) {
        console.error('Erreur lors du monitoring:', error.message);
      }
    }, interval);
  }

  // Arrêt monitoring
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
    console.log('⏹️ Monitoring arrêté');
  }

  // Statistiques des métriques
  getTotalMetricsCount() {
    let total = 0;
    
    // API metrics
    for (const metrics of this.metrics.api.values()) {
      total += metrics.length;
    }
    
    // System metrics
    total += this.metrics.system.size;
    
    // AI metrics
    total += this.metrics.ai.size;
    
    // Database metrics
    total += this.metrics.database.size;
    
    // Errors
    total += this.metrics.errors.length;
    
    return total;
  }

  // Analyse des performances API
  analyzeAPIPerformance() {
    const analysis = {};
    
    for (const [endpoint, metrics] of this.metrics.api.entries()) {
      if (metrics.length === 0) continue;
      
      const latencies = metrics.filter(m => m.success).map(m => m.latency);
      const errors = metrics.filter(m => !m.success);
      
      if (latencies.length > 0) {
        latencies.sort((a, b) => a - b);
        
        analysis[endpoint] = {
          total: metrics.length,
          success: latencies.length,
          errors: errors.length,
          successRate: ((latencies.length / metrics.length) * 100).toFixed(2) + '%',
          latency: {
            min: Math.min(...latencies),
            max: Math.max(...latencies),
            avg: Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length),
            p50: latencies[Math.floor(latencies.length * 0.5)],
            p95: latencies[Math.floor(latencies.length * 0.95)],
            p99: latencies[Math.floor(latencies.length * 0.99)]
          },
          recentErrors: errors.slice(-3).map(e => ({
            timestamp: new Date(e.timestamp).toISOString(),
            error: e.error,
            statusCode: e.statusCode
          }))
        };
      }
    }
    
    return analysis;
  }

  // Analyse métriques système
  analyzeSystemMetrics() {
    const systemMetrics = Array.from(this.metrics.system.values());
    
    if (systemMetrics.length === 0) {
      return { message: 'Aucune métrique système disponible' };
    }
    
    const latest = systemMetrics[systemMetrics.length - 1];
    const memoryUsages = systemMetrics.map(m => parseFloat(m.memory.usage));
    
    return {
      current: {
        timestamp: new Date(latest.timestamp).toISOString(),
        uptime: `${Math.round(latest.uptime / 1000)}s`,
        memory: {
          total: `${Math.round(latest.memory.total / 1024 / 1024)}MB`,
          used: `${Math.round(latest.memory.used / 1024 / 1024)}MB`,
          usage: `${latest.memory.usage}%`
        },
        cpu: {
          cores: latest.cpu.cores,
          loadAverage: latest.cpu.loadAverage.map(load => load.toFixed(2))
        }
      },
      trends: {
        memoryUsage: {
          min: Math.min(...memoryUsages).toFixed(2) + '%',
          max: Math.max(...memoryUsages).toFixed(2) + '%',
          avg: (memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length).toFixed(2) + '%'
        },
        samplesCount: systemMetrics.length
      }
    };
  }

  // Génération rapport complet
  generateMonitoringReport() {
    const report = {
      summary: {
        monitoringDuration: Math.round((performance.now() - this.startTime) / 1000),
        totalMetrics: this.getTotalMetricsCount(),
        isActive: this.isMonitoring,
        collectionsCount: {
          api: this.metrics.api.size,
          system: this.metrics.system.size,
          ai: this.metrics.ai.size,
          database: this.metrics.database.size,
          errors: this.metrics.errors.length
        }
      },
      api: this.analyzeAPIPerformance(),
      system: this.analyzeSystemMetrics(),
      alerts: this.generateAlerts(),
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }

  // Génération alertes
  generateAlerts() {
    const alerts = [];
    const apiAnalysis = this.analyzeAPIPerformance();
    const systemAnalysis = this.analyzeSystemMetrics();
    
    // Alertes API
    for (const [endpoint, stats] of Object.entries(apiAnalysis)) {
      if (stats.latency.p95 > 2000) {
        alerts.push({
          type: 'performance',
          severity: 'warning',
          message: `P95 latence élevée pour ${endpoint}: ${stats.latency.p95}ms`,
          endpoint,
          value: stats.latency.p95,
          threshold: 2000
        });
      }
      
      if (parseFloat(stats.successRate) < 95) {
        alerts.push({
          type: 'reliability',
          severity: 'critical',
          message: `Taux d'erreur élevé pour ${endpoint}: ${(100 - parseFloat(stats.successRate)).toFixed(2)}%`,
          endpoint,
          value: stats.successRate,
          threshold: '95%'
        });
      }
    }
    
    // Alertes système
    if (systemAnalysis.current && parseFloat(systemAnalysis.current.memory.usage) > 85) {
      alerts.push({
        type: 'resource',
        severity: 'warning',
        message: `Utilisation mémoire élevée: ${systemAnalysis.current.memory.usage}`,
        value: systemAnalysis.current.memory.usage,
        threshold: '85%'
      });
    }
    
    return alerts;
  }

  // Génération recommandations
  generateRecommendations() {
    const recommendations = [];
    const apiAnalysis = this.analyzeAPIPerformance();
    
    // Recommandations performance
    for (const [endpoint, stats] of Object.entries(apiAnalysis)) {
      if (stats.latency.avg > 1000) {
        recommendations.push({
          type: 'performance',
          endpoint,
          issue: `Latence moyenne élevée: ${stats.latency.avg}ms`,
          suggestion: 'Optimiser la requête ou ajouter un cache'
        });
      }
      
      if (stats.errors > 0) {
        recommendations.push({
          type: 'reliability',
          endpoint,
          issue: `${stats.errors} erreurs détectées`,
          suggestion: 'Analyser les logs et améliorer la gestion d\'erreurs'
        });
      }
    }
    
    return recommendations;
  }

  // Affichage rapport
  printMonitoringReport() {
    const report = this.generateMonitoringReport();
    
    console.log('\n' + '='.repeat(80));
    console.log('📡 RAPPORT MONITORING TÉLÉMÉTRIQUE');
    console.log('='.repeat(80));
    
    console.log('\n📈 RÉSUMÉ:');
    console.log(`  • Durée monitoring: ${report.summary.monitoringDuration}s`);
    console.log(`  • Métriques collectées: ${report.summary.totalMetrics}`);
    console.log(`  • Statut: ${report.summary.isActive ? '🟢 ACTIF' : '🔴 ARRÊTÉ'}`);
    console.log(`  • Collections: API:${report.summary.collectionsCount.api} System:${report.summary.collectionsCount.system} AI:${report.summary.collectionsCount.ai} DB:${report.summary.collectionsCount.database} Errors:${report.summary.collectionsCount.errors}`);
    
    console.log('\n⚡ PERFORMANCE API:');
    if (Object.keys(report.api).length === 0) {
      console.log('  Aucune métrique API disponible');
    } else {
      Object.keys(report.api).forEach(endpoint => {
        const stats = report.api[endpoint];
        console.log(`\n  ${endpoint}:`);
        console.log(`    Requêtes: ${stats.success}/${stats.total} (${stats.successRate})`);
        console.log(`    Latence: avg=${stats.latency.avg}ms p95=${stats.latency.p95}ms max=${stats.latency.max}ms`);
        if (stats.recentErrors.length > 0) {
          console.log(`    Erreurs récentes: ${stats.recentErrors.length}`);
        }
      });
    }
    
    console.log('\n💾 MÉTRIQUES SYSTÈME:');
    if (report.system.message) {
      console.log(`  ${report.system.message}`);
    } else {
      console.log(`  Mémoire: ${report.system.current.memory.used}/${report.system.current.memory.total} (${report.system.current.memory.usage})`);
      console.log(`  CPU: ${report.system.current.cpu.cores} cores, load: [${report.system.current.cpu.loadAverage.join(', ')}]`);
      console.log(`  Tendances mémoire: min=${report.system.trends.memoryUsage.min} max=${report.system.trends.memoryUsage.max} avg=${report.system.trends.memoryUsage.avg}`);
    }
    
    if (report.alerts.length > 0) {
      console.log('\n🚨 ALERTES:');
      report.alerts.forEach(alert => {
        const emoji = alert.severity === 'critical' ? '🔴' : '🟡';
        console.log(`  ${emoji} ${alert.type.toUpperCase()}: ${alert.message}`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMANDATIONS:');
      report.recommendations.forEach(rec => {
        console.log(`  • ${rec.endpoint}: ${rec.issue}`);
        console.log(`    → ${rec.suggestion}`);
      });
    }
    
    console.log('\n='.repeat(80));
  }
}

module.exports = {
  TelemetryMonitor
};