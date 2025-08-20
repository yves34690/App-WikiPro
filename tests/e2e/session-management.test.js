/**
 * TICKET-PERFORMANCE-001 - Tests E2E Gestion Sessions
 * Tests sessions persistantes et gestion état
 * Objectif: Persistance, récupération, isolation tenant
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3001';
const TENANT_SLUG = 'demo-company';
const SESSION_TARGET = 1000; // 1s max pour opérations session
const PERSISTENCE_TARGET = 500; // 500ms pour récupération

// Configuration du test
const TEST_CONFIG = {
  auth: {
    email: 'admin@demo-company.com',
    password: 'admin123'
  },
  sessionScenarios: [
    {
      title: 'Session Analyse Concurrentielle',
      description: 'Analyse de la concurrence et positionnement marché',
      conversations: [
        { user: 'Analyse les principaux concurrents', ai: 'Voici l\'analyse concurrentielle détaillée...' },
        { user: 'Recommandations stratégiques', ai: 'Basé sur cette analyse, je recommande...' }
      ]
    },
    {
      title: 'Session Formation IA',
      description: 'Formation et accompagnement équipe sur l\'IA',
      conversations: [
        { user: 'Processus d\'intégration IA', ai: 'Le processus comprend plusieurs étapes...' },
        { user: 'Bonnes pratiques', ai: 'Les bonnes pratiques incluent...' }
      ]
    },
    {
      title: 'Session Audit Processus',
      description: 'Audit des processus internes',
      conversations: [
        { user: 'Identification des inefficacités', ai: 'J\'ai identifié plusieurs axes d\'amélioration...' },
        { user: 'Plan d\'action', ai: 'Voici le plan d\'action recommandé...' }
      ]
    }
  ]
};

class SessionManagementTest {
  constructor() {
    this.authToken = null;
    this.createdSessions = [];
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

  async testSessionCreation(scenario) {
    const startTime = performance.now();
    
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions`,
        {
          title: scenario.title,
          description: scenario.description,
          model: 'openai',
          metadata: {
            test: true,
            scenario: scenario.title,
            createdAt: new Date().toISOString()
          }
        },
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );
      
      const endTime = performance.now();
      
      if (response.data?.id) {
        this.createdSessions.push({
          id: response.data.id,
          scenario: scenario.title,
          conversations: []
        });
      }
      
      return {
        operation: 'session_create',
        scenario: scenario.title,
        responseTime: endTime - startTime,
        success: response.status === 201,
        statusCode: response.status,
        sessionId: response.data?.id,
        details: {
          sessionCreated: !!response.data?.id,
          title: response.data?.title
        }
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        operation: 'session_create',
        scenario: scenario.title,
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
    }
  }

  async testConversationPersistence(sessionId, conversation, index) {
    const startTime = performance.now();
    
    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions/${sessionId}/conversations`,
        {
          user_message: conversation.user,
          ai_response: conversation.ai,
          model: 'openai',
          tokens_used: 50 + (index * 10),
          metadata: {
            test: true,
            conversationIndex: index,
            timestamp: new Date().toISOString()
          }
        },
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );
      
      const endTime = performance.now();
      
      // Enregistrer l'ID de conversation créée
      const sessionRecord = this.createdSessions.find(s => s.id === sessionId);
      if (sessionRecord && response.data?.id) {
        sessionRecord.conversations.push(response.data.id);
      }
      
      return {
        operation: 'conversation_persist',
        sessionId,
        conversationIndex: index,
        responseTime: endTime - startTime,
        success: response.status === 201,
        statusCode: response.status,
        conversationId: response.data?.id,
        details: {
          conversationSaved: !!response.data?.id,
          userMessage: conversation.user.substring(0, 30) + '...',
          aiResponse: conversation.ai.substring(0, 30) + '...'
        }
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        operation: 'conversation_persist',
        sessionId,
        conversationIndex: index,
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
    }
  }

  async testSessionRecovery(sessionId) {
    const startTime = performance.now();
    
    try {
      // Récupération de la session
      const sessionResponse = await axios.get(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions`,
        { 
          headers: { Authorization: `Bearer ${this.authToken}` },
          params: { limit: 100 } // S'assurer de récupérer toutes les sessions
        }
      );
      
      // Recherche de la session spécifique
      const sessions = sessionResponse.data || [];
      const targetSession = sessions.find(s => s.id === sessionId);
      
      if (!targetSession) {
        throw new Error('Session non trouvée dans la liste');
      }
      
      // Récupération des conversations
      const conversationsResponse = await axios.get(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions/${sessionId}/conversations`,
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );
      
      const endTime = performance.now();
      
      return {
        operation: 'session_recovery',
        sessionId,
        responseTime: endTime - startTime,
        success: sessionResponse.status === 200 && conversationsResponse.status === 200,
        statusCode: sessionResponse.status,
        details: {
          sessionFound: !!targetSession,
          sessionTitle: targetSession?.title,
          conversationsCount: Array.isArray(conversationsResponse.data) ? conversationsResponse.data.length : 0,
          sessionData: {
            id: targetSession?.id,
            title: targetSession?.title,
            description: targetSession?.description,
            createdAt: targetSession?.created_at
          }
        }
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        operation: 'session_recovery',
        sessionId,
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message,
        details: {
          sessionFound: false,
          conversationsCount: 0
        }
      };
    }
  }

  async testSessionUpdate(sessionId, scenario) {
    const startTime = performance.now();
    
    try {
      const updatedTitle = `${scenario} - Modifiée ${new Date().getTime()}`;
      const updatedDescription = `Description mise à jour: ${scenario}`;
      
      const response = await axios.put(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions/${sessionId}`,
        {
          title: updatedTitle,
          description: updatedDescription,
          metadata: {
            test: true,
            updated: true,
            updateTimestamp: new Date().toISOString()
          }
        },
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );
      
      const endTime = performance.now();
      
      return {
        operation: 'session_update',
        sessionId,
        scenario,
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status,
        details: {
          sessionUpdated: response.status === 200,
          newTitle: updatedTitle
        }
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        operation: 'session_update',
        sessionId,
        scenario,
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
        { 
          headers: { Authorization: `Bearer ${this.authToken}` },
          params: { limit: 100 }
        }
      );
      
      const endTime = performance.now();
      
      return {
        operation: 'sessions_list',
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status,
        details: {
          sessionsCount: Array.isArray(response.data) ? response.data.length : 0,
          sessionsData: response.data || []
        }
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        operation: 'sessions_list',
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message,
        details: {
          sessionsCount: 0,
          sessionsData: []
        }
      };
    }
  }

  async testSessionDeletion(sessionId, scenario) {
    const startTime = performance.now();
    
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/v1/${TENANT_SLUG}/sessions/${sessionId}`,
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );
      
      const endTime = performance.now();
      
      return {
        operation: 'session_delete',
        sessionId,
        scenario,
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status,
        details: {
          sessionDeleted: response.status === 200
        }
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        operation: 'session_delete',
        sessionId,
        scenario,
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
    }
  }

  async runSessionManagementTest() {
    console.log('🚀 Test gestion sessions et persistance...');
    console.log(`📊 Objectifs: Sessions < ${SESSION_TARGET}ms, récupération < ${PERSISTENCE_TARGET}ms`);

    if (!await this.authenticate()) {
      throw new Error('Impossible de s\'authentifier');
    }

    const allResults = [];

    // Phase 1: Création des sessions avec conversations
    console.log('📝 Phase 1: Création sessions et conversations...');
    for (const [index, scenario] of TEST_CONFIG.sessionScenarios.entries()) {
      console.log(`  Scénario ${index + 1}: ${scenario.title}`);
      
      // Création de la session
      const sessionResult = await this.testSessionCreation(scenario);
      allResults.push(sessionResult);
      
      if (sessionResult.success && sessionResult.sessionId) {
        // Ajout des conversations
        for (const [convIndex, conversation] of scenario.conversations.entries()) {
          const convResult = await this.testConversationPersistence(
            sessionResult.sessionId, 
            conversation, 
            convIndex
          );
          allResults.push(convResult);
        }
        
        console.log(`    ✅ Session créée avec ${scenario.conversations.length} conversations`);
      } else {
        console.log(`    ❌ Échec création session: ${sessionResult.error}`);
      }
    }

    // Phase 2: Test de récupération et persistance
    console.log('\n🔄 Phase 2: Test récupération sessions...');
    for (const sessionRecord of this.createdSessions) {
      const recoveryResult = await this.testSessionRecovery(sessionRecord.id);
      allResults.push(recoveryResult);
      
      const conversations = recoveryResult.details?.conversationsCount || 0;
      console.log(`  ${sessionRecord.scenario}: ${recoveryResult.success ? '✅' : '❌'} (${conversations} conversations)`);
    }

    // Phase 3: Test de modification
    console.log('\n✏️ Phase 3: Test modifications sessions...');
    for (const sessionRecord of this.createdSessions.slice(0, 2)) { // Seulement les 2 premières
      const updateResult = await this.testSessionUpdate(sessionRecord.id, sessionRecord.scenario);
      allResults.push(updateResult);
      
      console.log(`  Update ${sessionRecord.scenario}: ${updateResult.success ? '✅' : '❌'}`);
    }

    // Phase 4: Test liste complète
    console.log('\n📊 Phase 4: Test liste sessions...');
    const listResult = await this.testSessionsList();
    allResults.push(listResult);
    
    const totalSessions = listResult.details?.sessionsCount || 0;
    console.log(`  Liste sessions: ${listResult.success ? '✅' : '❌'} (${totalSessions} sessions)`);

    // Phase 5: Vérification cohérence
    console.log('\n🔍 Phase 5: Vérification cohérence...');
    const ourSessionsCount = this.createdSessions.length;
    const recoveredSessions = listResult.details?.sessionsData || [];
    const ourSessionsInList = recoveredSessions.filter(session => 
      this.createdSessions.some(created => created.id === session.id)
    ).length;
    
    console.log(`  Sessions créées: ${ourSessionsCount}`);
    console.log(`  Sessions retrouvées: ${ourSessionsInList}`);
    console.log(`  Cohérence: ${ourSessionsCount === ourSessionsInList ? '✅' : '❌'}`);

    // Phase 6: Nettoyage partiel (garder quelques sessions pour validation)
    console.log('\n🧹 Phase 6: Nettoyage partiel...');
    const sessionsToDelete = this.createdSessions.slice(0, 2); // Supprimer seulement les 2 premières
    
    for (const sessionRecord of sessionsToDelete) {
      const deleteResult = await this.testSessionDeletion(sessionRecord.id, sessionRecord.scenario);
      allResults.push(deleteResult);
      
      console.log(`  Suppression ${sessionRecord.scenario}: ${deleteResult.success ? '✅' : '❌'}`);
    }

    // Phase 7: Vérification suppression
    console.log('\n✅ Phase 7: Vérification suppressions...');
    const finalListResult = await this.testSessionsList();
    allResults.push(finalListResult);
    
    const finalSessionsCount = finalListResult.details?.sessionsCount || 0;
    const expectedRemaining = this.createdSessions.length - sessionsToDelete.length;
    
    console.log(`  Sessions restantes attendues: ${expectedRemaining}`);
    console.log(`  Sessions actuelles: ${finalSessionsCount}`);

    return allResults;
  }

  generateSessionReport(results) {
    // Groupement par opération
    const operationGroups = {
      session_create: [],
      conversation_persist: [],
      session_recovery: [],
      session_update: [],
      sessions_list: [],
      session_delete: []
    };

    results.forEach(result => {
      if (operationGroups[result.operation]) {
        operationGroups[result.operation].push(result);
      }
    });

    const report = {
      summary: {
        totalOperations: results.length,
        successfulOperations: results.filter(r => r.success).length,
        overallSuccessRate: ((results.filter(r => r.success).length / results.length) * 100).toFixed(2) + '%',
        sessionsCreated: operationGroups.session_create.filter(r => r.success).length,
        conversationsPersisted: operationGroups.conversation_persist.filter(r => r.success).length
      },
      operations: {}
    };

    // Analyse par type d'opération
    Object.keys(operationGroups).forEach(operation => {
      const results = operationGroups[operation];
      if (results.length === 0) return;

      const successfulResults = results.filter(r => r.success);
      const responseTimes = successfulResults.map(r => r.responseTime);
      
      if (responseTimes.length > 0) {
        responseTimes.sort((a, b) => a - b);
        
        const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const min = Math.min(...responseTimes);
        const max = Math.max(...responseTimes);
        const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];

        // Déterminer la cible selon l'opération
        let target = SESSION_TARGET;
        if (operation === 'session_recovery' || operation === 'sessions_list') {
          target = PERSISTENCE_TARGET;
        }

        report.operations[operation] = {
          total: results.length,
          success: successfulResults.length,
          errors: results.length - successfulResults.length,
          successRate: ((successfulResults.length / results.length) * 100).toFixed(2) + '%',
          responseTimes: {
            min: Math.round(min),
            max: Math.round(max),
            avg: Math.round(avg),
            p95: Math.round(p95)
          },
          validation: {
            target: target,
            status: max <= target ? '✅' : '❌'
          }
        };

        // Détails spécifiques selon l'opération
        if (operation === 'session_create') {
          const sessionsCreated = results.filter(r => r.sessionId).length;
          report.operations[operation].details = { sessionsCreated };
        } else if (operation === 'conversation_persist') {
          const conversationsCreated = results.filter(r => r.conversationId).length;
          report.operations[operation].details = { conversationsCreated };
        } else if (operation === 'session_recovery') {
          const totalConversationsRecovered = successfulResults.reduce((sum, r) => 
            sum + (r.details?.conversationsCount || 0), 0);
          report.operations[operation].details = { totalConversationsRecovered };
        }
      }
    });

    // Validations globales
    const createValid = report.operations.session_create?.validation.status === '✅';
    const persistValid = report.operations.conversation_persist?.validation.status === '✅';
    const recoveryValid = report.operations.session_recovery?.validation.status === '✅';
    const listValid = report.operations.sessions_list?.validation.status === '✅';

    report.validations = {
      sessionCreation: createValid ? '✅' : '❌',
      conversationPersistence: persistValid ? '✅' : '❌',
      sessionRecovery: recoveryValid ? '✅' : '❌',
      sessionListing: listValid ? '✅' : '❌',
      overallHealth: (createValid && persistValid && recoveryValid && listValid) ? '✅' : '❌'
    };

    return report;
  }

  printSessionReport(report) {
    console.log('\n' + '='.repeat(80));
    console.log('📚 RAPPORT DE PERFORMANCE - GESTION SESSIONS');
    console.log('='.repeat(80));
    
    console.log('\n📈 RÉSUMÉ GÉNÉRAL:');
    console.log(`  • Opérations totales: ${report.summary.totalOperations}`);
    console.log(`  • Opérations réussies: ${report.summary.successfulOperations}`);
    console.log(`  • Taux de succès: ${report.summary.overallSuccessRate}`);
    console.log(`  • Sessions créées: ${report.summary.sessionsCreated}`);
    console.log(`  • Conversations persistées: ${report.summary.conversationsPersisted}`);

    console.log('\n⚡ PERFORMANCE PAR OPÉRATION:');
    Object.keys(report.operations).forEach(operation => {
      const stats = report.operations[operation];
      console.log(`\n  ${operation}:`);
      console.log(`    Succès: ${stats.success}/${stats.total} (${stats.successRate})`);
      console.log(`    Temps de réponse:`);
      console.log(`      Min: ${stats.responseTimes.min}ms`);
      console.log(`      Moy: ${stats.responseTimes.avg}ms`);
      console.log(`      P95: ${stats.responseTimes.p95}ms`);
      console.log(`      Max: ${stats.responseTimes.max}ms (cible: < ${stats.validation.target}ms) ${stats.validation.status}`);
      
      if (stats.details) {
        console.log(`    Détails:`);
        Object.keys(stats.details).forEach(key => {
          console.log(`      ${key}: ${stats.details[key]}`);
        });
      }
    });

    console.log('\n🏆 VALIDATION DES CRITÈRES:');
    console.log(`  Création sessions: ${report.validations.sessionCreation}`);
    console.log(`  Persistance conversations: ${report.validations.conversationPersistence}`);
    console.log(`  Récupération sessions: ${report.validations.sessionRecovery}`);
    console.log(`  Liste sessions: ${report.validations.sessionListing}`);

    console.log(`\n🎯 RÉSULTAT GLOBAL: ${report.validations.overallHealth}`);
    console.log('='.repeat(80));
  }
}

// Exécution du test
async function runSessionManagementTest() {
  try {
    console.log('🔧 Vérification de la disponibilité du backend...');
    await axios.get(`${BASE_URL}/ping`);
    console.log('✅ Backend disponible');

    const tester = new SessionManagementTest();
    const results = await tester.runSessionManagementTest();
    const report = tester.generateSessionReport(results);
    
    tester.printSessionReport(report);
    
    // Sauvegarde du rapport
    const fs = require('fs');
    const reportPath = './tests/reports/session-management-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);

    // Code de sortie selon le résultat
    const success = report.validations.overallHealth === '✅';
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Erreur lors du test gestion sessions:', error.message);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runSessionManagementTest();
}

module.exports = {
  SessionManagementTest,
  runSessionManagementTest
};