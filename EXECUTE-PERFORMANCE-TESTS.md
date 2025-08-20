# 🚀 GUIDE EXÉCUTION - TESTS PERFORMANCE WIKIPRO

## TICKET-PERFORMANCE-001 - Suite Complète Prête

**📅 Créé:** 20 août 2025  
**🎯 Objectif:** Guide d'exécution rapide des tests performance  
**⏱️ Durée:** 2 minutes démo / 30 minutes complet  

---

## ⚡ DÉMARRAGE ULTRA-RAPIDE

### 1. 🔧 Prérequis (2 minutes)

```bash
# 1. Backend WikiPro démarré
cd backend
npm run start:dev
# ✅ Backend sur http://localhost:3001

# 2. Vérification base données
# ✅ PostgreSQL avec tenant demo-company
# ✅ Utilisateur admin@demo-company.com / admin123
```

### 2. 🎯 Démonstration Express (2 minutes)

```bash
# Navigation vers tests
cd tests

# Démonstration rapide validation fonctionnelle
npm run demo

# 📊 Résultat immédiat :
# ✅ Backend disponible
# ✅ Authentification fonctionnelle  
# ✅ APIs accessibles
# ✅ Sessions CRUD opérationnel
# ✅ Monitoring configuré
```

### 3. 🏆 Tests Complets (30 minutes)

```bash
# Suite complète tous tests + monitoring + rapport final
npm test

# 📋 Exécution séquentielle :
# 🏃‍♂️ Tests performance (API, streaming, auth, DB)
# 🎭 Tests E2E (parcours, providers, sessions)  
# 📊 Tests monitoring (télémétrie, alertes, dashboards)
# 📄 Rapport final généré
```

---

## 📊 TESTS INDIVIDUELS DISPONIBLES

### Tests Performance
```bash
npm run test:api-load      # 100 utilisateurs simultanés
npm run test:streaming     # Streaming IA 30 connexions
npm run test:auth         # Auth + isolation tenant
npm run test:database     # Performance PostgreSQL + RLS
```

### Tests End-to-End
```bash
npm run test:e2e-journey  # Parcours utilisateur complet
npm run test:e2e-providers # Fallback multi-providers IA
npm run test:e2e-sessions # Gestion sessions persistantes
```

### Monitoring & Dashboards
```bash
npm run monitor           # Télémétrie temps réel 60s
npm run alerts           # Simulation système alertes
npm run dashboards       # Démonstration dashboards
```

---

## 🎯 CRITÈRES DE VALIDATION

### ✅ Performances Attendues
- **API Latence P95:** < 500ms
- **Streaming IA:** < 500ms première réponse
- **Authentification:** < 200ms
- **Base données:** < 200ms requêtes
- **Parcours E2E:** < 10s total

### ✅ Résultats Tests
- **Charge API:** 100 utilisateurs supportés
- **Streaming:** 30 connexions simultanées
- **E2E:** 100% parcours réussis
- **Monitoring:** Métriques collectées
- **Alertes:** Seuils configurés

---

## 📋 CHECKLIST EXÉCUTION

### Avant Tests
- [ ] Backend WikiPro démarré (`npm run start:dev`)
- [ ] Base PostgreSQL accessible
- [ ] Tenant demo-company configuré
- [ ] Node.js >= 16.0.0 installé

### Pendant Tests
- [ ] Aucune erreur fatale affichée
- [ ] Métriques collectées en temps réel
- [ ] Progression visible dans logs
- [ ] Rapports générés dans /reports

### Après Tests
- [ ] Rapport final `FINAL-PERFORMANCE-REPORT.json`
- [ ] Tous critères Sprint 1 validés ✅
- [ ] Recommandations produites
- [ ] Système prêt production

---

## 🔧 DÉPANNAGE EXPRESS

### Backend Indisponible
```bash
# Vérifier backend démarré
curl http://localhost:3001/ping

# Si erreur, redémarrer backend
cd backend && npm run start:dev
```

### Authentification Échoue
```bash
# Vérifier credentials et tenant dans base
# Par défaut : admin@demo-company.com / admin123
# Tenant : demo-company
```

### Tests Timeout
```bash
# Vérifier ressources système
# Augmenter timeouts si nécessaire
# Redémarrer backend si surcharge
```

---

## 📊 INTERPRÉTATION RÉSULTATS

### 🟢 Succès Complet
```
✅ Tous tests passés
✅ Métriques dans cibles
✅ Aucune erreur critique
🎯 SYSTÈME PRÊT PRODUCTION
```

### 🟡 Succès Partiel
```
⚠️ Quelques tests échoués
⚠️ Certaines métriques limites
💡 Optimisations recommandées
🔧 AJUSTEMENTS REQUIS
```

### 🔴 Échec
```
❌ Tests critiques échoués
❌ Performances insuffisantes
❌ Erreurs système majeures
🚨 INTERVENTION NÉCESSAIRE
```

---

## 🎯 LIVRABLES GÉNÉRÉS

### Rapports JSON
- `api-load-report.json` - Tests charge API
- `streaming-report.json` - Tests streaming IA
- `auth-performance-report.json` - Tests authentification
- `user-journey-report.json` - Parcours E2E
- `FINAL-PERFORMANCE-REPORT.json` - **Rapport consolidé**

### Documentation
- `performance-report.md` - Rapport final validation
- Logs détaillés console
- Métriques télémétrie temps réel

---

## 🚀 PRÊT À EXÉCUTER !

### 🎯 Démo Rapide (Recommandé)
```bash
cd tests && npm run demo
```

### 🏆 Suite Complète
```bash
cd tests && npm test
```

### 📊 Monitoring Temps Réel
```bash
cd tests && npm run monitor
```

---

**🎉 WikiPro v2.0 Performance Excellence Awaits! 🏆**

**📞 Support:** Agent QA-Performance WikiPro  
**📧 Contact:** qa-performance@wikipro.dev  
**🔗 Documentation:** `tests/README.md`