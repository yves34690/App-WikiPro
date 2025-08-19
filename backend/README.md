# WikiPro Backend - Sprint 0 Foundation

## 🎯 Vue d'ensemble

Backend NestJS pour WikiPro - Plateforme de gestion de connaissances assistée par IA avec architecture multi-tenant.

**Principe fondamental**: "Un WikiPro = Une entité" - Isolation stricte par tenant.

## 🏗️ Architecture

### Core Services

- **Config Service**: Configuration centralisée avec validation
- **Auth Service**: Authentification JWT avec isolation multi-tenant
- **Telemetry Service**: Métriques et événements pour monitoring
- **Registry Service**: Pattern Registry pour providers modulaires

### AI Providers

- **Gemini Provider**: Interface Google Gemini 2.5 Flash
- **Provider Registry**: Système extensible pour futurs providers IA

## 🚀 Installation

```bash
# Cloner le projet
git clone <repo-url>
cd App-WikiPro/backend

# Installer les dépendances
npm install

# Configuration environnement
cp .env.example .env
# Éditer .env avec vos clés API

# Démarrer en développement
npm run start:dev

# Build production
npm run build
npm run start:prod
```

## 🔧 Configuration

### Variables d'environnement (.env)

```bash
# Serveur
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Base de données (futur)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=wikipro

# JWT Security
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=24h
BCRYPT_ROUNDS=12

# Google Gemini IA
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash-002
AI_MAX_TOKENS=4096
AI_TEMPERATURE=0.7

# Télémétrie (optionnel)
TELEMETRY_ENABLED=false
```

## 📋 API Endpoints

### Health & Status
- `GET /` - Health check global
- `GET /ping` - Ping/pong test

### Authentication
- `POST /auth/validate` - Valider un token JWT
- `GET /auth/profile` - Profil utilisateur
- `POST /auth/hash-password` - Hasher un mot de passe (dev)

### AI Providers
- `POST /ai/generate-text` - Générer du texte
- `POST /ai/chat-completion` - Chat completion
- `GET /ai/providers` - Lister providers disponibles
- `POST /ai/test-provider` - Tester un provider

### Registry
- `GET /registry/providers` - Lister tous les providers
- `GET /registry/providers/by-type` - Providers par type
- `GET /registry/providers/best` - Meilleur provider
- `POST /registry/health-check` - Health check providers

### Telemetry
- `GET /telemetry/events` - Événements récents
- `GET /telemetry/metrics` - Métriques par nom
- `GET /telemetry/system` - Métriques système

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests avec couverture
npm run test:cov

# Tests en mode watch
npm run test:watch
```

## 🔒 Sécurité Multi-tenant

### Isolation par Tenant
- Chaque requête authentifiée inclut un `tenantId`
- Validation automatique via `TenantGuard`
- Isolation stricte des données par tenant

### JWT Structure
```json
{
  "sub": "user-id",
  "email": "user@example.com", 
  "tenantId": "tenant-123",
  "roles": ["user", "admin"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

## 🤖 Utilisation IA

### Génération de texte
```typescript
POST /ai/generate-text
{
  "prompt": "Votre prompt ici",
  "maxTokens": 1000,
  "temperature": 0.7,
  "provider": "gemini" // optionnel
}
```

### Chat completion
```typescript
POST /ai/chat-completion
{
  "messages": [
    {"role": "user", "content": "Bonjour!"},
    {"role": "assistant", "content": "Salut! Comment ça va?"},
    {"role": "user", "content": "Très bien, merci!"}
  ],
  "maxTokens": 1000,
  "temperature": 0.7
}
```

## 📊 Monitoring

### Métriques automatiques
- Temps de réponse API
- Usage tokens IA
- Événements utilisateur
- Health checks providers

### Télémétrie
- Événements business trackés
- Métriques performance
- Support OpenTelemetry (futur)

## 🛠️ Scripts disponibles

```bash
npm run start          # Démarrer en mode production
npm run start:dev      # Démarrer en mode développement
npm run start:debug    # Démarrer en mode debug
npm run build          # Build pour production
npm run test           # Lancer les tests
npm run test:cov       # Tests avec couverture
npm run lint           # Linter le code
```

## 🔄 Architecture Registry Pattern

Le backend utilise un pattern Registry pour gérer les providers de manière modulaire :

### Enregistrement automatique
- Providers enregistrés au démarrage
- Health checks périodiques (5 min)
- Priorisation automatique

### Extensibilité
- Ajout facile de nouveaux providers IA
- Support multi-providers par type
- Fallback automatique si provider indisponible

## 📈 Roadmap Sprint 0

- [x] ✅ Setup NestJS + TypeScript
- [x] ✅ Core services (auth, config, telemetry)  
- [x] ✅ Registry pattern
- [x] ✅ Gemini provider
- [x] ✅ Tests unitaires
- [x] ✅ Documentation API

## 🚨 Important

**Ce backend est en Sprint 0** - Foundation seulement:
- Pas encore de base de données
- Auth basique (JWT seulement)
- Interface IA fonctionnelle 
- Prêt pour intégration frontend

**Sécurité**: Ne pas exposer les clés API. Utiliser des variables d'environnement.

**Multi-tenant**: Chaque requête doit inclure le tenantId pour l'isolation des données.

---

*Généré avec 🤖 WikiPro Sprint 0*