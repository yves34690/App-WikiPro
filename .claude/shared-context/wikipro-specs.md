# 📚 CONTEXTE PARTAGÉ WIKIPRO - ÉQUIPE AGENTS

## 🎯 VISION PRODUIT

**WikiPro** est une application de gestion de connaissances d'entreprise assistée par IA générative, basée sur le principe fondamental : **"Un WikiPro = une entité"**.

### Objectifs Stratégiques :
- **Phase 1 (MVP)** : Lancer rapidement pour tester le marché (12 semaines)
- **Phase 2 (Scale)** : Solution enterprise robuste et scalable
- **Innovation** : Pipeline RAG modulaire pour expériences IA variées

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Technologique Confirmée :
- **Backend** : Node.js/TypeScript + NestJS Framework
- **API** : GraphQL avec Apollo Server
- **Frontend** : React/TypeScript (existant à finaliser)
- **Base de données** : PostgreSQL (métadonnées) + Pinecone (vecteurs)
- **IA** : Pipeline RAG avec LlamaIndex/LangChain
- **LLMs** : Claude/GPT avec gateway multi-modèles
- **Infrastructure** : Cloud (AWS/GCP) + Kubernetes + Docker

### Microservices Architecture :
1. **API Gateway** : Point d'entrée GraphQL unique
2. **auth-service** : Authentification JWT + rôles
3. **user-service** : Profils utilisateurs + permissions
4. **knowledge-base-service** : CRUD documents + métadonnées  
5. **rag-pipeline-service** : IA générative + recherche sémantique

## 🔒 CONTRAINTES CRITIQUES

### Multi-Tenancy (Non-négociable) :
- **Isolation stricte** des données par entité/tenant
- **Sécurité** : Aucune fuite de données entre clients
- **Performance** : Maintenir les performances malgré l'isolation

### Standards Qualité :
- **Tests automatisés** obligatoires (>80% coverage)
- **Documentation** technique complète et à jour
- **Sécurité** : OWASP compliance + audit régulier
- **Performance** : <200ms réponse API, <2s génération IA

## 📋 PROCESSUS DE DÉVELOPPEMENT

### Méthodologie Agile :
- **Sprints** : 2 semaines
- **Daily standups** : 15min coordination équipe
- **Reviews** : Démos fin de sprint
- **Retrospectives** : Amélioration continue

### Validation Gates :
- **S2** : Architecture review (Architecte + Professeur)
- **S4** : Backend API review (Backend + Frontend)  
- **S6** : RAG Pipeline review (IA + QA)
- **S8** : Integration review (Tous agents)
- **S10** : Pre-production review (DevOps + QA)
- **S12** : Production readiness (Équipe complète)

### Escalation Protocol :
- **Blocage >4h** → Alert Professeur-Expert
- **Conflit architectural** → Alert Architecte-Coordinateur
- **Issue performance** → Alert QA-Performance
- **Problème sécurité** → Alert immédiat tous agents

## 🎭 RÔLES & RESPONSABILITÉS

### Agent Architecte-Coordinateur :
- Vision architecture globale + coordination équipe
- API Gateway + communication inter-services
- Standards développement + validation technique

### Agent Backend-Core :
- Services métier (auth, user, knowledge-base)
- Sécurité multi-tenant + base de données
- API GraphQL + logique business

### Agent IA-RAG :
- Pipeline ingestion + génération RAG
- Intégration LLMs + optimisation prompts
- Recherche sémantique + performance IA

### Agent Frontend-Integration :
- Composants React + intégration GraphQL
- Interface utilisateur + expérience utilisateur
- Tests frontend + optimisations

### Agent DevOps-Cloud :
- Infrastructure cloud + déploiement K8s
- CI/CD pipeline + monitoring
- Sécurité infrastructure + backup

### Agent QA-Performance :
- Tests automatisés + qualité code
- Performance + load testing
- Sécurité application + audit

### Agent Professeur-Expert :
- Résolution blocages complexes
- Mentoring équipe + best practices
- Veille technologique + innovation

## 🚀 LIVRABLES ATTENDUS

### MVP (Semaines 1-12) :
- ✅ Architecture microservices opérationnelle
- ✅ Backend complet avec API GraphQL
- ✅ Pipeline RAG fonctionnel 
- ✅ Frontend intégré avec composants IA
- ✅ Infrastructure cloud déployée
- ✅ Tests automatisés + monitoring

### Success Metrics :
- **Technique** : 99.9% uptime, <200ms API response
- **Business** : Pipeline RAG précis, UX fluide
- **Équipe** : Vélocité constante, dette technique maîtrisée

## 📞 COMMUNICATION

### Outils :
- **Code** : Git avec branches feature + PR reviews
- **Documentation** : Markdown + diagrammes C4
- **Monitoring** : Grafana + Prometheus + logs centralisés
- **Chat** : Intégration agents via MCP

### Reporting :
- **Daily** : Status updates automatisés
- **Weekly** : Sprint review + metrics
- **Bi-weekly** : Architecture review + tech debt

---

**🎯 Objectif Final** : Livrer un MVP WikiPro robuste, scalable et sécurisé, prêt à évoluer vers une solution enterprise complète.