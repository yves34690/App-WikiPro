/**
 * TICKET-PERFORMANCE-001 - Tests de Charge API
 * Tests de performance pour 100 utilisateurs simultanés
 * Objectif: Toutes les requêtes API < 2s, 95% < 500ms
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3001';
const TENANT_SLUG = 'demo-company';
const TARGET_USERS = 100;
const MAX_RESPONSE_TIME = 2000; // 2s max
const P95_TARGET = 500; // 95% des requêtes < 500ms

// Configuration du test
const TEST_CONFIG = {
  auth: {
    email: 'admin@demo-company.com',
    password: 'admin123'
  },
  endpoints: [
    { path: '/api/auth/login', method: 'POST', requiresAuth: false },
    { path: '/api/auth/verify', method: 'GET', requiresAuth: true },
    { path: `/api/v1/${TENANT_SLUG}/sessions`, method: 'GET', requiresAuth: true },
    { path: `/api/v1/${TENANT_SLUG}/ai/health`, method: 'GET', requiresAuth: true },
    { path: '/telemetry/health', method: 'GET', requiresAuth: false },
    { path: '/registry/health', method: 'GET', requiresAuth: false }
  ]
};

class PerformanceTestRunner {
  constructor() {
    this.results = [];
    this.authTokens = new Map();
  }

  async authenticate(userId) {
    const startTime = performance.now();
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_CONFIG.auth);
      const endTime = performance.now();
      
      if (response.data.access_token) {
        this.authTokens.set(userId, response.data.access_token);
      }
      
      return {
        endpoint: '/api/auth/login',
        userId,
        responseTime: endTime - startTime,
        success: true,
        statusCode: response.status
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        endpoint: '/api/auth/login',
        userId,
        responseTime: endTime - startTime,
        success: false,
        error: error.message,
        statusCode: error.response?.status || 0
      };
    }
  }

  async makeRequest(endpoint, userId) {
    const token = this.authTokens.get(userId);
    const headers = endpoint.requiresAuth && token ? 
      { Authorization: `Bearer ${token}` } : {};

    const startTime = performance.now();
    try {
      let response;
      if (endpoint.method === 'GET') {
        response = await axios.get(`${BASE_URL}${endpoint.path}`, { headers });
      } else if (endpoint.method === 'POST') {
        response = await axios.post(`${BASE_URL}${endpoint.path}`, {}, { headers });
      }
      
      const endTime = performance.now();
      return {
        endpoint: endpoint.path,
        userId,
        responseTime: endTime - startTime,
        success: true,
        statusCode: response.status
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        endpoint: endpoint.path,
        userId,
        responseTime: endTime - startTime,
        success: false,
        error: error.message,
        statusCode: error.response?.status || 0
      };
    }
  }

  async simulateUser(userId) {
    const userResults = [];
    
    // 1. Authentification
    const authResult = await this.authenticate(userId);
    userResults.push(authResult);
    
    if (!authResult.success) {
      console.log(`❌ Utilisateur ${userId}: Échec authentification`);
      return userResults;
    }

    // 2. Tests des endpoints
    for (const endpoint of TEST_CONFIG.endpoints) {
      if (endpoint.path === '/api/auth/login') continue; // Déjà testé
      
      const result = await this.makeRequest(endpoint, userId);
      userResults.push(result);
      
      // Délai entre les requêtes (simulation réaliste)
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return userResults;
  }

  async runLoadTest() {
    console.log(`🚀 Démarrage test de charge: ${TARGET_USERS} utilisateurs simultanés`);
    console.log(`📊 Objectifs: Max ${MAX_RESPONSE_TIME}ms, P95 < ${P95_TARGET}ms`);
    
    const startTime = performance.now();
    
    // Lancement de tous les utilisateurs en parallèle
    const userPromises = [];
    for (let i = 1; i <= TARGET_USERS; i++) {
      userPromises.push(this.simulateUser(i));
    }
    
    const allResults = await Promise.all(userPromises);
    const endTime = performance.now();
    
    // Consolidation des résultats
    this.results = allResults.flat();
    
    return {
      totalDuration: endTime - startTime,
      totalRequests: this.results.length,
      results: this.results
    };
  }

  generateReport(testResults) {
    const { totalDuration, totalRequests, results } = testResults;
    
    // Analyse par endpoint
    const endpointStats = {};
    results.forEach(result => {
      if (!endpointStats[result.endpoint]) {
        endpointStats[result.endpoint] = {
          total: 0,
          success: 0,
          errors: 0,
          responseTimes: []
        };
      }
      
      endpointStats[result.endpoint].total++;
      if (result.success) {
        endpointStats[result.endpoint].success++;
        endpointStats[result.endpoint].responseTimes.push(result.responseTime);
      } else {
        endpointStats[result.endpoint].errors++;
      }
    });

    // Calcul des statistiques
    const report = {
      summary: {
        totalDuration: Math.round(totalDuration),
        totalRequests,
        concurrentUsers: TARGET_USERS,
        requestsPerSecond: Math.round(totalRequests / (totalDuration / 1000))
      },
      endpoints: {}
    };

    Object.keys(endpointStats).forEach(endpoint => {
      const stats = endpointStats[endpoint];
      const responseTimes = stats.responseTimes.sort((a, b) => a - b);
      
      if (responseTimes.length > 0) {
        const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)];
        const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
        const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];
        const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const min = Math.min(...responseTimes);
        const max = Math.max(...responseTimes);

        report.endpoints[endpoint] = {
          total: stats.total,
          success: stats.success,
          errors: stats.errors,
          successRate: ((stats.success / stats.total) * 100).toFixed(2) + '%',
          errorRate: ((stats.errors / stats.total) * 100).toFixed(2) + '%',
          responseTimes: {
            min: Math.round(min),
            max: Math.round(max),
            avg: Math.round(avg),
            p50: Math.round(p50),
            p95: Math.round(p95),
            p99: Math.round(p99)
          },
          validations: {
            maxResponseTime: max <= MAX_RESPONSE_TIME ? '✅' : '❌',
            p95Target: p95 <= P95_TARGET ? '✅' : '❌'
          }
        };
      }
    });

    return report;
  }

  printReport(report) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RAPPORT DE PERFORMANCE - TEST DE CHARGE API');
    console.log('='.repeat(80));
    
    console.log('\n📈 RÉSUMÉ GÉNÉRAL:');
    console.log(`  • Durée totale: ${report.summary.totalDuration}ms`);
    console.log(`  • Requêtes totales: ${report.summary.totalRequests}`);
    console.log(`  • Utilisateurs simultanés: ${report.summary.concurrentUsers}`);
    console.log(`  • Débit: ${report.summary.requestsPerSecond} req/s`);

    console.log('\n🎯 PERFORMANCE PAR ENDPOINT:');
    Object.keys(report.endpoints).forEach(endpoint => {
      const stats = report.endpoints[endpoint];
      console.log(`\n  ${endpoint}`);
      console.log(`    Succès: ${stats.success}/${stats.total} (${stats.successRate})`);
      console.log(`    Erreurs: ${stats.errors} (${stats.errorRate})`);
      console.log(`    Temps de réponse:`);
      console.log(`      Min: ${stats.responseTimes.min}ms`);
      console.log(`      Moy: ${stats.responseTimes.avg}ms`);
      console.log(`      P50: ${stats.responseTimes.p50}ms`);
      console.log(`      P95: ${stats.responseTimes.p95}ms ${stats.validations.p95Target}`);
      console.log(`      P99: ${stats.responseTimes.p99}ms`);
      console.log(`      Max: ${stats.responseTimes.max}ms ${stats.validations.maxResponseTime}`);
    });

    console.log('\n🏆 VALIDATION DES CRITÈRES:');
    let allCriteriaMet = true;
    Object.keys(report.endpoints).forEach(endpoint => {
      const validations = report.endpoints[endpoint].validations;
      const passed = Object.values(validations).every(v => v === '✅');
      console.log(`  ${endpoint}: ${passed ? '✅ CONFORME' : '❌ NON CONFORME'}`);
      if (!passed) allCriteriaMet = false;
    });

    console.log(`\n🎯 RÉSULTAT GLOBAL: ${allCriteriaMet ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
    console.log('='.repeat(80));
  }
}

// Exécution du test
async function runPerformanceTest() {
  try {
    console.log('🔧 Vérification de la disponibilité du backend...');
    await axios.get(`${BASE_URL}/ping`);
    console.log('✅ Backend disponible');

    const runner = new PerformanceTestRunner();
    const results = await runner.runLoadTest();
    const report = runner.generateReport(results);
    
    runner.printReport(report);
    
    // Sauvegarde du rapport
    const fs = require('fs');
    const reportPath = './tests/reports/api-load-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);

    // Code de sortie selon le résultat
    const success = Object.values(report.endpoints).every(endpoint => 
      Object.values(endpoint.validations).every(v => v === '✅')
    );
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Erreur lors du test de performance:', error.message);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runPerformanceTest();
}

module.exports = {
  PerformanceTestRunner,
  runPerformanceTest
};