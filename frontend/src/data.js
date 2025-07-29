
// Application Data
export const appData = {
  "kpis": {
    "total_etudes": 233,
    "total_mots_cles": 4356,
    "nb_poles": 6,
    "nb_typologies": 20
  },
  "evolution_annuelle": {
    "annees": [2020, 2021, 2022, 2023, 2024],
    "nombres": [29, 66, 59, 58, 21]
  },
  "poles": {
    "labels": [
      "Aménagement, urbanisme, mobilité et environnement",
      "Développement économique & tourisme",
      "Ingénierie & conduite de projets",
      "Développement territorial & social",
      "Marketing territorial, concertation & communication",
      "Modélisation économique & financière"
    ],
    "values": [60, 55, 45, 38, 18, 17]
  },
  "top_typologies": {
    "labels": [
      "Études de faisabilité et de programmation",
      "Stratégie de développement économique",
      "Stratégie et prospective territoriale",
      "Conception de projets urbains",
      "Ingénierie financière et montage",
      "Modélisation économique & financière",
      "Planification et études de mobilité",
      "Planification territoriale",
      "Valorisation touristique",
      "Études de marché"
    ],
    "values": [53, 42, 39, 32, 28, 18, 18, 16, 15, 13]
  },
  "mots_cles_par_categorie": {
    "Contexte": {
      "labels": ["La Réunion", "PLU", "croissance démographique", "développement territorial", "Tourisme", "SCOT", "Mayotte", "Territoire rural"],
      "values": [12, 7, 7, 6, 6, 6, 5, 5]
    },
    "Enjeux": {
      "labels": ["attractivité", "attractivité territoriale", "financement", "accessibilité", "développement économique", "Développement durable"],
      "values": [18, 8, 7, 6, 6, 6]
    },
    "Réponses": {
      "labels": ["Feuille de route", "Mobilités douces", "ingénierie financière", "accompagnement entreprises", "gouvernance partagée"],
      "values": [7, 6, 5, 4, 4]
    },
    "Étude": {
      "labels": ["programmation", "faisabilité", "aménagement", "développement économique", "développement territorial"],
      "values": [24, 15, 14, 10, 9]
    },
    "Méthodes": {
      "labels": ["Entretiens", "Benchmark", "Plateforme collaborative", "Analyse documentaire", "Ateliers"],
      "values": [26, 20, 10, 9, 8]
    }
  },
  "methodologies": [
    {
      "id": 1,
      "title": "Approche systémique territoriale",
      "description": "Analyse des interdépendances entre acteurs, ressources et enjeux territoriaux",
      "impact": "Structurant"
    },
    {
      "id": 2,
      "title": "Prospective participative",
      "description": "Construction collective de scénarios d'avenir intégrant les visions des différents acteurs",
      "impact": "Innovant"
    },
    {
      "id": 3,
      "title": "Analyse multicritère spatiale",
      "description": "Évaluation géographique des potentialités et contraintes territoriales",
      "impact": "Opérationnel"
    },
    {
      "id": 4,
      "title": "Benchmarking territorial",
      "description": "Comparaison des pratiques et performances avec des territoires similaires",
      "impact": "Stratégique"
    }
  ],
  "processPhases": [
    {
      "step": 1,
      "title": "Diagnostic territorial approfondi",
      "desc": "Analyse des ressources, contraintes, dynamiques et acteurs du territoire selon une approche systémique multi-échelle."
    },
    {
      "step": 2,
      "title": "Co-construction des enjeux",
      "desc": "Identification participative des défis prioritaires avec les parties prenantes locales et définition d'une vision partagée."
    },
    {
      "step": 3,
      "title": "Élaboration stratégique",
      "desc": "Conception de scénarios d'intervention et définition d'une stratégie d'action territorialisée et opérationnelle."
    },
    {
      "step": 4,
      "title": "Programmation et mise en œuvre",
      "desc": "Déclinaison opérationnelle en actions concrètes avec calendrier, budget et indicateurs de suivi-évaluation."
    },
    {
      "step": 5,
      "title": "Accompagnement et évaluation",
      "desc": "Suivi des réalisations, évaluation des impacts et ajustement des stratégies selon une logique d'amélioration continue."
    }
  ],
  "iaBenchmark": [
    {"model": "GPT-4", "security": 7, "cost": 6, "capacity": 9, "score": 7.3},
    {"model": "Claude 3.5", "security": 8, "cost": 7, "capacity": 8, "score": 7.7},
    {"model": "Mistral Large", "security": 9, "cost": 8, "capacity": 7, "score": 8.0}
  ],
  "synthese_annuelle": [
    {"annee": 2020, "nb_etudes": 29, "nb_poles_actifs": 6},
    {"annee": 2021, "nb_etudes": 66, "nb_poles_actifs": 6},
    {"annee": 2022, "nb_etudes": 59, "nb_poles_actifs": 6},
    {"annee": 2023, "nb_etudes": 58, "nb_poles_actifs": 6},
    {"annee": 2024, "nb_etudes": 21, "nb_poles_actifs": 6}
  ],
  "dataSources": [
    {
      "id": 1,
      "name": "INSEE",
      "type": "Démographie",
      "description": "Données démographiques et socio-économiques",
      "access": "API publique",
      "lastUpdate": "2024-01-15",
      "status": "active"
    },
    {
      "id": 2,
      "name": "OpenData territoires",
      "type": "Territorial",
      "description": "Données ouvertes territoriales",
      "access": "Téléchargement",
      "lastUpdate": "2023-12-20",
      "status": "active"
    },
    {
      "id": 3,
      "name": "Base SIRENE",
      "type": "Économique",
      "description": "Répertoire des entreprises",
      "access": "API",
      "lastUpdate": "2024-01-10",
      "status": "active"
    }
  ],
  "dataProcessing": [
    {
      "id": 1,
      "name": "Analyse démographique",
      "description": "Traitement des données de population",
      "tools": ["Python", "R", "Excel"],
      "complexity": "Intermédiaire"
    },
    {
      "id": 2,
      "name": "Cartographie SIG",
      "description": "Analyse spatiale et cartographique",
      "tools": ["QGIS", "ArcGIS", "PostGIS"],
      "complexity": "Avancé"
    }
  ],
  "illustrations": [
    {
      "id": 1,
      "title": "Schéma d'aménagement urbain",
      "category": "Urbanisme",
      "type": "Schéma",
      "description": "Illustration des principes d'aménagement",
      "tags": ["aménagement", "urbain", "planification"],
      "usage": "Présentation AO urbanisme"
    },
    {
      "id": 2,
      "title": "Graphique évolution démographique",
      "category": "Démographie",
      "type": "Graphique",
      "description": "Courbe d'évolution de la population",
      "tags": ["démographie", "évolution", "statistiques"],
      "usage": "Diagnostic territorial"
    },
    {
      "id": 3,
      "title": "Carte des flux économiques",
      "category": "Économie",
      "type": "Cartographie",
      "description": "Visualisation des échanges économiques",
      "tags": ["économie", "flux", "territoire"],
      "usage": "Étude économique"
    }
  ],
  "outils": [
    {
      "id": 1,
      "name": "Analyse SWOT",
      "category": "Diagnostic",
      "description": "Outil d'analyse stratégique Forces/Faiblesses/Opportunités/Menaces",
      "instructions": "1. Identifier les forces internes\n2. Lister les faiblesses\n3. Analyser les opportunités externes\n4. Évaluer les menaces",
      "mobilisation": "Phase de diagnostic territorial et stratégique",
      "impact": "Structurant"
    },
    {
      "id": 2,
      "name": "Matrice d'acteurs",
      "category": "Gouvernance",
      "description": "Mapping des parties prenantes et de leurs relations",
      "instructions": "1. Identifier tous les acteurs\n2. Définir leurs intérêts\n3. Évaluer leur pouvoir d'influence\n4. Analyser les jeux d'acteurs",
      "mobilisation": "Phase de concertation et gouvernance",
      "impact": "Opérationnel"
    },
    {
      "id": 3,
      "name": "Arbre à problèmes",
      "category": "Analyse",
      "description": "Outil de structuration des causes et effets",
      "instructions": "1. Identifier le problème central\n2. Lister les causes racines\n3. Identifier les effets\n4. Hiérarchiser les relations",
      "mobilisation": "Phase de diagnostic approfondi",
      "impact": "Analytique"
    }
  ],
  "cvtheque": [
    {
      "id": 1,
      "nom": "Marie Dupont",
      "poste": "Urbaniste-Planificatrice",
      "experience": "8 ans",
      "competences": ["Urbanisme", "SIG", "Concertation", "PLU"],
      "pole": "Aménagement, urbanisme, mobilité et environnement",
      "localisation": "Paris",
      "disponibilite": "Disponible",
      "projets_recents": ["SCOT Métropole", "PLU Communal", "Étude mobilité"]
    },
    {
      "id": 2,
      "nom": "Jean Martin",
      "poste": "Économiste territorial",
      "experience": "12 ans",
      "competences": ["Économie territoriale", "Modélisation", "Statistiques", "Prospective"],
      "pole": "Développement économique & tourisme",
      "localisation": "Lyon",
      "disponibilite": "Partiellement disponible",
      "projets_recents": ["Stratégie économique régionale", "Étude filière tourisme"]
    },
    {
      "id": 3,
      "nom": "Sophie Lemaire",
      "poste": "Chef de projet territorial",
      "experience": "6 ans",
      "competences": ["Gestion de projet", "Animation territoriale", "Communication", "Innovation"],
      "pole": "Ingénierie & conduite de projets",
      "localisation": "Bordeaux",
      "disponibilite": "Disponible",
      "projets_recents": ["Projet smart city", "Innovation territoriale", "Plateforme collaborative"]
    }
  ],
  "competences": [
    "Urbanisme et aménagement",
    "Développement économique territorial",
    "Modélisation économique et financière",
    "Systèmes d'information géographique (SIG)",
    "Concertation et participation citoyenne",
    "Gestion de projet territorial",
    "Communication et marketing territorial",
    "Analyse de données territoriales",
    "Prospective et stratégie territoriale",
    "Innovation territoriale et smart city",
    "Tourisme et valorisation patrimoniale",
    "Ingénierie financière et montage de projets",
    "Évaluation des politiques publiques",
    "Développement durable et transition écologique",
    "Mobilité et transport",
    "Habitat et logement",
    "Économie sociale et solidaire",
    "Animation de réseaux d'acteurs",
    "Benchmark et veille territoriale",
    "Gouvernance territoriale"
  ],
  "matriceCompetences": {
    "poles": [
      "Aménagement, urbanisme, mobilité et environnement",
      "Développement économique & tourisme", 
      "Ingénierie & conduite de projets",
      "Développement territorial & social",
      "Marketing territorial, concertation & communication",
      "Modélisation économique & financière"
    ],
    "niveaux": ["Débutant", "Intermédiaire", "Confirmé", "Expert"],
    "data": [
      {
        "competence": "Urbanisme et aménagement",
        "pole": "Aménagement, urbanisme, mobilité et environnement",
        "niveau_requis": "Expert",
        "disponible": 5
      },
      {
        "competence": "Développement économique territorial",
        "pole": "Développement économique & tourisme",
        "niveau_requis": "Confirmé",
        "disponible": 3
      },
      {
        "competence": "Gestion de projet territorial",
        "pole": "Ingénierie & conduite de projets",
        "niveau_requis": "Expert",
        "disponible": 4
      }
    ]
  },
  "references": [
    {
      "id": 1,
      "titre": "Étude de faisabilité pour la création d'une Zone d'Activité Économique",
      "client": "Communauté de communes du Val de Loire",
      "annee": 2024,
      "pole": "Développement économique & tourisme",
      "typologie": "Études de faisabilité et de programmation",
      "objet": "ZAE",
      "description": "Analyse de faisabilité technique, économique et environnementale pour l'implantation d'une zone d'activité de 15 hectares dédiée aux entreprises artisanales et industrielles.",
      "mots_cles": ["ZAE", "faisabilité", "développement économique", "artisanat", "industrie", "aménagement"],
      "duree": "6 mois",
      "budget": "45 000€",
      "statut": "Terminé",
      "equipe": 4,
      "resultats": "Validation du projet avec recommandations d'aménagement phasé"
    },
    {
      "id": 2,
      "titre": "Plan de développement touristique de la station thermale",
      "client": "Ville de Vichy",
      "annee": 2023,
      "pole": "Développement économique & tourisme",
      "typologie": "Stratégie de développement économique",
      "objet": "Station thermale",
      "description": "Élaboration d'une stratégie de diversification et de modernisation de l'offre touristique pour repositionner la destination sur le marché du tourisme de bien-être.",
      "mots_cles": ["tourisme", "thermalisme", "bien-être", "stratégie", "diversification", "modernisation"],
      "duree": "8 mois",
      "budget": "62 000€",
      "statut": "Terminé",
      "equipe": 5,
      "resultats": "Plan d'actions validé avec 15 mesures opérationnelles"
    },
    {
      "id": 3,
      "titre": "Reconversion de la friche industrielle en éco-quartier",
      "client": "Métropole de Lille",
      "annee": 2024,
      "pole": "Aménagement, urbanisme, mobilité et environnement",
      "typologie": "Conception de projets urbains",
      "objet": "Friche industrielle",
      "description": "Conception d'un projet de reconversion d'une ancienne usine textile en éco-quartier mixte intégrant logements, commerces et espaces verts.",
      "mots_cles": ["reconversion", "friche", "éco-quartier", "mixité", "développement durable", "urbanisme"],
      "duree": "12 mois",
      "budget": "95 000€",
      "statut": "En cours",
      "equipe": 7,
      "resultats": "Phase 1 validée : diagnostic et programmation"
    },
    {
      "id": 4,
      "titre": "Étude de repositionnement du complexe cinématographique",
      "client": "SEM Cinéma Grand Ouest",
      "annee": 2023,
      "pole": "Marketing territorial, concertation & communication",
      "typologie": "Stratégie et prospective territoriale",
      "objet": "Cinéma",
      "description": "Analyse stratégique pour la modernisation et le repositionnement d'un complexe de 8 salles face à la concurrence et aux nouveaux usages numériques.",
      "mots_cles": ["cinéma", "repositionnement", "modernisation", "concurrence", "numérique", "loisirs"],
      "duree": "4 mois",
      "budget": "28 000€",
      "statut": "Terminé",
      "equipe": 3,
      "resultats": "Plan de modernisation avec ROI projeté de 18%"
    },
    {
      "id": 5,
      "titre": "Optimisation logistique de la halle de marée",
      "client": "Port de Boulogne-sur-Mer",
      "annee": 2024,
      "pole": "Ingénierie & conduite de projets",
      "typologie": "Ingénierie financière et montage",
      "objet": "Halle de pêche",
      "description": "Réorganisation des flux et modernisation des équipements de la halle de marée pour améliorer la traçabilité et réduire les coûts logistiques.",
      "mots_cles": ["halle de marée", "logistique", "traçabilité", "pêche", "modernisation", "optimisation"],
      "duree": "10 mois",
      "budget": "72 000€",
      "statut": "En cours",
      "equipe": 6,
      "resultats": "Réduction projetée de 25% des coûts logistiques"
    },
    {
      "id": 6,
      "titre": "Schéma directeur d'aménagement de l'aéroport régional",
      "client": "Syndicat mixte Aéroport Centre-Val de Loire",
      "annee": 2023,
      "pole": "Aménagement, urbanisme, mobilité et environnement",
      "typologie": "Planification et études de mobilité",
      "objet": "Aéroport",
      "description": "Élaboration du schéma directeur d'aménagement pour l'extension et la modernisation de l'aéroport en intégrant les enjeux environnementaux et de mobilité durable.",
      "mots_cles": ["aéroport", "schéma directeur", "extension", "mobilité", "environnement", "transport"],
      "duree": "14 mois",
      "budget": "118 000€",
      "statut": "Terminé",
      "equipe": 8,
      "resultats": "Validation du schéma avec horizon 2035"
    },
    {
      "id": 7,
      "titre": "Reconversion énergétique du site industriel",
      "client": "Groupe industriel Normandie",
      "annee": 2024,
      "pole": "Développement territorial & social",
      "typologie": "Modélisation économique & financière",
      "objet": "Usine",
      "description": "Étude de faisabilité pour la transition énergétique d'un site industriel vers les énergies renouvelables avec analyse des impacts économiques et sociaux.",
      "mots_cles": ["usine", "transition énergétique", "renouvelables", "industrie", "économie", "social"],
      "duree": "7 mois",
      "budget": "54 000€",
      "statut": "En cours",
      "equipe": 5,
      "resultats": "Économies projetées de 30% sur les coûts énergétiques"
    },
    {
      "id": 8,
      "titre": "Développement du pôle multimodal de fret",
      "client": "Région Hauts-de-France",
      "annee": 2023,
      "pole": "Aménagement, urbanisme, mobilité et environnement",
      "typologie": "Planification territoriale",
      "objet": "Plateforme logistique",
      "description": "Conception et planification d'un pôle multimodal combinant transport routier, ferroviaire et fluvial pour optimiser les flux de marchandises régionaux.",
      "mots_cles": ["multimodal", "fret", "logistique", "transport", "planification", "flux"],
      "duree": "16 mois",
      "budget": "135 000€",
      "statut": "Terminé",
      "equipe": 9,
      "resultats": "Plateforme opérationnelle avec 3 modes de transport"
    },
    {
      "id": 9,
      "titre": "Rénovation urbaine du centre commercial",
      "client": "Foncière Commerciale Atlantique",
      "annee": 2024,
      "pole": "Marketing territorial, concertation & communication",
      "typologie": "Valorisation touristique",
      "objet": "Centre commercial",
      "description": "Stratégie de rénovation et repositionnement d'un centre commercial de 25 000m² avec intégration d'espaces de loisirs et services de proximité.",
      "mots_cles": ["centre commercial", "rénovation", "repositionnement", "loisirs", "services", "commerce"],
      "duree": "9 mois",
      "budget": "67 000€",
      "statut": "En cours",
      "equipe": 4,
      "resultats": "Taux d'occupation projeté à 92%"
    },
    {
      "id": 10,
      "titre": "Aménagement du parc technologique universitaire",
      "client": "Université de Bretagne Sud",
      "annee": 2023,
      "pole": "Développement économique & tourisme",
      "typologie": "Études de marché",
      "objet": "Campus universitaire",
      "description": "Étude de marché et programmation pour l'aménagement d'un parc technologique adossé au campus universitaire, favorisant l'innovation et les start-ups.",
      "mots_cles": ["campus", "parc technologique", "innovation", "start-ups", "université", "technologie"],
      "duree": "6 mois",
      "budget": "38 000€",
      "statut": "Terminé",
      "equipe": 4,
      "resultats": "Programmation validée pour 50 entreprises"
    },
    {
      "id": 11,
      "titre": "Modernisation du port de plaisance",
      "client": "Communauté d'agglomération Côte d'Azur",
      "annee": 2024,
      "pole": "Ingénierie & conduite de projets",
      "typologie": "Conception de projets urbains",
      "objet": "Port de plaisance",
      "description": "Projet de modernisation et d'extension du port de plaisance avec création d'un pôle nautique et amélioration des services aux plaisanciers.",
      "mots_cles": ["port de plaisance", "nautique", "modernisation", "plaisanciers", "tourisme", "maritime"],
      "duree": "11 mois",
      "budget": "89 000€",
      "statut": "En cours",
      "equipe": 6,
      "resultats": "Capacité d'accueil augmentée de 40%"
    },
    {
      "id": 12,
      "titre": "Requalification du quartier de la gare",
      "client": "Ville de Strasbourg",
      "annee": 2023,
      "pole": "Développement territorial & social",
      "typologie": "Planification territoriale",
      "objet": "Quartier gare",
      "description": "Projet de requalification urbaine du quartier de la gare intégrant mixité fonctionnelle, espaces publics de qualité et amélioration des mobilités.",
      "mots_cles": ["quartier gare", "requalification", "mixité", "espaces publics", "mobilités", "urbanisme"],
      "duree": "13 mois",
      "budget": "102 000€",
      "statut": "Terminé",
      "equipe": 7,
      "resultats": "Plan guide adopté par le conseil municipal"
    }
  ],
  "objets_etudes": [
    "Aéroport", "ZAE", "Cinéma", "Usine", "Halle de pêche", "Friche industrielle", 
    "Station thermale", "Plateforme logistique", "Centre commercial", "Campus universitaire",
    "Port de plaisance", "Quartier gare", "Parc technologique", "Zone artisanale",
    "Complexe sportif", "Hôpital", "Médiathèque", "Marché couvert", "Parking",
    "Espace culturel", "Zone résidentielle", "Parc d'activités"
  ]
};
