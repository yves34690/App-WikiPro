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
