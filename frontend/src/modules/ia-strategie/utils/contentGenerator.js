import { appData } from '../../../data.js';

/**
 * Générateur de contenu contextuel pour l'IA Stratégie
 */
export const generateContextualContent = (prompt, selectedModel) => {
  const basePrompt = prompt.toLowerCase();
  
  if (basePrompt.includes('rapport') || basePrompt.includes('synthèse')) {
    return `# Rapport de synthèse des activités WikiPro

## Vue d'ensemble
Analyse basée sur les données actuelles de l'entreprise :
- **${appData.references.length} études** réalisées sur la période
- **${appData.poles.labels.length} pôles** d'expertise mobilisés
- **Budget total** : ${Math.round(appData.references.reduce((acc, r) => acc + parseInt(r.budget.replace(/[€\s]/g, '')), 0) / 1000)}K€

## Répartition par pôles
${appData.poles.labels.map((pole, index) => 
  `- **${pole}** : ${appData.poles.values[index]} études`
).join('\n')}

## Tendances identifiées
Les projets de reconversion urbaine (friches industrielles, centres commerciaux) représentent une part croissante de l'activité, avec une montée en puissance des enjeux de transition énergétique.

## Recommandations
1. Renforcer l'expertise en économie circulaire
2. Développer les partenariats public-privé
3. Intégrer davantage les outils numériques dans nos méthodes

*Document généré avec l'IA ${selectedModel} - ${new Date().toLocaleDateString()}*`;
  }
  
  if (basePrompt.includes('proposition') || basePrompt.includes('offre')) {
    return `# Proposition commerciale

## Contexte du projet
Basé sur notre expertise démontrée dans ${appData.references.length} références similaires.

## Notre approche
Mobilisation de nos **${appData.poles.labels.length} pôles d'expertise** :

${appData.poles.labels.slice(0, 3).map(pole => 
  `### ${pole}
  Équipe dédiée avec méthodologies éprouvées`
).join('\n\n')}

## Livrables proposés
- Diagnostic territorial approfondi
- Stratégie d'aménagement personnalisée  
- Plan d'actions opérationnel
- Accompagnement à la mise en œuvre

## Références pertinentes
${appData.references.slice(0, 2).map(ref => 
  `**${ref.titre}** - ${ref.client} (${ref.annee})
  Budget: ${ref.budget} | Durée: ${ref.duree} | Statut: ${ref.statut}`
).join('\n\n')}

*Proposition générée avec ${selectedModel} - Contact: equipe@wikipro.fr*`;
  }
  
  return `# Document généré

Analyse contextuelle basée sur vos données WikiPro :

## Données mobilisées
- **Références** : ${appData.references.length} études dans la base
- **Expertises** : ${appData.competences.length} compétences disponibles  
- **Pôles actifs** : ${appData.poles.labels.length} domaines d'intervention
- **Objets d'études** : ${appData.objets_etudes.length} types de projets couverts

## Contenu personnalisé
Le contenu sera adapté selon votre demande spécifique, en mobilisant :
- Les données de vos références clients
- L'expertise de vos équipes par pôle
- Les méthodologies éprouvées
- Les retours d'expérience capitalisés

*Généré par ${selectedModel} le ${new Date().toLocaleDateString()}*`;
};