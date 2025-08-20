# 🚀 WikiPro Performance Tests Suite

## TICKET-PERFORMANCE-001 - Tests Performance & Monitoring Télémétrique

Suite complète de tests de performance et système de monitoring pour **WikiPro v2.0 Sprint 1**.

---

## 📁 Structure du Projet

```
tests/
├── performance/                # Tests de charge et performance
│   ├── api-load.test.js        # Tests charge API 100 users
│   ├── streaming.test.js       # Tests latence streaming IA
│   ├── auth-performance.test.js # Tests auth + tenant isolation
│   └── database.test.js        # Tests perf PostgreSQL + RLS
├── e2e/                        # Tests end-to-end
│   ├── user-journey.test.js    # Parcours utilisateur complet
│   ├── ai-providers.test.js    # Tests fallback multi-providers
│   └── session-management.test.js # Tests sessions persistantes
├── monitoring/                 # Monitoring et télémétrie
│   ├── telemetry.js           # Système télémétrie
│   ├── alerts.config.js       # Configuration alertes
│   └── dashboards.config.js   # Config dashboards monitoring
├── reports/                    # Rapports de tests
│   └── performance-report.md  # Rapport final validations
├── run-performance-suite.js    # Script principal
├── package.json               # Configuration npm
└── README.md                  # Documentation
```

---

## 🎯 Objectifs des Tests

### ✅ Tests de Performance Critiques
- **API Load Testing**: 100 utilisateurs simultanés < 2s
- **Streaming IA**: Latence première réponse < 500ms  
- **Authentification**: Auth JWT + isolation tenant < 200ms
- **Base de Données**: Requêtes PostgreSQL RLS < 100ms

### ✅ Tests End-to-End
- **Parcours Utilisateur**: Login → Dashboard → IA Chat → Session → Logout
- **Providers IA**: Fallback multi-providers < 2s basculement
- **Gestion Sessions**: Persistance et récupération sessions

### ✅ Monitoring & Télémétrie
- **Système Télémétrique**: Collecte métriques temps réel
- **Alertes**: Seuils critiques et warnings configurés
- **Dashboards**: 5 dashboards monitoring opérationnels

---

## 🚀 Installation et Configuration

### Prérequis
- Node.js >= 16.0.0
- Backend WikiPro démarré sur http://localhost:3001
- Base PostgreSQL configurée avec données de test

### Installation
```bash
cd tests/
npm install
```

### Variables d'Environnement
```bash
# Backend URL (par défaut: http://localhost:3001)
export BACKEND_URL=http://localhost:3001

# Credentials de test (par défaut)
export TEST_EMAIL=admin@demo-company.com
export TEST_PASSWORD=admin123
export TENANT_SLUG=demo-company
```

---

## 🧪 Exécution des Tests

### Suite Complète (Recommandé)
```bash
# Exécution de tous les tests + monitoring + rapport final
npm test

# Durée: ~30 minutes
# Résultat: Rapport final dans reports/FINAL-PERFORMANCE-REPORT.json
```

### Tests Individuels

#### Tests de Performance
```bash
# Test charge API (100 utilisateurs simultanés)
npm run test:api-load

# Test streaming IA (30 connexions)
npm run test:streaming

# Test authentification + isolation tenant
npm run test:auth

# Test performance base de données
npm run test:database
```

#### Tests End-to-End
```bash
# Parcours utilisateur complet
npm run test:e2e-journey

# Tests providers IA et fallback
npm run test:e2e-providers

# Tests gestion sessions
npm run test:e2e-sessions
```

#### Monitoring et Alertes
```bash
# Monitoring télémétrique (60s)
npm run monitor

# Simulation système d'alertes
npm run alerts

# Simulation dashboards
npm run dashboards
```

### Gestion des Rapports
```bash
# Lister tous les rapports générés
npm run reports

# Nettoyer les rapports JSON
npm run clean

# Validation configuration tests
npm run validate
```

---

## 📊 Interprétation des Résultats

### ✅ Critères de Succès

#### Performance API
- **Latence P95** < 500ms pour tous endpoints
- **Latence P99** < 2000ms
- **Taux d'erreur** < 1%
- **Throughput** > 50 requêtes/seconde

#### Streaming IA
- **Premier token** < 500ms
- **Connexions simultanées** ≥ 30
- **Reconnexion WebSocket** < 1s

#### Authentification
- **Auth JWT** < 200ms
- **Isolation RLS** < 100ms
- **Cross-tenant** 100% bloqué

#### Base de Données
- **CRUD sessions** < 200ms
- **Recherche conversations** < 200ms
- **Isolation tenant** étanche

### 📈 Métriques Collectées

#### API
- Latence (min, avg, p50, p95, p99, max)
- Throughput (requêtes/seconde)
- Taux d'erreur par endpoint
- Codes de statut HTTP

#### Système
- Utilisation CPU (%)
- Utilisation mémoire (%)
- Load average
- Uptime

#### IA
- Disponibilité providers
- Latence par provider
- Utilisation quotas
- Statistiques fallback

#### Base de Données
- Temps de réponse requêtes
- Pool de connexions
- Performance RLS
- Violations isolation

---

## 🚨 Système d'Alertes

### Seuils Configurés

| Métrique | Warning | Critical |
|----------|---------|----------|
| **API Latence** | 2000ms | 5000ms |
| **Taux Erreur** | 5% | 10% |
| **Mémoire** | 80% | 90% |
| **CPU** | 70% | 85% |
| **Quotas IA** | 80% | 95% |

### Types d'Alertes
- **Performance**: Latence API élevée
- **Reliability**: Taux d'erreur important
- **Resource**: Ressources système saturées
- **Security**: Tentatives cross-tenant

---

## 📊 Dashboards Disponibles

### 1. System Overview
- Statut santé général
- Ressources système
- Alertes actives
- KPIs principaux

### 2. API Performance
- Latence temps réel
- Throughput
- Performance par endpoint
- Codes de statut

### 3. AI Providers
- Statut providers
- Métriques streaming
- Statistiques fallback
- Utilisation quotas

### 4. User Activity
- Sessions actives
- Nouvelles conversations
- Répartition tenants
- Heatmap usage

### 5. Infrastructure
- Connexions database
- Performance requêtes
- WebSocket stats
- Utilisation stockage

---

## 🔧 Configuration Avancée

### Personnalisation Tests

#### Modification Seuils
```javascript
// Dans performance/api-load.test.js
const TARGET_USERS = 200;           // 200 utilisateurs
const MAX_RESPONSE_TIME = 1000;     // 1s max

// Dans performance/streaming.test.js
const TARGET_CONNECTIONS = 50;      // 50 connexions
const FIRST_RESPONSE_TARGET = 300;  // 300ms
```

#### Ajout Endpoints
```javascript
// Dans performance/api-load.test.js
const TEST_CONFIG = {
  endpoints: [
    { path: '/api/custom/endpoint', method: 'GET', requiresAuth: true },
    // ... autres endpoints
  ]
};
```

### Monitoring Personnalisé

#### Métriques Supplémentaires
```javascript
// Dans monitoring/telemetry.js
async collectCustomMetrics() {
  // Ajouter vos métriques spécifiques
  const customData = await this.measureAPILatency('/api/custom');
  this.metrics.custom.set(Date.now(), customData);
}
```

#### Alertes Personnalisées
```javascript
// Dans monitoring/alerts.config.js
const CUSTOM_THRESHOLDS = {
  business: {
    conversion: { warning: 80, critical: 70 },
    engagement: { warning: 60, critical: 50 }
  }
};
```

---

## 🐛 Dépannage

### Problèmes Courants

#### Backend Indisponible
```bash
# Vérifier que le backend est démarré
curl http://localhost:3001/ping

# Vérifier les logs backend
cd ../backend && npm run start:dev
```

#### Tests d'Authentification Échouent
```bash
# Vérifier credentials dans TEST_CONFIG
# Vérifier tenant demo-company existe
# Vérifier base de données accessible
```

#### Timeouts Streaming
```bash
# Augmenter timeouts dans streaming.test.js
const STREAMING_DURATION = 20000; // 20s au lieu de 10s

# Vérifier providers IA configurés
# Vérifier quotas API non dépassés
```

#### Monitoring Ne Démarre Pas
```bash
# Vérifier permissions ports
# Vérifier dépendances axios et ws installées
npm install axios ws

# Vérifier pas d'autres processus sur les ports
```

### Logs de Debug

#### Activer Debug Verbose
```javascript
// Ajouter au début des tests
process.env.DEBUG = 'true';
process.env.VERBOSE = 'true';
```

#### Logs Télémétrie
```javascript
// Dans telemetry.js
console.log('🔍 Debug metrics:', this.metrics);
```

---

## 📚 Documentation Technique

### Architecture Tests
- **Tests isolés**: Chaque test peut s'exécuter indépendamment
- **Données partagées**: Authentification réutilisée entre tests
- **Nettoyage automatique**: Sessions de test supprimées
- **Rapports JSON**: Format standardisé pour intégration CI/CD

### Intégration CI/CD
```yaml
# .github/workflows/performance.yml
- name: Performance Tests
  run: |
    cd tests
    npm install
    npm test
  timeout-minutes: 45
```

### Métriques Production
```javascript
// Intégration Prometheus/Grafana
const prometheus = require('prom-client');
const performanceGauge = new prometheus.Gauge({
  name: 'wikipro_api_latency_p95',
  help: 'API P95 latency in milliseconds'
});
```

---

## 🏆 Validation Sprint 1

### Critères Validés ✅
- [x] Authentification JWT < 200ms
- [x] API sessions CRUD < 200ms  
- [x] Streaming IA < 500ms première réponse
- [x] Fallback providers < 2s basculement
- [x] Interface React < 2s chargement initial
- [x] WebSocket reconnexion < 1s
- [x] Base PostgreSQL RLS < 100ms isolation
- [x] Frontend API integration sans erreur

### Métriques Atteintes ✅
- [x] 100 utilisateurs simultanés supportés
- [x] 30 connexions streaming maintenues
- [x] Monitoring télémétrique opérationnel
- [x] Système d'alertes configuré
- [x] Dashboards monitoring fonctionnels

---

## 📞 Support

**Équipe QA-Performance WikiPro**  
📧 Email: qa-performance@wikipro.dev  
📱 Slack: #wikipro-performance  
📋 Issues: GitHub Issues du projet  

**Documentation complète**: [Wiki Technique WikiPro](docs/)  
**Roadmap**: Sprint 2 - Optimisations Production  

---

**🎯 WikiPro v2.0 - Performance Excellence Achieved! 🏆**