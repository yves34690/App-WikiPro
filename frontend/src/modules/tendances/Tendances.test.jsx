/**
 * Tests unitaires pour le module Tendances
 */

import { render, screen } from '@testing-library/react';
import Tendances from './Tendances';

// Mock Chart.js components
jest.mock('react-chartjs-2', () => ({
  Line: ({ data, options }) => <div data-testid="line-chart" data-chart-type="line">Line Chart Mock</div>,
  Bar: ({ data, options }) => <div data-testid="bar-chart" data-chart-type="bar">Bar Chart Mock</div>,
}));

// Mock appData
jest.mock('../../data.js', () => ({
  appData: {
    evolution_annuelle: {
      annees: ['2020', '2021', '2022', '2023']
    },
    poles: {
      labels: ['Pôle A', 'Pôle B', 'Pôle C']
    },
    top_typologies: {
      labels: ['Type 1', 'Type 2'],
      values: [10, 20]
    }
  }
}));

describe('Tendances Module', () => {
  test('devrait rendre la grille de graphiques', () => {
    const { container } = render(<Tendances />);
    
    const chartsGrid = container.querySelector('.charts-grid');
    expect(chartsGrid).toBeInTheDocument();
  });

  test('devrait afficher les titres des graphiques', () => {
    render(<Tendances />);
    
    expect(screen.getByText('Évolution par pôles d\'expertise')).toBeInTheDocument();
    expect(screen.getByText('Top 10 des typologies d\'études')).toBeInTheDocument();
  });

  test('devrait rendre les graphiques Line et Bar', () => {
    render(<Tendances />);
    
    // Vérifier que les mocks de Chart.js sont rendus
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  test('devrait avoir deux cartes de graphiques', () => {
    const { container } = render(<Tendances />);
    
    const chartContainers = container.querySelectorAll('.chart-container');
    expect(chartContainers).toHaveLength(2);
    
    chartContainers.forEach(container => {
      expect(container).toHaveClass('card');
    });
  });

  test('devrait avoir la structure CSS correcte', () => {
    const { container } = render(<Tendances />);
    
    const cards = container.querySelectorAll('.card.chart-container');
    expect(cards).toHaveLength(2);
    
    cards.forEach(card => {
      const cardBody = card.querySelector('.card__body');
      expect(cardBody).toBeInTheDocument();
    });
  });

  test('devrait contenir les titres dans les card bodies', () => {
    const { container } = render(<Tendances />);
    
    const cardBodies = container.querySelectorAll('.card__body');
    expect(cardBodies).toHaveLength(2);
    
    const firstTitle = cardBodies[0].querySelector('h3');
    const secondTitle = cardBodies[1].querySelector('h3');
    
    expect(firstTitle).toHaveTextContent('Évolution par pôles d\'expertise');
    expect(secondTitle).toHaveTextContent('Top 10 des typologies d\'études');
  });

  test('devrait s\'afficher sans erreur', () => {
    expect(() => {
      render(<Tendances />);
    }).not.toThrow();
  });

  test('devrait utiliser les données mockées correctement', () => {
    render(<Tendances />);
    
    // Les graphiques doivent être rendus avec les données mockées
    const lineChart = screen.getByTestId('line-chart');
    const barChart = screen.getByTestId('bar-chart');
    
    expect(lineChart).toHaveAttribute('data-chart-type', 'line');
    expect(barChart).toHaveAttribute('data-chart-type', 'bar');
  });

  test('devrait avoir une structure responsive', () => {
    const { container } = render(<Tendances />);
    
    const chartsGrid = container.querySelector('.charts-grid');
    expect(chartsGrid).toBeInTheDocument();
    
    // Vérifier que les cartes sont dans la grille
    const cards = chartsGrid.querySelectorAll('.card.chart-container');
    expect(cards).toHaveLength(2);
  });
});