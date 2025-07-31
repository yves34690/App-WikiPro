# Documentation de la Stack Technique

L'application est composée de deux parties distinctes : une application front-end moderne basée sur React et un prototype plus simple en HTML, CSS et JavaScript.

---

## 1. Application Principale (`frontend/`)

Cette application, construite avec **Create React App**, constitue le cœur du projet.

*   **Langage :**
    *   **JavaScript (ES6+)**

*   **Framework et Librairies Principales :**
    *   **React (`react`, `react-dom`) :** Bibliothèque JavaScript pour construire des interfaces utilisateur.
    *   **React Scripts (`react-scripts`) :** Scripts et configurations pour les applications React (démarrage, build, test).

*   **Visualisation de Données :**
    *   **Chart.js (`chart.js`) :** Librairie pour créer des graphiques interactifs.
    *   **React Chart.js 2 (`react-chartjs-2`) :** Composants React pour intégrer `Chart.js`.

*   **Tests :**
    *   **Jest (`jest`) :** Framework de test JavaScript.
    *   **React Testing Library (`@testing-library/react`, `@testing-library/jest-dom`) :** Outils pour tester les composants React.

*   **Icônes :**
    *   **Font Awesome (`@fortawesome/fontawesome-free`) :** Bibliothèque d'icônes vectorielles.

*   **Gestion des Dépendances :**
    *   **npm :** Gestionnaire de paquets pour l'écosystème JavaScript.

---

## 2. Prototype (`Prototype/`)

Ce prototype est une application web statique, probablement utilisée pour des démonstrations ou des tests de concept.

*   **Structure :**
    *   **HTML5**
    *   **CSS3**
    *   **JavaScript (ES6+)**

*   **Librairies (chargées via CDN) :**
    *   **Chart.js :** Pour les graphiques et visualisations.
    *   **Font Awesome :** Pour les icônes.

*   **Données :**
    *   Les données sont actuellement **statiques** et stockées dans un objet JavaScript dans le fichier `app.js`.

---

## Architecture Générale

*   **Front-end uniquement :** L'application ne présente pas de composant back-end. Les données sont soit statiques (dans le prototype), soit destinées à être chargées via des appels API (dans l'application React).
*   **Deux approches :** Le projet combine une approche de prototypage rapide (HTML/CSS/JS) et une approche de développement d'application robuste et évolutive (React).
