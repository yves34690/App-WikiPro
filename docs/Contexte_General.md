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