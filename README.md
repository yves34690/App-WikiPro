# App-WikiPro

## Description
Application de gestion de la base de connaissance d'une entitée développée pour la production à l'appuie de l'intelligence artificielle et de la documentation interne.

# Contexte Général de l'Application WikiPro

## 1. Vue d'ensemble de WikiPro

### Définition et objectif principal

WikiPro est une application conçue pour gérer la **base de connaissance** d'une entité, qu'il s'agisse d'une société, d'une collectivité locale, d'une administration ou d'une association. Son objectif fondamental est de fournir une assistance par **Intelligence Artificielle (IA)** pour faciliter et accélérer la production de documents, en s'appuyant sur la documentation interne et le savoir capitalisé de l'organisation. L'application vise à transformer les données brutes et les documents existants en une ressource active et intelligente, capable de générer des analyses, des synthèses et des réponses pertinentes.

### Concept clé ("Un WikiPro = une entité")

Le principe directeur du déploiement de WikiPro est "**Un WikiPro = une entité**". Cette approche signifie que chaque instance de l'application est unique et spécifiquement adaptée à l'organisation qu'elle sert. Plutôt que de proposer une solution générique, l'administration et le déploiement se font **par le code**. Cette personnalisation profonde garantit que chaque WikiPro est le reflet fidèle des connaissances, des processus et des spécificités de l'entité, assurant une pertinence maximale. Les données de chaque organisation restent cloisonnées et protégées, seule une sélection d'indicateurs anonymisés est partagée à des fins de recherche et de comparaison.

### Public cible et cas d'usage

Le public cible de WikiPro est large et inclut toute organisation désireuse de valoriser son capital immatériel. Les cas d'usage varient en fonction de la nature de l'entité :

*   **Bureau d'études :** Mobilisation de méthodes, d'outils et de retours d'expérience sur des projets antérieurs.
*   **Collectivité territoriale :** Analyse des décisions passées, suivi de leurs effets et justification des politiques publiques.
*   **Cabinet d'architecte :** Accès aux techniques de construction, aux retours sur les matériaux et aux systèmes constructifs déjà mis en œuvre.
*   **Centre de formation :** Structuration des référentiels de compétences, consolidation des retours pédagogiques et validation des outils d'évaluation.

## 2. Problématique et enjeux

### Problèmes adressés

WikiPro répond à un enjeu majeur : la **perte de connaissance** et l'inefficacité liées à la difficulté d'accéder et d'exploiter la documentation interne. Chaque organisation accumule une quantité massive d'informations (études, rapports, notes, etc.) qui reste souvent sous-utilisée. L'application cherche à résoudre ce problème en structurant cette information et en la rendant interrogeable et exploitable via une IA, afin d'améliorer la **productivité** et la **qualité** des nouvelles productions.

### Particularités de chaque organisation

La principale difficulté réside dans le fait que chaque organisation possède une **base de connaissance unique** et une **architecture réseau spécifique**. Le classement des ressources, les terminologies utilisées et les types de documents varient considérablement d'une entité à l'autre. Cette hétérogénéité rend impossible le déploiement d'une solution standardisée et pertinente pour tous.

### Défis techniques identifiés

Le défi technique est de créer une plateforme capable de s'adapter à cette diversité. La solution ne peut pas être un logiciel **"prêt-à-porter"**. Elle doit être suffisamment flexible pour s'intégrer à des environnements variés et pour traiter des corpus de données hétérogènes. C'est ce qui justifie l'approche innovante de **personnalisation par le code**, assistée par l'IA, pour adapter l'application à chaque contexte client.

## 3. Architecture fonctionnelle

### Processus de capitalisation

La capitalisation des connaissances s'articule autour du traitement systématique d'un ensemble de documents de référence, notamment :

*   **CCTP** (Cahier des Clauses Techniques Particulières)
*   **Notes Méthodologiques**
*   **CVthèques** et compétences mobilisées
*   **DPGF** (Décomposition du Prix Global et Forfaitaire)
*   **Livrables** de projets
*   **Méthodes et outils** identifiés

Chaque document pertinent fait l'objet d'une analyse par IA via des **Prompts d'instruction** dédiés pour en extraire une note de synthèse et les mots-clés pertinents.

### Fonctionnalités principales

Le frontend développé présente plusieurs fonctionnalités clés, organisées en tableaux de bord :

*   **Vue d'ensemble :** Indicateurs clés (nombre d'études, mots-clés uniques, pôles d'expertise, typologies d'études).
*   **Analyse de tendances :** Heatmaps de densité des mots-clés, graphiques d'évolution par pôle, top des typologies d'études.
*   **Gestion des ressources :** Consultation des méthodes, des références de projets, des sources de données, des outils, des CV et des compétences.
*   **Recherche et filtrage :** Un moteur de recherche global et des filtres multiples (pôle, typologie, année, etc.) pour naviguer dans la base de connaissance.
*   **Studio d'IA WikiPro :** Une interface conversationnelle permettant aux utilisateurs de formuler des requêtes en langage naturel pour générer des documents complexes (rapports de synthèse, propositions commerciales, analyses de tendances).

### Modules et composants

L'application est structurée autour de plusieurs modules visibles dans l'interface :

*   **Tendances**
*   **Mots-clés**
*   **Pôles** (d'expertise)
*   **Méthodes**
*   **Références** (projets)
*   **Data** (sources de données)
*   **Illustrations**
*   **Outils**
*   **CVthèque**
*   **Compétences**
*   **Studio d'IA**

## 4. État d'avancement

### Développements réalisés (frontend)

La phase actuelle de développement s'est concentrée sur le **frontend**. Une application robuste a été construite avec React, incluant l'ensemble des interfaces de visualisation de données et de navigation décrites ci-dessus. Un prototype plus simple en HTML/CSS/JS existe également, pour des démonstrations initiales. Les composants visuels (graphiques, tableaux, cartes) sont fonctionnels mais utilisent pour l'instant des données statiques ou simulées.

### Développements à venir (backend)

Le **backend** reste à créer. Cette partie sera cruciale pour connecter le frontend aux données réelles et pour orchestrer les traitements IA. Les tâches principales incluront :

*   La mise en place d'une base de données pour stocker les informations extraites.
*   Le développement d'API pour alimenter le frontend.
*   L'intégration des modèles d'IA pour le traitement des documents (génération de synthèses, extraction de mots-clés).
*   La création du "Studio d'IA WikiPro" qui devra interpréter les requêtes utilisateurs et générer les documents demandés.

### Données à intégrer

Le **backend** devra être capable d'ingérer et de traiter l'ensemble des documents constituant la base de connaissance de l'organisation : CCTP, notes méthodologiques, CV, DPGF, livrables, etc.

## 5. Stack technique

### Technologies utilisées

La stack technique est exclusivement **frontend** à ce stade :

*   **Application principale :**
    *   Langage : **JavaScript (ES6+)**
    *   Framework : **React** (via Create React App)
    *   Visualisation de données : **Chart.js** avec l'intégrateur react-chartjs-2
    *   Tests : **Jest** et **React Testing Library**
    *   Icônes : **Font Awesome**
*   **Prototype :**
    *   Structure : **HTML5, CSS3, JavaScript (ES6+)**
    *   Librairies : **Chart.js** et **Font Awesome** (via CDN)

### Architecture générale

L'architecture actuelle est celle d'une **application front-end uniquement**. Il n'y a pas de composant backend. Les données sont soit statiques (dans le prototype), soit destinées à être chargées via des appels API depuis l'application React une fois le **backend** développé. Le projet combine une approche de prototypage rapide (HTML/CSS/JS) et une approche de développement d'application plus robuste et évolutive avec React.

### Choix technologiques

Les choix technologiques sont modernes et standards pour le développement d'applications web interactives. L'utilisation de React offre une base solide pour une interface utilisateur complexe et réactive, tandis que Chart.js est une solution éprouvée pour la visualisation de données.

## 6. Perspective et innovation

### Approche de personnalisation par code

WikiPro se distingue par son pari sur une **personnalisation par actualisation du code**. Plutôt que de proposer une interface d'administration complexe pour le paramétrage, l'application est conçue pour être rapidement modifiée par des développeurs afin de l'adapter aux besoins et à l'environnement spécifiques de chaque client.

### Techniques IA utilisées (Vibe Coding, Context Engineering)

Cette personnalisation rapide est rendue possible par l'application de techniques d'IA de pointe au service du développement lui-même :

*   **Vibe Coding :** Permet d'adapter le style et la structure du code de manière assistée par IA.
*   **Context Engineering :** Vise à fournir à l'IA le contexte métier et technique nécessaire pour qu'elle puisse générer ou modifier le code de manière pertinente.

Ces techniques constituent une véritable révolution, permettant de réduire drastiquement les temps d'adaptation et de déploiement.

### Objectifs de recherche et publication

Au-delà de son aspect commercial, WikiPro est aussi un projet de recherche. Les **indicateurs** générés (corrélations entre problématiques et réponses, évolution des processus, etc.), bien qu'anonymisés, seront collectés et analysés. L'objectif est de **publier annuellement des résultats** sur l'évolution de la corrélation entre la mobilisation d'une base de connaissance et les gains de productivité, offrant ainsi des aperçus précieux à la communauté scientifique et technologique.

## **Document d'Architecture de l'Application WikiPro**

Version : 1.0  
Date : 29 juillet 2025  
Auteur : Gemini, Architecte Logiciel Senior IA

### **1\. Introduction et Philosophie Architecturale**

Ce document détaille l'architecture technique retenue pour le développement et le déploiement de l'application WikiPro. L'objectif est de construire une plateforme robuste, évolutive et sécurisée, capable de répondre aux exigences fonctionnelles de gestion de connaissances assistée par IA tout en respectant la contrainte métier fondamentale :

**"Un WikiPro \= une entité"**1.

L'architecture repose sur les principes fondamentaux suivants :

* **Approche Évolutive (Monolithe Modulaire) :** L'application démarrera sous la forme d'un **monolithe modulaire** pour accélérer le développement initial, tout en maintenant des frontières de services claires. Cette approche permet une migration progressive et ciblée vers une architecture de  
  **microservices** pour les composants qui le nécessiteront (ex: IA, ingestion)2.

* **Asynchronisme et Orientation Événementielle :** Les traitements longs et coûteux, comme l'ingestion et l'analyse de documents, seront gérés de manière asynchrone via une file de messages pour garantir la réactivité et la résilience de l'application333.

* **Sécurité et Isolation par Conception (Security & Multi-Tenancy by Design) :** L'isolation des données de chaque entité est un prérequis non négociable. Elle sera appliquée à toutes les couches de l'infrastructure : schémas de base de données dédiés ou Row-Level Security, namespaces séparés dans la base vectorielle, et politiques d'accès strictes4.

* **Cloud-Native et Scalabilité :** L'ensemble des services sera conteneurisé (Docker) et orchestré par Kubernetes. Cette approche garantit la portabilité (multi-cloud/on-premise) et la capacité à monter en charge horizontalement pour répondre à la demande5.

### **2\. Architecture Globale**

L'architecture système est conçue en plusieurs couches logiques distinctes, communiquant via des API bien définies.

#### **2.1. Diagramme de l'Architecture**

Extrait de code

flowchart TD  
    subgraph "Utilisateur & CI/CD"  
        User\["Utilisateur (Navigateur)"\]  
        CICD\["Pipeline CI/CD (GitHub Actions)"\]  
        Terraform\["Infrastructure as Code (Terraform)"\]  
    end

    subgraph "Cloud Platform (AWS/GCP/Azure)"  
        CDN\["CDN (Cloudflare/CloudFront)"\]  
        ApiGateway\["API Gateway (Kong / AWS API Gateway)\\nREST & GraphQL"\]

        subgraph "Backend Services (Kubernetes Cluster)"  
            AuthService\["Service Authentification\\n(Keycloak)"\]  
            CoreApi\["API Principale (FastAPI)\\n- Gestion Documents\\n- Indicateurs & Dashboards"\]  
            IngestionService\["Service d'Ingestion Asynchrone\\n(FastAPI \+ Celery)"\]  
            RAGService\["Service IA (RAG & Studio)\\n(FastAPI \+ LlamaIndex)"\]  
        end

        subgraph "LLM & AI Gateway"  
            LLMGateway\["Gateway Multi-LLM\\n(Routing & Cache Sémantique)"\]  
            OpenAI\["OpenAI/Anthropic API"\]  
            LocalLLM\["Modèle Local (Llama/Mistral)"\]  
        end

        subgraph "Data & Storage Layer"  
            Postgres\["PostgreSQL\\n(Métadonnées & Relations)"\]  
            Elasticsearch\["Elasticsearch\\n(Recherche Texte & Agrégation)"\]  
            Qdrant\["Vector DB: Qdrant\\n(Recherche Sémantique)"\]  
            Redis\["Cache & Message Queue\\n(Redis / RabbitMQ)"\]  
            S3\["Stockage Fichiers (S3/MinIO)"\]  
        end  
    end

    User \--\> CDN \--\> ApiGateway  
    ApiGateway \--\> CoreApi  
    ApiGateway \--\> RAGService  
    ApiGateway \--\> AuthService

    CoreApi \-- CRUD & Queries \--\> Postgres  
    CoreApi \-- Full-text Search \--\> Elasticsearch  
    IngestionService \-- Publie Tâches \--\> Redis  
    IngestionService \-- Lit Tâches \--\> Redis  
    IngestionService \-- Écrit métadonnées \--\> Postgres  
    IngestionService \-- Stocke Fichiers \--\> S3  
    IngestionService \-- Crée Vecteurs via LLMGateway \--\> Qdrant

    RAGService \-- Recherche Hybride \--\> Qdrant & Elasticsearch  
    RAGService \-- Appelle Génération \--\> LLMGateway

    LLMGateway \-- Route vers \--\> OpenAI  
    LLMGateway \-- Route vers \--\> LocalLLM

    CICD \--\> Terraform \--\> AuthSvc & CoreApi & IngestionSvc & RAGSvc

### **3\. Description Détaillée des Composants**

#### **Frontend**

* **Description :** Application monopage (SPA) interactive qui constitue l'interface utilisateur.  
* **Technologie :** **React** (via Create React App), avec Chart.js pour les graphiques6.

* **Rôle :** Consommer les API backend (REST/GraphQL), afficher les tableaux de bord et les visualisations, fournir les interfaces pour l'upload de documents et le Studio IA7.

#### **API Gateway**

* **Description :** Point d'entrée unique pour toutes les requêtes du frontend.  
* **Technologie :** Kong ou service managé (AWS API Gateway).  
* **Rôle :** Gérer le routage des requêtes vers les services internes, l'authentification des tokens JWT, la limitation de débit (rate limiting) et exposer une **double interface REST et GraphQL** pour plus de flexibilité8.

#### **Service d'Authentification**

* **Description :** Service centralisé pour la gestion des identités et des accès.  
* **Technologie :** **Keycloak**.  
* **Rôle :** Gérer les utilisateurs, les rôles, les permissions et l'authentification via les standards **OAuth2/OpenID Connect**. Il prend en charge le SSO (SAML) pour une intégration facile en entreprise9.

#### **Services Backend (FastAPI)**

* **API Principale :** Gère la logique métier principale (CRUD sur les documents, utilisateurs, etc.) et les requêtes pour les indicateurs des tableaux de bord.  
* **Service d'Ingestion Asynchrone :** Orchestre le pipeline de traitement des documents (parsing, chunking, embedding) via une file de messages pour ne pas impacter les performances de l'API principale10101010.

* **Service IA (RAG & Studio) :** Contient la logique du moteur de **Retrieval-Augmented Generation**. Il reçoit les requêtes du Studio IA, effectue la recherche hybride et orchestre les appels au LLM via la gateway1111.

#### **Gateway Multi-LLM**

* **Description :** Couche d'abstraction intelligente pour interagir avec les modèles de langue.  
* **Rôle :** Ce composant crucial permet d'optimiser les coûts et les performances en **routant intelligemment les requêtes** vers différents LLM (propriétaires comme OpenAI/Claude, ou open-source comme Llama/Mistral) en fonction de la complexité de la tâche, du coût ou des besoins de souveraineté. Il intègre également un **cache sémantique** pour éviter les appels répétitifs.

#### **Couche de Persistance des Données**

* **PostgreSQL :** Base de données relationnelle principale pour stocker toutes les **métadonnées structurées** (utilisateurs, documents, relations, configurations d'entités). La sécurité multi-entité est assurée par des schémas séparés ou le Row-Level Security12.

* **Elasticsearch :** Moteur de recherche dédié à la **recherche textuelle (full-text)** et aux **agrégations complexes** nécessaires pour les tableaux de bord et les filtres. Il complète la recherche vectorielle.  
* **Qdrant :** Base de données vectorielle de haute performance, choisie pour stocker les **embeddings** des segments de documents et effectuer la **recherche par similarité sémantique**, qui est au cœur du moteur RAG.  
* **Redis :** Utilisé à double fin : comme **file de messages** pour le traitement asynchrone (via Celery) et comme **cache** pour les données fréquemment consultées (sessions, résultats de requêtes coûteuses)13.

#### **Stockage Fichiers**

* **Description :** Système de stockage d'objets pour les fichiers bruts.  
* **Technologie :** **AWS S3** ou une alternative compatible comme **MinIO** pour les déploiements on-premise14.

* **Rôle :** Conserver de manière sécurisée et durable les documents originaux uploadés par les utilisateurs15.

### **4\. Flux de Données Principaux**

#### **4.1. Flux d'Ingestion d'un Nouveau Document**

1. **Upload :** L'utilisateur dépose un fichier via le frontend React16.

2. **Stockage Initial :** L'API Principale reçoit le fichier, le dépose dans le bucket S3, et crée une entrée dans la table documents de PostgreSQL avec le statut pending17.

3. **Mise en File :** Une tâche d'ingestion est publiée dans la file de messages Redis18.

4. **Traitement Asynchrone :** Un worker du Service d'Ingestion consomme la tâche19. Il télécharge le fichier depuis S3.

5. **Extraction & Chunking :** Le texte est extrait, nettoyé, et découpé en segments (chunks)20202020.

6. **Embedding :** Pour chaque chunk, le service appelle la Gateway IA pour générer un vecteur d'embedding21.

7. **Indexation Finale :** Les vecteurs sont stockés dans Qdrant, le texte brut dans Elasticsearch, et les métadonnées relationnelles mises à jour dans PostgreSQL22. Le statut du document passe à

   completed.

#### **4.2. Flux d'une Requête au Studio IA (RAG)**

1. **Requête :** L'utilisateur pose une question en langage naturel dans le Studio IA23.

2. **Routage :** L'API Gateway transmet la requête au Service IA24.

3. **Recherche Hybride :** Le Service IA convertit la question en vecteur et interroge simultanément :  
   * **Qdrant** pour trouver les chunks de documents les plus pertinents sémantiquement.  
   * **Elasticsearch** pour trouver les passages contenant les mots-clés exacts.  
4. **Augmentation du Contexte :** Les résultats des deux recherches sont combinés et classés pour former un contexte riche25.

5. **Génération :** Ce contexte, ainsi que la question originale, sont envoyés à la Gateway Multi-LLM, qui sélectionne le modèle approprié et génère la réponse26262626.

6. **Streaming :** La réponse est renvoyée au frontend en temps réel (streaming) via des WebSockets, avec les références vers les documents sources pour la vérifiabilité27.

### **5\. Stratégie de Déploiement**

L'infrastructure est gérée selon les meilleures pratiques DevOps pour assurer la reproductibilité, la scalabilité et la maintenabilité.

* **Conteneurisation :** Tous les services backend sont packagés en images **Docker**28.

* **Orchestration :** Un cluster **Kubernetes** gère le déploiement, la mise à l'échelle (scaling) et la résilience des conteneurs2929.

* **Infrastructure as Code (IaC) :** **Terraform** est utilisé pour provisionner et gérer l'ensemble de l'infrastructure cloud (cluster, bases de données, réseaux), rendant les déploiements prévisibles et versionnés30.

* **Intégration et Déploiement Continus (CI/CD) :** **GitHub Actions** automatise le cycle de vie du code : tests, build des images Docker, scans de sécurité, et déploiement sur les différents environnements (développement, staging, production) via des chartes **Helm**31313131.  


## Technologies utilisées
- Frontend : HTML, CSS, JavaScript
- Développement en cours...

## Installation
# **Spécifications Techniques Complètes pour la Plateforme WikiPro**

**Rapport d'Architecture Logicielle**

**Version:** 1.0

**Date:** 21 octobre 2025

**Auteur:** Architecte Logiciel Senior, Spécialiste IA & Gestion de Connaissances

**Statut:** Pour Implémentation

---

## **Analyse Synthétique des Enjeux Techniques**

### **Introduction**

La mission consiste à transformer la vision de WikiPro — une base de connaissances d'entreprise assistée par Intelligence Artificielle — en un plan d'exécution technique robuste et détaillé. L'enjeu principal ne réside pas seulement dans la construction d'une application web moderne, mais dans la conception d'un système où l'IA générative n'est pas une fonctionnalité périphérique, mais le moteur central de la création de valeur. L'application doit être conçue dès le départ pour garantir une isolation stricte des données entre les clients (multi-tenancy), une scalabilité capable de supporter des volumes documentaires massifs, et une sécurité de niveau entreprise.

L'analyse des documents fournis révèle une vision produit ambitieuse et un frontend en cours de développement sur une base technologique moderne (React, TypeScript). Cependant, l'entièreté du backend, de l'infrastructure de données et des pipelines d'IA reste à définir. Ce document fournit les spécifications complètes pour combler cette lacune et guider l'équipe de développement.

### **Philosophie Architecturale**

Pour répondre à ces exigences complexes, une philosophie architecturale claire et pragmatique est adoptée, reposant sur deux piliers fondamentaux :

1. **Architecture en Microservices :** L'application sera décomposée en un ensemble de services indépendants, déployables et évolutifs. Ce pattern est essentiel pour gérer la complexité, permettre aux équipes de travailler en parallèle et faire évoluer sélectivement les composants en fonction de la charge. Par exemple, le service d'ingestion de documents aura des pics d'utilisation très différents du service d'authentification. Cette modularité est un prérequis pour la maintenabilité à long terme et l'optimisation des coûts.1  
2. **Retrieval-Augmented Generation (RAG) comme Fondement :** Le cœur de l'intelligence de WikiPro reposera sur une architecture de type "Retrieval-Augmented Generation" (RAG). Ce choix est stratégique et non négociable. Contrairement aux Large Language Models (LLMs) utilisés de manière isolée, qui peuvent "halluciner" ou fournir des informations obsolètes, le RAG ancre les réponses du modèle dans la base de connaissances privée et vérifiable de l'entreprise.2 Chaque affirmation, chaque résumé, chaque réponse générée par l'IA sera traçable jusqu'aux documents sources. Nous adopterons une approche de  
   **RAG Modulaire** 5, qui nous permettra d'assembler et de chainer différents composants (multiples stratégies de recherche, ré-ordonnancement, etc.) pour créer des expériences IA variées et adaptées, allant de la simple question-réponse à la génération de rapports complexes dans le Studio WikiPro.

Ce document détaille comment ces principes se traduisent en choix technologiques concrets, en structures d'API et en plans de déploiement.

## **4.1. Architecture Globale de la Plateforme WikiPro**

Cette section définit la structure de haut niveau du système, les patterns fondamentaux et la stack technologique qui serviront de fondation à l'ensemble du projet.

### **4.1.1. Diagramme d'Architecture Conceptuelle**

Le diagramme ci-dessous illustre les interactions entre les quatre zones logiques principales du système : la zone Client (Frontend), la zone Applicative (Backend), la zone de Persistance (Données) et la zone d'Intelligence (Services IA). Il met en évidence le flux d'une requête utilisateur et la manière dont l'isolation des tenants (Tenant A vs Tenant B) est maintenue à travers toute la stack.

Extrait de code

graph TD  
    subgraph Zone Client  
        User\[Utilisateur\] \--\> FE  
    end

    subgraph Zone Applicative (Backend \- Kubernetes)  
        FE \--\> APIGW\[API Gateway \<br\> (GraphQL)\]  
        APIGW \--\> AuthService  
        APIGW \--\> UserService  
        APIGW \--\> KBService  
        APIGW \--\> RAGService  
    end

    subgraph Zone de Persistance (Cloud)  
        AuthService \--\> DBR  
        UserService \--\> DBR  
        KBService \--\> DBR  
        KBService \--\> S3  
        RAGService \--\> VectorDB  
    end

    subgraph Zone d'Intelligence (IA Services)  
        RAGService \--\> EmbeddingModel  
        RAGService \--\> LLM\_API\[Generation LLM API \<br\> (Anthropic, OpenAI, etc.)\]  
    end

    style User fill:\#f9f,stroke:\#333,stroke-width:2px  
    style FE fill:\#ccf,stroke:\#333,stroke-width:2px  
    style APIGW fill:\#9cf,stroke:\#333,stroke-width:2px

### **4.1.2. Choix des Patterns Architecturaux**

Les choix architecturaux suivants sont dictés par les exigences de scalabilité, de maintenabilité et d'intégration native de l'IA.

* **Microservices :** Comme mentionné, une architecture en microservices est retenue. Chaque service (auth-service, user-service, knowledge-base-service, rag-pipeline-service) sera un processus indépendant, communiquant via des API bien définies. Cette approche offre une résilience accrue (une défaillance dans un service n'entraîne pas la chute de tout le système), facilite les mises à jour et les déploiements indépendants, et permet d'utiliser la technologie la plus adaptée pour chaque tâche. La gestion de cette complexité sera assurée par un API Gateway qui sert de point d'entrée unique pour le frontend.1  
* **Retrieval-Augmented Generation (RAG) :** Ce pattern est au cœur de la proposition de valeur de WikiPro. Il se décompose en deux flux principaux 4 :  
  1. **L'indexation (Ingestion) :** Un processus asynchrone qui prend les documents sources (PDF, DOCX, etc.), les nettoie, les segmente en "chunks" (morceaux), convertit chaque chunk en une représentation numérique (embedding) via un modèle d'IA, et stocke ces embeddings dans une base de données vectorielle spécialisée.2  
  2. **La restitution (Génération) :** Un processus synchrone déclenché par une requête utilisateur. La requête est transformée en embedding, utilisée pour rechercher les chunks les plus pertinents dans la base de données vectorielle. Ces chunks sont ensuite injectés dans le prompt d'un LLM comme contexte, forçant le modèle à générer une réponse basée sur ces informations factuelles et non sur sa connaissance interne.1 Cette approche est la seule manière fiable de garantir des réponses précises, contextuelles et à jour, tout en permettant de citer les sources.

### **4.1.3. Sélection et Justification de la Stack Technologique**

Le choix des technologies est une décision critique qui impacte la performance, le coût, la sécurité et la vélocité de développement. Les recommandations ci-dessous sont le fruit d'une analyse comparative rigoureuse.

#### **La Décision Pivot : La Base de Données Vectorielle**

La performance et la sécurité de la recherche sémantique, ainsi que le respect de la contrainte de multi-tenancy, dépendent entièrement du choix de la base de données vectorielle. Une simple approche par filtrage de métadonnées sur une base non conçue pour l'isolation des tenants entraînerait des dégradations de performance et des risques de sécurité inacceptables à grande échelle. Il est impératif de choisir une solution offrant une isolation native et performante.

**Tableau 1 : Comparaison des Bases de Données Vectorielles pour WikiPro**

| Caractéristique | Pinecone | Weaviate | Milvus | Qdrant | Recommandation pour WikiPro |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Multi-Tenancy** | **Excellente**. Native via "Namespaces" pour une isolation stricte et performante.9 | **Très Bonne**. Support natif de la multi-tenancy.10 | Bonne. Via "Partitions" ou "Collections", mais moins intégré que Pinecone. | Bonne. Via "Collections", nécessite une gestion manuelle plus fine. | **Pinecone** pour une solution managée "clé en main" ou **Weaviate** pour la flexibilité open-source. |
| **Scalabilité** | **Excellente**. Architecture serverless, auto-scaling horizontal prouvé à l'échelle de milliards de vecteurs.10 | **Très Bonne**. Scaling horizontal, disponible en managé ou auto-hébergé.12 | **Très Bonne**. Conçue pour le scaling horizontal, mais plus complexe à opérer en auto-hébergé.12 | Bonne. Scaling horizontal, mais moins mature que les leaders sur les très grands volumes. | **Pinecone** est le leader pour la scalabilité sans effort opérationnel. |
| **Performance (Latence)** | **Excellente**. Latence p99 \< 50ms rapportée à grande échelle.10 | Très Bonne. Latence faible, mais peut être supérieure à Pinecone sur des charges extrêmes.10 | Très Bonne. Optimisée pour le débit (throughput) élevé. | Très Bonne. Performances élevées, écrite en Rust. | **Pinecone** pour la latence la plus prédictible en production. |
| **Recherche Hybride** | Oui. Supporte la recherche combinant vecteurs (sémantique) et métadonnées (filtres).9 | Oui. Fonctionnalité native et puissante.13 | Oui. | Oui. | Tous les candidats sont viables sur ce point. |
| **Écosystème** | Très bon. Intégrations solides avec LangChain, LlamaIndex, etc. | Très bon. Communauté open-source active, nombreux modules d'intégration.14 | Bon. Très populaire dans la communauté open-source. | Bon. Communauté en forte croissance. | **Pinecone** et **Weaviate** ont les écosystèmes les plus matures pour les cas d'entreprise. |
| **Modèle de Coût** | Managé (pay-as-you-go). Coût prédictible mais potentiellement plus élevé.13 | Open-source (gratuit) ou managé. Offre plus de flexibilité sur les coûts.13 | Open-source. | Open-source. | Dépend de la stratégie : **Pinecone** pour l'externalisation de l'infra, **Weaviate** pour le contrôle. |

**Décision :** La recommandation initiale est d'utiliser **Pinecone** pour son architecture serverless qui élimine la charge opérationnelle, sa scalabilité prouvée et son support natif des namespaces qui répond parfaitement à notre exigence de multi-tenancy. Si une option auto-hébergée (on-premise) ou un contrôle total sur l'infrastructure devient une priorité, **Weaviate** représente la meilleure alternative.

#### **La Flexibilité Stratégique : Le Modèle de Génération (LLM)**

Le marché des LLMs est en constante évolution. S'enfermer avec un seul fournisseur est un risque stratégique majeur. L'architecture doit être agnostique au modèle, en traitant les LLMs comme des composants interchangeables via une API. Cela permettra de bénéficier des meilleures performances, des meilleurs coûts et des innovations futures, quel que soit le fournisseur.

**Tableau 2 : Comparaison des Fournisseurs de LLM (pour la Génération)**

| Critère | OpenAI (o3 / GPT-4.x) | Anthropic (Claude 3.7) | Google (Gemini 2.5) | Open-Source (Llama 4 / DeepSeek v3) | Recommandation pour WikiPro |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Raisonnement & Précision** | **Excellent**. Très performant sur les tâches logiques et le suivi d'instructions complexes.15 | **Excellent**. Réputé pour sa faible tendance à l'hallucination et ses réponses structurées.15 | Très bon. Fortement intégré à l'écosystème Google.15 | Variable. Les meilleurs modèles rivalisent avec les modèles propriétaires, mais nécessitent un fine-tuning. | **Anthropic** et **OpenAI** sont les leaders pour la fiabilité "out-of-the-box". |
| **Fenêtre de Contexte** | Grande (128k+ tokens). | **Excellente** (200k+ tokens). Idéal pour analyser de longs documents.15 | Très grande (1M+ tokens). | De plus en plus grande (jusqu'à 10M pour Llama 4).15 | **Anthropic** et **Google** sont en tête, ce qui est un avantage majeur pour le RAG. |
| **Sécurité & Alignement** | Bon. | **Excellent**. Au cœur de la philosophie d'Anthropic ("Constitutional AI").16 | Très bon. | Dépend de l'implémentation et du fine-tuning. | **Anthropic** offre les meilleures garanties pour les cas d'usage en entreprise. |
| **Disponibilité Fine-Tuning** | Oui (sur certains modèles). | Non (public), focus sur le prompt engineering.16 | Oui. | **Excellent**. Contrôle total sur le processus. | **Open-Source** et **OpenAI** offrent le plus de flexibilité pour l'adaptation. |
| **Coût (par M tokens)** | Compétitif. | Modéré à élevé (selon le modèle : Haiku, Sonnet, Opus).17 | Compétitif. | **Très faible** (coût de l'infrastructure uniquement).18 | **Open-Source** est le plus économique à l'échelle, suivi par OpenAI et Google. |

**Décision :** La stratégie recommandée est de commencer avec **Anthropic Claude 3.7 Sonnet** comme modèle de génération par défaut. Sa grande fenêtre de contexte, sa faible propension à l'hallucination et son focus sur la sécurité en font un choix idéal et robuste pour le lancement.15 L'architecture devra cependant inclure une couche d'abstraction (façade) permettant de router facilement les requêtes vers d'autres modèles (comme OpenAI o3 ou une version auto-hébergée de Llama 4\) à des fins de test A/B, d'optimisation des coûts ou de spécialisation des tâches.

#### **La Qualité à la Source : Le Modèle d'Embedding**

La pertinence de la recherche sémantique commence par la qualité des embeddings. Le choix du modèle d'embedding est donc aussi crucial que celui du LLM de génération. Les benchmarks publics comme le MTEB (Massive Text Embedding Benchmark) sont une ressource inestimable pour ce choix.

**Tableau 3 : Sélection du Modèle d'Embedding (Basé sur le MTEB)**

| Modèle | Développeur | Score MTEB (Retrieval Avg) | Dimensions | Déploiement | Recommandation pour WikiPro |
| :---- | :---- | :---- | :---- | :---- | :---- |
| NV-Embed-v2 | NVIDIA | **\~69.3** (Top du classement) 19 | 2240 | API / Auto-hébergé | Excellente performance, mais peut être complexe à déployer. |
| BAAI/bge-large-en-v1.5 | BAAI | \~68.2 | 1024 | **Auto-hébergé (Open-Source)** | **Excellent équilibre performance/coût**. Très populaire et bien supporté. |
| nomic-embed-text-v1.5 | Nomic | \~68.1 | 768 | Auto-hébergé (Open-Source) | Très bonne performance, modèle multimodal. |
| text-embedding-3-large | OpenAI | \~67.5 | 3072 | API (Propriétaire) | Très bonne performance, facile à utiliser mais plus coûteux et moins de contrôle. |

**Décision :** La recommandation est de démarrer avec un modèle open-source de premier plan comme **BAAI/bge-large-en-v1.5**. Il offre des performances de récupération de premier ordre tout en permettant un déploiement auto-hébergé, ce qui garantit un contrôle total sur les coûts et la sécurité des données.20 Le service d'IA sera conçu pour pouvoir appeler ce modèle hébergé en interne, tout en gardant la possibilité de basculer vers une API comme celle d'OpenAI si nécessaire.

## **4.2. Spécifications Détaillées du Backend**

Cette section fournit le plan directeur pour la conception et le développement de tous les services côté serveur.

### **4.2.1. Architecture des Services Backend (Node.js/TypeScript)**

Le backend sera construit sur une stack Node.js avec TypeScript pour garantir la cohérence avec le frontend et bénéficier d'un écosystème mature pour les applications web.

* **Framework : NestJS**  
  * **Justification :** Bien que des frameworks comme FastAPI (Python) soient excellents pour des tâches purement liées à la donnée, **NestJS** est choisi pour sa nature structurée et opinionnée. Il impose une architecture modulaire et facilement testable, ce qui est un atout majeur pour un projet complexe impliquant plusieurs services et développeurs. Sa performance est comparable à celle d'autres frameworks Node.js de premier plan et son utilisation de TypeScript de bout en bout (décorateurs, DI) s'aligne parfaitement avec la stack frontend.21  
* **Définition des Microservices :**  
  * **API Gateway :** Un service unique (par exemple, basé sur Apollo Server for GraphQL) qui sert de point d'entrée. Il est responsable du routage des requêtes vers les services appropriés, de la validation initiale des jetons d'authentification, de la limitation de débit (rate limiting) et de l'agrégation des réponses.  
  * **auth-service :** Gère l'enregistrement, la connexion (email/mot de passe, SSO), la génération et la validation des jetons JWT. Il est le garant de l'identité de l'utilisateur et de son appartenance à un tenant.  
  * **user-service :** Gère les profils utilisateurs, les rôles (Admin, Éditeur, Lecteur) et les permissions au sein d'un tenant.  
  * **knowledge-base-service :** Gère les opérations CRUD (Create, Read, Update, Delete) pour les entités métier : bases de connaissances, documents (métadonnées), dossiers, etc. Il interagit avec la base de données relationnelle et le stockage d'objets pour les fichiers bruts.  
  * **rag-pipeline-service :** Le cœur de l'IA. Ce service est stateless et expose deux ensembles d'API principaux : une API asynchrone pour l'ingestion de documents et une API synchrone pour le requêtage (question-réponse, etc.). Il orchestrera les différentes étapes du pipeline RAG en utilisant un framework comme **LlamaIndex** ou **LangChain** pour faciliter l'intégration des différents composants (data loaders, chunkers, LLMs).22

### **4.2.2. Spécification de l'API (GraphQL)**

* **Justification du choix de GraphQL :** Pour une application avec une interface utilisateur riche et interconnectée comme WikiPro, GraphQL est supérieur à REST. Il permet au frontend de spécifier précisément les données dont il a besoin en une seule requête, évitant ainsi le sur-fetching (over-fetching) et le sous-fetching (under-fetching). Cela réduit la latence perçue et simplifie la gestion de l'état côté client.  
* **Exemple de Schéma (SDL \- Schema Definition Language) :**  
  GraphQL  
  type Tenant {  
    id: ID\!  
    name: String\!  
    knowledgeBases:\!  
  }

  type User {  
    id: ID\!  
    email: String\!  
    role: String\! \# e.g., "ADMIN", "EDITOR", "VIEWER"  
  }

  type KnowledgeBase {  
    id: ID\!  
    name: String\!  
    documents:\!  
  }

  type Document {  
    id: ID\!  
    name: String\!  
    status: String\! \# e.g., "PENDING", "INDEXED", "FAILED"  
    createdAt: String\!  
  }

  type QueryResponse {  
    answer: String\!  
    sources:\!  
  }

  type DocumentChunk {  
    documentId: ID\!  
    documentName: String\!  
    content: String\!  
    relevanceScore: Float\!  
  }

  \# QUERIES  
  type Query {  
    me: User  
    knowledgeBase(id: ID\!): KnowledgeBase  
  }

  \# MUTATIONS  
  type Mutation {  
    \# Authentification  
    login(email: String\!, password: String\!): String \# Returns JWT

    \# Gestion des documents  
    uploadDocument(kbId: ID\!, file: Upload\!): Document

    \# Interaction IA  
    askQuestion(kbId: ID\!, question: String\!): QueryResponse  
  }

### **4.2.3. Modèle de Données et Persistance**

La stratégie de persistance est duale pour séparer les données structurées des données vectorielles non structurées.

* **Base de Données Relationnelle (PostgreSQL) :**  
  * **Justification :** PostgreSQL est un choix robuste, mature et extrêmement fiable pour les données relationnelles. Son support de JSONB et ses extensions en font un outil polyvalent.  
  * **Schéma Principal :**  
    * tenants (id, name, created\_at)  
    * users (id, email, password\_hash, tenant\_id)  
    * roles (id, name)  
    * user\_roles (user\_id, role\_id)  
    * knowledge\_bases (id, name, tenant\_id)  
    * documents (id, name, original\_path, status, kb\_id, tenant\_id)  
    * api\_keys (id, key\_hash, user\_id, tenant\_id)  
  * **Isolation :** Le tenant\_id est une clé étrangère non-nullable dans presque toutes les tables. Toute requête à la base de données doit être impérativement filtrée par le tenant\_id de l'utilisateur authentifié.  
* **Base de Données Vectorielle (Pinecone) :**  
  * **Structure :** La stratégie consistera à créer un **index Pinecone unique** pour l'ensemble de l'application WikiPro. À l'intérieur de cet index, les données de chaque client seront totalement isolées en utilisant un **namespace** dédié, dont le nom sera dérivé de l'ID du tenant (par exemple, tenant-uuid-1234). Cette approche est la plus performante et la plus sécurisée pour la multi-tenancy.9  
  * **Métadonnées des Vecteurs :** Chaque vecteur stocké sera accompagné de métadonnées riches, essentielles pour le filtrage et la traçabilité :  
    JSON  
    {  
      "tenant\_id": "tenant-uuid-1234",  
      "document\_id": "doc-uuid-5678",  
      "chunk\_id": 42,  
      "source\_filename": "rapport\_annuel\_2024.pdf",  
      "page\_number": 5,  
      "text": "Le texte original du chunk..."  
    }

### **4.2.4. Pipeline d'IA : Ingestion et Indexation (RAG \- Étape 1\)**

Ce pipeline est déclenché lors de l'ajout d'un nouveau document. Il est conçu pour être asynchrone et robuste.

1. **Chargement et Extraction (Data Loading & Extraction) :** Lorsqu'un fichier est téléversé sur le stockage d'objets (S3), un événement déclenche le rag-pipeline-service. Ce service utilise une bibliothèque comme **unstructured.io** pour traiter une grande variété de formats (PDF, DOCX, HTML, TXT, PPTX) et en extraire le contenu textuel brut de manière fiable, en tentant de préserver la mise en page (titres, listes, tableaux).24  
2. **Segmentation (Chunking) :** Le texte extrait est divisé en morceaux (chunks). Une stratégie de **segmentation sémantique** ou de **RecursiveCharacterTextSplitter** sera employée. Contrairement à une division par taille fixe, cette méthode tente de couper le texte aux endroits logiques (fins de phrases, paragraphes) pour préserver le contexte sémantique de chaque chunk.2 Les paramètres de départ recommandés sont une taille de chunk de  
   **512 tokens** avec un chevauchement (overlap) de **50 tokens** pour assurer la continuité entre les chunks.25  
3. **Génération des Embeddings (Embedding Generation) :** Pour chaque chunk de texte, le service appelle l'API du modèle d'embedding choisi (par exemple, notre instance auto-hébergée de BAAI/bge-large-en-v1.5). Le modèle retourne un vecteur de haute dimension (par exemple, 1024 dimensions) qui représente sémantiquement le contenu du chunk.  
4. **Stockage (Upserting to Vector DB) :** Le service envoie le vecteur, son ID unique et les métadonnées associées (y compris le tenant\_id) à la base de données vectorielle (Pinecone). L'opération est un "upsert" : si un chunk avec le même ID existe déjà, il est mis à jour ; sinon, il est créé.

### **4.2.5. Pipeline d'IA : Requêtage et Génération (RAG \- Étape 2\)**

Ce pipeline est déclenché en temps réel par une requête de l'utilisateur (via le chat ou le Studio).

1. **Traitement de la Requête (Query Processing) :** La requête brute de l'utilisateur est d'abord améliorée. Des techniques de **RAG Avancé** seront implémentées, comme la **Query Expansion**. Le système peut utiliser un LLM pour reformuler la question de l'utilisateur de plusieurs manières différentes ("Quels sont les résultats financiers de Q4?", "Donne-moi le bilan du quatrième trimestre.", "Comment s'est passée la fin d'année financièrement?") afin d'élargir la recherche et de récupérer des documents pertinents même s'ils n'utilisent pas les mêmes mots-clés.6  
2. **Embedding de la Requête (Query Embedding) :** La ou les requêtes traitées sont envoyées au même modèle d'embedding que celui utilisé pour l'ingestion afin de garantir la cohérence de l'espace vectoriel.  
3. **Recherche Hybride (Hybrid Search) :** Le rag-pipeline-service interroge la base de données vectorielle. La requête est double :  
   * Une recherche de similarité sémantique (k-Nearest Neighbors) sur les vecteurs.  
   * Un filtre strict sur les métadonnées : filter={"tenant\_id": {"$eq": "user-tenant-id-1234"}}.  
     Cette étape garantit que seuls les documents appartenant au bon tenant sont considérés.  
4. **Ré-ordonnancement (Re-ranking) :** Le premier ensemble de résultats (par exemple, les 20 chunks les plus pertinents) est souvent bruité. Pour affiner la pertinence, ces 20 chunks sont passés à un modèle de **re-ranking** plus léger et spécialisé (par exemple, BAAI/bge-reranker-v2-m3 20). Ce modèle ne fait pas une recherche large, mais compare spécifiquement chaque chunk à la requête initiale et leur attribue un nouveau score de pertinence. Cette étape améliore considérablement la qualité du contexte final.5  
5. **Augmentation du Contexte et Prompting (Context Augmentation & Prompting) :** Les 3 à 5 chunks les mieux classés après le re-ranking sont sélectionnés. Leur contenu textuel est concaténé et formaté dans un prompt système soigneusement conçu pour le LLM de génération.  
   * **Exemple de Prompt :**  
     Vous êtes un assistant expert qui répond aux questions en se basant UNIQUEMENT sur le contexte fourni ci-dessous. Ne faites aucune supposition et n'utilisez pas vos connaissances externes. Si le contexte ne contient pas la réponse, dites "L'information n'est pas disponible dans les documents fournis."

     \---  
     Chunk 1 (Source: rapport\_annuel.pdf, p. 5): Le chiffre d'affaires pour le T4 2024 a atteint 15 millions d'euros, soit une augmentation de 12% par rapport à l'année précédente.  
     \---  
     Chunk 2 (Source: presentation\_interne.pptx, slide 8): Les marges brutes se sont améliorées, passant de 25% à 28% au T4.  
     \---

     Quel a été le chiffre d'affaires et la marge brute au T4 2024?

6. **Génération (Generation) :** Le prompt final est envoyé à l'API du LLM de génération (par exemple, Anthropic Claude 3.7). La réponse est ensuite retournée à l'utilisateur, idéalement en streaming pour une meilleure réactivité perçue.

### **4.2.6. Authentification, Sécurité et Isolation des Données**

La sécurité est une préoccupation primordiale, en particulier dans un environnement multi-tenant.

* **Authentification :** Un flux basé sur les **JSON Web Tokens (JWT)** sera utilisé. Après une connexion réussie, le auth-service génère un JWT signé contenant des informations essentielles (user\_id, tenant\_id, role, exp). Ce jeton doit être inclus dans l'en-tête Authorization de chaque requête subséquente à l'API Gateway.  
* **Autorisation et Isolation :** L'API Gateway et chaque microservice valideront la signature et l'expiration du JWT à chaque requête entrante. Un middleware applicatif systématique extraira le tenant\_id du jeton et l'injectera dans le contexte de la requête. **Toutes les opérations de base de données (SQL et vectorielles) devront impérativement utiliser ce tenant\_id dans leur clause WHERE ou leur filtre de métadonnées.** Cette politique non négociable empêche un utilisateur du tenant A d'accéder, même accidentellement, aux données du tenant B.  
* **Contrôle d'Accès Basé sur les Rôles (RBAC) :** Le role présent dans le JWT (Admin, Editor, Viewer) sera utilisé pour contrôler l'accès à des mutations GraphQL spécifiques. Par exemple, seul un utilisateur avec le rôle Admin ou Editor pourra appeler la mutation uploadDocument.  
* **Protection des Données :** Des mesures pour la détection et l'anonymisation ou le masquage des informations personnelles identifiables (PII) seront intégrées dans le pipeline d'ingestion. Des outils peuvent être utilisés pour scanner le texte extrait et masquer les numéros de téléphone, adresses e-mail, etc., avant la génération des embeddings.29

## **4.3. Finalisation du Frontend et Expérience Utilisateur**

Le frontend React existant doit être complété pour intégrer pleinement les fonctionnalités backend et offrir une expérience utilisateur fluide et digne de confiance.

### **4.3.1. Développement des Composants Manquants**

Les composants suivants sont prioritaires pour le développement :

* **StudioEditor :** Un éditeur de texte riche (basé sur une librairie comme **TipTap** ou **Lexical**) qui sera le cœur du "Studio WikiPro". Il devra permettre des actions contextuelles assistées par IA (sélectionner un texte et cliquer sur "Résumer", "Développer", "Reformuler", "Traduire"). Ces actions déclencheront des appels à la mutation askQuestion du backend avec des prompts spécifiques.  
* **ConversationalAgentUI :** Une interface de chat classique pour permettre aux utilisateurs de poser des questions directement à une ou plusieurs bases de connaissances. Elle doit gérer l'historique de la conversation et afficher les réponses de manière claire.  
* **DocumentUploader :** Un composant permettant de téléverser des documents par glisser-déposer, de suivre leur statut d'indexation (en attente, en cours, indexé, erreur) et de les organiser en dossiers.  
* **AdminDashboard :** Une section de l'application réservée aux administrateurs de tenant pour gérer les utilisateurs, leurs rôles, créer/supprimer des bases de connaissances et visualiser des statistiques d'utilisation simples (nombre de requêtes, documents indexés).

### **4.3.2. Intégration avec l'API GraphQL**

* **Gestion de l'État et des Données :** L'utilisation d'**Apollo Client** est fortement recommandée. C'est la bibliothèque de référence pour les clients GraphQL en React. Elle gère nativement le cache, la mise à jour de l'état après les mutations et simplifie considérablement la logique de récupération des données.  
* **Mises à Jour en Temps Réel :** Pour des processus longs comme l'indexation d'un document, les **GraphQL Subscriptions** (via WebSockets) ou des techniques de polling plus simples seront utilisées pour mettre à jour l'interface utilisateur en temps réel sans que l'utilisateur ait besoin de rafraîchir la page.

### **4.3.3. Recommandations d'Améliorations UX/UI**

L'adoption d'une application d'IA générative repose sur la confiance. L'interface doit être conçue pour être transparente et pour aider l'utilisateur à vérifier les informations.

* **Transparence et Vérifiabilité :** Le scepticisme des utilisateurs envers les "hallucinations" des IA est un obstacle majeur à l'adoption.2 Pour le surmonter, l'application ne peut pas être une "boîte noire". Chaque réponse générée par l'IA, que ce soit dans le chat ou dans le Studio, doit impérativement inclure des  
  **citations cliquables** renvoyant directement aux chunks de documents sources qui ont été utilisés pour la formuler. En cliquant sur une citation, l'utilisateur devrait voir le passage exact du document original, lui permettant de vérifier la source de l'information.2  
* **Réactivité de l'Interface :** Les réponses des LLMs peuvent prendre plusieurs secondes à être générées. Pour éviter une attente frustrante, les réponses doivent être **affichées en streaming** (token par token) dès qu'elles sont disponibles depuis le backend. Cela donne un retour visuel immédiat à l'utilisateur et améliore considérablement la réactivité perçue de l'application. Des technologies comme les Server-Sent Events (SSE) sont bien adaptées à cet usage.  
* **Boucle de Rétroaction Utilisateur (Feedback Loop) :** Chaque réponse générée par l'IA sera accompagnée de boutons "pouce en l'air" / "pouce en bas". Cette rétroaction est extrêmement précieuse. Elle sera stockée et pourra être utilisée ultérieurement pour évaluer la performance des modèles et, potentiellement, pour affiner des modèles spécifiques via des techniques comme le RLHF (Reinforcement Learning from Human Feedback).5

## **4.4. Intégration, Déploiement et Opérations (DevOps)**

Une infrastructure solide et des processus automatisés sont essentiels pour un déploiement rapide et une maintenance efficace.

### **4.4.1. Pipeline CI/CD (GitHub Actions)**

Un pipeline d'intégration et de déploiement continus sera mis en place avec GitHub Actions.

* **Déclencheurs :** Le workflow se déclenchera sur chaque push vers une branche de fonctionnalité (déploiement sur l'environnement de staging) et sur chaque merge dans la branche main (déploiement en production).  
* **Étapes du Pipeline :**  
  1. **Checkout Code**  
  2. **Lint & Format Check** (ESLint, Prettier)  
  3. **Run Unit & Integration Tests** (Jest pour le backend, React Testing Library pour le frontend)  
  4. **Build Docker Images** (pour chaque microservice)  
  5. **Push Images to Container Registry** (par exemple, Amazon ECR)  
  6. **Deploy to Kubernetes** (en utilisant kubectl apply ou un outil comme ArgoCD)

### **4.4.2. Configuration des Environnements (Kubernetes)**

L'application sera conteneurisée et orchestrée avec Kubernetes pour la portabilité et la scalabilité.

* **Infrastructure as Code (IaC) :** Toutes les ressources cloud (cluster Kubernetes, bases de données, buckets S3, etc.) seront définies et gérées à l'aide de **Terraform**. Cela garantit la reproductibilité, la traçabilité et la facilité de gestion des environnements.  
* **Définition des Environnements :**  
  * **development :** Les développeurs travailleront localement en utilisant Docker Compose pour lancer les services nécessaires.  
  * **staging :** Un environnement hébergé sur le cloud, miroir exact de la production. Il est utilisé pour les tests de bout en bout et la validation avant toute mise en production.  
  * **production :** L'environnement client final, hébergé sur un service Kubernetes managé comme **Amazon EKS** ou **Google GKE** pour une haute disponibilité et une gestion simplifiée.

### **4.4.3. Stratégie de Test**

Une stratégie de test multi-niveaux est indispensable pour garantir la qualité et la fiabilité.

* **Tests Backend :**  
  * Tests unitaires (Jest) pour chaque fonction et classe.  
  * Tests d'intégration (Supertest) pour valider les interactions entre services.  
  * Tests de bout en bout (E2E) pour simuler des flux utilisateurs complets.  
* **Tests Frontend :**  
  * Tests de composants (React Testing Library) pour chaque composant UI.  
  * Tests E2E (Cypress) pour valider les parcours utilisateurs dans le navigateur.  
* **Évaluation du Pipeline RAG :** C'est l'aspect le plus critique et le plus complexe du testing. Les tests unitaires classiques ne suffisent pas pour une IA. Un framework d'évaluation dédié comme **RAGAS** 23 ou une suite de tests personnalisée sera intégrée au pipeline CI/CD pour le  
  rag-pipeline-service. À chaque modification, cette suite mesurera automatiquement des métriques clés sur un jeu de données de test :  
  * **Faithfulness (Fidélité) :** La réponse générée est-elle entièrement supportée par le contexte fourni? (Mesure anti-hallucination).  
  * **Answer Relevancy (Pertinence de la réponse) :** La réponse est-elle pertinente par rapport à la question posée?  
  * Context Precision & Recall (Précision et Rappel du contexte) : Le retriever a-t-il bien sélectionné les chunks pertinents et seulement ceux-là?  
    Une régression sur ces métriques devra bloquer la mise en production.

### **4.4.4. Plan de Déploiement Initial**

Pour le lancement et les mises à jour ultérieures, une stratégie de déploiement **Blue-Green** ou **Canary** est recommandée pour garantir l'absence d'interruption de service (zero-downtime). Le plan de déploiement initial consistera à provisionner l'infrastructure de production via Terraform, à déployer la première version de l'application, et à effectuer une série de tests de fumée avant de pointer le DNS public vers le nouvel environnement.

## **4.5. Feuille de Route Technique et Estimations**

Cette section propose un plan de développement pragmatique, découpé en phases logiques (épopées) avec des estimations d'effort pour guider la planification.

### **4.5.1. Priorisation des Développements (Découpage en Épopées)**

1. **Épopée 1 : Fondation & MVP Authentification (Effort estimé : 4 semaines-développeur)**  
   * **Objectif :** Mettre en place les fondations techniques et un premier flux utilisateur fonctionnel.  
   * **Livrables :**  
     * Infrastructure de base (K8s, DBs, CI/CD) provisionnée.  
     * Services auth-service et user-service implémentés.  
     * Frontend : pages de connexion, d'inscription et tableau de bord vide.  
     * L'utilisateur peut créer un compte, se connecter et obtenir un JWT.  
2. **Épopée 2 : Pipeline RAG Essentiel (Effort estimé : 6 semaines-développeur)**  
   * **Objectif :** Implémenter la fonctionnalité IA de base de bout en bout.  
   * **Livrables :**  
     * Services knowledge-base-service et rag-pipeline-service (version de base).  
     * Pipeline d'ingestion fonctionnel : upload, chunking, embedding, stockage.  
     * Interface de chat basique permettant de poser une question à une base de connaissances et de recevoir une réponse (sans re-ranking ni UX avancée).  
3. **Épopée 3 : Studio WikiPro (Bêta) & UX Avancée (Effort estimé : 5 semaines-développeur)**  
   * **Objectif :** Développer l'interface d'édition principale et améliorer l'expérience de confiance.  
   * **Livrables :**  
     * Composant StudioEditor avec des actions IA de base (résumer, etc.).  
     * Implémentation des citations de sources cliquables.  
     * Implémentation du streaming des réponses de l'IA.  
     * Implémentation de la boucle de feedback utilisateur (pouces).  
4. **Épopée 4 : RAG Avancé & Sécurité Renforcée (Effort estimé : 4 semaines-développeur)**  
   * **Objectif :** Améliorer significativement la pertinence de l'IA et finaliser la sécurité.  
   * **Livrables :**  
     * Intégration du modèle de re-ranking dans le pipeline de requêtage.  
     * Implémentation de la Query Expansion ou d'une autre technique d'amélioration de la requête.  
     * Finalisation du RBAC et développement du AdminDashboard.  
5. **Épopée 5 : Scalabilité & Monitoring (Continu)**  
   * **Objectif :** Assurer la performance et la fiabilité de la plateforme à grande échelle.  
   * **Livrables :**  
     * Mise en place d'une suite de tests de charge (k6, Locust).  
     * Optimisation des requêtes et des configurations des services.  
     * Configuration d'une stack d'observabilité complète (Prometheus, Grafana, Loki) pour le monitoring et les alertes.

### **4.5.2. Estimation des Efforts**

Les estimations sont fournies en **semaines-développeur** et supposent une équipe de 3 à 4 ingénieurs (backend, frontend, DevOps). Elles représentent l'effort de développement pur et n'incluent pas la gestion de projet, le design ou les tests QA.

* **Épopée 1 :** 4 semaines-développeur  
* **Épopée 2 :** 6 semaines-développeur  
* **Épopée 3 :** 5 semaines-développeur  
* **Épopée 4 :** 4 semaines-développeur  
* **Total pour le lancement public :** \~19 semaines-développeur

### **4.5.3. Jalons de Livraison Proposés**

* **Fin du Mois 2 : MVP Interne.** Une version fonctionnelle de l'application est disponible pour les tests internes, avec l'authentification et le pipeline RAG de base.  
* **Fin du Mois 4 : Lancement Bêta.** Une version stable est prête à être partagée avec les premiers clients pilotes. Elle inclut le Studio WikiPro et les améliorations UX critiques (citations, streaming).  
* **Fin du Mois 5 : Lancement Public.** La version 1.0 est lancée publiquement, intégrant les capacités de RAG avancé et une sécurité renforcée.



## Utilisation  
Guide d'utilisation à venir.

## Auteur
Yves Cloarec - Responsable Administratif et Financier
