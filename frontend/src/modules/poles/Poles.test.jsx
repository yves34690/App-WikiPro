/**
 * Tests unitaires pour le module Poles
 */

import { render, screen } from '@testing-library/react';
import Poles from './Poles';

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Pie: ({ data, options }) => <div data-testid="pie-chart" data-chart-type="pie">Pie Chart Mock</div>,
  Bar: ({ data, options }) => <div data-testid="bar-chart" data-chart-type="bar">Bar Chart Mock</div>,
}));

// Mock appData
jest.mock('../../data.js', () => ({
  appData: {
    poles: {
      labels: ['Pôle A', 'Pôle B', 'Pôle C'],
      values: [10, 20, 30]
    },
    top_typologies: {
      labels: ['Type 1', 'Type 2', 'Type 3'],
      values: [15, 25, 35]
    }
  }
}));

describe('Poles Module', () => {
  test('devrait rendre la grille de graphiques', () => {
    const { container } = render(<Poles />);
    
    const chartsGrid = container.querySelector('.charts-grid');
    expect(chartsGrid).toBeInTheDocument();
  });

  test('devrait afficher les titres des graphiques', () => {
    render(<Poles />);
    
    expect(screen.getByText('Répartition par pôles')).toBeInTheDocument();
    expect(screen.getByText('Top 15 des typologies')).toBeInTheDocument();
  });

  test('devrait rendre les graphiques Pie et Bar', () => {
    render(<Poles />);
    
    // Vérifier que les mocks de Chart.js sont rendus
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  test('devrait avoir les cartes appropriées', () => {
    const { container } = render(<Poles />);
    
    // 2 cartes de graphiques et 1 carte pour le tableau détaillé
    const allCards = container.querySelectorAll('.card');
    expect(allCards).toHaveLength(3);
    
    const chartContainers = container.querySelectorAll('.chart-container');
    expect(chartContainers).toHaveLength(2);
    
    chartContainers.forEach(container => {
      expect(container).toHaveClass('card');
    });
  });

  test('devrait avoir la structure CSS correcte', () => {
    const { container } = render(<Poles />);
    
    const cards = container.querySelectorAll('.card.chart-container');
    expect(cards).toHaveLength(2);
    
    // Toutes les cartes doivent avoir un card__body
    const allCards = container.querySelectorAll('.card');
    allCards.forEach(card => {
      const cardBody = card.querySelector('.card__body');
      expect(cardBody).toBeInTheDocument();
    });
  });

  test('devrait être un fragment React', () => {
    const { container } = render(<Poles />);
    
    // Poles utilise un fragment React, donc plusieurs éléments enfants
    expect(container.children.length).toBeGreaterThan(0);
  });

  test('devrait s\'afficher sans erreur', () => {
    expect(() => {
      render(<Poles />);
    }).not.toThrow();
  });

  test('devrait utiliser les bonnes données mockées', () => {
    render(<Poles />);
    
    // Les graphiques doivent être rendus avec les types corrects
    const pieChart = screen.getByTestId('pie-chart');
    const barChart = screen.getByTestId('bar-chart');
    
    expect(pieChart).toHaveAttribute('data-chart-type', 'pie');
    expect(barChart).toHaveAttribute('data-chart-type', 'bar');
  });

  test('devrait contenir les titres dans les card bodies', () => {
    const { container } = render(<Poles />);
    
    const cardBodies = container.querySelectorAll('.card__body');
    expect(cardBodies).toHaveLength(3);
    
    const firstTitle = cardBodies[0].querySelector('h3');
    const secondTitle = cardBodies[1].querySelector('h3');
    const thirdTitle = cardBodies[2].querySelector('h3');
    
    expect(firstTitle).toHaveTextContent('Répartition par pôles');
    expect(secondTitle).toHaveTextContent('Top 15 des typologies');
    expect(thirdTitle).toHaveTextContent('Tableau détaillé par pôle et typologie');
  });

  test('devrait avoir une structure responsive', () => {
    const { container } = render(<Poles />);
    
    const chartsGrid = container.querySelector('.charts-grid');
    expect(chartsGrid).toBeInTheDocument();
    
    // Vérifier que les cartes graphiques sont dans la grille
    const cards = chartsGrid.querySelectorAll('.card.chart-container');
    expect(cards).toHaveLength(2);
    
    // Vérifier la présence du tableau détaillé
    const polesDetails = container.querySelector('.poles-details');
    expect(polesDetails).toBeInTheDocument();
    expect(polesDetails).toHaveAttribute('id', 'polesDetails');
  });

  test('devrait avoir tous les composants visibles', () => {
    render(<Poles />);
    
    const allComponents = [
      screen.getByTestId('pie-chart'),
      screen.getByTestId('bar-chart')
    ];
    
    allComponents.forEach(component => {
      expect(component).toBeVisible();
    });
  });
});