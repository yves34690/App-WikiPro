/**
 * DÉMONSTRATION RAPIDE - TICKET-PERFORMANCE-001
 * Script de validation rapide des tests performance
 * Durée: ~2 minutes pour validation fonctionnelle
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3001';

class QuickPerformanceDemo {
  constructor() {
    this.results = [];
    this.startTime = performance.now();
  }

  async checkBackendAvailability() {
    console.log('🔧 Vérification disponibilité backend...');
    try {
      const response = await axios.get(`${BASE_URL}/ping`, { timeout: 5000 });
      console.log('✅ Backend disponible');
      return true;
    } catch (error) {
      console.log('❌ Backend indisponible:', error.message);
      console.log('💡 Assurez-vous que le backend est démarré avec: cd backend && npm run start:dev');
      return false;
    }
  }

  async quickAuthTest() {
    console.log('\n🔐 Test authentification rapide...');
    const startTime = performance.now();
    
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'admin@demo-company.com',
        password: 'admin123'
      });
      
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      if (response.data.access_token) {
        console.log(`✅ Authentification réussie en ${duration}ms`);
        return { success: true, token: response.data.access_token, duration };
      } else {
        console.log('❌ Token non reçu');
        return { success: false, duration };
      }
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      console.log(`❌ Authentification échouée: ${error.message} (${duration}ms)`);
      return { success: false, duration, error: error.message };
    }
  }

  async quickAPITests(token) {
    console.log('\n⚡ Tests API rapides...');
    
    const endpoints = [
      { name: 'Health Auth', url: '/api/auth/health' },
      { name: 'Verify Token', url: '/api/auth/verify', auth: true },
      { name: 'Sessions List', url: '/api/v1/demo-company/sessions', auth: true },
      { name: 'AI Health', url: '/api/v1/demo-company/ai/health', auth: true },
      { name: 'Telemetry', url: '/telemetry/health' }
    ];

    const results = [];
    
    for (const endpoint of endpoints) {
      const startTime = performance.now();
      
      try {
        const headers = endpoint.auth ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${BASE_URL}${endpoint.url}`, { 
          headers, 
          timeout: 10000 
        });
        
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        console.log(`  ✅ ${endpoint.name}: ${duration}ms`);
        results.push({ name: endpoint.name, duration, success: true });
        
      } catch (error) {
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        console.log(`  ❌ ${endpoint.name}: ${duration}ms - ${error.message}`);
        results.push({ name: endpoint.name, duration, success: false, error: error.message });
      }
    }
    
    return results;
  }

  async quickSessionTest(token) {
    console.log('\n📝 Test session rapide...');
    
    try {
      // Création session
      const startCreate = performance.now();
      const createResponse = await axios.post(
        `${BASE_URL}/api/v1/demo-company/sessions`,
        {
          title: `Demo Test Session ${Date.now()}`,
          description: 'Session de démonstration rapide',
          model: 'openai'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const endCreate = performance.now();
      const createDuration = Math.round(endCreate - startCreate);
      
      if (createResponse.data?.id) {
        console.log(`  ✅ Création session: ${createDuration}ms`);
        
        const sessionId = createResponse.data.id;
        
        // Récupération session
        const startGet = performance.now();
        const getResponse = await axios.get(
          `${BASE_URL}/api/v1/demo-company/sessions`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const endGet = performance.now();
        const getDuration = Math.round(endGet - startGet);
        
        console.log(`  ✅ Récupération sessions: ${getDuration}ms (${getResponse.data?.length || 0} sessions)`);
        
        // Suppression session
        const startDelete = performance.now();
        await axios.delete(
          `${BASE_URL}/api/v1/demo-company/sessions/${sessionId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const endDelete = performance.now();
        const deleteDuration = Math.round(endDelete - startDelete);
        
        console.log(`  ✅ Suppression session: ${deleteDuration}ms`);
        
        return {
          success: true,
          create: createDuration,
          get: getDuration,
          delete: deleteDuration
        };
      } else {
        console.log('  ❌ Session non créée');
        return { success: false };
      }
    } catch (error) {
      console.log(`  ❌ Erreur session: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async demonstrateMonitoring() {
    console.log('\n📊 Démonstration monitoring...');
    
    const { TelemetryMonitor } = require('./monitoring/telemetry.js');
    const { AlertsManager } = require('./monitoring/alerts.config.js');
    const { DashboardsConfig } = require('./monitoring/dashboards.config.js');
    
    // Monitoring
    console.log('  📡 Système télémétrie: ✅ Disponible');
    const monitor = new TelemetryMonitor();
    console.log(`  📊 Métriques collectées: ${monitor.getTotalMetricsCount()}`);
    
    // Alertes
    console.log('  🚨 Système alertes: ✅ Configuré');
    const alerts = new AlertsManager();
    const alertsReport = alerts.generateAlertsReport();
    console.log(`  📋 Alertes actives: ${alertsReport.summary.activeAlerts}`);
    
    // Dashboards
    console.log('  📈 Dashboards: ✅ Opérationnels');
    const dashboards = new DashboardsConfig();
    const dashboardsList = dashboards.getAvailableDashboards();
    console.log(`  🎛️ Dashboards disponibles: ${dashboardsList.length}`);
    
    return {
      telemetry: true,
      alerts: true,
      dashboards: dashboardsList.length
    };
  }

  generateQuickReport(authResult, apiResults, sessionResult, monitoringResult) {
    const endTime = performance.now();
    const totalDuration = Math.round(endTime - this.startTime);
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 RAPPORT DÉMONSTRATION RAPIDE - TICKET-PERFORMANCE-001');
    console.log('='.repeat(80));
    
    console.log('\n📈 RÉSULTATS:');
    console.log(`  • Durée totale: ${totalDuration}ms`);
    console.log(`  • Backend: ${authResult ? '✅ Disponible' : '❌ Indisponible'}`);
    
    if (authResult && authResult.success) {
      console.log(`  • Authentification: ✅ ${authResult.duration}ms`);
      
      const successfulAPIs = apiResults.filter(r => r.success).length;
      console.log(`  • APIs testées: ${successfulAPIs}/${apiResults.length} succès`);
      
      if (apiResults.length > 0) {
        const avgLatency = Math.round(
          apiResults.filter(r => r.success).reduce((sum, r) => sum + r.duration, 0) / 
          Math.max(1, successfulAPIs)
        );
        console.log(`  • Latence moyenne: ${avgLatency}ms`);
      }
      
      if (sessionResult && sessionResult.success) {
        console.log(`  • Sessions CRUD: ✅ Create:${sessionResult.create}ms Get:${sessionResult.get}ms Delete:${sessionResult.delete}ms`);
      }
      
      if (monitoringResult) {
        console.log(`  • Monitoring: ✅ ${monitoringResult.dashboards} dashboards configurés`);
      }
    } else {
      console.log('  • Tests limités car backend indisponible');
    }
    
    console.log('\n🎯 VALIDATION RAPIDE:');
    const validations = [
      { name: 'Backend disponible', status: authResult ? '✅' : '❌' },
      { name: 'Auth fonctionnelle', status: authResult?.success ? '✅' : '❌' },
      { name: 'APIs accessibles', status: apiResults.some(r => r.success) ? '✅' : '❌' },
      { name: 'Sessions CRUD', status: sessionResult?.success ? '✅' : '❌' },
      { name: 'Monitoring configuré', status: monitoringResult ? '✅' : '❌' }
    ];
    
    validations.forEach(v => {
      console.log(`  • ${v.name}: ${v.status}`);
    });
    
    const allValid = validations.every(v => v.status === '✅');
    console.log(`\n🏆 RÉSULTAT: ${allValid ? '✅ SYSTÈME PRÊT' : '⚠️ CONFIGURATION REQUISE'}`);
    
    if (!allValid) {
      console.log('\n💡 ACTIONS REQUISES:');
      if (!authResult) {
        console.log('  1. Démarrer le backend: cd backend && npm run start:dev');
      }
      if (authResult && !authResult.success) {
        console.log('  2. Vérifier configuration auth et base de données');
      }
      if (!apiResults.some(r => r.success)) {
        console.log('  3. Vérifier configuration APIs et endpoints');
      }
    } else {
      console.log('\n🚀 PRÊT POUR TESTS COMPLETS:');
      console.log('  • Exécuter: npm test (suite complète ~30min)');
      console.log('  • Ou tests individuels: npm run test:api-load');
      console.log('  • Monitoring: npm run monitor');
    }
    
    console.log('\n='.repeat(80));
  }

  async runQuickDemo() {
    console.log('🚀 DÉMONSTRATION RAPIDE TESTS PERFORMANCE');
    console.log('='.repeat(80));
    console.log('Validation fonctionnelle rapide (~2 minutes)');
    console.log('Pour tests complets: npm test\n');
    
    // Vérification backend
    const backendAvailable = await this.checkBackendAvailability();
    if (!backendAvailable) {
      this.generateQuickReport(false, [], null, null);
      return false;
    }
    
    // Test auth
    const authResult = await this.quickAuthTest();
    
    let apiResults = [];
    let sessionResult = null;
    let monitoringResult = null;
    
    if (authResult.success) {
      // Tests API
      apiResults = await this.quickAPITests(authResult.token);
      
      // Test session
      sessionResult = await this.quickSessionTest(authResult.token);
      
      // Démonstration monitoring
      monitoringResult = await this.demonstrateMonitoring();
    }
    
    // Rapport final
    this.generateQuickReport(authResult, apiResults, sessionResult, monitoringResult);
    
    return authResult.success && apiResults.some(r => r.success);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const demo = new QuickPerformanceDemo();
  
  demo.runQuickDemo().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ Erreur démonstration:', error.message);
    process.exit(1);
  });
}

module.exports = {
  QuickPerformanceDemo
};