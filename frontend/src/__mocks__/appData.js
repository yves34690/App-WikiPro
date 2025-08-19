/**
 * Mock des données appData pour les tests
 * Version simplifiée avec données cohérentes
 */

export const mockAppData = {
  kpis: {
    total_etudes: 150,
    total_mots_cles: 45,
    nb_poles: 6,
    nb_typologies: 12
  },
  
  evolution_annuelle: {
    annees: ['2020', '2021', '2022', '2023', '2024'],
    nombres: [20, 35, 45, 60, 80]
  },
  
  poles: {
    labels: [
      'Aménagement urbain',
      'Développement économique',
      'Environnement',
      'Transport',
      'Habitat',
      'Gouvernance'
    ],
    values: [25, 20, 18, 15, 12, 10]
  },
  
  top_typologies: {
    labels: [
      'Étude de faisabilité',
      'Diagnostic territorial',
      'Schéma directeur',
      'Plan local urbanisme',
      'Étude d\'impact'
    ],
    values: [30, 25, 20, 15, 10]
  },
  
  synthese_annuelle: [
    { annee: 2020, nb_etudes: 20, nb_poles_actifs: 4 },
    { annee: 2021, nb_etudes: 35, nb_poles_actifs: 5 },
    { annee: 2022, nb_etudes: 45, nb_poles_actifs: 6 },
    { annee: 2023, nb_etudes: 60, nb_poles_actifs: 6 },
    { annee: 2024, nb_etudes: 80, nb_poles_actifs: 6 }
  ],
  
  mots_cles_par_categorie: {
    'Contexte': {
      labels: ['urbain', 'territoire', 'développement'],
      values: [15, 12, 10]
    },
    'Enjeux': {
      labels: ['durabilité', 'mobilité', 'économie'],
      values: [8, 7, 6]
    },
    'Réponses': {
      labels: ['aménagement', 'planification', 'innovation'],
      values: [10, 9, 7]
    }
  },
  
  references: [
    {
      id: 1,
      titre: 'Étude de faisabilité ZAE Test',
      client: 'Commune Test',
      annee: 2024,
      statut: 'Terminé',
      pole: 'Aménagement urbain',
      typologie: 'Étude de faisabilité',
      objet: 'Zone d\'activité',
      duree: '6 mois',
      budget: '50 000 €',
      equipe: 3,
      description: 'Description test pour les tests unitaires',
      mots_cles: ['test', 'unitaire', 'jest'],
      resultats: 'Résultats de test pour validation'
    },
    {
      id: 2,
      titre: 'Diagnostic territorial Test',
      client: 'Intercommunalité Test',
      annee: 2023,
      statut: 'En cours',
      pole: 'Développement économique',
      typologie: 'Diagnostic territorial',
      objet: 'Territoire',
      duree: '8 mois',
      budget: '75 000 €',
      equipe: 4,
      description: 'Autre description test',
      mots_cles: ['diagnostic', 'test', 'territorial'],
      resultats: 'Autres résultats de test'
    }
  ],
  
  objets_etudes: [
    'Zone d\'activité',
    'Territoire',
    'Centre-ville',
    'Quartier'
  ],
  
  methodologies: [
    {
      id: 1,
      title: 'Analyse territoriale',
      description: 'Méthode test pour analyse',
      impact: 'Élevé'
    },
    {
      id: 2,
      title: 'Concertation publique',
      description: 'Méthode test concertation',
      impact: 'Moyen'
    }
  ],
  
  processPhases: [
    {
      step: 1,
      title: 'Phase de test 1',
      desc: 'Description phase test'
    },
    {
      step: 2,
      title: 'Phase de test 2', 
      desc: 'Autre description phase'
    }
  ],
  
  dataSources: [
    {
      id: 1,
      name: 'Source test',
      type: 'Démographie',
      status: 'active',
      description: 'Source de données test',
      access: 'API',
      lastUpdate: '2024-01-01'
    }
  ],
  
  dataProcessing: [
    {
      id: 1,
      name: 'Traitement test',
      description: 'Traitement test description',
      tools: ['Python', 'R'],
      complexity: 'Simple'
    }
  ],
  
  illustrations: [
    {
      id: 1,
      title: 'Illustration test',
      description: 'Description illustration test',
      category: 'Urbanisme',
      type: 'Schéma',
      tags: ['test', 'schema'],
      usage: 'Usage test'
    }
  ],
  
  outils: [
    {
      id: 1,
      name: 'Outil test',
      category: 'Diagnostic',
      impact: 'Élevé',
      description: 'Description outil test',
      instructions: 'Instruction 1\nInstruction 2',
      mobilisation: 'Mobilisation test'
    }
  ],
  
  cvtheque: [
    {
      id: 1,
      nom: 'Jean Test',
      poste: 'Consultant test',
      experience: '5 ans',
      pole: 'Aménagement urbain',
      disponibilite: 'Disponible',
      localisation: 'Paris',
      competences: ['test', 'jest', 'react'],
      projets_recents: ['Projet test 1', 'Projet test 2']
    }
  ],
  
  competences: [
    'React',
    'JavaScript',
    'Jest',
    'Testing',
    'Mock'
  ],
  
  matriceCompetences: {
    poles: ['Aménagement urbain', 'Développement économique'],
    niveaux: ['Débutant', 'Intermédiaire', 'Confirmé'],
    data: [
      {
        competence: 'React',
        pole: 'Aménagement urbain',
        niveau_requis: 'Confirmé',
        disponible: 3
      },
      {
        competence: 'Jest',
        pole: 'Développement économique',
        niveau_requis: 'Intermédiaire',
        disponible: 2
      }
    ]
  }
};

export default mockAppData;