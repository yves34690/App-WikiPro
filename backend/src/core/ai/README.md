# Module IA Multi-Providers - WikiPro

Ce module implémente un système d'intelligence artificielle multi-providers avec fallback automatique, gestion des quotas, et streaming temps réel pour WikiPro.

## 🎯 Fonctionnalités Principales

### ✅ Providers Supportés
- **OpenAI GPT** (gpt-4, gpt-3.5-turbo)
- **Anthropic Claude** (claude-3-sonnet, claude-3-haiku)
- **Google Gemini** (gemini-1.5-pro, gemini-1.0-pro)

### ✅ Fonctionnalités Avancées
- **Fallback automatique** entre providers
- **Gestion des quotas** par tenant et provider
- **Streaming WebSocket** temps réel < 500ms
- **Circuit breaker** pour la résilience
- **Monitoring** et métriques
- **Isolation multi-tenant**

## 🏗️ Architecture

```
src/core/ai/
├── providers/           # Providers IA
│   ├── base-provider.ts
│   ├── openai.provider.ts
│   ├── anthropic.provider.ts
│   └── gemini.provider.ts
├── services/           # Services métier
│   ├── ai-orchestrator.service.ts
│   └── quota-manager.service.ts
├── dto/                # Data Transfer Objects
│   ├── chat-request.dto.ts
│   ├── stream-request.dto.ts
│   └── provider-config.dto.ts
├── ai.controller.ts    # API REST
├── ai.gateway.ts      # WebSocket Gateway
└── ai.module.ts       # Module principal
```

## 🚀 Configuration

### Variables d'Environnement

```bash
# OpenAI
AI_OPENAI_API_KEY=sk-your-openai-key
AI_OPENAI_MODEL=gpt-4

# Anthropic  
AI_ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
AI_ANTHROPIC_MODEL=claude-3-sonnet-20240229

# Gemini
AI_GEMINI_API_KEY=your-gemini-key
AI_GEMINI_MODEL=gemini-1.5-pro

# Configuration générale
AI_DEFAULT_TEMPERATURE=0.7
AI_FALLBACK_ENABLED=true
AI_CIRCUIT_BREAKER_THRESHOLD=5
```

### Quotas par Défaut

```typescript
// Limites tenant
AI_TENANT_DAILY_TOKEN_LIMIT=50000
AI_TENANT_MONTHLY_TOKEN_LIMIT=1000000

// Limites provider global
AI_OPENAI_DAILY_LIMIT=500000
AI_ANTHROPIC_DAILY_LIMIT=300000
AI_GEMINI_DAILY_LIMIT=200000
```

## 📡 API Endpoints

### Chat Synchrone
```http
POST /api/v1/:tenant_slug/ai/chat
Content-Type: application/json
Authorization: Bearer <jwt_token>
X-Preferred-Provider: openai|anthropic|gemini

{
  "messages": [
    { "role": "user", "content": "Hello AI!" }
  ],
  "temperature": 0.7,
  "maxTokens": 1000,
  "sessionId": "optional-session-id"
}
```

### Statut des Providers
```http
GET /api/v1/:tenant_slug/ai/providers
Authorization: Bearer <jwt_token>
```

### Health Check
```http
GET /api/v1/:tenant_slug/ai/health
Authorization: Bearer <jwt_token>
```

### Statistiques
```http
GET /api/v1/:tenant_slug/ai/stats
Authorization: Bearer <jwt_token>
```

## 🔄 WebSocket Streaming

### Connexion
```javascript
const socket = io('/ai/stream', {
  auth: {
    token: 'jwt_token',
    tenantId: 'tenant_id',
    userId: 'user_id'
  }
});
```

### Événements
```javascript
// Démarrer un stream
socket.emit('chat.stream.start', {
  messages: [{ role: 'user', content: 'Hello!' }],
  temperature: 0.7,
  preferredProvider: 'openai'
});

// Écouter les chunks
socket.on('chat.chunk', (data) => {
  console.log('Chunk reçu:', data.chunk.delta);
});

// Stream terminé
socket.on('chat.complete', (data) => {
  console.log('Réponse complète:', data.response);
});
```

## 🎛️ Gestion des Quotas

### Vérification Automatique
- Quotas tenant (quotidien/mensuel)
- Quotas provider (global)
- Alertes automatiques (75%, 90%)

### Réinitialisation
- **Quotas quotidiens**: Minuit UTC
- **Quotas mensuels**: 1er du mois UTC

### Monitoring
```typescript
// Récupération des métriques
const stats = quotaManager.getGlobalStats();
const alerts = quotaManager.getRecentAlerts();
```

## ⚡ Logique de Fallback

### Ordre de Priorité (par défaut)
1. **OpenAI** (priorité 9)
2. **Anthropic** (priorité 8)  
3. **Gemini** (priorité 7)

### Triggers de Fallback
- Provider indisponible (HTTP 5xx)
- Quota épuisé (HTTP 429)
- Timeout > 30s
- Circuit breaker activé

### Override Manuel
```http
X-Preferred-Provider: anthropic
```

## 🛡️ Circuit Breaker

### Configuration
- **Seuil**: 5 erreurs consécutives
- **Timeout**: 60 secondes
- **Récupération**: Automatique

### États
- **Fermé**: Fonctionnement normal
- **Ouvert**: Provider désactivé
- **Semi-ouvert**: Test de récupération

## 📊 Métriques & Monitoring

### Par Provider
```typescript
interface ProviderMetrics {
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageLatency: number;
  dailyTokens: number;
  errorRate: number;
}
```

### Alertes
- **Warning**: 75% des quotas
- **Critical**: 90% des quotas
- **Exceeded**: 100% des quotas

## 🧪 Tests

### Tests Unitaires
```bash
npm test -- src/core/ai/tests/
```

### Tests d'Intégration
```bash
npm run test:e2e -- --testNamePattern="AI Module"
```

### Test Manuel API
```bash
node test-ai-api.js
```

## 🔧 Développement

### Ajouter un Nouveau Provider

1. **Créer le provider**:
```typescript
export class NewProvider extends BaseProvider {
  readonly type = AIProviderType.NEW_PROVIDER;
  readonly name = 'New Provider';
  
  async initialize(): Promise<void> { /* ... */ }
  async chatCompletion(request: ChatRequest): Promise<ChatResponse> { /* ... */ }
  async chatCompletionStream(request: ChatRequest, events: StreamEvents): Promise<void> { /* ... */ }
}
```

2. **Ajouter au enum**:
```typescript
export enum AIProviderType {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GEMINI = 'gemini',
  NEW_PROVIDER = 'new_provider', // 👈 Nouveau
}
```

3. **Intégrer dans l'orchestrateur**:
```typescript
await this.aiOrchestrator.initialize(
  openaiApiKey,
  anthropicApiKey, 
  geminiApiKey,
  newProviderApiKey // 👈 Nouveau
);
```

### Debug & Logs

Les logs incluent:
- 🚀 Initialisation des providers
- 💬 Requêtes et réponses 
- ⚡ Circuit breaker events
- 🚨 Alertes quotas
- 📊 Métriques de performance

Niveau de log recommandé: `info` en production, `debug` en développement.

## 🚨 Dépannage

### Provider Indisponible
1. Vérifier la clé API
2. Vérifier la connectivité réseau
3. Consulter les logs d'initialisation

### Quotas Dépassés
1. Vérifier `GET /ai/providers` pour les quotas actuels
2. Ajuster les limites dans les variables d'environnement
3. Réinitialiser manuellement si nécessaire

### Streaming Lent
1. Vérifier la latence réseau
2. Optimiser la configuration WebSocket
3. Ajuster les timeout providers

### Circuit Breaker Activé
1. Attendre la récupération automatique (60s)
2. Vérifier la santé du provider
3. Réduire le seuil si nécessaire

## 📋 TODO / Roadmap

- [ ] Support des function calls OpenAI
- [ ] Cache Redis pour les réponses
- [ ] Métriques Prometheus
- [ ] Dashboard de monitoring
- [ ] Support multimodal (images)
- [ ] Fine-tuning des modèles
- [ ] Rate limiting adaptatif

## 🤝 Contribution

1. Suivre les patterns existants
2. Ajouter des tests unitaires
3. Documenter les nouvelles fonctionnalités
4. Respecter l'isolation multi-tenant
5. Maintenir la compatibilité API

---

**Auteurs**: Équipe WikiPro  
**Version**: 1.0.0  
**Dernière mise à jour**: $(date)