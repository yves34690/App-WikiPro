# Sessions IA Module - WikiPro Backend

Module de persistance des sessions et conversations IA avec isolation tenant stricte.

## 🎯 Objectif

Implémenter un système CRUD complet pour les sessions IA permettant de :
- Créer et gérer des sessions de conversation avec différents providers IA
- Persister l'historique complet des conversations
- Garantir une isolation tenant rigoureuse
- Maintenir des performances optimales (< 200ms par requête)

## 📋 Critères d'Acceptation

### ✅ CRUD Complet Sessions
- [x] Création de session avec titre + provider obligatoires
- [x] Liste paginée des sessions utilisateur avec tri par date
- [x] Mise à jour titre et métadonnées
- [x] Suppression avec cascade sur conversations
- [x] Isolation tenant automatique via user_id

### ✅ Historique Conversations Persistant
- [x] Création de conversation avec message obligatoire
- [x] Mise à jour avec réponse IA + métriques (tokens, temps)
- [x] Liste paginée avec tri chronologique
- [x] Tracking provider utilisé et performance

### ✅ Performance Optimisée
- [x] Toutes requêtes < 200ms avec pagination
- [x] Index optimaux sur (user_id, created_at)
- [x] Pagination par défaut (limit 20, max 100)

### ✅ Validation DTOs Stricte
- [x] Titre: 1-255 caractères, pas de HTML dangereux
- [x] Provider: enum strict (openai|anthropic|gemini)
- [x] Message: 1-50000 caractères obligatoire
- [x] Métadonnées: JSON valide, max 10KB

### ✅ Sécurité & Isolation
- [x] RLS policies empêchant accès cross-tenant
- [x] Validation inputs contre XSS/injection
- [x] Triple niveau isolation tenant
- [x] Cascade DELETE sécurisé

## 🏗️ Architecture

### Structure des Fichiers
```
src/core/sessions/
├── entities/
│   ├── session.entity.ts          # Entité Session avec relations
│   └── conversation.entity.ts     # Entité Conversation avec métriques
├── dto/
│   ├── create-session.dto.ts      # DTO création session
│   ├── update-session.dto.ts      # DTO mise à jour session
│   ├── conversation.dto.ts        # DTOs conversations + query
│   └── index.ts                   # Exports DTOs
├── tests/
│   └── tenant-isolation.e2e-spec.ts # Tests isolation multi-tenant
├── scripts/
│   ├── create-test-data.ts        # Création données de test
│   └── validate-implementation.ts  # Validation critères
├── session.service.ts             # Service métier avec isolation
├── session.controller.ts          # API REST avec 4 endpoints
├── session.module.ts              # Module NestJS
├── session.service.spec.ts        # Tests unitaires service
├── session.controller.spec.ts     # Tests intégration API
└── README.md                      # Documentation
```

### Base de Données

#### Table ai_sessions
```sql
CREATE TABLE ai_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('openai', 'anthropic', 'gemini')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Table conversations
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT,
    provider_used VARCHAR(50) CHECK (provider_used IN ('openai', 'anthropic', 'gemini')),
    tokens_used INTEGER DEFAULT 0 CHECK (tokens_used >= 0),
    processing_time_ms INTEGER DEFAULT 0 CHECK (processing_time_ms >= 0),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### RLS Policies
```sql
-- Session isolation par tenant via user_id
CREATE POLICY ai_sessions_tenant_isolation ON ai_sessions 
    USING (user_id IN (SELECT id FROM users WHERE tenant_id = current_tenant_id()));

-- Conversation isolation via session
CREATE POLICY conversations_tenant_isolation ON conversations
    USING (session_id IN (SELECT s.id FROM ai_sessions s INNER JOIN users u ON s.user_id = u.id 
           WHERE u.tenant_id = current_tenant_id()));
```

## 🚀 API Endpoints

### 1. GET /api/v1/:tenant_slug/sessions
Liste paginée des sessions utilisateur avec statistiques.

**Query Parameters:**
- `page` (optional): Numéro de page (défaut: 1)
- `limit` (optional): Éléments par page (défaut: 20, max: 100)
- `title` (optional): Filtrage par titre (recherche partielle)
- `provider` (optional): Filtrage par provider IA

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "session": {
        "id": "uuid",
        "title": "Analyse Q1 2025",
        "provider": "openai",
        "metadata": {},
        "created_at": "2025-01-15T10:00:00Z",
        "updated_at": "2025-01-15T10:00:00Z"
      },
      "stats": {
        "conversationCount": 5,
        "totalTokens": 1500,
        "avgProcessingTime": 2300,
        "lastActivity": "2025-01-15T12:00:00Z"
      }
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "processingTimeMs": 150
  }
}
```

### 2. POST /api/v1/:tenant_slug/sessions
Création d'une nouvelle session IA.

**Body:**
```json
{
  "title": "Nouvelle analyse stratégique",
  "provider": "openai",
  "metadata": {
    "context": "analyse_financiere",
    "priority": "high"
  }
}
```

### 3. GET /api/v1/:tenant_slug/sessions/:session_id/conversations
Historique des conversations d'une session.

**Query Parameters:**
- `page`, `limit`: Pagination standard
- `provider` (optional): Filter par provider utilisé

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "message": "Quelle est la tendance du marché ?",
      "response": "Basé sur les données disponibles...",
      "provider_used": "openai",
      "tokens_used": 150,
      "processing_time_ms": 2300,
      "has_response": true,
      "is_complete": true,
      "created_at": "2025-01-15T10:05:00Z",
      "statistics": {
        "message_length": 35,
        "response_length": 245,
        "token_efficiency": 0.065,
        "compression_ratio": 7.0
      }
    }
  ],
  "meta": { /* pagination standard */ }
}
```

### 4. POST /api/v1/:tenant_slug/sessions/:session_id/conversations
Ajout d'une conversation à une session.

**Body:**
```json
{
  "message": "Analyse les tendances du marché pour Q1 2025",
  "metadata": {
    "context": "market_analysis",
    "urgency": "high"
  }
}
```

### Endpoints Bonus

#### PUT /api/v1/:tenant_slug/sessions/:session_id
Mise à jour d'une session (titre et/ou métadonnées).

#### DELETE /api/v1/:tenant_slug/sessions/:session_id  
Suppression d'une session et toutes ses conversations.

#### PUT /api/v1/:tenant_slug/sessions/conversations/:conversation_id
Mise à jour conversation avec réponse IA et métriques.

## 🔒 Sécurité

### Isolation Tenant
- **Triple niveau**: JWT Auth → Tenant Guard → RLS Database
- **User scope**: Chaque requête filtrée par user_id automatiquement
- **RLS policies**: Protection au niveau PostgreSQL même en cas de bypass applicatif

### Validation Inputs
- **Sanitization**: Protection XSS sur titre (regex Matches)
- **Size limits**: Titre 255 chars, message 50KB, métadonnées 10KB
- **Enum validation**: Providers strictement contrôlés
- **SQL injection**: Paramétrisé via TypeORM

### Rate Limiting
- **GET sessions**: 60 req/min par utilisateur
- **POST sessions**: 30 créations/min par utilisateur  
- **POST conversations**: 50 messages/min par utilisateur

## ⚡ Performance

### Optimisations
- **Index composites**: `(user_id, created_at)` pour pagination rapide
- **Index recherche**: GIN sur `to_tsvector(title)` pour recherche texte
- **Pagination obligatoire**: Défaut 20, max 100 éléments
- **Query optimization**: `findManyAndCount()` optimisé

### Métriques Objectifs
- **< 200ms**: Toutes requêtes API incluant pagination
- **< 100ms**: Requêtes simples (get by id)
- **< 500ms**: Requêtes avec calculs statistiques

### Monitoring
- **Processing time**: Inclus dans chaque réponse API
- **Token efficiency**: Calcul automatique tokens/seconde
- **Cache ready**: Architecture compatible Redis future

## 🧪 Tests

### Tests Unitaires
```bash
npm test session.service.spec.ts
npm test session.controller.spec.ts
```

### Tests d'Intégration
```bash
npm test session.controller.spec.ts -- --detectOpenHandles
```

### Tests Isolation Multi-tenant
```bash
npm test tenant-isolation.e2e-spec.ts
```

### Validation Complète
```bash
npm run sessions:validate
```

### Données de Test
```bash
# Créer données de test standard
npm run test-data create

# Créer dataset volumineux pour performance
npm run test-data create-large

# Nettoyer données de test
npm run test-data clean
```

## 🔧 Configuration

### Variables d'Environnement
```env
# Base de données (héritées du module principal)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wikipro
DB_USERNAME=wikipro_app
DB_PASSWORD=secure_password

# Rate limiting (optionnel, défauts dans ThrottlerModule)
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### Intégration Module
Le module est automatiquement intégré dans `AppModule`:
```typescript
import { SessionModule } from '@core/sessions/session.module';

@Module({
  imports: [
    // ... autres modules
    SessionModule,
  ],
})
export class AppModule {}
```

## 📈 Métriques & Monitoring

### Statistiques par Session
- Nombre de conversations
- Total tokens consommés  
- Temps de traitement moyen
- Dernière activité

### KPIs Globaux
- Sessions actives par tenant
- Tokens consommés par provider
- Performance moyenne par endpoint
- Taux d'erreur par type de requête

### Logs Structurés
```typescript
// Exemple de log service
this.logger.log(
  `Session créée pour tenant ${tenantSlug} en ${processingTime}ms: ${session.id}`
);
```

## 🚀 Déploiement

### Migrations
```bash
# Appliquer migration sessions
npm run migration:run

# Vérifier RLS policies
psql -d wikipro -c "SELECT * FROM pg_policies WHERE tablename IN ('ai_sessions', 'conversations');"
```

### Vérification Post-Déploiement
```bash
# Validation automatique
npm run sessions:validate

# Test performance en conditions réelles
npm run sessions:perf-test
```

## 🔮 Évolutions Futures

### Phase 2 - Fonctionnalités Avancées
- [ ] Export/Import sessions en JSON/CSV
- [ ] Templates de sessions réutilisables
- [ ] Historique des modifications (audit trail)
- [ ] Partage de sessions entre utilisateurs (même tenant)

### Phase 3 - IA Intégrée
- [ ] Auto-catégorisation des sessions par IA
- [ ] Suggestions de questions follow-up
- [ ] Analyse sentiment des conversations
- [ ] Résumés automatiques de sessions

### Phase 4 - Analytics
- [ ] Dashboard analytics par tenant
- [ ] Métriques d'utilisation par provider
- [ ] Optimisation automatique des prompts
- [ ] A/B testing providers IA

---

## 📞 Support

Pour questions techniques ou bugs:
1. Vérifier les logs: `npm run logs:sessions`
2. Lancer validation: `npm run sessions:validate` 
3. Créer issue avec détails reproduction

**Status**: ✅ PRODUCTION READY - Tous critères TICKET-BACKEND-003 validés