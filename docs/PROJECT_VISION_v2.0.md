# WIKIPRO PROJECT VISION v2.0 - ARCHITECTURE HYBRIDE PROGRESSIVE

## 🎯 OBJECTIF DE CETTE MISE À JOUR

**Pourquoi** : Pivot stratégique vers une architecture hybride pour maîtriser les coûts, améliorer la conformité RGPD, et s'aligner sur l'évolution du marché IA.

**Valeur** : Transformation de WikiPro d'un "wiki traditionnel" vers une "**Couche d'Orchestration et de Gouvernance Intelligente**" pour l'IA d'entreprise.

## 📋 GOUVERNANCE DOCUMENTAIRE

**Propriétaire** : CTO Strategic Translator (Agent)  
**Responsable métier** : Yves (Visionnaire/CEO)  
**Fréquence de révision** : Mensuelle ou à chaque sprint majeur  
**Validation** : Obligatoire avant tout développement backend

## 🎯 NOUVELLE PROPOSITION DE VALEUR

### Avant (v1.0)
- Stockage centralisé des données métier
- Interface unique pour consultation/recherche
- Gestion de connaissances traditionnelle

### Après (v2.0) - NOUVELLE VISION
WikiPro devient une **plateforme d'orchestration IA** offrant :

1. **L'Abstraction** : Interface unique pour piloter plusieurs providers IA (OpenAI, Anthropic, Google, Mistral)
2. **La Gouvernance** : Contrôle centralisé des droits, coûts, sécurité et conformité
3. **Le Contexte** : Assistance pour préparer et injecter le contexte optimal dans l'IA
4. **La Télémétrie** : Métriques d'usage, performance et ROI des interactions IA

## 🏗️ ARCHITECTURE HYBRIDE PROGRESSIVE

### Phase 1 : Backend Minimal + 1 Provider (3 mois)
Core Services (chez WikiPro) Data Layer (chez Client)
├── auth/ ├── Google Drive/Workspace
├── config/ ├── Microsoft 365/SharePoint
├── telemetry/ ├── Box/Dropbox
├── providers/ └── Systèmes on-premise
│ ├── interfaces/
│ ├── openai/
│ └── registry.ts
└── orchestration/
├── context-builder/
└── launchers/


### Phase 2 : Multi-Provider + Governance (6 mois)
- Ajout Anthropic, Google, Mistral
- Policies de gouvernance
- Dashboard administrateur
- Intégration stockage client

### Phase 3 : Décentralisation Complète (12 mois)
- Architecture entièrement distribuée
- Edge computing pour performance
- Orchestration multi-cloud

## 🔧 STACK TECHNIQUE CIBLE

### Backend Core
- **Framework** : NestJS + TypeScript
- **Database** : PostgreSQL (métadonnées uniquement)
- **Cache** : Redis
- **Telemetry** : Prometheus + Grafana
- **Security** : JWT, RBAC, Row-Level Security

### Provider Abstraction Layer

interface IAProvider {
id: 'openai' | 'anthropic' | 'google' | 'mistral';
capabilities: Capability[];
features: {
canEmbedUI: boolean;
supportsConnectors: boolean;
supportsFileUrlUpload: boolean;
supportsCitations: boolean;
};
detect(): Promise<void>;
launch(opts: LaunchOptions): Promise<'opened'>;
call?(opts: LaunchOptions): Promise<{ content: string; cites?: string[] }>;
}

## 📊 UX & INTÉGRATION IA

### Modes d'intégration (priorité)
1. **Deep-links + Context handoff** (recommandé)
2. **API calls** (quand contractuellement permis)
3. **Desktop bridges (MCP)** (pour on-premise sécurisé)

### Expérience utilisateur
- Boutons "Ouvrir dans [Provider]" avec deep-links
- Prompts pré-construits copiés automatiquement
- URLs de fichiers attachées (Drive/SharePoint)
- Historique des actions et télémétrie

## 🧪 PLAN DE VALIDATION PROGRESSIVE

### Sprint 0 : Foundation (4 semaines)
- Backend core (auth, config, telemetry)
- OpenAI provider + registry
- Deep-link service fonctionnel

### Sprint 1-2 : Multi-Provider (8 semaines)
- Anthropic, Google, Mistral
- Capability detection
- Error handling & fallback

### Sprint 3-4 : Production Ready (8 semaines)
- Governance policies
- Admin dashboard
- Client storage integration

## 🔒 GOUVERNANCE & SÉCURITÉ

### Principles de sécurité
- **Data minimization** : Aucune donnée métier stockée chez WikiPro
- **Multi-tenant isolation** : Row-Level Security strict
- **Provider abstraction** : Pas de dépendance directe aux APIs
- **Audit trail** : Logging complet des interactions

### Conformité RGPD
- Données personnelles : Minimales (config utilisateur uniquement)
- Droit à l'oubli : Suppression complète du profil
- Portabilité : Export JSON de la configuration
- Responsabilité : Clairement définie (client = données, WikiPro = orchestration)

## 📈 MÉTRIQUES DE SUCCÈS

### Techniques
- Temps de réponse < 200ms pour l'orchestration
- Disponibilité > 99.5%
- 0 incident de sécurité multi-tenant

### Business
- Réduction de 60% des coûts d'infrastructure vs v1.0
- Adoption : 80% des clients utilisent ≥2 providers IA
- NPS > 70 sur l'expérience d'orchestration

## 🔄 PROCESSUS D'AMÉLIORATION CONTINUE

### Feedback loops
- **Clients** : Dashboard de feedback intégré
- **Équipe** : Retrospectives sprint
- **Technique** : Monitoring automated alerts

### Mise à jour documentation
- **Déclencheurs** : Fin de sprint, changement d'architecture, feedback client
- **Processus** : Agent CTO → Validation CEO → Commit automatique
- **Versioning** : Semantic versioning avec changelog détaillé

## 🚀 PROCHAINES ACTIONS IMMÉDIATES

1. **Cette semaine** : Valider cette vision avec 2-3 prospects clients
2. **Semaine prochaine** : Lancer Sprint 0 (Backend Foundation)
3. **Mois prochain** : Premier client pilote avec Gemini uniquement
