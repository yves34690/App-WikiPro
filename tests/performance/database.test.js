/**
 * TICKET-PERFORMANCE-001 - Tests Performance Base de Données
 * Tests PostgreSQL + RLS performance
 * Objectif: Requêtes RLS < 100ms, 1000 conversations < 200ms recherche
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3001';
const TENANT_SLUG = 'demo-company';
const RLS_TARGET = 100; // 100ms max pour isolation RLS
const SEARCH_TARGET = 200; // 200ms max pour recherche 1000 conversations
const DB_OPERATIONS_COUNT = 100; // Nombre d'opérations DB à tester

// Configuration du test
const TEST_CONFIG = {
  auth: {
    email: 'admin@demo-company.com',
    password: 'admin123'
  }
};

class DatabasePerformanceTest {
  constructor() {
    this.authToken = null;
    this.results = [];
  }

  async authenticate() {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_CONFIG.auth);
      if (response.data.access_token) {
        this.authToken = response.data.access_token;
        return true;
      }
    } catch (error) {
      console.error('❌ Authentification échouée:', error.message);
    }
    return false;
  }

  async testSessionCreation() {
    const startTime = performance.now();
    
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions`,
        {
          title: `Test Session ${Date.now()}`,
          description: 'Session de test pour mesures de performance',
          model: 'openai'
        },
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );
      
      const endTime = performance.now();
      
      return {
        operation: 'session_create',
        responseTime: endTime - startTime,
        success: response.status === 201,
        statusCode: response.status,
        sessionId: response.data?.id
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        operation: 'session_create',
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
    }
  }

  async testSessionsList() {
    const startTime = performance.now();
    
    try {
      const response = await axios.get(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions`,
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );
      
      const endTime = performance.now();
      
      return {
        operation: 'sessions_list',
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status,
        recordsCount: Array.isArray(response.data) ? response.data.length : 0
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        operation: 'sessions_list',
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message,
        recordsCount: 0
      };
    }
  }

  async testConversationCreation(sessionId) {
    if (!sessionId) return null;

    const startTime = performance.now();
    
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions/${sessionId}/conversations`,
        {
          user_message: `Test message ${Date.now()}`,
          ai_response: 'Réponse de test pour mesure de performance',
          model: 'openai',
          tokens_used: 50
        },
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );
      
      const endTime = performance.now();
      
      return {
        operation: 'conversation_create',
        responseTime: endTime - startTime,
        success: response.status === 201,
        statusCode: response.status,
        conversationId: response.data?.id
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        operation: 'conversation_create',
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
    }
  }

  async testConversationsList(sessionId) {
    if (!sessionId) return null;

    const startTime = performance.now();
    
    try {
      const response = await axios.get(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions/${sessionId}/conversations`,
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );
      
      const endTime = performance.now();
      
      return {
        operation: 'conversations_list',
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status,
        recordsCount: Array.isArray(response.data) ? response.data.length : 0
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        operation: 'conversations_list',
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message,
        recordsCount: 0
      };
    }
  }

  async testSessionUpdate(sessionId) {
    if (!sessionId) return null;

    const startTime = performance.now();
    
    try {
      const response = await axios.put(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions/${sessionId}`,
        {
          title: `Updated Session ${Date.now()}`,
          description: 'Session mise à jour pour test performance'
        },
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );
      
      const endTime = performance.now();
      
      return {
        operation: 'session_update',
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        operation: 'session_update',
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
    }
  }

  async testSessionDeletion(sessionId) {
    if (!sessionId) return null;

    const startTime = performance.now();
    
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions/${sessionId}`,
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );
      
      const endTime = performance.now();
      
      return {
        operation: 'session_delete',
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        operation: 'session_delete',
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
    }
  }

  async testTelemetryMetrics() {
    const startTime = performance.now();
    
    try {
      const response = await axios.get(`${BASE_URL}/telemetry/metrics`);
      const endTime = performance.now();
      
      return {
        operation: 'telemetry_metrics',
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status,
        metricsCount: response.data?.length || 0
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        operation: 'telemetry_metrics',
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
    }
  }

  async runDatabasePerformanceTest() {
    console.log(`🚀 Test performance base de données: ${DB_OPERATIONS_COUNT} opérations`);
    console.log(`📊 Objectifs: RLS < ${RLS_TARGET}ms, recherche < ${SEARCH_TARGET}ms`);

    if (!await this.authenticate()) {
      throw new Error('Impossible de s\'authentifier');
    }

    const allResults = [];
    const createdSessionIds = [];

    // Phase 1: Tests CRUD de base
    console.log('📝 Phase 1: Tests CRUD sessions/conversations...');
    
    for (let i = 1; i <= DB_OPERATIONS_COUNT; i++) {
      // Création session
      const createResult = await this.testSessionCreation();
      allResults.push(createResult);
      
      if (createResult.success && createResult.sessionId) {
        createdSessionIds.push(createResult.sessionId);
        
        // Création conversation
        const conversationResult = await this.testConversationCreation(createResult.sessionId);
        if (conversationResult) allResults.push(conversationResult);
        
        // Liste conversations
        const listConversationsResult = await this.testConversationsList(createResult.sessionId);
        if (listConversationsResult) allResults.push(listConversationsResult);
        
        // Update session
        const updateResult = await this.testSessionUpdate(createResult.sessionId);
        if (updateResult) allResults.push(updateResult);
      }
      
      // Progression
      if (i % 10 === 0) {
        console.log(`  Progression: ${i}/${DB_OPERATIONS_COUNT} opérations`);
      }
    }

    // Phase 2: Tests de performance de lecture
    console.log('📊 Phase 2: Tests performance lecture...');
    
    for (let i = 1; i <= 20; i++) {
      const listResult = await this.testSessionsList();
      allResults.push(listResult);
    }

    // Phase 3: Tests télémétrie
    console.log('📡 Phase 3: Tests télémétrie...');
    
    for (let i = 1; i <= 10; i++) {
      const telemetryResult = await this.testTelemetryMetrics();
      allResults.push(telemetryResult);
    }

    // Phase 4: Nettoyage (suppression des sessions créées)
    console.log('🧹 Phase 4: Nettoyage...');
    
    for (const sessionId of createdSessionIds.slice(0, Math.min(10, createdSessionIds.length))) {
      const deleteResult = await this.testSessionDeletion(sessionId);
      if (deleteResult) allResults.push(deleteResult);
    }

    return allResults;
  }

  generateDatabaseReport(results) {
    // Groupement par opération
    const operationStats = {};
    
    results.forEach(result => {
      if (!operationStats[result.operation]) {
        operationStats[result.operation] = {
          total: 0,
          success: 0,
          errors: 0,
          responseTimes: [],
          recordsCounts: []
        };
      }
      
      operationStats[result.operation].total++;
      if (result.success) {
        operationStats[result.operation].success++;
        operationStats[result.operation].responseTimes.push(result.responseTime);
        if (result.recordsCount !== undefined) {
          operationStats[result.operation].recordsCounts.push(result.recordsCount);
        }
      } else {
        operationStats[result.operation].errors++;
      }
    });

    const report = {
      summary: {
        totalOperations: results.length,
        operationTypes: Object.keys(operationStats).length,
        overallSuccessRate: ((results.filter(r => r.success).length / results.length) * 100).toFixed(2) + '%'
      },
      operations: {}
    };

    // Calcul des statistiques par opération
    Object.keys(operationStats).forEach(operation => {
      const stats = operationStats[operation];
      const responseTimes = stats.responseTimes.sort((a, b) => a - b);
      
      if (responseTimes.length > 0) {
        const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)];
        const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
        const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];
        const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const min = Math.min(...responseTimes);
        const max = Math.max(...responseTimes);

        // Validation selon le type d'opération
        let target = RLS_TARGET;
        if (operation.includes('list') || operation.includes('search')) {
          target = SEARCH_TARGET;
        }

        report.operations[operation] = {
          total: stats.total,
          success: stats.success,
          errors: stats.errors,
          successRate: ((stats.success / stats.total) * 100).toFixed(2) + '%',
          responseTimes: {
            min: Math.round(min),
            max: Math.round(max),
            avg: Math.round(avg),
            p50: Math.round(p50),
            p95: Math.round(p95),
            p99: Math.round(p99)
          },
          validation: {
            target: target,
            status: max <= target ? '✅' : '❌'
          }
        };

        // Statistiques sur les données retournées
        if (stats.recordsCounts.length > 0) {
          const avgRecords = stats.recordsCounts.reduce((a, b) => a + b, 0) / stats.recordsCounts.length;
          const maxRecords = Math.max(...stats.recordsCounts);
          report.operations[operation].dataStats = {
            avgRecords: Math.round(avgRecords),
            maxRecords
          };
        }
      }
    });

    return report;
  }

  printDatabaseReport(report) {
    console.log('\n' + '='.repeat(80));
    console.log('🗄️ RAPPORT DE PERFORMANCE - BASE DE DONNÉES');
    console.log('='.repeat(80));
    
    console.log('\n📈 RÉSUMÉ GÉNÉRAL:');
    console.log(`  • Opérations totales: ${report.summary.totalOperations}`);
    console.log(`  • Types d'opérations: ${report.summary.operationTypes}`);
    console.log(`  • Taux de succès global: ${report.summary.overallSuccessRate}`);

    console.log('\n⚡ PERFORMANCE PAR OPÉRATION:');
    Object.keys(report.operations).forEach(operation => {
      const stats = report.operations[operation];
      console.log(`\n  ${operation}:`);
      console.log(`    Succès: ${stats.success}/${stats.total} (${stats.successRate})`);
      console.log(`    Temps de réponse:`);
      console.log(`      Min: ${stats.responseTimes.min}ms`);
      console.log(`      Moy: ${stats.responseTimes.avg}ms`);
      console.log(`      P50: ${stats.responseTimes.p50}ms`);
      console.log(`      P95: ${stats.responseTimes.p95}ms`);
      console.log(`      P99: ${stats.responseTimes.p99}ms`);
      console.log(`      Max: ${stats.responseTimes.max}ms (cible: < ${stats.validation.target}ms) ${stats.validation.status}`);
      
      if (stats.dataStats) {
        console.log(`    Données:`);
        console.log(`      Enregistrements moy: ${stats.dataStats.avgRecords}`);
        console.log(`      Enregistrements max: ${stats.dataStats.maxRecords}`);
      }
    });

    console.log('\n🏆 VALIDATION DES CRITÈRES:');
    let allCriteriaMet = true;
    Object.keys(report.operations).forEach(operation => {
      const validation = report.operations[operation].validation;
      const passed = validation.status === '✅';
      console.log(`  ${operation}: ${passed ? '✅ CONFORME' : '❌ NON CONFORME'}`);
      if (!passed) allCriteriaMet = false;
    });

    console.log(`\n🎯 RÉSULTAT GLOBAL: ${allCriteriaMet ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
    console.log('='.repeat(80));
  }
}

// Exécution du test
async function runDatabasePerformanceTest() {
  try {
    console.log('🔧 Vérification de la disponibilité du backend...');
    await axios.get(`${BASE_URL}/ping`);
    console.log('✅ Backend disponible');

    const tester = new DatabasePerformanceTest();
    const results = await tester.runDatabasePerformanceTest();
    const report = tester.generateDatabaseReport(results);
    
    tester.printDatabaseReport(report);
    
    // Sauvegarde du rapport
    const fs = require('fs');
    const reportPath = './tests/reports/database-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);

    // Code de sortie selon le résultat
    const success = Object.values(report.operations).every(operation => 
      operation.validation.status === '✅'
    );
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Erreur lors du test database performance:', error.message);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runDatabasePerformanceTest();
}

module.exports = {
  DatabasePerformanceTest,
  runDatabasePerformanceTest
};