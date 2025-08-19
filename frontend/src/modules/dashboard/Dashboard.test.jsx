/**
 * Tests unitaires pour le module Dashboard
 */

import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

// Mock des composants enfants
jest.mock('./components', () => ({
  Kpis: () => <div data-testid="kpis">Kpis Component</div>,
  Document360Widget: () => <div data-testid="document360">Document360 Widget</div>,
  SyntheseTable: () => <div data-testid="synthese-table">Synthese Table</div>,
}));

jest.mock('../../components/charts', () => ({
  EvolutionChart: () => <div data-testid="evolution-chart">Evolution Chart</div>,
  PolesChart: () => <div data-testid="poles-chart">Poles Chart</div>,
}));

describe('Dashboard Module', () => {
  test('devrait rendre tous les composants principaux', () => {
    render(<Dashboard />);
    
    // Vérifier que tous les composants sont présents
    expect(screen.getByTestId('kpis')).toBeInTheDocument();
    expect(screen.getByTestId('document360')).toBeInTheDocument();
    expect(screen.getByTestId('evolution-chart')).toBeInTheDocument();
    expect(screen.getByTestId('poles-chart')).toBeInTheDocument();
    expect(screen.getByTestId('synthese-table')).toBeInTheDocument();
  });

  test('devrait avoir la structure de grille pour les graphiques', () => {
    const { container } = render(<Dashboard />);
    
    const chartsGrid = container.querySelector('.charts-grid');
    expect(chartsGrid).toBeInTheDocument();
    
    // Vérifier que les graphiques sont dans la grille
    expect(chartsGrid).toContainElement(screen.getByTestId('evolution-chart'));
    expect(chartsGrid).toContainElement(screen.getByTestId('poles-chart'));
  });

  test('devrait rendre les composants dans le bon ordre', () => {
    const { container } = render(<Dashboard />);
    
    const children = Array.from(container.children);
    const testIds = children.map(child => {
      if (child.dataset.testid) return child.dataset.testid;
      if (child.classList && child.classList.contains('charts-grid')) return 'charts-grid';
      return null;
    }).filter(Boolean);
    
    expect(testIds).toEqual(['kpis', 'document360', 'charts-grid', 'synthese-table']);
  });

  test('devrait être un fragment React', () => {
    const { container } = render(<Dashboard />);
    
    // Dashboard utilise un fragment React, donc pas d'élément wrapper unique
    // On s'attend à plusieurs éléments enfants directement dans le container
    expect(container.children.length).toBeGreaterThan(1);
  });

  test('devrait s\'afficher sans erreur', () => {
    expect(() => {
      render(<Dashboard />);
    }).not.toThrow();
  });

  test('devrait avoir tous les composants visibles', () => {
    render(<Dashboard />);
    
    const allComponents = [
      screen.getByTestId('kpis'),
      screen.getByTestId('document360'),
      screen.getByTestId('evolution-chart'),
      screen.getByTestId('poles-chart'),
      screen.getByTestId('synthese-table')
    ];
    
    allComponents.forEach(component => {
      expect(component).toBeVisible();
    });
  });
});