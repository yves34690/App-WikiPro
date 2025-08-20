/**
 * TICKET-PERFORMANCE-001 - Tests Streaming IA
 * Tests de latence et throughput pour le streaming IA
 * Objectif: Première réponse < 500ms, 30 connexions simultanées
 */

const WebSocket = require('ws');
const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3001';
const WS_URL = 'ws://localhost:3001';
const TENANT_SLUG = 'demo-company';
const TARGET_CONNECTIONS = 30;
const FIRST_RESPONSE_TARGET = 500; // 500ms pour première réponse
const STREAMING_DURATION = 10000; // 10s test streaming

// Configuration du test
const TEST_CONFIG = {
  auth: {
    email: 'admin@demo-company.com',
    password: 'admin123'
  },
  testPrompts: [
    'Explique-moi en quelques mots le concept de WikiPro',
    'Quels sont les avantages de l\'IA pour les organisations?',
    'Comment optimiser la gestion des connaissances?',
    'Décris les fonctionnalités principales d\'un système de RAG',
    'Quels sont les défis de l\'implémentation d\'une IA d\'entreprise?'
  ]
};

class StreamingPerformanceTest {
  constructor() {
    this.results = [];
    this.authTokens = new Map();
    this.websockets = new Map();
    this.streamingMetrics = new Map();
  }

  async authenticate(userId) {
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_CONFIG.auth);
      if (response.data.access_token) {
        this.authTokens.set(userId, response.data.access_token);
        return true;
      }
    } catch (error) {
      console.error(`❌ Authentification échouée pour utilisateur ${userId}:`, error.message);
    }
    return false;
  }

  async testAIStreamingREST(userId) {
    const token = this.authTokens.get(userId);
    const prompt = TEST_CONFIG.testPrompts[userId % TEST_CONFIG.testPrompts.length];
    
    const startTime = performance.now();
    let firstResponseTime = null;
    let totalResponseTime = null;
    let success = false;
    let streamChunks = 0;

    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/ai/chat`,
        {
          message: prompt,
          model: 'openai',
          stream: true
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'stream'
        }
      );

      let isFirstChunk = true;
      
      response.data.on('data', (chunk) => {
        if (isFirstChunk) {
          firstResponseTime = performance.now() - startTime;
          isFirstChunk = false;
        }
        streamChunks++;
      });

      response.data.on('end', () => {
        totalResponseTime = performance.now() - startTime;
        success = true;
      });

      response.data.on('error', (error) => {
        console.error(`❌ Erreur streaming pour utilisateur ${userId}:`, error.message);
      });

      // Attendre la fin du stream ou timeout
      await new Promise((resolve) => {
        setTimeout(() => resolve(), STREAMING_DURATION);
        response.data.on('end', resolve);
        response.data.on('error', resolve);
      });

    } catch (error) {
      totalResponseTime = performance.now() - startTime;
      console.error(`❌ Erreur requête IA pour utilisateur ${userId}:`, error.message);
    }

    return {
      userId,
      prompt,
      success,
      firstResponseTime: firstResponseTime || totalResponseTime,
      totalResponseTime: totalResponseTime || (performance.now() - startTime),
      streamChunks,
      method: 'REST'
    };
  }

  async testAIStreamingWebSocket(userId) {
    const token = this.authTokens.get(userId);
    const prompt = TEST_CONFIG.testPrompts[userId % TEST_CONFIG.testPrompts.length];
    
    return new Promise((resolve) => {
      const startTime = performance.now();
      let firstResponseTime = null;
      let totalResponseTime = null;
      let success = false;
      let streamChunks = 0;
      let isFirstMessage = true;

      const ws = new WebSocket(`${WS_URL}/ai-streaming`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const timeout = setTimeout(() => {
        ws.close();
        resolve({
          userId,
          prompt,
          success: false,
          firstResponseTime: performance.now() - startTime,
          totalResponseTime: performance.now() - startTime,
          streamChunks: 0,
          method: 'WebSocket',
          error: 'Timeout'
        });
      }, STREAMING_DURATION);

      ws.on('open', () => {
        // Envoi de la requête de chat
        ws.send(JSON.stringify({
          type: 'chat',
          data: {
            message: prompt,
            tenant_slug: TENANT_SLUG,
            model: 'openai'
          }
        }));
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          
          if (message.type === 'ai_response' || message.type === 'chunk') {
            if (isFirstMessage) {
              firstResponseTime = performance.now() - startTime;
              isFirstMessage = false;
            }
            streamChunks++;
            
            if (message.type === 'ai_response' && message.data.finished) {
              totalResponseTime = performance.now() - startTime;
              success = true;
              clearTimeout(timeout);
              ws.close();
              
              resolve({
                userId,
                prompt,
                success,
                firstResponseTime,
                totalResponseTime,
                streamChunks,
                method: 'WebSocket'
              });
            }
          }
        } catch (error) {
          console.error(`❌ Erreur parsing WebSocket pour utilisateur ${userId}:`, error.message);
        }
      });

      ws.on('error', (error) => {
        clearTimeout(timeout);
        resolve({
          userId,
          prompt,
          success: false,
          firstResponseTime: performance.now() - startTime,
          totalResponseTime: performance.now() - startTime,
          streamChunks,
          method: 'WebSocket',
          error: error.message
        });
      });
    });
  }

  async testConcurrentStreaming() {
    console.log(`🚀 Test streaming IA: ${TARGET_CONNECTIONS} connexions simultanées`);
    console.log(`📊 Objectif: Première réponse < ${FIRST_RESPONSE_TARGET}ms`);

    // Authentification de tous les utilisateurs
    const authPromises = [];
    for (let i = 1; i <= TARGET_CONNECTIONS; i++) {
      authPromises.push(this.authenticate(i));
    }
    
    const authResults = await Promise.all(authPromises);
    const authenticatedUsers = authResults.filter(Boolean).length;
    
    if (authenticatedUsers < TARGET_CONNECTIONS) {
      console.warn(`⚠️ Seulement ${authenticatedUsers}/${TARGET_CONNECTIONS} utilisateurs authentifiés`);
    }

    // Test streaming REST et WebSocket en parallèle
    const streamingPromises = [];
    
    for (let i = 1; i <= authenticatedUsers; i++) {
      // Alternance entre REST et WebSocket
      if (i % 2 === 0) {
        streamingPromises.push(this.testAIStreamingREST(i));
      } else {
        streamingPromises.push(this.testAIStreamingWebSocket(i));
      }
    }

    const startTime = performance.now();
    const results = await Promise.all(streamingPromises);
    const endTime = performance.now();

    return {
      totalDuration: endTime - startTime,
      authenticatedUsers,
      results
    };
  }

  generateStreamingReport(testResults) {
    const { totalDuration, authenticatedUsers, results } = testResults;
    
    // Analyse par méthode
    const methodStats = {
      REST: { results: [], success: 0, total: 0 },
      WebSocket: { results: [], success: 0, total: 0 }
    };

    results.forEach(result => {
      const method = result.method;
      methodStats[method].results.push(result);
      methodStats[method].total++;
      if (result.success) {
        methodStats[method].success++;
      }
    });

    const report = {
      summary: {
        totalDuration: Math.round(totalDuration),
        targetConnections: TARGET_CONNECTIONS,
        authenticatedUsers,
        completedTests: results.length,
        overallSuccessRate: ((results.filter(r => r.success).length / results.length) * 100).toFixed(2) + '%'
      },
      methods: {}
    };

    // Statistiques par méthode
    Object.keys(methodStats).forEach(method => {
      const stats = methodStats[method];
      if (stats.results.length === 0) return;

      const successfulResults = stats.results.filter(r => r.success);
      const firstResponseTimes = successfulResults.map(r => r.firstResponseTime);
      const totalResponseTimes = successfulResults.map(r => r.totalResponseTime);
      const streamChunks = successfulResults.map(r => r.streamChunks);

      if (firstResponseTimes.length > 0) {
        firstResponseTimes.sort((a, b) => a - b);
        totalResponseTimes.sort((a, b) => a - b);
        streamChunks.sort((a, b) => a - b);

        const firstP50 = firstResponseTimes[Math.floor(firstResponseTimes.length * 0.5)];
        const firstP95 = firstResponseTimes[Math.floor(firstResponseTimes.length * 0.95)];
        const firstAvg = firstResponseTimes.reduce((a, b) => a + b, 0) / firstResponseTimes.length;
        const firstMax = Math.max(...firstResponseTimes);

        const totalP50 = totalResponseTimes[Math.floor(totalResponseTimes.length * 0.5)];
        const totalP95 = totalResponseTimes[Math.floor(totalResponseTimes.length * 0.95)];
        const totalAvg = totalResponseTimes.reduce((a, b) => a + b, 0) / totalResponseTimes.length;

        const avgChunks = streamChunks.reduce((a, b) => a + b, 0) / streamChunks.length;

        report.methods[method] = {
          total: stats.total,
          success: stats.success,
          successRate: ((stats.success / stats.total) * 100).toFixed(2) + '%',
          firstResponse: {
            avg: Math.round(firstAvg),
            p50: Math.round(firstP50),
            p95: Math.round(firstP95),
            max: Math.round(firstMax)
          },
          totalResponse: {
            avg: Math.round(totalAvg),
            p50: Math.round(totalP50),
            p95: Math.round(totalP95)
          },
          streaming: {
            avgChunks: Math.round(avgChunks)
          },
          validations: {
            firstResponseTarget: firstMax <= FIRST_RESPONSE_TARGET ? '✅' : '❌',
            successRateTarget: (stats.success / stats.total) >= 0.95 ? '✅' : '❌'
          }
        };
      }
    });

    return report;
  }

  printStreamingReport(report) {
    console.log('\n' + '='.repeat(80));
    console.log('🎮 RAPPORT DE PERFORMANCE - STREAMING IA');
    console.log('='.repeat(80));
    
    console.log('\n📈 RÉSUMÉ GÉNÉRAL:');
    console.log(`  • Durée totale: ${report.summary.totalDuration}ms`);
    console.log(`  • Connexions cibles: ${report.summary.targetConnections}`);
    console.log(`  • Utilisateurs authentifiés: ${report.summary.authenticatedUsers}`);
    console.log(`  • Tests complétés: ${report.summary.completedTests}`);
    console.log(`  • Taux de succès global: ${report.summary.overallSuccessRate}`);

    console.log('\n🚀 PERFORMANCE PAR MÉTHODE:');
    Object.keys(report.methods).forEach(method => {
      const stats = report.methods[method];
      console.log(`\n  ${method}:`);
      console.log(`    Succès: ${stats.success}/${stats.total} (${stats.successRate})`);
      console.log(`    Première réponse:`);
      console.log(`      Moyenne: ${stats.firstResponse.avg}ms`);
      console.log(`      P50: ${stats.firstResponse.p50}ms`);
      console.log(`      P95: ${stats.firstResponse.p95}ms`);
      console.log(`      Max: ${stats.firstResponse.max}ms ${stats.validations.firstResponseTarget}`);
      console.log(`    Réponse complète:`);
      console.log(`      Moyenne: ${stats.totalResponse.avg}ms`);
      console.log(`      P50: ${stats.totalResponse.p50}ms`);
      console.log(`      P95: ${stats.totalResponse.p95}ms`);
      console.log(`    Streaming:`);
      console.log(`      Chunks moyens: ${stats.streaming.avgChunks}`);
      console.log(`    Validation: ${stats.validations.successRateTarget}`);
    });

    console.log('\n🏆 VALIDATION DES CRITÈRES:');
    let allCriteriaMet = true;
    Object.keys(report.methods).forEach(method => {
      const validations = report.methods[method].validations;
      const passed = Object.values(validations).every(v => v === '✅');
      console.log(`  ${method}: ${passed ? '✅ CONFORME' : '❌ NON CONFORME'}`);
      if (!passed) allCriteriaMet = false;
    });

    console.log(`\n🎯 RÉSULTAT GLOBAL: ${allCriteriaMet ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
    console.log('='.repeat(80));
  }
}

// Exécution du test
async function runStreamingTest() {
  try {
    console.log('🔧 Vérification de la disponibilité du backend...');
    await axios.get(`${BASE_URL}/ping`);
    console.log('✅ Backend disponible');

    const tester = new StreamingPerformanceTest();
    const results = await tester.testConcurrentStreaming();
    const report = tester.generateStreamingReport(results);
    
    tester.printStreamingReport(report);
    
    // Sauvegarde du rapport
    const fs = require('fs');
    const reportPath = './tests/reports/streaming-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);

    // Code de sortie selon le résultat
    const success = Object.values(report.methods).every(method => 
      Object.values(method.validations).every(v => v === '✅')
    );
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Erreur lors du test streaming:', error.message);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runStreamingTest();
}

module.exports = {
  StreamingPerformanceTest,
  runStreamingTest
};