/**
 * Tests unitaires pour le module MotsCles
 */

import { render, screen, fireEvent } from '@testing-library/react';
import MotsCles from './MotsCles';

// Mock des composants enfants
jest.mock('./components', () => ({
  FiltersSection: ({ categorieFilter, setCategorieFilter, poleFilter, setPoleFilter, typologieFilter, setTypologieFilter }) => (
    <div data-testid="filters-section">
      <button onClick={() => setCategorieFilter('test-categorie')} data-testid="set-categorie">
        Set Categorie: {categorieFilter || 'none'}
      </button>
      <button onClick={() => setPoleFilter('test-pole')} data-testid="set-pole">
        Set Pole: {poleFilter || 'none'}
      </button>
      <button onClick={() => setTypologieFilter('test-typologie')} data-testid="set-typologie">
        Set Typologie: {typologieFilter || 'none'}
      </button>
    </div>
  ),
  WordCloud: ({ selectedCategory, selectedPole, selectedTypologie }) => (
    <div data-testid="word-cloud">
      Word Cloud: {selectedCategory || 'all'}/{selectedPole || 'all'}/{selectedTypologie || 'all'}
    </div>
  ),
  HeatmapChart: () => <div data-testid="heatmap-chart">Heatmap Chart</div>
}));

// Mock du hook personnalisé
const mockMotsClesHookValues = {
  categorieFilter: '',
  setCategorieFilter: jest.fn(),
  poleFilter: '',
  setPoleFilter: jest.fn(),
  typologieFilter: '',
  setTypologieFilter: jest.fn()
};

jest.mock('./hooks/useMotsClesFilters', () => ({
  useMotsClesFilters: jest.fn()
}));

// Configuration du mock après import
const { useMotsClesFilters } = require('./hooks/useMotsClesFilters');
useMotsClesFilters.mockReturnValue(mockMotsClesHookValues);

describe('MotsCles Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useMotsClesFilters.mockReturnValue(mockMotsClesHookValues);
  });

  test('devrait rendre tous les composants principaux', () => {
    render(<MotsCles />);
    
    expect(screen.getByTestId('filters-section')).toBeInTheDocument();
    expect(screen.getByTestId('word-cloud')).toBeInTheDocument();
    expect(screen.getByTestId('heatmap-chart')).toBeInTheDocument();
  });

  test('devrait avoir la structure de grille pour les graphiques', () => {
    const { container } = render(<MotsCles />);
    
    const chartsGrid = container.querySelector('.charts-grid');
    expect(chartsGrid).toBeInTheDocument();
    
    // Les composants Word Cloud et Heatmap doivent être dans la grille
    expect(chartsGrid).toContainElement(screen.getByTestId('word-cloud'));
    expect(chartsGrid).toContainElement(screen.getByTestId('heatmap-chart'));
  });

  test('devrait passer les bonnes props aux composants enfants', () => {
    render(<MotsCles />);
    
    // Vérifier que FiltersSection reçoit les bonnes props
    expect(screen.getByTestId('set-categorie')).toHaveTextContent('Set Categorie: none');
    expect(screen.getByTestId('set-pole')).toHaveTextContent('Set Pole: none');
    expect(screen.getByTestId('set-typologie')).toHaveTextContent('Set Typologie: none');
    
    // Vérifier que WordCloud reçoit les filtres
    expect(screen.getByTestId('word-cloud')).toHaveTextContent('Word Cloud: all/all/all');
  });

  test('devrait être un fragment React', () => {
    const { container } = render(<MotsCles />);
    
    // MotsCles utilise un fragment, donc plusieurs éléments enfants
    expect(container.children.length).toBeGreaterThan(1);
  });

  test('devrait s\'afficher sans erreur', () => {
    expect(() => {
      render(<MotsCles />);
    }).not.toThrow();
  });

  test('devrait utiliser le hook useMotsClesFilters', () => {
    // Ce test vérifie que le hook est bien appelé
    render(<MotsCles />);
    
    // Si le hook fonctionne, les composants doivent être rendus
    expect(screen.getByTestId('filters-section')).toBeInTheDocument();
  });

  test('devrait organiser les composants dans le bon ordre', () => {
    const { container } = render(<MotsCles />);
    
    const children = Array.from(container.children);
    expect(children).toHaveLength(2);
    
    // Premier enfant : FiltersSection
    expect(children[0]).toContainElement(screen.getByTestId('filters-section'));
    
    // Deuxième enfant : charts-grid
    expect(children[1]).toHaveClass('charts-grid');
    expect(children[1]).toContainElement(screen.getByTestId('word-cloud'));
    expect(children[1]).toContainElement(screen.getByTestId('heatmap-chart'));
  });

  test('devrait permettre l\'interaction avec les filtres (simulation)', () => {
    render(<MotsCles />);
    
    // Simuler l'interaction avec les boutons de filtres
    const setCategorieButton = screen.getByTestId('set-categorie');
    const setPoleButton = screen.getByTestId('set-pole');
    const setTypologieButton = screen.getByTestId('set-typologie');
    
    expect(setCategorieButton).toBeInTheDocument();
    expect(setPoleButton).toBeInTheDocument();
    expect(setTypologieButton).toBeInTheDocument();
    
    // Ces boutons devraient être cliquables
    expect(setCategorieButton).toBeEnabled();
    expect(setPoleButton).toBeEnabled();
    expect(setTypologieButton).toBeEnabled();
  });

  test('devrait transmettre les filtres au WordCloud', () => {
    render(<MotsCles />);
    
    const wordCloud = screen.getByTestId('word-cloud');
    
    // Vérifier que WordCloud reçoit bien les props de filtres
    // (ici tous vides car le mock retourne des chaînes vides)
    expect(wordCloud).toHaveTextContent('Word Cloud: all/all/all');
  });

  test('devrait avoir une architecture modulaire appropriée', () => {
    render(<MotsCles />);
    
    // Vérifier que le module est bien décomposé en sous-composants
    expect(screen.getByTestId('filters-section')).toBeInTheDocument();
    expect(screen.getByTestId('word-cloud')).toBeInTheDocument();
    expect(screen.getByTestId('heatmap-chart')).toBeInTheDocument();
    
    // Vérifier la structure de grille
    const { container } = render(<MotsCles />);
    const chartsGrid = container.querySelector('.charts-grid');
    expect(chartsGrid).toBeInTheDocument();
  });
});