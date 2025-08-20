/**
 * TICKET-PERFORMANCE-001 - Tests E2E Parcours Utilisateur
 * Tests end-to-end du parcours utilisateur complet
 * Scénario: Login → Dashboard → IA Chat → Session save → Logout
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3001';
const TENANT_SLUG = 'demo-company';
const JOURNEY_TARGET = 10000; // 10s max pour parcours complet
const STEP_TARGET = 2000; // 2s max par étape

// Configuration du test
const TEST_CONFIG = {
  user: {
    email: 'admin@demo-company.com',
    password: 'admin123'
  },
  chatPrompts: [
    'Bonjour, pouvez-vous m\'expliquer les fonctionnalités principales de WikiPro?',
    'Comment puis-je organiser mes documents dans WikiPro?',
    'Quels sont les avantages de l\'IA intégrée?',
    'Comment collaborer efficacement avec mon équipe?',
    'Pouvez-vous me donner des conseils pour optimiser mes recherches?'
  ]
};

class UserJourneyTest {
  constructor() {
    this.results = [];
    this.sessionData = {
      authToken: null,
      sessionId: null,
      conversationIds: [],
      userProfile: null
    };
  }

  async step1_Login() {
    const stepName = 'Login';
    const startTime = performance.now();
    
    try {
      console.log('🔐 Étape 1: Authentification...');
      
      const response = await axios.post(`${BASE_URL}/api/auth/login`, TEST_CONFIG.user);
      const endTime = performance.now();
      
      if (response.data.access_token) {
        this.sessionData.authToken = response.data.access_token;
        this.sessionData.userProfile = response.data.user;
      }
      
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: !!response.data.access_token,
        statusCode: response.status,
        details: {
          tokenReceived: !!response.data.access_token,
          userInfo: !!response.data.user
        }
      };
      
      console.log(`  ✅ ${stepName}: ${Math.round(result.responseTime)}ms`);
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
      
      console.log(`  ❌ ${stepName}: ${Math.round(result.responseTime)}ms - ${error.message}`);
      return result;
    }
  }

  async step2_VerifyToken() {
    const stepName = 'Verify Token';
    const startTime = performance.now();
    
    try {
      console.log('🎫 Étape 2: Vérification du token...');
      
      const response = await axios.get(`${BASE_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${this.sessionData.authToken}` }
      });
      const endTime = performance.now();
      
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status,
        details: {
          tokenValid: response.status === 200
        }
      };
      
      console.log(`  ✅ ${stepName}: ${Math.round(result.responseTime)}ms`);
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
      
      console.log(`  ❌ ${stepName}: ${Math.round(result.responseTime)}ms - ${error.message}`);
      return result;
    }
  }

  async step3_AccessDashboard() {
    const stepName = 'Dashboard Access';
    const startTime = performance.now();
    
    try {
      console.log('📊 Étape 3: Accès au dashboard...');
      
      // Simulation d'accès aux données du dashboard
      const [sessionsResponse, healthResponse, telemetryResponse] = await Promise.all([
        axios.get(`${BASE_URL}/api/v1/${TENANT_SLUG}/sessions`, {
          headers: { Authorization: `Bearer ${this.sessionData.authToken}` }
        }),
        axios.get(`${BASE_URL}/api/v1/${TENANT_SLUG}/ai/health`, {
          headers: { Authorization: `Bearer ${this.sessionData.authToken}` }
        }),
        axios.get(`${BASE_URL}/telemetry/health`)
      ]);
      
      const endTime = performance.now();
      
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: sessionsResponse.status === 200 && healthResponse.status === 200,
        statusCode: 200,
        details: {
          sessionsLoaded: Array.isArray(sessionsResponse.data) ? sessionsResponse.data.length : 0,
          aiHealthy: healthResponse.status === 200,
          telemetryHealthy: telemetryResponse.status === 200
        }
      };
      
      console.log(`  ✅ ${stepName}: ${Math.round(result.responseTime)}ms - ${result.details.sessionsLoaded} sessions`);
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
      
      console.log(`  ❌ ${stepName}: ${Math.round(result.responseTime)}ms - ${error.message}`);
      return result;
    }
  }

  async step4_CreateSession() {
    const stepName = 'Create Session';
    const startTime = performance.now();
    
    try {
      console.log('📝 Étape 4: Création d\'une session...');
      
      const response = await axios.post(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions`,
        {
          title: `Test Journey Session ${new Date().toISOString()}`,
          description: 'Session créée pendant le test de parcours utilisateur',
          model: 'openai'
        },
        { headers: { Authorization: `Bearer ${this.sessionData.authToken}` } }
      );
      
      const endTime = performance.now();
      
      if (response.data?.id) {
        this.sessionData.sessionId = response.data.id;
      }
      
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: response.status === 201,
        statusCode: response.status,
        details: {
          sessionId: response.data?.id,
          sessionCreated: !!response.data?.id
        }
      };
      
      console.log(`  ✅ ${stepName}: ${Math.round(result.responseTime)}ms - ID: ${response.data?.id}`);
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
      
      console.log(`  ❌ ${stepName}: ${Math.round(result.responseTime)}ms - ${error.message}`);
      return result;
    }
  }

  async step5_ChatInteraction() {
    const stepName = 'AI Chat Interaction';
    const startTime = performance.now();
    
    try {
      console.log('💬 Étape 5: Interaction avec l\'IA...');
      
      const prompt = TEST_CONFIG.chatPrompts[Math.floor(Math.random() * TEST_CONFIG.chatPrompts.length)];
      
      const response = await axios.post(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/ai/chat`,
        {
          message: prompt,
          model: 'openai',
          stream: false, // Mode non-streaming pour simplifier le test E2E
          session_id: this.sessionData.sessionId
        },
        { 
          headers: { Authorization: `Bearer ${this.sessionData.authToken}` },
          timeout: 30000 // 30s timeout pour l'IA
        }
      );
      
      const endTime = performance.now();
      
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status,
        details: {
          prompt: prompt.substring(0, 50) + '...',
          responseReceived: !!response.data?.response,
          model: response.data?.model || 'unknown',
          tokensUsed: response.data?.tokens_used || 0
        }
      };
      
      console.log(`  ✅ ${stepName}: ${Math.round(result.responseTime)}ms - ${result.details.tokensUsed} tokens`);
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
      
      console.log(`  ❌ ${stepName}: ${Math.round(result.responseTime)}ms - ${error.message}`);
      return result;
    }
  }

  async step6_SaveConversation() {
    const stepName = 'Save Conversation';
    const startTime = performance.now();
    
    try {
      console.log('💾 Étape 6: Sauvegarde de la conversation...');
      
      const response = await axios.post(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions/${this.sessionData.sessionId}/conversations`,
        {
          user_message: 'Message de test pour parcours utilisateur',
          ai_response: 'Réponse de test sauvegardée',
          model: 'openai',
          tokens_used: 45,
          metadata: {
            test: true,
            journey: 'user-e2e-test'
          }
        },
        { headers: { Authorization: `Bearer ${this.sessionData.authToken}` } }
      );
      
      const endTime = performance.now();
      
      if (response.data?.id) {
        this.sessionData.conversationIds.push(response.data.id);
      }
      
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: response.status === 201,
        statusCode: response.status,
        details: {
          conversationId: response.data?.id,
          conversationSaved: !!response.data?.id
        }
      };
      
      console.log(`  ✅ ${stepName}: ${Math.round(result.responseTime)}ms - ID: ${response.data?.id}`);
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
      
      console.log(`  ❌ ${stepName}: ${Math.round(result.responseTime)}ms - ${error.message}`);
      return result;
    }
  }

  async step7_LoadConversations() {
    const stepName = 'Load Conversations';
    const startTime = performance.now();
    
    try {
      console.log('📚 Étape 7: Chargement des conversations...');
      
      const response = await axios.get(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions/${this.sessionData.sessionId}/conversations`,
        { headers: { Authorization: `Bearer ${this.sessionData.authToken}` } }
      );
      
      const endTime = performance.now();
      
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status,
        details: {
          conversationsCount: Array.isArray(response.data) ? response.data.length : 0,
          conversationsLoaded: response.status === 200
        }
      };
      
      console.log(`  ✅ ${stepName}: ${Math.round(result.responseTime)}ms - ${result.details.conversationsCount} conversations`);
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
      
      console.log(`  ❌ ${stepName}: ${Math.round(result.responseTime)}ms - ${error.message}`);
      return result;
    }
  }

  async step8_UpdateSession() {
    const stepName = 'Update Session';
    const startTime = performance.now();
    
    try {
      console.log('✏️ Étape 8: Mise à jour de la session...');
      
      const response = await axios.put(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions/${this.sessionData.sessionId}`,
        {
          title: `Updated Test Journey Session ${new Date().toISOString()}`,
          description: 'Session mise à jour pendant le test de parcours utilisateur'
        },
        { headers: { Authorization: `Bearer ${this.sessionData.authToken}` } }
      );
      
      const endTime = performance.now();
      
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status,
        details: {
          sessionUpdated: response.status === 200
        }
      };
      
      console.log(`  ✅ ${stepName}: ${Math.round(result.responseTime)}ms`);
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
      
      console.log(`  ❌ ${stepName}: ${Math.round(result.responseTime)}ms - ${error.message}`);
      return result;
    }
  }

  async step9_Cleanup() {
    const stepName = 'Cleanup';
    const startTime = performance.now();
    
    try {
      console.log('🧹 Étape 9: Nettoyage...');
      
      // Suppression de la session (cascade sur les conversations)
      const response = await axios.delete(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions/${this.sessionData.sessionId}`,
        { headers: { Authorization: `Bearer ${this.sessionData.authToken}` } }
      );
      
      const endTime = performance.now();
      
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status,
        details: {
          sessionDeleted: response.status === 200
        }
      };
      
      console.log(`  ✅ ${stepName}: ${Math.round(result.responseTime)}ms`);
      return result;
      
    } catch (error) {
      const endTime = performance.now();
      const result = {
        step: stepName,
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
      
      console.log(`  ❌ ${stepName}: ${Math.round(result.responseTime)}ms - ${error.message}`);
      return result;
    }
  }

  async runCompleteJourney() {
    console.log('🚀 Démarrage du parcours utilisateur complet...');
    console.log(`📊 Objectifs: Parcours < ${JOURNEY_TARGET}ms, étapes < ${STEP_TARGET}ms`);
    
    const journeyStartTime = performance.now();
    const steps = [];
    
    // Exécution séquentielle des étapes
    steps.push(await this.step1_Login());
    if (!steps[0].success) return { journeySuccess: false, steps, totalTime: performance.now() - journeyStartTime };
    
    steps.push(await this.step2_VerifyToken());
    if (!steps[1].success) return { journeySuccess: false, steps, totalTime: performance.now() - journeyStartTime };
    
    steps.push(await this.step3_AccessDashboard());
    steps.push(await this.step4_CreateSession());
    if (!steps[3].success) return { journeySuccess: false, steps, totalTime: performance.now() - journeyStartTime };
    
    steps.push(await this.step5_ChatInteraction());
    steps.push(await this.step6_SaveConversation());
    steps.push(await this.step7_LoadConversations());
    steps.push(await this.step8_UpdateSession());
    steps.push(await this.step9_Cleanup());
    
    const journeyEndTime = performance.now();
    const totalTime = journeyEndTime - journeyStartTime;
    
    const journeySuccess = steps.every(step => step.success);
    
    return {
      journeySuccess,
      totalTime,
      steps
    };
  }

  generateJourneyReport(journeyResult) {
    const { journeySuccess, totalTime, steps } = journeyResult;
    
    const report = {
      summary: {
        totalTime: Math.round(totalTime),
        journeySuccess,
        stepsPassed: steps.filter(s => s.success).length,
        stepsTotal: steps.length,
        successRate: ((steps.filter(s => s.success).length / steps.length) * 100).toFixed(2) + '%'
      },
      steps: {},
      validations: {
        totalTimeTarget: totalTime <= JOURNEY_TARGET ? '✅' : '❌',
        allStepsSuccess: journeySuccess ? '✅' : '❌'
      }
    };

    // Analyse par étape
    steps.forEach(step => {
      report.steps[step.step] = {
        responseTime: Math.round(step.responseTime),
        success: step.success,
        statusCode: step.statusCode,
        details: step.details || {},
        validation: step.responseTime <= STEP_TARGET ? '✅' : '❌'
      };
      
      if (step.error) {
        report.steps[step.step].error = step.error;
      }
    });

    return report;
  }

  printJourneyReport(report) {
    console.log('\n' + '='.repeat(80));
    console.log('👤 RAPPORT DE PERFORMANCE - PARCOURS UTILISATEUR E2E');
    console.log('='.repeat(80));
    
    console.log('\n📈 RÉSUMÉ DU PARCOURS:');
    console.log(`  • Durée totale: ${report.summary.totalTime}ms`);
    console.log(`  • Succès parcours: ${report.summary.journeySuccess ? 'OUI' : 'NON'}`);
    console.log(`  • Étapes réussies: ${report.summary.stepsPassed}/${report.summary.stepsTotal}`);
    console.log(`  • Taux de succès: ${report.summary.successRate}`);

    console.log('\n📝 DÉTAIL PAR ÉTAPE:');
    Object.keys(report.steps).forEach((stepName, index) => {
      const step = report.steps[stepName];
      console.log(`\n  ${index + 1}. ${stepName}:`);
      console.log(`    Temps: ${step.responseTime}ms ${step.validation}`);
      console.log(`    Statut: ${step.success ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
      console.log(`    Code HTTP: ${step.statusCode}`);
      
      if (step.details && Object.keys(step.details).length > 0) {
        console.log(`    Détails:`);
        Object.keys(step.details).forEach(key => {
          console.log(`      ${key}: ${step.details[key]}`);
        });
      }
      
      if (step.error) {
        console.log(`    Erreur: ${step.error}`);
      }
    });

    console.log('\n🏆 VALIDATION DES CRITÈRES:');
    console.log(`  Temps total (< ${JOURNEY_TARGET}ms): ${report.validations.totalTimeTarget}`);
    console.log(`  Toutes étapes réussies: ${report.validations.allStepsSuccess}`);
    
    const allStepsValidTime = Object.values(report.steps).every(step => step.validation === '✅');
    console.log(`  Toutes étapes (< ${STEP_TARGET}ms): ${allStepsValidTime ? '✅' : '❌'}`);

    const globalSuccess = report.validations.totalTimeTarget === '✅' && 
                         report.validations.allStepsSuccess === '✅' && 
                         allStepsValidTime;
    
    console.log(`\n🎯 RÉSULTAT GLOBAL: ${globalSuccess ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
    console.log('='.repeat(80));
  }
}

// Exécution du test
async function runUserJourneyTest() {
  try {
    console.log('🔧 Vérification de la disponibilité du backend...');
    await axios.get(`${BASE_URL}/ping`);
    console.log('✅ Backend disponible');

    const tester = new UserJourneyTest();
    const result = await tester.runCompleteJourney();
    const report = tester.generateJourneyReport(result);
    
    tester.printJourneyReport(report);
    
    // Sauvegarde du rapport
    const fs = require('fs');
    const reportPath = './tests/reports/user-journey-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);

    // Code de sortie selon le résultat
    const success = report.validations.totalTimeTarget === '✅' && 
                   report.validations.allStepsSuccess === '✅';
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Erreur lors du test parcours utilisateur:', error.message);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runUserJourneyTest();
}

module.exports = {
  UserJourneyTest,
  runUserJourneyTest
};