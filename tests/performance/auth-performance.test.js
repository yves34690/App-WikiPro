/**
 * TICKET-PERFORMANCE-001 - Tests Performance Authentification
 * Tests de performance auth + isolation tenant
 * Objectif: Auth JWT < 200ms, isolation RLS < 100ms
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3001';
const AUTH_TARGET = 200; // 200ms max pour auth
const RLS_TARGET = 100; // 100ms max pour isolation
const CONCURRENT_AUTHS = 50; // 50 auth simultanées

// Configuration multi-tenant
const TEST_TENANTS = [
  {
    slug: 'demo-company',
    auth: { email: 'admin@demo-company.com', password: 'admin123' }
  },
  {
    slug: 'test-org',
    auth: { email: 'user@test-org.com', password: 'user123' }
  },
  {
    slug: 'corp-ltd',
    auth: { email: 'manager@corp-ltd.com', password: 'manager123' }
  }
];

class AuthPerformanceTest {
  constructor() {
    this.results = [];
    this.authTokens = new Map();
  }

  async testSingleAuth(tenantConfig, userId) {
    const startTime = performance.now();
    
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, tenantConfig.auth);
      const endTime = performance.now();
      
      const responseTime = endTime - startTime;
      const success = !!response.data.access_token;
      
      if (success) {
        this.authTokens.set(`${tenantConfig.slug}_${userId}`, response.data.access_token);
      }
      
      return {
        tenant: tenantConfig.slug,
        userId,
        responseTime,
        success,
        statusCode: response.status,
        tokenReceived: success
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        tenant: tenantConfig.slug,
        userId,
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message,
        tokenReceived: false
      };
    }
  }

  async testTokenVerification(tenantConfig, userId) {
    const token = this.authTokens.get(`${tenantConfig.slug}_${userId}`);
    if (!token) return null;

    const startTime = performance.now();
    
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const endTime = performance.now();
      
      return {
        tenant: tenantConfig.slug,
        userId,
        operation: 'token_verify',
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        tenant: tenantConfig.slug,
        userId,
        operation: 'token_verify',
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message
      };
    }
  }

  async testTenantIsolation(tenantConfig, userId) {
    const token = this.authTokens.get(`${tenantConfig.slug}_${userId}`);
    if (!token) return null;

    const startTime = performance.now();
    
    try {
      // Test accès aux sessions du tenant (doit passer par RLS)
      const response = await axios.get(
        `${BASE_URL}/api/v1/${tenantConfig.slug}/sessions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const endTime = performance.now();
      
      return {
        tenant: tenantConfig.slug,
        userId,
        operation: 'tenant_isolation',
        responseTime: endTime - startTime,
        success: response.status === 200,
        statusCode: response.status,
        dataReturned: Array.isArray(response.data) ? response.data.length : 0
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        tenant: tenantConfig.slug,
        userId,
        operation: 'tenant_isolation',
        responseTime: endTime - startTime,
        success: false,
        statusCode: error.response?.status || 0,
        error: error.message,
        dataReturned: 0
      };
    }
  }

  async testCrossTenantsAccess(userToken, targetTenant) {
    const startTime = performance.now();
    
    try {
      // Tentative d'accès aux données d'un autre tenant (doit échouer)
      const response = await axios.get(
        `${BASE_URL}/api/v1/${targetTenant}/sessions`,
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      const endTime = performance.now();
      
      return {
        operation: 'cross_tenant_access',
        targetTenant,
        responseTime: endTime - startTime,
        success: false, // Doit échouer pour être correct
        statusCode: response.status,
        shouldFail: true,
        actualResult: 'PASSED', // Problème de sécurité
        dataReturned: Array.isArray(response.data) ? response.data.length : 0
      };
    } catch (error) {
      const endTime = performance.now();
      return {
        operation: 'cross_tenant_access',
        targetTenant,
        responseTime: endTime - startTime,
        success: true, // Correct d'échouer
        statusCode: error.response?.status || 0,
        shouldFail: true,
        actualResult: 'BLOCKED', // Correct
        error: error.message,
        dataReturned: 0
      };
    }
  }

  async runConcurrentAuthTest() {
    console.log(`🚀 Test authentification concurrent: ${CONCURRENT_AUTHS} auth simultanées`);
    console.log(`📊 Objectifs: Auth < ${AUTH_TARGET}ms, RLS < ${RLS_TARGET}ms`);

    const authPromises = [];
    
    // Génération des tests d'auth simultanés
    for (let i = 1; i <= CONCURRENT_AUTHS; i++) {
      const tenantConfig = TEST_TENANTS[i % TEST_TENANTS.length];
      authPromises.push(this.testSingleAuth(tenantConfig, i));
    }

    const startTime = performance.now();
    const authResults = await Promise.all(authPromises);
    const authEndTime = performance.now();

    console.log(`✅ Phase authentification complétée en ${Math.round(authEndTime - startTime)}ms`);

    // Tests de vérification des tokens
    const verifyPromises = [];
    authResults.forEach((result, index) => {
      if (result.success) {
        const tenantConfig = TEST_TENANTS[index % TEST_TENANTS.length];
        verifyPromises.push(this.testTokenVerification(tenantConfig, result.userId));
      }
    });

    const verifyResults = await Promise.all(verifyPromises.filter(Boolean));
    console.log(`✅ Phase vérification tokens complétée`);

    // Tests d'isolation tenant
    const isolationPromises = [];
    authResults.forEach((result, index) => {
      if (result.success) {
        const tenantConfig = TEST_TENANTS[index % TEST_TENANTS.length];
        isolationPromises.push(this.testTenantIsolation(tenantConfig, result.userId));
      }
    });

    const isolationResults = await Promise.all(isolationPromises.filter(Boolean));
    console.log(`✅ Phase isolation tenant complétée`);

    // Tests cross-tenant (sécurité)
    const crossTenantPromises = [];
    authResults.forEach((result, index) => {
      if (result.success) {
        const userTenant = TEST_TENANTS[index % TEST_TENANTS.length];
        const targetTenant = TEST_TENANTS[(index + 1) % TEST_TENANTS.length];
        const token = this.authTokens.get(`${userTenant.slug}_${result.userId}`);
        
        if (token && userTenant.slug !== targetTenant.slug) {
          crossTenantPromises.push(this.testCrossTenantsAccess(token, targetTenant.slug));
        }
      }
    });

    const crossTenantResults = await Promise.all(crossTenantPromises);
    console.log(`✅ Phase test cross-tenant complétée`);

    const totalEndTime = performance.now();

    return {
      totalDuration: totalEndTime - startTime,
      authResults,
      verifyResults,
      isolationResults,
      crossTenantResults
    };
  }

  generateAuthReport(testResults) {
    const { totalDuration, authResults, verifyResults, isolationResults, crossTenantResults } = testResults;
    
    // Analyse des authentifications
    const successfulAuths = authResults.filter(r => r.success);
    const authTimes = successfulAuths.map(r => r.responseTime);
    
    // Analyse des vérifications
    const successfulVerifies = verifyResults.filter(r => r.success);
    const verifyTimes = successfulVerifies.map(r => r.responseTime);
    
    // Analyse de l'isolation
    const successfulIsolations = isolationResults.filter(r => r.success);
    const isolationTimes = successfulIsolations.map(r => r.responseTime);
    
    // Analyse cross-tenant
    const properlyBlockedCrossTenant = crossTenantResults.filter(r => r.actualResult === 'BLOCKED');
    const securityBreaches = crossTenantResults.filter(r => r.actualResult === 'PASSED');

    const report = {
      summary: {
        totalDuration: Math.round(totalDuration),
        concurrentAuths: CONCURRENT_AUTHS,
        tenantsUsed: TEST_TENANTS.length
      },
      authentication: this.calculateStats(authTimes, 'auth', AUTH_TARGET),
      tokenVerification: this.calculateStats(verifyTimes, 'verify', AUTH_TARGET),
      tenantIsolation: this.calculateStats(isolationTimes, 'isolation', RLS_TARGET),
      security: {
        crossTenantTests: crossTenantResults.length,
        properlyBlocked: properlyBlockedCrossTenant.length,
        securityBreaches: securityBreaches.length,
        securityScore: crossTenantResults.length > 0 ? 
          ((properlyBlockedCrossTenant.length / crossTenantResults.length) * 100).toFixed(2) + '%' : 'N/A',
        validation: securityBreaches.length === 0 ? '✅' : '❌'
      }
    };

    return report;
  }

  calculateStats(times, operation, target) {
    if (times.length === 0) {
      return {
        total: 0,
        success: 0,
        successRate: '0%',
        responseTimes: {},
        validation: '❌'
      };
    }

    times.sort((a, b) => a - b);
    
    const p50 = times[Math.floor(times.length * 0.5)];
    const p95 = times[Math.floor(times.length * 0.95)];
    const p99 = times[Math.floor(times.length * 0.99)];
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    return {
      total: times.length,
      success: times.length,
      successRate: '100%',
      responseTimes: {
        min: Math.round(min),
        max: Math.round(max),
        avg: Math.round(avg),
        p50: Math.round(p50),
        p95: Math.round(p95),
        p99: Math.round(p99)
      },
      validation: max <= target ? '✅' : '❌'
    };
  }

  printAuthReport(report) {
    console.log('\n' + '='.repeat(80));
    console.log('🔐 RAPPORT DE PERFORMANCE - AUTHENTIFICATION & SÉCURITÉ');
    console.log('='.repeat(80));
    
    console.log('\n📈 RÉSUMÉ GÉNÉRAL:');
    console.log(`  • Durée totale: ${report.summary.totalDuration}ms`);
    console.log(`  • Authentifications simultanées: ${report.summary.concurrentAuths}`);
    console.log(`  • Tenants testés: ${report.summary.tenantsUsed}`);

    console.log('\n🔑 PERFORMANCE AUTHENTIFICATION:');
    this.printOperationStats('Authentification', report.authentication, AUTH_TARGET);
    
    console.log('\n🎫 PERFORMANCE VÉRIFICATION TOKENS:');
    this.printOperationStats('Vérification', report.tokenVerification, AUTH_TARGET);
    
    console.log('\n🏢 PERFORMANCE ISOLATION TENANT:');
    this.printOperationStats('Isolation RLS', report.tenantIsolation, RLS_TARGET);

    console.log('\n🛡️ SÉCURITÉ CROSS-TENANT:');
    console.log(`  • Tests réalisés: ${report.security.crossTenantTests}`);
    console.log(`  • Accès correctement bloqués: ${report.security.properlyBlocked}`);
    console.log(`  • Failles de sécurité: ${report.security.securityBreaches}`);
    console.log(`  • Score sécurité: ${report.security.securityScore} ${report.security.validation}`);

    console.log('\n🏆 VALIDATION DES CRITÈRES:');
    const authValid = report.authentication.validation === '✅';
    const verifyValid = report.tokenVerification.validation === '✅';
    const isolationValid = report.tenantIsolation.validation === '✅';
    const securityValid = report.security.validation === '✅';

    console.log(`  Authentification (< ${AUTH_TARGET}ms): ${authValid ? '✅ CONFORME' : '❌ NON CONFORME'}`);
    console.log(`  Vérification tokens (< ${AUTH_TARGET}ms): ${verifyValid ? '✅ CONFORME' : '❌ NON CONFORME'}`);
    console.log(`  Isolation RLS (< ${RLS_TARGET}ms): ${isolationValid ? '✅ CONFORME' : '❌ NON CONFORME'}`);
    console.log(`  Sécurité cross-tenant: ${securityValid ? '✅ CONFORME' : '❌ NON CONFORME'}`);

    const allValid = authValid && verifyValid && isolationValid && securityValid;
    console.log(`\n🎯 RÉSULTAT GLOBAL: ${allValid ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);
    console.log('='.repeat(80));
  }

  printOperationStats(name, stats, target) {
    if (stats.total === 0) {
      console.log(`  ${name}: Aucune donnée disponible`);
      return;
    }

    console.log(`  ${name}:`);
    console.log(`    Succès: ${stats.success}/${stats.total} (${stats.successRate})`);
    console.log(`    Temps de réponse:`);
    console.log(`      Min: ${stats.responseTimes.min}ms`);
    console.log(`      Moy: ${stats.responseTimes.avg}ms`);
    console.log(`      P50: ${stats.responseTimes.p50}ms`);
    console.log(`      P95: ${stats.responseTimes.p95}ms`);
    console.log(`      P99: ${stats.responseTimes.p99}ms`);
    console.log(`      Max: ${stats.responseTimes.max}ms (cible: < ${target}ms) ${stats.validation}`);
  }
}

// Exécution du test
async function runAuthPerformanceTest() {
  try {
    console.log('🔧 Vérification de la disponibilité du backend...');
    await axios.get(`${BASE_URL}/ping`);
    console.log('✅ Backend disponible');

    const tester = new AuthPerformanceTest();
    const results = await tester.runConcurrentAuthTest();
    const report = tester.generateAuthReport(results);
    
    tester.printAuthReport(report);
    
    // Sauvegarde du rapport
    const fs = require('fs');
    const reportPath = './tests/reports/auth-performance-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);

    // Code de sortie selon le résultat
    const success = report.authentication.validation === '✅' &&
                   report.tokenVerification.validation === '✅' &&
                   report.tenantIsolation.validation === '✅' &&
                   report.security.validation === '✅';
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Erreur lors du test auth performance:', error.message);
    process.exit(1);
  }
}

// Exécution si appelé directement
if (require.main === module) {
  runAuthPerformanceTest();
}

module.exports = {
  AuthPerformanceTest,
  runAuthPerformanceTest
};