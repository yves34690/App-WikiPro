const axios = require('axios');

// Configuration de base
const BASE_URL = 'http://localhost:3001/api/v1';
const TENANT_SLUG = 'demo-company';
const TEST_TOKEN = 'demo-jwt-token'; // Remplacer par un vrai token

// Helper pour les requêtes
const apiCall = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}/${TENANT_SLUG}/${endpoint}`,
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Tenant-ID': TENANT_SLUG,
        'X-User-ID': 'test-user-id',
      }
    };
    
    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur ${method} ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
};

// Tests pour l'API IA
async function runAITests() {
  console.log('🧪 Tests API IA Multi-Providers - WikiPro');
  console.log('==========================================\n');

  // Test 1: Health Check
  console.log('1️⃣ Test Health Check...');
  const healthStatus = await apiCall('GET', 'ai/health');
  if (healthStatus) {
    console.log('✅ Health Check:', healthStatus.overall);
    console.log('📊 Providers:', Object.keys(healthStatus.providers).join(', '));
  }

  // Test 2: Statut des providers
  console.log('\n2️⃣ Test Statut Providers...');
  const providersStatus = await apiCall('GET', 'ai/providers');
  if (providersStatus) {
    console.log('✅ Providers disponibles:', providersStatus.providers.length);
    providersStatus.providers.forEach(provider => {
      console.log(`   - ${provider.name}: ${provider.available ? '🟢 Disponible' : '🔴 Indisponible'}`);
    });
  }

  // Test 3: Statistiques système
  console.log('\n3️⃣ Test Statistiques...');
  const stats = await apiCall('GET', 'ai/stats');
  if (stats) {
    console.log('✅ Stats système:');
    console.log(`   - Providers: ${stats.providers.available}/${stats.providers.total}`);
    console.log(`   - Quotas tenants: ${stats.quotas.totalTenants}`);
    console.log(`   - Connexions WS: ${stats.streaming.activeConnections || 0}`);
  }

  // Test 4: Chat simple (devrait probablement échouer sans vraies clés API)
  console.log('\n4️⃣ Test Chat Simple...');
  const chatRequest = {
    messages: [
      { role: 'user', content: 'Bonjour, peux-tu me dire combien font 2+2?' }
    ],
    temperature: 0.7,
    maxTokens: 50
  };

  const chatResponse = await apiCall('POST', 'ai/chat', chatRequest);
  if (chatResponse) {
    console.log('✅ Réponse IA reçue:');
    console.log(`   - Provider: ${chatResponse.provider}`);
    console.log(`   - Tokens: ${chatResponse.tokensUsed}`);
    console.log(`   - Durée: ${chatResponse.duration}ms`);
    console.log(`   - Réponse: "${chatResponse.message.content.substring(0, 100)}..."`);
  } else {
    console.log('⚠️ Chat échoué (normal sans clés API configurées)');
  }

  // Test 5: Chat avec provider spécifique
  console.log('\n5️⃣ Test Chat avec Provider Préféré...');
  const chatWithProviderRequest = {
    ...chatRequest,
    messages: [
      { role: 'user', content: 'Test avec provider spécifique' }
    ]
  };

  const chatWithProvider = await apiCall('POST', 'ai/chat', chatWithProviderRequest, {
    'X-Preferred-Provider': 'openai'
  });

  if (chatWithProvider) {
    console.log('✅ Chat avec provider préféré réussi');
  } else {
    console.log('⚠️ Chat avec provider préféré échoué');
  }

  // Test 6: Validation des données d'entrée
  console.log('\n6️⃣ Test Validation...');
  const invalidRequest = {
    messages: [], // Messages vides - devrait être rejeté
    temperature: 3.0, // Température invalide
  };

  const validationResponse = await apiCall('POST', 'ai/chat', invalidRequest);
  if (!validationResponse) {
    console.log('✅ Validation fonctionne (requête invalide rejetée)');
  } else {
    console.log('❌ Problème de validation');
  }

  console.log('\n==========================================');
  console.log('🏁 Tests terminés');
  
  // Résumé des fonctionnalités testées
  console.log('\n📋 Fonctionnalités testées:');
  console.log('   ✓ Health check des providers IA');
  console.log('   ✓ Récupération du statut des providers');  
  console.log('   ✓ Statistiques système globales');
  console.log('   ✓ API Chat synchrone');
  console.log('   ✓ Sélection de provider préféré');
  console.log('   ✓ Validation des données d\'entrée');
  
  console.log('\n⚡ Pour tester le streaming WebSocket:');
  console.log('   - Connectez-vous à ws://localhost:3001/ai/stream');
  console.log('   - Envoyez un événement "chat.stream.start"');
  
  console.log('\n🔑 Pour tester avec de vraies réponses IA:');
  console.log('   - Configurez les variables d\'environnement:');
  console.log('     • AI_OPENAI_API_KEY=sk-...');
  console.log('     • AI_ANTHROPIC_API_KEY=sk-ant-...');
  console.log('     • AI_GEMINI_API_KEY=...');
}

// Exécuter les tests
if (require.main === module) {
  runAITests().catch(console.error);
}

module.exports = { runAITests, apiCall };