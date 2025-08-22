# 🚀 WikiPro - Plateforme d'orchestration IA

> **Version 2.0** - Architecture hybride progressive pour l'orchestration de l'IA d'entreprise

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-ea2845.svg)](https://nestjs.com/)

---

## 📋 Vue d'ensemble

WikiPro transforme votre gestion de connaissances traditionnelle en **couche d'orchestration IA intelligente**. Une interface unique pour piloter plusieurs providers IA (OpenAI, Anthropic, Google, Mistral) avec gouvernance, sécurité et télémétrie centralisées.

### 🎯 Proposition de valeur

- **🎛️ Abstraction** : Interface unique pour tous les providers IA
- **🛡️ Gouvernance** : Contrôle centralisé des droits, coûts et conformité
- **🧠 Contexte** : Assistance pour préparer et injecter le contexte optimal
- **📊 Télémétrie** : Métriques d'usage, performance et ROI des interactions IA

---

## 🏗️ Architecture Monorepo

```
App-WikiPro/
├── 📁 frontend/          # React SPA (TypeScript)
│   ├── src/modules/      # Modules métier (Dashboard, IA Studio, etc.)
│   ├── src/components/   # Composants réutilisables
│   └── src/services/     # Services API
├── 📁 backend/           # NestJS API (TypeScript)
│   ├── src/core/         # Modules core (auth, config, telemetry)
│   ├── src/modules/      # Modules métier (ai-providers, chat)
│   └── src/database/     # Migrations et entités TypeORM
├── 📁 docs/              # Documentation technique
├── 🐳 docker-compose.yml # Services PostgreSQL + pgAdmin
└── 📦 package.json       # Orchestration monorepo
```

---

## ⚡ Démarrage Rapide

### 🔧 Prérequis

- **Node.js** 18+ et npm 9+
- **Docker** & Docker Compose
- **Git** (optionnel)

### 🚀 Installation en 3 étapes

```bash
# 1. Cloner et installer les dépendances
git clone https://github.com/yves34690/App-WikiPro.git
cd App-WikiPro
npm run setup

# 2. Configurer l'environnement
cp backend/.env.template backend/.env
# Éditer .env avec vos paramètres

# 3. Lancer l'application complète
npm run dev
```

**✅ C'est prêt !**
- Frontend : http://localhost:3000
- Backend : http://localhost:3001
- pgAdmin : http://localhost:8080

---

## 🎮 Commandes Principales

### 🚀 Développement

```bash
# Lancer frontend + backend simultanément
npm run dev

# Lancer seulement le frontend
npm run dev:frontend-only

# Lancer seulement le backend  
npm run dev:backend-only
```

### 🗄️ Base de données

```bash
# Setup complet PostgreSQL
npm run db:setup

# Gestion des migrations
npm run db:migrate          # Appliquer migrations
npm run db:migrate:revert    # Annuler dernière migration
npm run db:status           # État migrations

# Données de développement
npm run db:seed             # Insérer données test
npm run db:reset            # Reset complet ⚠️
```

### 🐳 Docker

```bash
# Services (PostgreSQL + pgAdmin + Redis)
npm run docker:up           # Démarrer services
npm run docker:down         # Arrêter services  
npm run docker:reset        # Reset avec volumes ⚠️

# Monitoring
npm run docker:logs         # Logs services
npm run status              # État complet application
```

### 🧪 Tests et Qualité

```bash
# Tests complets
npm run test                # Frontend + Backend
npm run test:coverage       # Avec couverture

# Tests séparés
npm run test:frontend       # Tests React
npm run test:backend        # Tests NestJS

# Qualité code
npm run lint               # Linting
npm run format             # Formatage code
```

### 🚀 Production

```bash
# Build complet
npm run build              # Frontend + Backend

# Déploiement
npm run deploy:staging     # Staging
npm run deploy:production  # Production
```

---

## 🛠️ Stack Technique

### 📱 Frontend
- **React 19** avec TypeScript
- **Chart.js** pour visualisations
- **TanStack Query** pour state management  
- **FontAwesome** pour icônes
- **Jest + Testing Library** pour tests

### ⚙️ Backend
- **NestJS 11** avec TypeScript
- **TypeORM** + PostgreSQL pour persistance
- **JWT** + Guards pour authentification
- **WebSocket** pour chat temps réel
- **Swagger** pour documentation API

### 🗄️ Base de données
- **PostgreSQL 15** avec Row Level Security
- **TypeORM** migrations automatiques
- **pgAdmin** interface graphique
- **Redis** pour cache (optionnel)

### 🤖 IA & Intégrations
- **OpenAI** (GPT-4, GPT-3.5)
- **Anthropic** (Claude)
- **Google** (Gemini)
- **Mistral AI**

---

## 🌟 Fonctionnalités Principales

### 📊 Dashboard
- KPIs temps réel
- Graphiques d'évolution
- Synthèse des données

### 🤖 IA Studio
- Chat multi-provider
- Streaming temps réel  
- Historique conversations
- Métriques d'usage

### 🔍 Gestion Connaissances
- Mots-clés intelligents
- Analyse des tendances
- Références projets
- Pôles d'expertise

### 👥 Multi-tenant
- Isolation stricte des données
- Gestion des utilisateurs
- Rôles et permissions
- Configuration par organisation

---

## 🔧 Configuration

### Variables d'environnement

```bash
# Backend (.env)
DATABASE_URL=postgresql://wikipro_user:wikipro_password@localhost:5432/wikipro_dev
JWT_SECRET=your-super-secret-key
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### Ports par défaut

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Backend | 3001 | http://localhost:3001 |
| PostgreSQL | 5432 | - |
| pgAdmin | 8080 | http://localhost:8080 |
| Redis | 6379 | - |

---

## 📚 Documentation

### Guides utilisateurs
- [🚀 Guide Démarrage Rapide](docs/QUICKSTART.md)
- [🗄️ Setup Base de Données](backend/DATABASE_SETUP.md)
- [🐳 Configuration Docker](docs/DOCKER.md)

### Documentation technique
- [🏗️ Architecture Système](docs/WikiPro%20architecture.md)
- [📋 Vision Projet](docs/PROJECT_VISION_v2.0.md)
- [🔧 Stack Technique](docs/TECHNICAL_STACK.md)

### API & Références
- Backend API : http://localhost:3001/api (Swagger)
- [🧪 Tests & Coverage](frontend/TESTS-COVERAGE-REPORT.md)

---

## 🤝 Développement

### Workflow Git

```bash
# Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Développer et tester
npm run dev
npm run test

# Commiter et pousser
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin feature/nouvelle-fonctionnalite
```

### Standards qualité
- **Tests** : Couverture > 80%
- **Linting** : ESLint + Prettier
- **Types** : TypeScript strict
- **Commits** : Convention conventional commits

---

## 🚨 Résolution Problèmes

### Erreurs communes

**Base de données inaccessible**
```bash
npm run docker:reset
npm run db:setup
```

**Conflits de ports**
```bash
# Vérifier ports occupés
netstat -tulpn | grep :3000
npm run status
```

**Dépendances cassées**
```bash
npm run clean
npm run setup
```

---

## 📊 Monitoring & Observabilité

### Santé Application
```bash
# Vérification complète
npm run health

# Logs en temps réel
npm run logs
```

### Métriques disponibles
- Performance requêtes BDD
- Utilisation providers IA  
- Métriques WebSocket
- Erreurs et exceptions

---

## 🎯 Roadmap

### ✅ Sprint 0-1 (Terminé)
- Frontend React fonctionnel
- Backend NestJS + auth
- Chat WebSocket

### 🚧 Sprint 2A (En cours)
- **PostgreSQL + TypeORM**
- **Persistance utilisateurs**
- **Historique conversations**

### 📋 Sprint 2B (Planifié)  
- Entités business complètes
- API GraphQL
- Tests d'intégration

### 🔮 Version 3.0 (Futur)
- Architecture décentralisée
- Edge computing
- Orchestration multi-cloud

---

## 📞 Support & Contact

**Équipe WikiPro**
- **CEO/Visionnaire** : Yves
- **Agent CTO** : Strategic Translator
- **Repository** : [GitHub](https://github.com/yves34690/App-WikiPro)

**Ressources**
- 📖 [Documentation complète](docs/)
- 🐛 [Issues GitHub](https://github.com/yves34690/App-WikiPro/issues)
- 💬 [Discussions](https://github.com/yves34690/App-WikiPro/discussions)

---

## 📄 Licence

MIT License - voir [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">

**🚀 Fait avec ❤️ par l'équipe WikiPro**

*Transformons ensemble la gestion de connaissances avec l'IA !*

</div>