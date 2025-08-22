# TICKET-BACKEND-003 - Configuration Multi-Providers avec Health Checks

## 📋 Plan de Mise en Œuvre

### Phase 1 - Extension Configuration (30min)
**Objectif :** Étendre le ConfigService existant avec toutes les configurations IA avancées

1. **Extension .env.example**
   - Ajouter toutes les variables de configuration IA spécifiées
   - Variables de quotas, limits, timeouts, fallback
   - Configuration des health checks et alertes

2. **Mise à jour config.validation.ts**  
   - Étendre le schéma Joi avec toutes les nouvelles variables
   - Validation des API keys et modèles
   - Validation des quotas et limites

3. **Extension ConfigService**
   - Créer interface AIGatewayConfig complète
   - Méthodes utilitaires (getActiveProviders, etc.)
   - Configuration fallback et retry logique

### Phase 2 - Services Configuration IA (45min)
**Objectif :** Créer AIConfigService centralisé avec validation démarrage

4. **Création ai-gateway/config/ai-config.interface.ts**
   - Interfaces configuration complètes
   - Types pour health checks, quotas, fallback
   - Énumérations providers et statuts

5. **Implémentation ai-gateway/config/ai-config.service.ts**
   - Service centralisé de configuration IA
   - Validation au démarrage (fail-fast)
   - Méthodes utilitaires pour providers actifs
   - Cache configuration avec refresh

### Phase 3 - Système Health Checks (60min) 
**Objectif :** Créer système complet de health checks multi-providers

6. **Extension interfaces health existantes**
   - Compléter health.interface.ts avec nouvelles interfaces
   - QuotaStatus, ConfigValidationResult
   - AlertThreshold et métriques avancées

7. **Implémentation ai-gateway/health/ai-health.service.ts**
   - Health checks par provider avec timeout < 5s
   - Validation configuration globale
   - Monitoring quotas temps réel
   - Logique fallback automatique

8. **Création ai-gateway/health/ai-health.controller.ts**
   - Endpoints API `/api/ai/health` et `/api/ai/providers`
   - Format dashboard-ready
   - Intégration avec monitoring existant

### Phase 4 - Stubs Providers (30min)
**Objectif :** Créer stubs providers prêts pour intégration vraies APIs

9. **Mise à jour ai-gateway/providers/[provider].provider.ts**  
   - Stubs OpenAI, Anthropic, Gemini dans ai-gateway/providers/
   - Interface commune avec health checks
   - Simulation latence et réponses réalistes
   - Préparation pour vraies implémentations

### Phase 5 - Intégration Health Global (30min)
**Objectif :** Intégrer health IA avec health controller global

10. **Extension AppController health endpoint**
    - Intégrer AI health dans endpoint `/health` global
    - Statut agrégé système + IA
    - Backward compatibility

11. **Tests et validation**
    - Tests health checks et configuration  
    - Tests fallback et retry logic
    - Tests démarrage avec/sans clés API
    - Tests endpoints API health

## 🎯 Critères de Validation

### Configuration ✅
- [ ] Toutes variables .env documentées dans .env.example
- [ ] Validation Joi complète au démarrage
- [ ] Fail-fast si configuration critique manquante
- [ ] Configuration providers activés dynamique

### Health Checks ✅  
- [ ] Health check < 5s timeout par provider
- [ ] Endpoints `/api/ai/health` et `/api/ai/providers` fonctionnels
- [ ] Format JSON dashboard-ready
- [ ] Métriques temps réel (response time, error rate)

### Fallback & Reliability ✅
- [ ] Fallback automatique si provider indisponible
- [ ] Retry logic avec exponential backoff
- [ ] Quotas monitoring par tenant
- [ ] Alertes configurables par seuils

### Tests ✅
- [ ] Coverage 100% nouveaux services  
- [ ] Tests démarrage configuration valide/invalide
- [ ] Tests health checks avec simulation timeout
- [ ] Tests fallback et retry scenarios

## 🚀 Livrables

### Fichiers Créés
- `backend/src/ai-gateway/config/ai-config.interface.ts`
- `backend/src/ai-gateway/config/ai-config.service.ts` 
- `backend/src/ai-gateway/health/ai-health.service.ts`
- `backend/src/ai-gateway/health/ai-health.controller.ts`
- `backend/src/ai-gateway/providers/openai.provider.ts` (stub)
- `backend/src/ai-gateway/providers/anthropic.provider.ts` (stub)
- `backend/src/ai-gateway/providers/gemini.provider.ts` (stub)

### Fichiers Modifiés
- `backend/.env.example` (variables IA complètes)
- `backend/src/core/config/config.validation.ts` (validation étendue)
- `backend/src/core/config/config.service.ts` (AIGatewayConfig)
- `backend/src/ai-gateway/interfaces/health.interface.ts` (types étendus)
- `backend/src/app.controller.ts` (intégration AI health)
- `backend/src/ai-gateway/ai-gateway.module.ts` (nouveaux services)

### Tests
- Tests unitaires pour tous nouveaux services
- Tests intégration health checks
- Tests configuration et validation
- Tests fallback scenarios

## 📈 Impact Architecture
- Base solide pour intégration vrais providers LLM
- Monitoring et observabilité temps réel
- Resilience et haute disponibilité
- Configuration centralisée et sécurisée
- API health dashboard-ready

---

**État :** ⏳ En attente d'approbation
**Durée estimée :** 3h15min  
**Complexité :** Moyenne-Élevée