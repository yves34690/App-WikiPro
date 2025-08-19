/**
 * Tests unitaires pour le hook useReferencesFilters
 */

import { renderHook, act } from '@testing-library/react';
import { useReferencesFilters } from './useReferencesFilters';

// Mock appData avec des données de test
jest.mock('../../../data.js', () => ({
  appData: {
    references: [
      {
        id: 1,
        titre: 'Étude Urbanisme Lyon',
        client: 'Ville de Lyon',
        description: 'Étude d\'aménagement urbain',
        mots_cles: ['urbanisme', 'aménagement'],
        pole: 'Urbanisme',
        typologie: 'Étude',
        objet: 'Aménagement',
        annee: 2023,
        budget: '25 000€',
        statut: 'Terminé'
      },
      {
        id: 2,
        titre: 'Diagnostic Économique Paris',
        client: 'Région IDF',
        description: 'Diagnostic économique territorial',
        mots_cles: ['économie', 'diagnostic'],
        pole: 'Économie',
        typologie: 'Diagnostic',
        objet: 'Développement',
        annee: 2024,
        budget: '40 000€',
        statut: 'En cours'
      },
      {
        id: 3,
        titre: 'Plan Communication Marseille',
        client: 'Métropole Marseille',
        description: 'Stratégie de communication locale',
        mots_cles: ['communication', 'stratégie'],
        pole: 'Communication',
        typologie: 'Plan',
        objet: 'Communication',
        annee: 2022,
        budget: '15 000€',
        statut: 'Terminé'
      }
    ]
  }
}));

describe('useReferencesFilters Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devrait initialiser avec les valeurs par défaut', () => {
    const { result } = renderHook(() => useReferencesFilters());

    expect(result.current.searchTerm).toBe('');
    expect(result.current.selectedPole).toBe('');
    expect(result.current.selectedTypologie).toBe('');
    expect(result.current.selectedObjet).toBe('');
    expect(result.current.selectedAnnee).toBe('');
    expect(result.current.selectedStatut).toBe('');
    expect(result.current.sortBy).toBe('annee');
    expect(result.current.sortOrder).toBe('desc');
  });

  test('devrait retourner toutes les références par défaut', () => {
    const { result } = renderHook(() => useReferencesFilters());

    expect(result.current.sortedReferences).toHaveLength(3);
    // Par défaut, tri par année desc : 2024, 2023, 2022
    expect(result.current.sortedReferences[0].annee).toBe(2024);
    expect(result.current.sortedReferences[1].annee).toBe(2023);
    expect(result.current.sortedReferences[2].annee).toBe(2022);
  });

  test('devrait filtrer par terme de recherche', () => {
    const { result } = renderHook(() => useReferencesFilters());

    act(() => {
      result.current.setSearchTerm('Lyon');
    });

    expect(result.current.sortedReferences).toHaveLength(1);
    expect(result.current.sortedReferences[0].titre).toBe('Étude Urbanisme Lyon');
  });

  test('devrait filtrer par recherche dans les mots-clés', () => {
    const { result } = renderHook(() => useReferencesFilters());

    act(() => {
      result.current.setSearchTerm('économie');
    });

    expect(result.current.sortedReferences).toHaveLength(1);
    expect(result.current.sortedReferences[0].titre).toBe('Diagnostic Économique Paris');
  });

  test('devrait filtrer par pôle', () => {
    const { result } = renderHook(() => useReferencesFilters());

    act(() => {
      result.current.setSelectedPole('Urbanisme');
    });

    expect(result.current.sortedReferences).toHaveLength(1);
    expect(result.current.sortedReferences[0].pole).toBe('Urbanisme');
  });

  test('devrait filtrer par typologie', () => {
    const { result } = renderHook(() => useReferencesFilters());

    act(() => {
      result.current.setSelectedTypologie('Diagnostic');
    });

    expect(result.current.sortedReferences).toHaveLength(1);
    expect(result.current.sortedReferences[0].typologie).toBe('Diagnostic');
  });

  test('devrait filtrer par année', () => {
    const { result } = renderHook(() => useReferencesFilters());

    act(() => {
      result.current.setSelectedAnnee('2023');
    });

    expect(result.current.sortedReferences).toHaveLength(1);
    expect(result.current.sortedReferences[0].annee).toBe(2023);
  });

  test('devrait filtrer par statut', () => {
    const { result } = renderHook(() => useReferencesFilters());

    act(() => {
      result.current.setSelectedStatut('En cours');
    });

    expect(result.current.sortedReferences).toHaveLength(1);
    expect(result.current.sortedReferences[0].statut).toBe('En cours');
  });

  test('devrait appliquer plusieurs filtres simultanément', () => {
    const { result } = renderHook(() => useReferencesFilters());

    act(() => {
      result.current.setSelectedPole('Urbanisme');
      result.current.setSelectedStatut('Terminé');
    });

    expect(result.current.sortedReferences).toHaveLength(1);
    expect(result.current.sortedReferences[0].titre).toBe('Étude Urbanisme Lyon');
  });

  test('devrait trier par titre', () => {
    const { result } = renderHook(() => useReferencesFilters());

    act(() => {
      result.current.toggleSort('titre');
    });

    expect(result.current.sortBy).toBe('titre');
    expect(result.current.sortOrder).toBe('desc');
    
    // Tri alphabétique descendant
    const titles = result.current.sortedReferences.map(ref => ref.titre);
    expect(titles[0]).toBe('Plan Communication Marseille');
    expect(titles[1]).toBe('Étude Urbanisme Lyon');
    expect(titles[2]).toBe('Diagnostic Économique Paris');
  });

  test('devrait trier par client', () => {
    const { result } = renderHook(() => useReferencesFilters());

    act(() => {
      result.current.toggleSort('client');
    });

    expect(result.current.sortBy).toBe('client');
    expect(result.current.sortOrder).toBe('desc');
  });

  test('devrait trier par budget', () => {
    const { result } = renderHook(() => useReferencesFilters());

    act(() => {
      result.current.toggleSort('budget');
    });

    expect(result.current.sortBy).toBe('budget');
    expect(result.current.sortOrder).toBe('desc');
    
    // Tri par budget descendant : 40000, 25000, 15000
    expect(result.current.sortedReferences[0].budget).toBe('40 000€');
    expect(result.current.sortedReferences[1].budget).toBe('25 000€');
    expect(result.current.sortedReferences[2].budget).toBe('15 000€');
  });

  test('devrait basculer l\'ordre de tri', () => {
    const { result } = renderHook(() => useReferencesFilters());

    // Par défaut, sortBy = 'annee' et sortOrder = 'desc'
    // Premier toggle sur le même champ : passe à asc
    act(() => {
      result.current.toggleSort('annee');
    });

    expect(result.current.sortBy).toBe('annee');
    expect(result.current.sortOrder).toBe('asc');

    // Deuxième toggle sur le même champ : passe à desc
    act(() => {
      result.current.toggleSort('annee');
    });

    expect(result.current.sortBy).toBe('annee');
    expect(result.current.sortOrder).toBe('desc');
    
    // Tri par année décroissant : 2024, 2023, 2022 (retour à l'état initial)
    expect(result.current.sortedReferences[0].annee).toBe(2024);
    expect(result.current.sortedReferences[1].annee).toBe(2023);
    expect(result.current.sortedReferences[2].annee).toBe(2022);
  });

  test('devrait changer de champ de tri et réinitialiser à desc', () => {
    const { result } = renderHook(() => useReferencesFilters());

    // Définir un tri par année asc (premier toggle passe à asc)
    act(() => {
      result.current.toggleSort('annee');
    });

    expect(result.current.sortOrder).toBe('asc');

    // Changer pour un autre champ
    act(() => {
      result.current.toggleSort('titre');
    });

    expect(result.current.sortBy).toBe('titre');
    expect(result.current.sortOrder).toBe('desc');
  });

  test('devrait gérer une recherche qui ne trouve rien', () => {
    const { result } = renderHook(() => useReferencesFilters());

    act(() => {
      result.current.setSearchTerm('inexistant');
    });

    expect(result.current.sortedReferences).toHaveLength(0);
  });

  test('devrait être réactif aux changements de filtres', () => {
    const { result } = renderHook(() => useReferencesFilters());

    // Appliquer un filtre
    act(() => {
      result.current.setSelectedPole('Urbanisme');
    });

    expect(result.current.sortedReferences).toHaveLength(1);

    // Changer le filtre
    act(() => {
      result.current.setSelectedPole('Économie');
    });

    expect(result.current.sortedReferences).toHaveLength(1);
    expect(result.current.sortedReferences[0].pole).toBe('Économie');

    // Supprimer le filtre
    act(() => {
      result.current.setSelectedPole('');
    });

    expect(result.current.sortedReferences).toHaveLength(3);
  });

  test('devrait préserver l\'ordre de tri lors des changements de filtre', () => {
    const { result } = renderHook(() => useReferencesFilters());

    // Changer vers titre : premier toggle définit le champ à 'titre' avec ordre 'desc'
    act(() => {
      result.current.toggleSort('titre');
    });

    expect(result.current.sortOrder).toBe('desc');

    // Appliquer un filtre
    act(() => {
      result.current.setSelectedStatut('Terminé');
    });

    // Le tri doit être préservé
    expect(result.current.sortBy).toBe('titre');
    expect(result.current.sortOrder).toBe('desc');
    expect(result.current.sortedReferences).toHaveLength(2);
  });

  test('devrait exposer toutes les fonctions nécessaires', () => {
    const { result } = renderHook(() => useReferencesFilters());

    // États des filtres
    expect(typeof result.current.searchTerm).toBe('string');
    expect(typeof result.current.setSearchTerm).toBe('function');
    expect(typeof result.current.selectedPole).toBe('string');
    expect(typeof result.current.setSelectedPole).toBe('function');
    expect(typeof result.current.selectedTypologie).toBe('string');
    expect(typeof result.current.setSelectedTypologie).toBe('function');
    expect(typeof result.current.selectedObjet).toBe('string');
    expect(typeof result.current.setSelectedObjet).toBe('function');
    expect(typeof result.current.selectedAnnee).toBe('string');
    expect(typeof result.current.setSelectedAnnee).toBe('function');
    expect(typeof result.current.selectedStatut).toBe('string');
    expect(typeof result.current.setSelectedStatut).toBe('function');

    // États du tri
    expect(typeof result.current.sortBy).toBe('string');
    expect(typeof result.current.sortOrder).toBe('string');
    expect(typeof result.current.toggleSort).toBe('function');

    // Données
    expect(Array.isArray(result.current.sortedReferences)).toBe(true);
  });
});