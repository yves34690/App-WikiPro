/**
 * TICKET-PERFORMANCE-001 - Configuration Dashboards
 * Configuration dashboards monitoring et visualisation
 * Objectif: Tableaux de bord pour supervision système
 */

class DashboardsConfig {
  constructor() {
    this.dashboards = new Map();
    this.initializeDashboards();
  }

  initializeDashboards() {
    // Dashboard Overview Système
    this.dashboards.set('system_overview', {
      id: 'system_overview',
      title: 'Vue d\'ensemble Système WikiPro',
      description: 'Santé générale et métriques principales',
      refreshInterval: 30000, // 30 secondes
      widgets: [
        {
          id: 'health_status',
          type: 'status',
          title: 'Statut Santé',
          size: 'medium',
          position: { row: 1, col: 1 },
          config: {
            endpoints: [
              { name: 'Backend', url: '/ping' },
              { name: 'Auth', url: '/api/auth/health' },
              { name: 'IA', url: '/api/v1/demo-company/ai/health' },
              { name: 'Télémétrie', url: '/telemetry/health' }
            ]
          }
        },
        {
          id: 'system_resources',
          type: 'gauge',
          title: 'Ressources Système',
          size: 'large',
          position: { row: 1, col: 2 },
          config: {
            metrics: [
              { label: 'CPU', key: 'cpu.usage', unit: '%', max: 100, thresholds: [70, 85] },
              { label: 'Mémoire', key: 'memory.usage', unit: '%', max: 100, thresholds: [80, 90] },
              { label: 'Disque', key: 'disk.usage', unit: '%', max: 100, thresholds: [80, 95] }
            ]
          }
        },
        {
          id: 'active_alerts',
          type: 'list',
          title: 'Alertes Actives',
          size: 'medium',
          position: { row: 2, col: 1 },
          config: {
            maxItems: 5,
            showSeverity: true,
            autoRefresh: true
          }
        },
        {
          id: 'kpi_summary',
          type: 'metrics',
          title: 'KPIs Principaux',
          size: 'large',
          position: { row: 2, col: 2 },
          config: {
            metrics: [
              { label: 'Uptime', key: 'system.uptime', format: 'duration' },
              { label: 'Req/min', key: 'api.throughput', format: 'number' },
              { label: 'P95 Latence', key: 'api.latency.p95', format: 'ms' },
              { label: 'Taux Erreur', key: 'api.errorRate', format: 'percent' }
            ]
          }
        }
      ]
    });

    // Dashboard Performance API
    this.dashboards.set('api_performance', {
      id: 'api_performance',
      title: 'Performance API WikiPro',
      description: 'Métriques détaillées des APIs',
      refreshInterval: 15000, // 15 secondes
      widgets: [
        {
          id: 'api_latency_chart',
          type: 'timeseries',
          title: 'Latence API Temps Réel',
          size: 'xlarge',
          position: { row: 1, col: 1 },
          config: {
            timeWindow: '1h',
            metrics: [
              { key: 'api.latency.avg', label: 'Moyenne', color: '#2196F3' },
              { key: 'api.latency.p95', label: 'P95', color: '#FF9800' },
              { key: 'api.latency.max', label: 'Maximum', color: '#F44336' }
            ],
            yAxis: { unit: 'ms', min: 0 }
          }
        },
        {
          id: 'throughput_chart',
          type: 'timeseries',
          title: 'Débit Requêtes',
          size: 'large',
          position: { row: 2, col: 1 },
          config: {
            timeWindow: '1h',
            metrics: [
              { key: 'api.requests.total', label: 'Total', color: '#4CAF50' },
              { key: 'api.requests.success', label: 'Succès', color: '#8BC34A' },
              { key: 'api.requests.errors', label: 'Erreurs', color: '#F44336' }
            ],
            yAxis: { unit: 'req/min', min: 0 }
          }
        },
        {
          id: 'endpoints_table',
          type: 'table',
          title: 'Performance par Endpoint',
          size: 'large',
          position: { row: 2, col: 2 },
          config: {
            columns: [
              { key: 'endpoint', label: 'Endpoint', width: '40%' },
              { key: 'requests', label: 'Req/min', width: '15%' },
              { key: 'avg_latency', label: 'Latence Moy', width: '15%' },
              { key: 'p95_latency', label: 'P95', width: '15%' },
              { key: 'error_rate', label: 'Erreurs', width: '15%' }
            ],
            sortBy: 'p95_latency',
            sortOrder: 'desc',
            maxRows: 10
          }
        },
        {
          id: 'status_codes',
          type: 'pie',
          title: 'Répartition Codes Statut',
          size: 'medium',
          position: { row: 3, col: 1 },
          config: {
            timeWindow: '1h',
            categories: [
              { range: '2xx', label: 'Succès', color: '#4CAF50' },
              { range: '4xx', label: 'Erreurs Client', color: '#FF9800' },
              { range: '5xx', label: 'Erreurs Serveur', color: '#F44336' }
            ]
          }
        }
      ]
    });

    // Dashboard IA & Providers
    this.dashboards.set('ai_providers', {
      id: 'ai_providers',
      title: 'Providers IA & Fallback',
      description: 'Surveillance des providers IA et mécanismes de fallback',
      refreshInterval: 20000, // 20 secondes
      widgets: [
        {
          id: 'providers_status',
          type: 'status_grid',
          title: 'Statut Providers',
          size: 'large',
          position: { row: 1, col: 1 },
          config: {
            providers: ['openai', 'anthropic', 'gemini'],
            showLatency: true,
            showQuota: true,
            showErrors: true
          }
        },
        {
          id: 'ai_response_times',
          type: 'histogram',
          title: 'Distribution Temps Réponse IA',
          size: 'large',
          position: { row: 1, col: 2 },
          config: {
            timeWindow: '2h',
            buckets: [0, 500, 1000, 2000, 5000, 10000],
            metric: 'ai.response.latency'
          }
        },
        {
          id: 'fallback_stats',
          type: 'metrics',
          title: 'Statistiques Fallback',
          size: 'medium',
          position: { row: 2, col: 1 },
          config: {
            metrics: [
              { label: 'Fallbacks/h', key: 'ai.fallback.rate', format: 'number' },
              { label: 'Taux Fallback', key: 'ai.fallback.percentage', format: 'percent' },
              { label: 'Temps Moyen', key: 'ai.fallback.avgTime', format: 'ms' },
              { label: 'Provider Principal', key: 'ai.primary.provider', format: 'string' }
            ]
          }
        },
        {
          id: 'quota_usage',
          type: 'progress_bars',
          title: 'Utilisation Quotas',
          size: 'medium',
          position: { row: 2, col: 2 },
          config: {
            providers: ['openai', 'anthropic', 'gemini'],
            showPercentage: true,
            showRemaining: true,
            warningThreshold: 80,
            criticalThreshold: 95
          }
        },
        {
          id: 'streaming_metrics',
          type: 'timeseries',
          title: 'Métriques Streaming',
          size: 'xlarge',
          position: { row: 3, col: 1 },
          config: {
            timeWindow: '30m',
            metrics: [
              { key: 'streaming.connections.active', label: 'Connexions Actives', color: '#2196F3' },
              { key: 'streaming.firstResponse.avg', label: 'Premier Token (ms)', color: '#FF9800' },
              { key: 'streaming.throughput', label: 'Tokens/sec', color: '#4CAF50' }
            ]
          }
        }
      ]
    });

    // Dashboard User Activity
    this.dashboards.set('user_activity', {
      id: 'user_activity',
      title: 'Activité Utilisateurs',
      description: 'Métriques d\'utilisation et engagement',
      refreshInterval: 60000, // 1 minute
      widgets: [
        {
          id: 'active_sessions',
          type: 'counter',
          title: 'Sessions Actives',
          size: 'medium',
          position: { row: 1, col: 1 },
          config: {
            metric: 'sessions.active.count',
            threshold: { warning: 100, critical: 200 },
            showTrend: true
          }
        },
        {
          id: 'new_conversations',
          type: 'timeseries',
          title: 'Nouvelles Conversations',
          size: 'large',
          position: { row: 1, col: 2 },
          config: {
            timeWindow: '24h',
            metric: 'conversations.created',
            aggregation: 'count_per_hour',
            showAverage: true
          }
        },
        {
          id: 'user_distribution',
          type: 'pie',
          title: 'Répartition par Tenant',
          size: 'medium',
          position: { row: 2, col: 1 },
          config: {
            metric: 'users.by_tenant',
            showPercentage: true,
            maxCategories: 8
          }
        },
        {
          id: 'usage_heatmap',
          type: 'heatmap',
          title: 'Carte de Chaleur Usage',
          size: 'large',
          position: { row: 2, col: 2 },
          config: {
            timeWindow: '7d',
            xAxis: 'hour_of_day',
            yAxis: 'day_of_week',
            metric: 'api.requests.count',
            colorScheme: 'blue_green'
          }
        },
        {
          id: 'top_features',
          type: 'bar_chart',
          title: 'Fonctionnalités les Plus Utilisées',
          size: 'large',
          position: { row: 3, col: 1 },
          config: {
            timeWindow: '24h',
            metric: 'features.usage',
            maxBars: 10,
            horizontal: true
          }
        }
      ]
    });

    // Dashboard Infrastructure
    this.dashboards.set('infrastructure', {
      id: 'infrastructure',
      title: 'Infrastructure & Base de Données',
      description: 'Monitoring infrastructure et performance DB',
      refreshInterval: 30000, // 30 secondes
      widgets: [
        {
          id: 'database_connections',
          type: 'gauge',
          title: 'Connexions Database',
          size: 'medium',
          position: { row: 1, col: 1 },
          config: {
            metric: 'database.connections.active',
            max: 100,
            thresholds: [80, 95],
            showCurrent: true,
            showMax: true
          }
        },
        {
          id: 'db_query_performance',
          type: 'timeseries',
          title: 'Performance Requêtes DB',
          size: 'large',
          position: { row: 1, col: 2 },
          config: {
            timeWindow: '2h',
            metrics: [
              { key: 'database.query.avg', label: 'Moyenne', color: '#2196F3' },
              { key: 'database.query.p95', label: 'P95', color: '#FF9800' },
              { key: 'database.query.slow', label: 'Lentes (>100ms)', color: '#F44336' }
            ],
            yAxis: { unit: 'ms', min: 0 }
          }
        },
        {
          id: 'rls_performance',
          type: 'metrics',
          title: 'Performance RLS',
          size: 'medium',
          position: { row: 2, col: 1 },
          config: {
            metrics: [
              { label: 'Isolation Avg', key: 'rls.isolation.avg', format: 'ms' },
              { label: 'Isolation P95', key: 'rls.isolation.p95', format: 'ms' },
              { label: 'Violations', key: 'rls.violations.count', format: 'number' },
              { label: 'Efficacité', key: 'rls.efficiency', format: 'percent' }
            ]
          }
        },
        {
          id: 'storage_usage',
          type: 'stacked_bar',
          title: 'Utilisation Stockage',
          size: 'medium',
          position: { row: 2, col: 2 },
          config: {
            categories: ['sessions', 'conversations', 'metadata', 'logs'],
            showPercentage: true,
            showTotal: true
          }
        },
        {
          id: 'websocket_stats',
          type: 'realtime_chart',
          title: 'WebSocket Connexions',
          size: 'large',
          position: { row: 3, col: 1 },
          config: {
            timeWindow: '15m',
            metrics: [
              { key: 'websocket.connections.total', label: 'Total', color: '#2196F3' },
              { key: 'websocket.connections.active', label: 'Actives', color: '#4CAF50' },
              { key: 'websocket.reconnections', label: 'Reconnexions', color: '#FF9800' }
            ],
            updateInterval: 5000
          }
        }
      ]
    });
  }

  // Génération configuration widget
  generateWidgetConfig(widgetId, customConfig = {}) {
    const widget = this.findWidget(widgetId);
    if (!widget) return null;

    return {
      ...widget,
      config: {
        ...widget.config,
        ...customConfig
      }
    };
  }

  // Recherche widget
  findWidget(widgetId) {
    for (const dashboard of this.dashboards.values()) {
      const widget = dashboard.widgets.find(w => w.id === widgetId);
      if (widget) return widget;
    }
    return null;
  }

  // Configuration dashboard complet
  getDashboardConfig(dashboardId) {
    return this.dashboards.get(dashboardId);
  }

  // Liste des dashboards disponibles
  getAvailableDashboards() {
    return Array.from(this.dashboards.values()).map(dashboard => ({
      id: dashboard.id,
      title: dashboard.title,
      description: dashboard.description,
      widgetCount: dashboard.widgets.length
    }));
  }

  // Simulation de données pour démonstration
  generateMockData() {
    const now = Date.now();
    const timePoints = Array.from({length: 60}, (_, i) => now - (i * 60000)); // 60 points sur 1h
    
    return {
      system: {
        uptime: Math.floor(Math.random() * 86400 * 30), // 0-30 jours
        cpu: {
          usage: 45 + Math.random() * 30, // 45-75%
          cores: 8
        },
        memory: {
          usage: 60 + Math.random() * 25, // 60-85%
          total: 16 * 1024 * 1024 * 1024 // 16GB
        },
        disk: {
          usage: 30 + Math.random() * 40 // 30-70%
        }
      },
      api: {
        throughput: 50 + Math.random() * 100, // 50-150 req/min
        latency: {
          avg: 150 + Math.random() * 200, // 150-350ms
          p95: 300 + Math.random() * 500, // 300-800ms
          max: 500 + Math.random() * 1000 // 500-1500ms
        },
        errorRate: Math.random() * 5, // 0-5%
        timeseries: timePoints.map(time => ({
          timestamp: time,
          latency_avg: 150 + Math.random() * 200,
          latency_p95: 300 + Math.random() * 500,
          requests_total: 40 + Math.random() * 120,
          errors_count: Math.random() * 10
        }))
      },
      ai: {
        providers: {
          openai: {
            available: true,
            latency: 400 + Math.random() * 300,
            quota: 75 + Math.random() * 20, // 75-95%
            errors: Math.floor(Math.random() * 3)
          },
          anthropic: {
            available: Math.random() > 0.1, // 90% disponible
            latency: 350 + Math.random() * 400,
            quota: 60 + Math.random() * 30,
            errors: Math.floor(Math.random() * 2)
          },
          gemini: {
            available: Math.random() > 0.05, // 95% disponible
            latency: 300 + Math.random() * 250,
            quota: 45 + Math.random() * 35,
            errors: Math.floor(Math.random() * 4)
          }
        },
        fallback: {
          rate: Math.random() * 15, // 0-15 fallbacks/h
          percentage: Math.random() * 8, // 0-8%
          avgTime: 800 + Math.random() * 700 // 800-1500ms
        },
        streaming: {
          connections: Math.floor(10 + Math.random() * 40), // 10-50 connexions
          firstResponse: 200 + Math.random() * 300, // 200-500ms
          throughput: 50 + Math.random() * 150 // 50-200 tokens/sec
        }
      },
      database: {
        connections: {
          active: Math.floor(20 + Math.random() * 60), // 20-80 connexions
          max: 100
        },
        query: {
          avg: 50 + Math.random() * 100, // 50-150ms
          p95: 100 + Math.random() * 200, // 100-300ms
          slow: Math.floor(Math.random() * 10) // 0-10 requêtes lentes
        },
        rls: {
          isolation: {
            avg: 30 + Math.random() * 40, // 30-70ms
            p95: 60 + Math.random() * 80 // 60-140ms
          },
          violations: Math.floor(Math.random() * 3),
          efficiency: 95 + Math.random() * 4 // 95-99%
        }
      },
      users: {
        activeSessions: Math.floor(50 + Math.random() * 200), // 50-250 sessions
        newConversations: Math.floor(20 + Math.random() * 80), // 20-100 nouvelles
        byTenant: {
          'demo-company': 45,
          'test-org': 25,
          'corp-ltd': 20,
          'autre': 10
        }
      },
      websocket: {
        connections: {
          total: Math.floor(30 + Math.random() * 70), // 30-100 connexions
          active: Math.floor(20 + Math.random() * 50), // 20-70 actives
        },
        reconnections: Math.floor(Math.random() * 5) // 0-5 reconnexions
      }
    };
  }

  // Simulation dashboard temps réel
  simulateDashboard(dashboardId) {
    const dashboard = this.getDashboardConfig(dashboardId);
    if (!dashboard) return null;

    const mockData = this.generateMockData();
    
    console.log('\n' + '='.repeat(80));
    console.log(`📊 SIMULATION DASHBOARD: ${dashboard.title.toUpperCase()}`);
    console.log('='.repeat(80));
    console.log(`Description: ${dashboard.description}`);
    console.log(`Actualisation: ${dashboard.refreshInterval/1000}s`);
    console.log(`Widgets: ${dashboard.widgets.length}`);
    
    dashboard.widgets.forEach((widget, index) => {
      console.log(`\n📈 Widget ${index + 1}: ${widget.title}`);
      console.log(`   Type: ${widget.type} | Taille: ${widget.size}`);
      console.log(`   Position: Ligne ${widget.position.row}, Colonne ${widget.position.col}`);
      
      // Simulation de données selon le type de widget
      this.simulateWidgetData(widget, mockData);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('💡 Note: Ces données sont simulées pour démonstration');
    console.log('En production, elles seraient collectées depuis les APIs de monitoring');
    console.log('='.repeat(80));
  }

  // Simulation données widget
  simulateWidgetData(widget, mockData) {
    switch (widget.type) {
      case 'status':
      case 'status_grid':
        console.log('   📍 Statuts:');
        if (widget.config.endpoints) {
          widget.config.endpoints.forEach(endpoint => {
            const status = Math.random() > 0.1 ? '🟢 UP' : '🔴 DOWN';
            const latency = Math.floor(100 + Math.random() * 300);
            console.log(`     ${endpoint.name}: ${status} (${latency}ms)`);
          });
        }
        break;
        
      case 'gauge':
        console.log('   📊 Jauges:');
        widget.config.metrics?.forEach(metric => {
          const value = mockData.system[metric.key.split('.')[1]]?.usage || Math.random() * 100;
          const status = value > 85 ? '🔴' : value > 70 ? '🟡' : '🟢';
          console.log(`     ${metric.label}: ${value.toFixed(1)}${metric.unit} ${status}`);
        });
        break;
        
      case 'metrics':
        console.log('   🔢 Métriques:');
        widget.config.metrics?.forEach(metric => {
          let value;
          switch (metric.format) {
            case 'duration':
              value = `${Math.floor(mockData.system.uptime / 3600)}h`;
              break;
            case 'ms':
              value = `${Math.floor(mockData.api.latency.p95)}ms`;
              break;
            case 'percent':
              value = `${mockData.api.errorRate.toFixed(2)}%`;
              break;
            default:
              value = Math.floor(mockData.api.throughput);
          }
          console.log(`     ${metric.label}: ${value}`);
        });
        break;
        
      case 'timeseries':
        console.log('   📈 Série temporelle:');
        console.log(`     Fenêtre: ${widget.config.timeWindow}`);
        widget.config.metrics?.forEach(metric => {
          const currentValue = Math.floor(100 + Math.random() * 500);
          console.log(`     ${metric.label}: ${currentValue} (tendance: ${Math.random() > 0.5 ? '↗️' : '↘️'})`);
        });
        break;
        
      case 'table':
        console.log('   📋 Table (top 3):');
        for (let i = 1; i <= 3; i++) {
          const endpoint = `/api/endpoint${i}`;
          const latency = Math.floor(100 + Math.random() * 400);
          const requests = Math.floor(10 + Math.random() * 50);
          const errors = (Math.random() * 5).toFixed(2);
          console.log(`     ${endpoint}: ${requests} req/min, ${latency}ms, ${errors}% err`);
        }
        break;
        
      case 'counter':
        console.log('   🔢 Compteur:');
        const count = Math.floor(50 + Math.random() * 200);
        const trend = Math.random() > 0.5 ? '↗️ +12%' : '↘️ -5%';
        console.log(`     Valeur: ${count} ${trend}`);
        break;
        
      default:
        console.log(`     Type ${widget.type}: Données simulées disponibles`);
    }
  }

  // Génération rapport dashboards
  generateDashboardsReport() {
    const dashboards = this.getAvailableDashboards();
    
    return {
      summary: {
        totalDashboards: dashboards.length,
        totalWidgets: dashboards.reduce((sum, d) => sum + d.widgetCount, 0),
        availableTypes: this.getAvailableWidgetTypes()
      },
      dashboards: dashboards,
      widgetTypes: this.getWidgetTypesInfo(),
      simulationCapabilities: this.getSimulationInfo()
    };
  }

  // Types de widgets disponibles
  getAvailableWidgetTypes() {
    const types = new Set();
    for (const dashboard of this.dashboards.values()) {
      dashboard.widgets.forEach(widget => types.add(widget.type));
    }
    return Array.from(types);
  }

  // Informations types de widgets
  getWidgetTypesInfo() {
    return {
      status: 'Indicateurs de statut service',
      gauge: 'Jauges pour métriques système',
      timeseries: 'Graphiques temporels',
      table: 'Tableaux de données',
      pie: 'Graphiques circulaires',
      bar_chart: 'Graphiques en barres',
      heatmap: 'Cartes de chaleur',
      counter: 'Compteurs simples',
      progress_bars: 'Barres de progression',
      metrics: 'Panneaux de métriques'
    };
  }

  // Informations simulation
  getSimulationInfo() {
    return {
      dataGeneration: 'Génération automatique de données réalistes',
      timeWindows: 'Support fenêtres temporelles multiples',
      realtimeUpdates: 'Simulation mise à jour temps réel',
      alertIntegration: 'Intégration avec système d\'alertes'
    };
  }
}

module.exports = {
  DashboardsConfig
};