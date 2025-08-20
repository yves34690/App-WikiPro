/**
 * TICKET-PERFORMANCE-001 - Tests E2E Providers IA
 * Tests fallback multi-providers et résilience
 * Objectif: Fallback < 2s, résilience système
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3001';
const TENANT_SLUG = 'demo-company';
const FALLBACK_TARGET = 2000; // 2s max pour fallback
const PROVIDER_RESPONSE_TARGET = 5000; // 5s max par provider

// Configuration des providers
const AI_PROVIDERS = ['openai', 'anthropic', 'gemini'];
const TEST_CONFIG = {
  auth: {
    email: 'admin@demo-company.com',
    password: 'admin123'
  },
  testPrompts: [
    'Test de fonctionnement du provider IA',
    'Vérification de la disponibilité du service',
    'Test de performance et latence',
    'Contrôle qualité des réponses'
  ]
};

class AIProvidersTest {
  constructor() {
    this.authToken = null;
    this.results = [];
    this.sessionId = null;
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

  async createTestSession() {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions`,
        {
          title: `AI Providers Test Session ${new Date().toISOString()}`,
          description: 'Session de test pour providers IA',
          model: 'openai'
        },
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );
      
      if (response.data?.id) {
        this.sessionId = response.data.id;
        return true;
      }
    } catch (error) {
      console.error('❌ Création session échouée:', error.message);
    }
    return false;
  }

  async testProviderAvailability(provider) {
    const startTime = performance.now();
    
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/${TENANT_SLUG}/ai/health`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      
      const endTime = performance.now();
      
      // Vérifier si le provider est dans la réponse health
      const providersStatus = response.data?.providers || {};
      const providerStatus = providersStatus[provider] || { available: false };
      
      return {
        provider,
        operation: 'health_check',
        responseTime: endTime - startTime,
        success: response.status === 200,
        available: providerStatus.available,
        statusCode: response.status,
        details: providerStatus
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        provider,
        operation: 'health_check',
        responseTime: endTime - startTime,
        success: false,
        available: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
    }
  }

  async testProviderChat(provider, prompt) {
    const startTime = performance.now();
    
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/ai/chat`,
        {
          message: prompt,
          model: provider,
          stream: false,
          session_id: this.sessionId
        },
        { 
          headers: { Authorization: `Bearer ${this.authToken}` },
          timeout: PROVIDER_RESPONSE_TARGET + 1000 // Légèrement plus que la cible
        }
      );
      
      const endTime = performance.now();
      
      return {
        provider,
        operation: 'chat',
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status,
        details: {
          responseReceived: !!response.data?.response,
          model: response.data?.model || provider,
          tokensUsed: response.data?.tokens_used || 0,
          responseLength: response.data?.response?.length || 0
        }
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        provider,
        operation: 'chat',
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message,
        details: {
          responseReceived: false,
          model: provider,
          tokensUsed: 0,
          responseLength: 0
        }
      };
    }
  }

  async testProviderFallback(primaryProvider, fallbackProvider, prompt) {
    const startTime = performance.now();
    
    try {
      // Premier essai avec le provider principal
      console.log(`  🔄 Test fallback: ${primaryProvider} → ${fallbackProvider}`);
      
      let response = await axios.post(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/ai/chat`,
        {
          message: prompt,
          model: primaryProvider,
          stream: false,
          session_id: this.sessionId,
          fallback_enabled: true
        },
        { 
          headers: { Authorization: `Bearer ${this.authToken}` },
          timeout: FALLBACK_TARGET + PROVIDER_RESPONSE_TARGET
        }
      );
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Vérifier si un fallback a eu lieu
      const actualProvider = response.data?.model || primaryProvider;
      const fallbackOccurred = actualProvider !== primaryProvider;
      
      return {
        primaryProvider,
        fallbackProvider,
        actualProvider,
        operation: 'fallback_test',
        responseTime: totalTime,
        success: response.status === 200,
        fallbackOccurred,
        statusCode: response.status,
        details: {
          responseReceived: !!response.data?.response,
          tokensUsed: response.data?.tokens_used || 0,
          responseLength: response.data?.response?.length || 0,
          fallbackTime: fallbackOccurred ? totalTime : 0
        }
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        primaryProvider,
        fallbackProvider,
        actualProvider: 'none',
        operation: 'fallback_test',
        responseTime: endTime - startTime,
        success: false,
        fallbackOccurred: false,
        statusCode: error.response?.status || 0,
        error: error.message,
        details: {
          responseReceived: false,
          tokensUsed: 0,
          responseLength: 0,
          fallbackTime: 0
        }
      };
    }
  }

  async testProviderStats() {
    const startTime = performance.now();
    
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/${TENANT_SLUG}/ai/stats`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      
      const endTime = performance.now();
      
      return {
        operation: 'provider_stats',
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status,
        details: response.data || {}
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        operation: 'provider_stats',
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message,
        details: {}
      };
    }
  }

  async runProvidersTest() {
    console.log('🚀 Test des providers IA et mécanismes de fallback...');
    console.log(`📊 Objectifs: Fallback < ${FALLBACK_TARGET}ms, réponse < ${PROVIDER_RESPONSE_TARGET}ms`);

    if (!await this.authenticate()) {
      throw new Error('Impossible de s\'authentifier');
    }

    if (!await this.createTestSession()) {
      throw new Error('Impossible de créer une session de test');
    }

    const allResults = [];

    // Phase 1: Test de disponibilité des providers
    console.log('🔍 Phase 1: Vérification disponibilité providers...');
    for (const provider of AI_PROVIDERS) {
      const healthResult = await this.testProviderAvailability(provider);
      allResults.push(healthResult);
      console.log(`  ${provider}: ${healthResult.available ? '✅ Disponible' : '❌ Indisponible'} (${Math.round(healthResult.responseTime)}ms)`);
    }

    // Phase 2: Test de performance par provider
    console.log('\n⚡ Phase 2: Test performance par provider...');
    const availableProviders = allResults.filter(r => r.available).map(r => r.provider);
    
    for (const provider of availableProviders) {
      const prompt = TEST_CONFIG.testPrompts[Math.floor(Math.random() * TEST_CONFIG.testPrompts.length)];
      const chatResult = await this.testProviderChat(provider, prompt);
      allResults.push(chatResult);
      
      const status = chatResult.success ? '✅' : '❌';
      const tokens = chatResult.details?.tokensUsed || 0;
      console.log(`  ${provider}: ${status} ${Math.round(chatResult.responseTime)}ms (${tokens} tokens)`);
    }

    // Phase 3: Test des mécanismes de fallback
    console.log('\n🔄 Phase 3: Test mécanismes fallback...');
    if (availableProviders.length >= 2) {
      // Test fallback entre providers disponibles
      for (let i = 0; i < availableProviders.length - 1; i++) {
        const primary = availableProviders[i];
        const fallback = availableProviders[i + 1];
        const prompt = TEST_CONFIG.testPrompts[i % TEST_CONFIG.testPrompts.length];
        
        const fallbackResult = await this.testProviderFallback(primary, fallback, prompt);
        allResults.push(fallbackResult);
        
        const status = fallbackResult.success ? '✅' : '❌';
        const fallbackInfo = fallbackResult.fallbackOccurred ? 
          `(fallback vers ${fallbackResult.actualProvider})` : '(pas de fallback)';
        console.log(`  ${primary}→${fallback}: ${status} ${Math.round(fallbackResult.responseTime)}ms ${fallbackInfo}`);
      }
    } else {
      console.log('  ⚠️ Pas assez de providers disponibles pour tester le fallback');
    }

    // Phase 4: Test statistiques providers
    console.log('\n📊 Phase 4: Récupération statistiques...');
    const statsResult = await this.testProviderStats();
    allResults.push(statsResult);
    console.log(`  Statistiques: ${statsResult.success ? '✅' : '❌'} (${Math.round(statsResult.responseTime)}ms)`);

    // Phase 5: Nettoyage
    console.log('\n🧹 Phase 5: Nettoyage...');
    try {
      await axios.delete(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions/${this.sessionId}`,
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );
      console.log('  ✅ Session de test supprimée');
    } catch (error) {
      console.log('  ⚠️ Erreur suppression session:', error.message);
    }

    return allResults;
  }

  generateProvidersReport(results) {
    // Groupement par type d'opération
    const operationGroups = {
      health_check: [],
      chat: [],
      fallback_test: [],
      provider_stats: []
    };

    results.forEach(result => {
      if (operationGroups[result.operation]) {
        operationGroups[result.operation].push(result);
      }
    });

    const report = {
      summary: {
        totalTests: results.length,
        providersTestedCount: AI_PROVIDERS.length,
        availableProviders: operationGroups.health_check.filter(r => r.available).length,
        overallSuccessRate: ((results.filter(r => r.success).length / results.length) * 100).toFixed(2) + '%'
      },
      availability: {},
      performance: {},
      fallback: {},
      validations: {}
    };

    // Analyse disponibilité
    operationGroups.health_check.forEach(result => {
      report.availability[result.provider] = {
        available: result.available,
        responseTime: Math.round(result.responseTime),
        success: result.success,
        details: result.details || {}
      };
    });

    // Analyse performance
    operationGroups.chat.forEach(result => {
      const responseTimes = [result.responseTime];
      report.performance[result.provider] = {
        responseTime: Math.round(result.responseTime),
        success: result.success,
        details: result.details || {},
        validation: result.responseTime <= PROVIDER_RESPONSE_TARGET ? '✅' : '❌'
      };
    });

    // Analyse fallback
    if (operationGroups.fallback_test.length > 0) {
      const fallbackTests = operationGroups.fallback_test;
      const successfulFallbacks = fallbackTests.filter(r => r.success);
      const fallbacksOccurred = fallbackTests.filter(r => r.fallbackOccurred);
      
      report.fallback = {
        testsCount: fallbackTests.length,
        successfulTests: successfulFallbacks.length,
        fallbacksOccurred: fallbacksOccurred.length,
        averageFallbackTime: fallbacksOccurred.length > 0 ? 
          Math.round(fallbacksOccurred.reduce((sum, r) => sum + r.responseTime, 0) / fallbacksOccurred.length) : 0,
        maxFallbackTime: fallbacksOccurred.length > 0 ? 
          Math.round(Math.max(...fallbacksOccurred.map(r => r.responseTime))) : 0,
        tests: fallbackTests.map(test => ({
          primary: test.primaryProvider,
          fallback: test.fallbackProvider,
          actual: test.actualProvider,
          responseTime: Math.round(test.responseTime),
          success: test.success,
          fallbackOccurred: test.fallbackOccurred,
          validation: test.responseTime <= FALLBACK_TARGET ? '✅' : '❌'
        }))
      };
    }

    // Statistiques globales
    if (operationGroups.provider_stats.length > 0) {
      const statsResult = operationGroups.provider_stats[0];
      report.statistics = {
        success: statsResult.success,
        responseTime: Math.round(statsResult.responseTime),
        data: statsResult.details
      };
    }

    // Validations finales
    const availabilityValid = report.summary.availableProviders >= 2;
    const performanceValid = Object.values(report.performance).every(p => p.validation === '✅');
    const fallbackValid = report.fallback.tests ? 
      report.fallback.tests.every(t => t.validation === '✅') : true;

    report.validations = {
      minimumProviders: availabilityValid ? '✅' : '❌',
      performanceTargets: performanceValid ? '✅' : '❌',
      fallbackTargets: fallbackValid ? '✅' : '❌',
      overallHealth: (availabilityValid && performanceValid && fallbackValid) ? '✅' : '❌'
    };

    return report;
  }

  printProvidersReport(report) {
    console.log('\n' + '='.repeat(80));
    console.log('🤖 RAPPORT DE PERFORMANCE - PROVIDERS IA & FALLBACK');
    console.log('='.repeat(80));
    
    console.log('\n📈 RÉSUMÉ GÉNÉRAL:');
    console.log(`  • Tests totaux: ${report.summary.totalTests}`);
    console.log(`  • Providers testés: ${report.summary.providersTestedCount}`);
    console.log(`  • Providers disponibles: ${report.summary.availableProviders}`);
    console.log(`  • Taux de succès global: ${report.summary.overallSuccessRate}`);

    console.log('\n🔍 DISPONIBILITÉ DES PROVIDERS:');
    Object.keys(report.availability).forEach(provider => {
      const info = report.availability[provider];
      const status = info.available ? '✅ DISPONIBLE' : '❌ INDISPONIBLE';
      console.log(`  ${provider}: ${status} (${info.responseTime}ms)`);
    });

    console.log('\n⚡ PERFORMANCE PAR PROVIDER:');
    Object.keys(report.performance).forEach(provider => {
      const perf = report.performance[provider];
      const status = perf.success ? '✅' : '❌';
      const tokens = perf.details.tokensUsed || 0;
      console.log(`  ${provider}: ${status} ${perf.responseTime}ms (${tokens} tokens) ${perf.validation}`);
    });

    if (report.fallback && report.fallback.tests && report.fallback.tests.length > 0) {
      console.log('\n🔄 TESTS DE FALLBACK:');
      console.log(`  • Tests réalisés: ${report.fallback.testsCount}`);
      console.log(`  • Tests réussis: ${report.fallback.successfulTests}`);
      console.log(`  • Fallbacks déclenchés: ${report.fallback.fallbacksOccurred}`);
      console.log(`  • Temps moyen fallback: ${report.fallback.averageFallbackTime}ms`);
      console.log(`  • Temps max fallback: ${report.fallback.maxFallbackTime}ms`);
      
      console.log('\n  Détail des tests:');
      report.fallback.tests.forEach(test => {
        const status = test.success ? '✅' : '❌';
        const fallbackInfo = test.fallbackOccurred ? `→ ${test.actual}` : '(direct)';
        console.log(`    ${test.primary} ${fallbackInfo}: ${status} ${test.responseTime}ms ${test.validation}`);
      });
    }

    if (report.statistics) {
      console.log('\n📊 STATISTIQUES SYSTÈME:');
      console.log(`  • Récupération: ${report.statistics.success ? '✅' : '❌'} (${report.statistics.responseTime}ms)`);
      if (report.statistics.data && Object.keys(report.statistics.data).length > 0) {
        console.log(`  • Données disponibles: ${Object.keys(report.statistics.data).length} métriques`);
      }
    }

    console.log('\n🏆 VALIDATION DES CRITÈRES:');
    console.log(`  Providers minimum (≥ 2): ${report.validations.minimumProviders}`);
    console.log(`  Performance (< ${PROVIDER_RESPONSE_TARGET}ms): ${report.validations.performanceTargets}`);
    console.log(`  Fallback (< ${FALLBACK_TARGET}ms): ${report.validations.fallbackTargets}`);

    console.log(`\n🎯 RÉSULTAT GLOBAL: ${report.validations.overallHealth}`);
    console.log('='.repeat(80));
  }
}

// Exécution du test
async function runAIProvidersTest() {
  try {
    console.log('🔧 Vérification de la disponibilité du backend...');
    await axios.get(`${BASE_URL}/ping`);
    console.log('✅ Backend disponible');

    const tester = new AIProvidersTest();
    const results = await tester.runProvidersTest();
    const report = tester.generateProvidersReport(results);
    
    tester.printProvidersReport(report);
    
    // Sauvegarde du rapport
    const fs = require('fs');
    const reportPath = './tests/reports/ai-providers-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);

    // Code de sortie selon le résultat
    const success = report.validations.overallHealth === '✅';
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Erreur lors du test providers IA:', error.message);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runAIProvidersTest();
}

module.exports = {
  AIProvidersTest,
  runAIProvidersTest
};