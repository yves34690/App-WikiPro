# TICKET-FOUNDATION-001: Backend Core Setup - Architecture v2.0

## 🎯 CONTEXTE STRATÉGIQUE
- **Vision**: WikiPro comme Couche d'Orchestration et de Gouvernance Intelligente
- **Architecture**: Hybride progressive - Backend minimal + Provider Abstraction Layer
- **IP Core**: Registry pattern + interfaces standardisées
- **Alignement**: Documentation v2.0 (`docs/PROJECT_VISION_v2.0.md`)

## 📋 DESCRIPTION TECHNIQUE
Setup initial du backend core selon la nouvelle architecture hybride :
- Services fondamentaux (auth, config, telemetry)
- Interface standardisée OpenAI provider
- Registry pattern pour extensibilité
- Structure NestJS + TypeScript

## 🏗️ COMPOSANTS À IMPLÉMENTER

### 1. Structure NestJS Base
- **Module Core**: AuthModule, ConfigModule, TelemetryModule
- **Architecture modulaire**: Services indépendants et extensibles
- **Configuration**: Environment-based avec validation

### 2. Provider Abstraction Layer
- **Interface Gemini**: Abstraction standardisée avec Google AI
- **Registry Pattern**: Système d'enregistrement des providers
- **Extensibilité**: Préparation pour autres providers (OpenAI, Anthropic, etc.)

### 3. Services Fondamentaux
- **AuthService**: Gestion tokens et authentification
- **ConfigService**: Configuration centralisée et validation
- **TelemetryService**: Monitoring et métriques

### 4. Structure de Fichiers
```
backend/
├── src/
│   ├── core/
│   │   ├── auth/
│   │   ├── config/
│   │   └── telemetry/
│   ├── providers/
│   │   ├── abstracts/
│   │   ├── gemini/
│   │   └── registry/
│   ├── app.module.ts
│   └── main.ts
├── package.json
└── nest-cli.json
```

## 🎫 CRITÈRES D'ACCEPTATION

### ✅ Structure Projet
- [ ] Initialisation NestJS avec TypeScript
- [ ] Structure modulaire core/providers
- [ ] Configuration ESLint + Prettier
- [ ] Scripts npm (start, build, test)

### ✅ Services Core
- [ ] AuthModule avec JWT support
- [ ] ConfigModule avec validation schema
- [ ] TelemetryModule avec métriques de base
- [ ] Tests unitaires pour chaque service

### ✅ Provider Abstraction
- [ ] Interface abstraite IAIProvider
- [ ] Implementation Gemini provider avec @google/generative-ai
- [ ] Registry pattern fonctionnel
- [ ] Factory pattern pour création providers

### ✅ Intégration
- [ ] AppModule configure tous les modules
- [ ] Injection de dépendances opérationnelle
- [ ] Environment variables chargées
- [ ] Logging structuré configuré

## 🔧 STACK TECHNIQUE
- **Framework**: NestJS 10+
- **Language**: TypeScript 5+
- **Auth**: JWT + Passport
- **Config**: @nestjs/config + Joi validation
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI

## 📦 DÉPENDANCES PRINCIPALES
```json
{
  "@nestjs/core": "^10.0.0",
  "@nestjs/common": "^10.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/config": "^3.0.0",
  "@nestjs/swagger": "^7.0.0",
  "@google/generative-ai": "^0.19.0",
  "joi": "^17.0.0"
}
```

## 🧪 STRATÉGIE DE TESTS
- **Unit Tests**: Chaque service avec mocks
- **Integration Tests**: Modules core complets
- **E2E Tests**: Endpoints principaux
- **Coverage**: >80% minimum

## 🚀 ORDRE D'IMPLÉMENTATION
1. **Setup Projet**: NestJS + TypeScript + Config de base
2. **Core Services**: Auth → Config → Telemetry
3. **Provider Layer**: Interface abstraite → Gemini impl avec @google/generative-ai
4. **Registry**: Pattern enregistrement + Factory
5. **Integration**: AppModule + Tests + Documentation

## 🔧 CONFIGURATION GEMINI
- **Variable d'environnement**: `GEMINI_API_KEY`
- **Modèle par défaut**: `gemini-2.5-pro-latest`
- **Configuration**: Timeout, retry, rate limiting
- **Validation**: Schema Joi pour clé API

## 📊 ESTIMATIONS
- **Complexité**: Moyenne
- **Durée**: 2-3 jours de développement
- **Agent assigné**: Backend-Core
- **Dépendances**: Aucune (ticket fondation)

## 🎯 VALEUR MÉTIER
- **Base solide**: Architecture scalable pour tous les futurs développements
- **IP Protection**: Registry pattern = cœur de notre propriété intellectuelle
- **Extensibilité**: Préparation pour multi-providers
- **Gouvernance**: Services de monitoring et configuration centralisés

---
**Status**: PENDING  
**Créé le**: 2025-08-19  
**Vision**: v2.0 Architecture Hybride