/**
 * Tests unitaires pour le module References
 */

import { render, screen } from '@testing-library/react';
import References from './References';

// Mock des composants enfants
jest.mock('./components', () => ({
  FiltersSection: ({ searchTerm, setSearchTerm, selectedPole, setSelectedPole, selectedTypologie, setSelectedTypologie, selectedObjet, setSelectedObjet, selectedAnnee, setSelectedAnnee, selectedStatut, setSelectedStatut }) => (
    <div data-testid="filters-section">
      <span data-testid="search-term">{searchTerm || 'empty'}</span>
      <span data-testid="selected-pole">{selectedPole || 'none'}</span>
      <span data-testid="selected-typologie">{selectedTypologie || 'none'}</span>
      <span data-testid="selected-objet">{selectedObjet || 'none'}</span>
      <span data-testid="selected-annee">{selectedAnnee || 'none'}</span>
      <span data-testid="selected-statut">{selectedStatut || 'none'}</span>
      <button onClick={() => setSearchTerm('test search')} data-testid="set-search">Set Search</button>
      <button onClick={() => setSelectedPole('test-pole')} data-testid="set-pole">Set Pole</button>
    </div>
  ),
  SortControls: ({ sortBy, sortOrder, toggleSort }) => (
    <div data-testid="sort-controls">
      <span data-testid="sort-by">{sortBy || 'none'}</span>
      <span data-testid="sort-order">{sortOrder || 'none'}</span>
      <button onClick={() => toggleSort('date')} data-testid="toggle-sort">Toggle Sort</button>
    </div>
  ),
  ReferenceCard: ({ reference }) => (
    <div data-testid="reference-card">
      Reference: {reference?.titre || 'no-title'}
    </div>
  ),
  NoResults: () => <div data-testid="no-results">No Results Found</div>
}));

// Mock du hook personnalisé avec des valeurs par défaut
const mockHookValues = {
  searchTerm: '',
  setSearchTerm: jest.fn(),
  selectedPole: '',
  setSelectedPole: jest.fn(),
  selectedTypologie: '',
  setSelectedTypologie: jest.fn(),
  selectedObjet: '',
  setSelectedObjet: jest.fn(),
  selectedAnnee: '',
  setSelectedAnnee: jest.fn(),
  selectedStatut: '',
  setSelectedStatut: jest.fn(),
  sortBy: 'date',
  sortOrder: 'desc',
  toggleSort: jest.fn(),
  sortedReferences: [
    { id: 1, titre: 'Reference Test 1' },
    { id: 2, titre: 'Reference Test 2' }
  ]
};

jest.mock('./hooks/useReferencesFilters', () => ({
  useReferencesFilters: jest.fn()
}));

// Configuration du mock après import
const { useReferencesFilters } = require('./hooks/useReferencesFilters');
useReferencesFilters.mockReturnValue(mockHookValues);

describe('References Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useReferencesFilters.mockReturnValue(mockHookValues);
  });

  test('devrait rendre tous les composants principaux', () => {
    render(<References />);
    
    expect(screen.getByTestId('filters-section')).toBeInTheDocument();
    expect(screen.getByTestId('sort-controls')).toBeInTheDocument();
    expect(screen.getAllByTestId('reference-card')).toHaveLength(2);
  });

  test('devrait avoir la structure correcte', () => {
    const { container } = render(<References />);
    
    // Doit avoir une grille de graphiques
    const chartsGrid = container.querySelector('.charts-grid');
    expect(chartsGrid).toBeInTheDocument();
    
    // Doit avoir une carte principale
    const card = container.querySelector('.card');
    expect(card).toBeInTheDocument();
    
    const cardBody = container.querySelector('.card__body');
    expect(cardBody).toBeInTheDocument();
  });

  test('devrait passer les bonnes props aux composants', () => {
    render(<References />);
    
    // Vérifier FiltersSection
    expect(screen.getByTestId('search-term')).toHaveTextContent('empty');
    expect(screen.getByTestId('selected-pole')).toHaveTextContent('none');
    expect(screen.getByTestId('selected-typologie')).toHaveTextContent('none');
    
    // Vérifier SortControls
    expect(screen.getByTestId('sort-by')).toHaveTextContent('date');
    expect(screen.getByTestId('sort-order')).toHaveTextContent('desc');
    
    // Vérifier ReferenceCards
    expect(screen.getByText('Reference: Reference Test 1')).toBeInTheDocument();
    expect(screen.getByText('Reference: Reference Test 2')).toBeInTheDocument();
  });

  test('devrait afficher NoResults quand aucune référence', () => {
    // Mock pour retourner une liste vide
    const emptyHookValues = { ...mockHookValues, sortedReferences: [] };
    const { useReferencesFilters } = require('./hooks/useReferencesFilters');
    useReferencesFilters.mockReturnValue(emptyHookValues);

    render(<References />);
    
    expect(screen.getByTestId('no-results')).toBeInTheDocument();
    expect(screen.queryAllByTestId('reference-card')).toHaveLength(0);
  });

  test('devrait afficher le nombre correct de références', () => {
    render(<References />);
    
    const referenceCards = screen.getAllByTestId('reference-card');
    expect(referenceCards).toHaveLength(2);
    
    // Vérifier que les références sont bien affichées (pas de texte résultats spécifique)
  });

  test('devrait utiliser le hook useReferencesFilters', () => {
    const { useReferencesFilters } = require('./hooks/useReferencesFilters');
    
    render(<References />);
    
    expect(useReferencesFilters).toHaveBeenCalledTimes(1);
  });

  test('devrait être un fragment React', () => {
    const { container } = render(<References />);
    
    // References utilise un fragment, donc plusieurs éléments enfants
    expect(container.children.length).toBeGreaterThan(1);
  });

  test('devrait s\'afficher sans erreur', () => {
    expect(() => {
      render(<References />);
    }).not.toThrow();
  });

  test('devrait gérer différents nombres de références', () => {
    // Test avec une seule référence
    const singleRefHookValues = {
      ...mockHookValues,
      sortedReferences: [{ id: 1, titre: 'Single Reference' }]
    };
    
    const { useReferencesFilters } = require('./hooks/useReferencesFilters');
    useReferencesFilters.mockReturnValue(singleRefHookValues);

    render(<References />);
    
    expect(screen.getAllByTestId('reference-card')).toHaveLength(1);
  });

  test('devrait avoir une architecture modulaire appropriée', () => {
    render(<References />);
    
    // Vérifier que le module est bien décomposé
    expect(screen.getByTestId('filters-section')).toBeInTheDocument();
    expect(screen.getByTestId('sort-controls')).toBeInTheDocument();
    
    // Vérifier la structure de conteneur
    const { container } = render(<References />);
    expect(container.querySelector('.charts-grid')).toBeInTheDocument();
    expect(container.querySelector('.card')).toBeInTheDocument();
  });

  test('devrait transmettre toutes les props de filtres', () => {
    render(<References />);
    
    // Vérifier que tous les états de filtres sont transmis
    const filtersSection = screen.getByTestId('filters-section');
    expect(filtersSection).toContainElement(screen.getByTestId('search-term'));
    expect(filtersSection).toContainElement(screen.getByTestId('selected-pole'));
    expect(filtersSection).toContainElement(screen.getByTestId('selected-typologie'));
    expect(filtersSection).toContainElement(screen.getByTestId('selected-objet'));
    expect(filtersSection).toContainElement(screen.getByTestId('selected-annee'));
    expect(filtersSection).toContainElement(screen.getByTestId('selected-statut'));
  });

  test('devrait transmettre les props de tri', () => {
    render(<References />);
    
    const sortControls = screen.getByTestId('sort-controls');
    expect(sortControls).toContainElement(screen.getByTestId('sort-by'));
    expect(sortControls).toContainElement(screen.getByTestId('sort-order'));
    expect(sortControls).toContainElement(screen.getByTestId('toggle-sort'));
  });
});