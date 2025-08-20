/**
 * Script de test des endpoints WikiPro Backend
 * Test les 3 endpoints requis par TICKET-BACKEND-001
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Données de test basées sur .env.example
const TEST_DATA = {
  tenant_id: '550e8400-e29b-41d4-a716-446655440000',
  tenant_slug: 'demo-company',
  admin_email: 'admin@demo-company.com',
  admin_password: 'AdminDemo123!',
  user_email: 'user@demo-company.com',
  user_password: 'UserDemo123!'
};

let access_token = '';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testHealthCheck() {
  console.log('\n🔍 Test 1: Health Check Auth Service');
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/health`);
    console.log('✅ Health check réussi:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check échoué:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔐 Test 2: POST /api/auth/login');
  
  const loginData = {
    email: TEST_DATA.admin_email,
    password: TEST_DATA.admin_password,
    tenant_id: TEST_DATA.tenant_id
  };

  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, loginData);
    
    console.log('✅ Login réussi pour:', response.data.user.email);
    console.log('   Tenant:', response.data.tenant.name, `(${response.data.tenant.slug})`);
    console.log('   Rôle:', response.data.user.role);
    console.log('   Token JWT généré ✓');
    
    // Vérification structure de la réponse
    const required_fields = ['user', 'access_token', 'tenant'];
    const missing_fields = required_fields.filter(field => !response.data[field]);
    
    if (missing_fields.length > 0) {
      throw new Error(`Champs manquants dans la réponse: ${missing_fields.join(', ')}`);
    }
    
    // Vérification JWT payload
    const user = response.data.user;
    if (!user.id || !user.tenant_id || !user.email || !user.role) {
      throw new Error('Structure utilisateur incomplète dans la réponse');
    }
    
    access_token = response.data.access_token;
    console.log('   Structure de réponse validée ✓');
    
    return true;
  } catch (error) {
    if (error.response) {
      console.error('❌ Login échoué:', error.response.status, error.response.data);
    } else {
      console.error('❌ Login échoué:', error.message);
    }
    return false;
  }
}

async function testVerifyToken() {
  console.log('\n🔍 Test 3: GET /api/auth/verify');
  
  if (!access_token) {
    console.error('❌ Pas de token disponible pour le test');
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    console.log('✅ Vérification token réussie');
    console.log('   Utilisateur vérifié:', response.data.user.email);
    console.log('   Tenant:', response.data.tenant.name);
    console.log('   Token valide:', response.data.valid);
    
    // Vérifications
    if (!response.data.valid) {
      throw new Error('Token marqué comme invalide');
    }
    
    const user = response.data.user;
    if (!user.id || !user.tenant_id || !user.email || !user.roles) {
      throw new Error('Structure utilisateur incomplète dans la vérification');
    }
    
    console.log('   Structure de réponse validée ✓');
    
    return true;
  } catch (error) {
    if (error.response) {
      console.error('❌ Vérification token échouée:', error.response.status, error.response.data);
    } else {
      console.error('❌ Vérification token échouée:', error.message);
    }
    return false;
  }
}

async function testTenantProfile() {
  console.log('\n🏢 Test 4: GET /api/tenants/:slug/profile');
  
  if (!access_token) {
    console.error('❌ Pas de token disponible pour le test');
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/tenants/${TEST_DATA.tenant_slug}/profile`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    console.log('✅ Récupération profil tenant réussie');
    console.log('   Tenant:', response.data.name, `(${response.data.slug})`);
    console.log('   Plan:', response.data.plan_type);
    console.log('   Actif:', response.data.is_active);
    console.log('   Statistiques:', response.data.stats || 'Non disponibles');
    
    // Vérifications
    const required_fields = ['id', 'name', 'slug', 'plan_type', 'is_active'];
    const missing_fields = required_fields.filter(field => response.data[field] === undefined);
    
    if (missing_fields.length > 0) {
      throw new Error(`Champs manquants dans le profil: ${missing_fields.join(', ')}`);
    }
    
    console.log('   Structure de réponse validée ✓');
    
    return true;
  } catch (error) {
    if (error.response) {
      console.error('❌ Récupération profil échouée:', error.response.status, error.response.data);
    } else {
      console.error('❌ Récupération profil échouée:', error.message);
    }
    return false;
  }
}

async function testTenantIsolation() {
  console.log('\n🛡️ Test 5: Vérification isolation multi-tenant');
  
  if (!access_token) {
    console.error('❌ Pas de token disponible pour le test');
    return false;
  }
  
  // Test d'accès à un autre tenant (doit échouer)
  const fake_tenant_slug = 'autre-tenant';
  
  try {
    await axios.get(`${BASE_URL}/api/tenants/${fake_tenant_slug}/profile`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    console.error('❌ PROBLÈME DE SÉCURITÉ: Accès cross-tenant autorisé !');
    return false;
  } catch (error) {
    if (error.response && (error.response.status === 403 || error.response.status === 404)) {
      console.log('✅ Isolation tenant validée: accès cross-tenant correctement bloqué');
      console.log(`   Status: ${error.response.status} - ${error.response.statusText}`);
      return true;
    } else {
      console.error('❌ Erreur inattendue lors du test d\'isolation:', error.message);
      return false;
    }
  }
}

async function testInvalidLogin() {
  console.log('\n🚫 Test 6: Login avec identifiants invalides');
  
  const invalidLoginData = {
    email: 'invalid@demo-company.com',
    password: 'wrongpassword',
    tenant_id: TEST_DATA.tenant_id
  };

  try {
    await axios.post(`${BASE_URL}/api/auth/login`, invalidLoginData);
    console.error('❌ PROBLÈME DE SÉCURITÉ: Login invalide accepté !');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Sécurité login validée: identifiants invalides correctement rejetés');
      console.log(`   Status: ${error.response.status} - Unauthorized`);
      return true;
    } else {
      console.error('❌ Erreur inattendue lors du test de login invalide:', error.message);
      return false;
    }
  }
}

async function runAllTests() {
  console.log('🚀 WikiPro Backend - Tests des endpoints TICKET-BACKEND-001');
  console.log('===============================================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Tenant: ${TEST_DATA.tenant_slug}`);
  
  // Attendre que le serveur soit démarré
  console.log('\n⏳ Attente du démarrage du serveur...');
  await sleep(2000);
  
  const tests = [
    testHealthCheck,
    testLogin,
    testVerifyToken,
    testTenantProfile,
    testTenantIsolation,
    testInvalidLogin
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error('❌ Test échoué:', error.message);
      failed++;
    }
    
    await sleep(500); // Pause entre les tests
  }
  
  console.log('\n📊 RÉSULTATS');
  console.log('=============');
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`📈 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS !');
    console.log('   Backend WikiPro prêt pour TICKET-BACKEND-001 ✓');
    process.exit(0);
  } else {
    console.log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ');
    console.log('   Vérifiez la configuration et les données de test');
    process.exit(1);
  }
}

// Gestion des erreurs globales
process.on('unhandledRejection', (error) => {
  console.error('Erreur non gérée:', error);
  process.exit(1);
});

// Lancer les tests
runAllTests().catch(error => {
  console.error('Erreur lors de l\'exécution des tests:', error);
  process.exit(1);
});