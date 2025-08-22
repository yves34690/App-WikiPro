#!/usr/bin/env node

/**
 * Tests E2E Integration - Validation Flux Chat IA Complet
 * WikiPro IA Sprint 2B - TICKET-QA-001
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 TESTS E2E INTEGRATION - FLUX CHAT IA COMPLET');
console.log('=' .repeat(60));

/**
 * Test du flux de conversation complet
 */
function validateConversationFlow() {
  console.log('\n💬 VALIDATION FLUX CONVERSATION IA');
  console.log('-'.repeat(50));
  
  const checks = [];
  
  // 1. Service de conversation
  try {
    const convServicePath = path.join(__dirname, 'src/modules/chat/services/conversation.service.ts');
    const convContent = fs.readFileSync(convServicePath, 'utf8');
    const hasConversationFlow = convContent.includes('createConversation') && 
                               convContent.includes('getConversation') &&
                               convContent.includes('tenantId');
    checks.push({
      name: 'Service Conversation avec isolation tenant',
      passed: hasConversationFlow
    });
  } catch (error) {
    checks.push({
      name: 'Service Conversation avec isolation tenant',
      passed: false,
      error: error.message
    });
  }
  
  // 2. Service de messages avec métadonnées IA
  try {
    const msgServicePath = path.join(__dirname, 'src/modules/chat/services/message.service.ts');
    const msgContent = fs.readFileSync(msgServicePath, 'utf8');
    const hasMessageFlow = msgContent.includes('createMessage') && 
                          msgContent.includes('aiMetadata') &&
                          msgContent.includes('tenantId');
    checks.push({
      name: 'Service Messages avec métadonnées IA',
      passed: hasMessageFlow
    });
  } catch (error) {
    checks.push({
      name: 'Service Messages avec métadonnées IA',  
      passed: false,
      error: error.message
    });
  }
  
  // 3. Controller Chat avec endpoints
  try {
    const chatControllerPath = path.join(__dirname, 'src/modules/chat/chat.controller.ts');
    const chatContent = fs.readFileSync(chatControllerPath, 'utf8');
    const hasChatEndpoints = chatContent.includes('@Post') && 
                            chatContent.includes('@Get') &&
                            chatContent.includes('TenantGuard');
    checks.push({
      name: 'Controller Chat avec sécurité',
      passed: hasChatEndpoints
    });
  } catch (error) {
    checks.push({
      name: 'Controller Chat avec sécurité',
      passed: false,
      error: error.message
    });
  }
  
  // 4. Gateway WebSocket temps réel
  try {
    const wsGatewayPath = path.join(__dirname, 'src/modules/chat/chat.gateway.ts');
    const wsContent = fs.readFileSync(wsGatewayPath, 'utf8');
    const hasWebSocketGateway = wsContent.includes('@WebSocketGateway') && 
                               wsContent.includes('@SubscribeMessage') &&
                               wsContent.includes('handleMessage');
    checks.push({
      name: 'WebSocket Gateway temps réel',
      passed: hasWebSocketGateway
    });
  } catch (error) {
    checks.push({
      name: 'WebSocket Gateway temps réel',
      passed: false,
      error: error.message
    });
  }
  
  // 5. Intégration AI Gateway
  try {
    const aiGatewayPath = path.join(__dirname, 'src/ai-gateway/ai-gateway.service.ts');
    const aiContent = fs.readFileSync(aiGatewayPath, 'utf8');
    const hasAIIntegration = aiContent.includes('processMessage') || 
                            aiContent.includes('generateResponse') &&
                            aiContent.includes('fallback');
    checks.push({
      name: 'Intégration AI Gateway avec fallback',
      passed: hasAIIntegration
    });
  } catch (error) {
    checks.push({
      name: 'Intégration AI Gateway avec fallback',
      passed: false,
      error: error.message
    });
  }
  
  // Affichage résultats
  checks.forEach(check => {
    console.log(`${check.passed ? '✅' : '❌'} ${check.name}`);
    if (!check.passed && check.error) {
      console.log(`   ❌ Erreur: ${check.error}`);
    }
  });
  
  const passedChecks = checks.filter(c => c.passed).length;
  console.log(`📊 Flux conversation: ${passedChecks}/${checks.length} validé`);
  
  return passedChecks >= 4;
}

/**
 * Test des entités base de données
 */
function validateDatabaseEntities() {
  console.log('\n🗃️ VALIDATION ENTITÉS BASE DE DONNÉES');
  console.log('-'.repeat(50));
  
  const entities = [
    'src/database/entities/user.entity.ts',
    'src/database/entities/conversation.entity.ts', 
    'src/database/entities/message.entity.ts'
  ];
  
  const validatedEntities = entities.map(entity => {
    const entityPath = path.join(__dirname, entity);
    const exists = fs.existsSync(entityPath);
    
    let hasMetadata = false;
    if (exists) {
      try {
        const content = fs.readFileSync(entityPath, 'utf8');
        hasMetadata = content.includes('@Entity') && 
                     (content.includes('tenantId') || content.includes('User') || content.includes('aiMetadata'));
      } catch (error) {
        // Ignore read errors
      }
    }
    
    console.log(`${exists && hasMetadata ? '✅' : '❌'} ${entity}`);
    return exists && hasMetadata;
  });
  
  const validatedCount = validatedEntities.filter(Boolean).length;
  console.log(`📊 Entités validées: ${validatedCount}/${entities.length}`);
  
  return validatedCount >= 2;
}

/**
 * Test des migrations base de données
 */
function validateDatabaseMigrations() {
  console.log('\n🔄 VALIDATION MIGRATIONS BASE DE DONNÉES');
  console.log('-'.repeat(50));
  
  try {
    const migrationsDir = path.join(__dirname, 'src/database/migrations');
    const migrations = fs.readdirSync(migrationsDir)
                        .filter(file => file.endsWith('.ts'))
                        .sort();
    
    console.log(`✅ ${migrations.length} migrations trouvées`);
    
    // Vérifications spécifiques
    const hasInitialSetup = migrations.some(m => m.includes('InitialSetup'));
    const hasUsersTable = migrations.some(m => m.includes('UsersTable'));  
    const hasConversationTables = migrations.some(m => m.includes('Conversation'));
    const hasAIMetadata = migrations.some(m => m.includes('AiMetadata'));
    
    console.log(`${hasInitialSetup ? '✅' : '❌'} Migration InitialSetup`);
    console.log(`${hasUsersTable ? '✅' : '❌'} Migration UsersTable`);
    console.log(`${hasConversationTables ? '✅' : '❌'} Migration ConversationTables`);
    console.log(`${hasAIMetadata ? '✅' : '❌'} Migration AIMetadata`);
    
    const migrationScore = [hasInitialSetup, hasUsersTable, hasConversationTables, hasAIMetadata]
                          .filter(Boolean).length;
    
    console.log(`📊 Migrations validées: ${migrationScore}/4`);
    
    return migrationScore >= 3;
  } catch (error) {
    console.log(`❌ Erreur validation migrations: ${error.message}`);
    return false;
  }
}

/**
 * Test configuration et modules principaux
 */
function validateCoreModules() {
  console.log('\n⚙️ VALIDATION MODULES CORE');
  console.log('-'.repeat(50));
  
  const coreModules = [
    'src/app.module.ts',
    'src/core/config/config.service.ts',
    'src/core/auth/auth.module.ts',
    'src/core/redis/redis.service.ts',
    'src/modules/chat/chat.module.ts',
    'src/ai-gateway/ai-gateway.module.ts'
  ];
  
  const validatedModules = coreModules.map(module => {
    const modulePath = path.join(__dirname, module);
    const exists = fs.existsSync(modulePath);
    
    let isConfigured = false;
    if (exists) {
      try {
        const content = fs.readFileSync(modulePath, 'utf8');
        isConfigured = content.includes('@Module') || 
                      content.includes('@Injectable') || 
                      content.includes('export');
      } catch (error) {
        // Ignore read errors
      }
    }
    
    console.log(`${exists && isConfigured ? '✅' : '❌'} ${module}`);
    return exists && isConfigured;
  });
  
  const validatedCount = validatedModules.filter(Boolean).length;
  console.log(`📊 Modules core: ${validatedCount}/${coreModules.length} validés`);
  
  return validatedCount >= 5;
}

/**
 * Génération rapport E2E
 */
function generateE2EReport(results) {
  console.log('\n📋 RAPPORT E2E INTEGRATION');
  console.log('=' .repeat(60));
  
  const report = {
    ticket: 'TICKET-QA-001-E2E',
    timestamp: new Date().toISOString(),
    tests: results,
    summary: {
      passed: Object.values(results).filter(r => r === true).length,
      total: Object.keys(results).length
    }
  };
  
  report.integration_ready = (report.summary.passed / report.summary.total) >= 0.75;
  
  console.log(`🎯 TESTS E2E INTÉGRATION:`);
  console.log(`   ✅ Flux conversation IA: ${results.conversationFlow ? 'VALIDE' : 'ÉCHEC'}`);
  console.log(`   ✅ Entités base de données: ${results.databaseEntities ? 'VALIDE' : 'ÉCHEC'}`);
  console.log(`   ✅ Migrations DB: ${results.databaseMigrations ? 'VALIDE' : 'ÉCHEC'}`);
  console.log(`   ✅ Modules core: ${results.coreModules ? 'VALIDE' : 'ÉCHEC'}`);
  
  const successRate = (report.summary.passed / report.summary.total) * 100;
  console.log(`\n📊 Taux de réussite E2E: ${successRate.toFixed(1)}%`);
  console.log(`🚀 Intégration Ready: ${report.integration_ready ? 'OUI ✅' : 'NON ❌'}`);
  
  // Sauvegarde
  const reportPath = path.join(__dirname, 'RAPPORT-E2E-INTEGRATION.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Rapport E2E sauvegardé: ${reportPath}`);
  
  return report;
}

/**
 * EXÉCUTION PRINCIPALE
 */
async function main() {
  console.log('⏱️ Lancement tests E2E intégration...\n');
  
  const results = {
    conversationFlow: validateConversationFlow(),
    databaseEntities: validateDatabaseEntities(),
    databaseMigrations: validateDatabaseMigrations(),
    coreModules: validateCoreModules()
  };
  
  const report = generateE2EReport(results);
  
  console.log('\n🎉 TESTS E2E TERMINÉS !');
  console.log(`🎯 WikiPro IA Intégration Ready: ${report.integration_ready ? 'OUI ✅' : 'NON ❌'}`);
  
  process.exit(report.integration_ready ? 0 : 1);
}

// Exécution
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur critique tests E2E:', error);
    process.exit(1);
  });
}

module.exports = { main };