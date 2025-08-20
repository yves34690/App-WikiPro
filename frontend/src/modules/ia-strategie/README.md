# Module IA-Stratégie Avancé - WikiPro

## Vue d'ensemble

Le module IA-Stratégie Avancé est une interface complète pour interagir avec multiple providers d'IA en temps réel. Il offre un chat streaming moderne, une gestion avancée des providers avec fallback automatique, un historique des conversations avec recherche et export, ainsi qu'un dashboard de métriques en temps réel.

## Fonctionnalités Principales

### 🚀 Chat Streaming Temps Réel
- Interface moderne type ChatGPT
- Streaming des réponses avec typing effect
- Support markdown et syntax highlighting
- Actions sur messages (copier, regénérer)
- Raccourcis clavier (Ctrl+Enter, Esc)

### 🔄 Multi-Providers avec Fallback
- Support OpenAI, Anthropic, Gemini
- Sélection intelligente avec métriques
- Fallback automatique en cas d'erreur
- Override manuel du provider
- Notifications temps réel

### 📊 Dashboard Métriques
- Quotas et latence en temps réel
- Taux de succès par provider
- Graphiques et jauges interactives
- Historique d'usage
- Alertes quota faible

### 📝 Historique Avancé
- Recherche full-text dans conversations
- Filtres multiples (provider, type, date)
- Export en multiple formats (MD, JSON, TXT, HTML)
- Sélection multiple et actions batch
- Statistiques détaillées

## Architecture Technique

### Services
- **StreamingClient**: WebSocket sécurisé avec reconnexion automatique
- **ProvidersManager**: Gestion état et métriques des providers
- **AIProviders**: Configuration et capacités des providers

### Hooks
- **useAIChat**: Gestion streaming et conversations
- **useProviderSelection**: Sélection et fallback providers
- **useConversations**: Historique et recherche
- **useLocalStorage**: Persistance préférences

### Composants
- **IAStrategieAdvanced**: Composant principal
- **StreamingChat**: Interface de chat temps réel
- **ProviderSelector**: Sélection providers avec métriques
- **ConversationHistory**: Historique avec recherche/export
- **ProviderMetrics**: Dashboard métriques

## Installation et Usage

### Import du module

```javascript
import { IAStrategieAdvanced } from '../modules/ia-strategie';

// Ou composants individuels
import {
  StreamingChat,
  ProviderSelector,
  ConversationHistory,
  ProviderMetrics
} from '../modules/ia-strategie';
```

### Utilisation basique

```jsx
function MyApp() {
  return (
    <div>
      <IAStrategieAdvanced />
    </div>
  );
}
```

### Utilisation des composants individuels

```jsx
function CustomChat() {
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [sessionId, setSessionId] = useState('session-1');

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sélecteur de provider */}
      <div style={{ width: '300px' }}>
        <ProviderSelector
          onProviderChange={setSelectedProvider}
          layout="list"
          showFallbackToggle={true}
          showNotifications={true}
        />
      </div>
      
      {/* Chat principal */}
      <div style={{ flex: 1 }}>
        <StreamingChat
          sessionId={sessionId}
          selectedProvider={selectedProvider}
          onProviderChange={setSelectedProvider}
          enableMarkdown={true}
          showConnectionStatus={true}
        />
      </div>
    </div>
  );
}
```

### Utilisation des hooks

```jsx
function CustomComponent() {
  // Hook de chat streaming
  const {
    messages,
    isStreaming,
    sendMessage,
    stopStreaming,
    currentProvider
  } = useAIChat({
    sessionId: 'my-session',
    preferredProvider: 'openai',
    enableFallback: true
  });

  // Hook de sélection provider
  const {
    selectedProvider,
    providersData,
    selectProvider,
    notifications
  } = useProviderSelection();

  // Hook conversations
  const {
    conversations,
    searchConversations,
    downloadExport
  } = useConversations({
    sessionId: 'my-session'
  });

  return (
    <div>
      {/* Votre interface personnalisée */}
    </div>
  );
}
```

## Configuration des Providers

### Configuration par défaut

Les providers sont préconfigurés avec leurs capacités et quotas :

```javascript
const AI_PROVIDERS = {
  openai: {
    id: 'openai',
    displayName: 'GPT-4',
    icon: '🤖',
    color: '#10A37F',
    models: ['gpt-4', 'gpt-4-turbo'],
    capabilities: {
      streaming: true,
      reasoning: 'excellent',
      creativity: 'très bon'
    }
  },
  // ... autres providers
};
```

### Personnalisation

```javascript
import { getProvidersManager } from '../modules/ia-strategie';

const manager = getProvidersManager();

// Mettre à jour les métriques
manager.updateProviderStatus('openai', 'online', {
  responseTime: 500,
  availability: 99.9
});

// Enregistrer une requête réussie
manager.recordSuccess('openai', 1200, 150); // latence, tokens
```

## WebSocket et Streaming

### Connexion automatique

```javascript
import { getStreamingClient, WS_EVENTS } from '../modules/ia-strategie';

const client = getStreamingClient();

// Connexion
await client.connect();

// Écoute des événements
client.on(WS_EVENTS.CHAT_CHUNK, (data) => {
  console.log('Nouveau chunk:', data.content);
});

client.on(WS_EVENTS.CHAT_COMPLETE, (data) => {
  console.log('Chat terminé:', data);
});

// Démarrer un chat
client.startChat({
  message: 'Hello!',
  provider: 'openai',
  sessionId: 'my-session'
});
```

### Gestion des erreurs

```javascript
client.on(WS_EVENTS.ERROR, (error) => {
  console.error('Erreur WebSocket:', error);
});

client.on(WS_EVENTS.CHAT_ERROR, (error) => {
  console.error('Erreur chat:', error);
  // Fallback automatique si configuré
});
```

## Raccourcis Clavier

### Globaux
- `Ctrl+Shift+N` : Nouvelle session
- `Ctrl+Shift+H` : Basculer historique
- `Ctrl+Shift+M` : Basculer métriques
- `Ctrl+Shift+S` : Plier/déplier sidebar

### Chat
- `Ctrl+Enter` : Envoyer message
- `Esc` : Arrêter streaming

## Personnalisation Styles

### CSS personnalisé

```css
/* Override des couleurs providers */
.provider-card.openai {
  border-color: #10A37F;
}

.provider-card.anthropic {
  border-color: #FF6B35;
}

/* Animations personnalisées */
.chat-message {
  animation: slideInMessage 0.3s ease-out;
}

@keyframes slideInMessage {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

### Thème sombre

Le module supporte automatiquement le thème sombre via `[data-color-scheme="dark"]`.

## API Backend Requise

### Endpoints WebSocket

```
WS /api/v1/:tenant/ai/stream
```

Events supportés :
- `chat.start` → `chat.chunk` → `chat.complete`
- `chat.error`
- `provider.switch`
- `metrics.update`

### Endpoints REST

```
GET /api/v1/:tenant/ai/providers
POST /api/v1/:tenant/ai/chat
GET /api/v1/:tenant/sessions
POST /api/v1/:tenant/sessions
GET /api/v1/:tenant/sessions/:id/conversations
POST /api/v1/:tenant/sessions/:id/conversations
```

## Tests

### Lancer les tests

```bash
# Tests unitaires
npm test src/modules/ia-strategie

# Tests avec coverage
npm test -- --coverage src/modules/ia-strategie

# Tests d'intégration
npm test src/modules/ia-strategie/IAStrategie-Advanced.integration.test.js
```

### Structure des tests

- `hooks/*.test.js` : Tests des hooks
- `components/*.test.js` : Tests des composants
- `services/*.test.js` : Tests des services
- `*.integration.test.js` : Tests d'intégration

## Performance

### Optimisations incluses

- WebSocket avec reconnexion automatique
- Throttling des métriques (30s par défaut)
- Pagination des conversations
- Lazy loading des composants lourds
- Memoization des calculs coûteux

### Monitoring

```javascript
// Métriques de performance
const { getGlobalStats } = useProviderSelection();

const stats = getGlobalStats();
console.log('Latence moyenne:', stats.averageLatency);
console.log('Taux de succès:', stats.overallSuccessRate);
```

## Troubleshooting

### Problèmes courants

1. **WebSocket ne se connecte pas**
   - Vérifier le token JWT
   - Vérifier l'URL du backend
   - Vérifier les permissions réseau

2. **Providers indisponibles**
   - Vérifier les clés API backend
   - Vérifier les quotas
   - Forcer un refresh des métriques

3. **Messages ne s'affichent pas**
   - Vérifier sessionId
   - Vérifier les permissions utilisateur
   - Vérifier la console pour erreurs API

### Debug

```javascript
// Activer les logs debug
localStorage.setItem('wikip:ia:debug', 'true');

// Vérifier l'état WebSocket
const client = getStreamingClient();
console.log(client.getConnectionState());

// Vérifier les métriques providers
const manager = getProvidersManager();
console.log(manager.getAllMetrics());
```

## Roadmap

### V3.0 (Q1 2024)
- [ ] Support des fichiers (images, documents)
- [ ] Templates de prompts
- [ ] Collaboration temps réel
- [ ] Analytics avancées

### V3.1 (Q2 2024)
- [ ] Voice input/output
- [ ] Plugins système
- [ ] API publique
- [ ] Mobile responsive

## Contribution

Voir `CONTRIBUTING.md` pour les guidelines de développement et de contribution au module IA-Stratégie.

## License

Propriétaire - WikiPro © 2024