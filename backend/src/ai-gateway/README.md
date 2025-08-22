# AI Gateway Module - WikiPro

Le module AI Gateway est la fondation du système d'intelligence artificielle de WikiPro. Il fournit une couche d'abstraction unifiée pour interagir avec différents fournisseurs d'IA (OpenAI, Anthropic, Gemini, etc.) et inclut un système de mock intelligent pour le développement.

## Architecture

```
ai-gateway/
├── ai-gateway.service.ts       # Service principal avec routing et orchestration
├── ai-gateway.module.ts        # Configuration du module global
├── interfaces/                 # Définitions des types et interfaces
│   ├── llm-provider.interface.ts
│   ├── ai-response.interface.ts
│   └── health.interface.ts
├── providers/                  # Providers IA
│   ├── base.provider.ts        # Classe abstraite de base
│   └── mock.provider.ts        # Mock intelligent pour développement
└── README.md                   # Documentation (ce fichier)
```

## Fonctionnalités Principales

### 1. Mock Provider Intelligent
- Réponses contextuelles basées sur l'analyse de mots-clés
- Simulation de latence réaliste (1-3 secondes)
- Gestion d'erreurs avec simulation d'échecs (2% de taux d'erreur)
- Métriques de performance simulées

### 2. Routing Multi-LLM
- Router intelligent vers différents providers
- Système de fallback automatique
- Gestion des priorités et de la charge

### 3. Foundation RAG
- Mock de pipeline RAG avec documents simulés
- Préparation pour l'intégration de base de connaissances
- Support multi-tenant

### 4. Health Checks et Monitoring
- Validation des clés API
- Métriques de performance en temps réel
- Monitoring de la santé des providers

## Utilisation

### Injection du Service

```typescript
import { Injectable } from '@nestjs/common';
import { AIGatewayService } from '@ai-gateway/ai-gateway.service';

@Injectable()
export class MyService {
  constructor(private aiGateway: AIGatewayService) {}
}
```

### Chat Completion Mock

```typescript
// Réponse simple
const response = await this.aiGateway.mockChatCompletion(
  'Comment WikiPro peut-il aider mon organisation?'
);

// Avec contexte
const contextualResponse = await this.aiGateway.mockChatCompletion(
  'Analyse cette situation',
  'Contexte: Projet en retard, équipe surchargée, budget serré'
);
```

### Routing vers Providers

```typescript
import { LLMProvider } from '@ai-gateway/interfaces/llm-provider.interface';

// Router vers un provider spécifique
const response = await this.aiGateway.routeToProvider(
  LLMProvider.MOCK,
  'Génère un rapport d\'analyse',
  'tenant-123',
  {
    maxTokens: 1500,
    temperature: 0.7,
    systemPrompt: 'Tu es un expert en analyse de données'
  }
);
```

### Requêtes RAG

```typescript
// Mock RAG avec documents simulés
const ragResponse = await this.aiGateway.mockRAGQuery(
  'Quelle est la méthodologie recommandée pour ce type de projet?',
  'tenant-123'
);

console.log(ragResponse.answer);
console.log(ragResponse.relevantDocuments);
```

### Health Checks

```typescript
// Vérifier la santé générale
const healthStatus = await this.aiGateway.validateAPIKeys();
console.log(healthStatus.overall); // 'healthy', 'degraded', 'unhealthy'

// Statut des providers individuels
const providerStatuses = await this.aiGateway.getProviderStatus();
providerStatuses.forEach(status => {
  console.log(\`\${status.provider}: \${status.status}\`);
});
```

### Métriques et Statistiques

```typescript
// Métriques de performance
const metrics = await this.aiGateway.getPerformanceMetrics();
console.log(metrics[0].averageResponseTime);

// Statistiques d'utilisation
const stats = this.aiGateway.getUsageStats();
console.log(\`Total de requêtes: \${stats.totalRequests}\`);
console.log(\`Total de tokens: \${stats.totalTokens}\`);
```

## Configuration

Le module est configuré automatiquement avec des valeurs par défaut appropriées pour le développement. La configuration se trouve dans `ai-gateway.module.ts` :

```typescript
providers: [
  {
    provide: 'AI_GATEWAY_CONFIG',
    useFactory: () => ({
      defaultProvider: 'mock',
      enableMockProvider: true,
      enableFallback: true,
      // ... autres options
    }),
  },
]
```

## Types de Réponses

### AIResponse
```typescript
interface AIResponse {
  success: boolean;
  content: string;
  tokensUsed: number;
  responseTime: number;
  provider: string;
  model?: string;
  confidence?: number;
  metadata?: Record<string, any>;
}
```

### RAGResponse
```typescript
interface RAGResponse {
  success: boolean;
  answer: string;
  relevantDocuments: RAGDocument[];
  confidence: number;
  tokensUsed: number;
  responseTime: number;
  query: string;
  tenantId: string;
}
```

## Extension Future

Le module est conçu pour être étendu avec de vrais providers IA :

1. **OpenAI Provider** : Intégration GPT-4, GPT-3.5-turbo
2. **Anthropic Provider** : Claude-3 Sonnet, Haiku
3. **Gemini Provider** : Google Gemini Pro
4. **Pipeline RAG** : Vector database, embeddings, recherche sémantique

## Tests

```bash
# Tests du module AI Gateway
npm test -- ai-gateway

# Tests avec coverage
npm test -- ai-gateway --coverage

# Tests de performance (incluant les tests longs)
npm test -- ai-gateway --testTimeout=30000
```

## Développement

Pour ajouter un nouveau provider :

1. Étendre `BaseAIGatewayProvider`
2. Implémenter les méthodes abstraites
3. Ajouter la configuration au module
4. Créer les tests unitaires

Exemple :
```typescript
export class MyCustomProvider extends BaseAIGatewayProvider {
  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    // Implémentation custom
  }
  
  async healthCheck(): Promise<ProviderStatus> {
    // Vérification de santé
  }
}
```

## Sécurité et Performance

- ✅ Isolation multi-tenant intégrée
- ✅ Validation stricte des entrées
- ✅ Gestion d'erreurs robuste
- ✅ Retry automatique avec backoff exponentiel
- ✅ Timeouts configurables
- ✅ Rate limiting (préparé)
- ✅ Logging détaillé sans informations sensibles

## Intégration avec l'Écosystème WikiPro

Le AI Gateway s'intègre parfaitement avec :
- **TelemetryService** : Tracking des événements et métriques
- **ConfigService** : Configuration centralisée
- **Auth/Tenant System** : Isolation et sécurité multi-tenant
- **Chat Module** : Intégration WebSocket pour chat en temps réel
- **Future RAG Pipeline** : Base de connaissances organisationnelle

---

**Status**: ✅ Implémenté et testé  
**Version**: 1.0.0  
**Compatible**: Sprint 2B Foundation  
**Prêt pour**: Intégration des providers de production