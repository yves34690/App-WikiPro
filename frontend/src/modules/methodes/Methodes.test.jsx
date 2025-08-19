/**
 * Tests unitaires pour le module Methodes
 */

import { render, screen } from '@testing-library/react';
import Methodes from './Methodes';

// Mock appData
jest.mock('../../data.js', () => ({
  appData: {
    methodologies: [
      {
        id: 1,
        title: 'Méthode Test 1',
        description: 'Description méthode 1',
        impact: 'High'
      },
      {
        id: 2,
        title: 'Méthode Test 2',
        description: 'Description méthode 2',
        impact: 'Medium'
      }
    ],
    processPhases: [
      {
        step: 1,
        title: 'Phase Test 1',
        desc: 'Description phase 1'
      },
      {
        step: 2,
        title: 'Phase Test 2',
        desc: 'Description phase 2'
      }
    ]
  }
}));

describe('Methodes Module', () => {
  test('devrait rendre les titres des sections principales', () => {
    render(<Methodes />);
    
    expect(screen.getByText('Méthodes clés')).toBeInTheDocument();
    expect(screen.getByText('Timeline du processus')).toBeInTheDocument();
    expect(screen.getByText('Document360 - Documentation associée')).toBeInTheDocument();
  });

  test('devrait afficher les méthologies', () => {
    render(<Methodes />);
    
    expect(screen.getByText('Méthode Test 1')).toBeInTheDocument();
    expect(screen.getByText('Description méthode 1')).toBeInTheDocument();
    expect(screen.getByText('Méthode Test 2')).toBeInTheDocument();
    expect(screen.getByText('Description méthode 2')).toBeInTheDocument();
  });

  test('devrait afficher les phases du processus', () => {
    render(<Methodes />);
    
    expect(screen.getByText('Phase Test 1')).toBeInTheDocument();
    expect(screen.getByText('Description phase 1')).toBeInTheDocument();
    expect(screen.getByText('Phase Test 2')).toBeInTheDocument();
    expect(screen.getByText('Description phase 2')).toBeInTheDocument();
  });

  test('devrait avoir la structure CSS correcte', () => {
    const { container } = render(<Methodes />);
    
    // Vérifier qu'il y a 3 cartes
    const cards = container.querySelectorAll('.card');
    expect(cards).toHaveLength(3);
    
    // Vérifier la grille des méthodologies
    const methodologiesGrid = container.querySelector('.methodologies-grid');
    expect(methodologiesGrid).toBeInTheDocument();
    expect(methodologiesGrid).toHaveAttribute('id', 'methodologiesGrid');
    
    // Vérifier la timeline
    const timeline = container.querySelector('.timeline');
    expect(timeline).toBeInTheDocument();
    expect(timeline).toHaveAttribute('id', 'processTimeline');
  });

  test('devrait avoir des cartes de méthodologie', () => {
    const { container } = render(<Methodes />);
    
    const methodologyCards = container.querySelectorAll('.methodology-card');
    expect(methodologyCards).toHaveLength(2);
    
    methodologyCards.forEach(card => {
      expect(card.querySelector('h4')).toBeInTheDocument();
      expect(card.querySelector('p')).toBeInTheDocument();
    });
  });

  test('devrait avoir des éléments de timeline', () => {
    const { container } = render(<Methodes />);
    
    const timelineItems = container.querySelectorAll('.timeline-item');
    expect(timelineItems).toHaveLength(2);
    
    timelineItems.forEach(item => {
      expect(item.querySelector('.timeline-step')).toBeInTheDocument();
      expect(item.querySelector('.timeline-content')).toBeInTheDocument();
    });
  });

  test('devrait avoir le widget Document360', () => {
    const { container } = render(<Methodes />);
    
    const document360Widget = container.querySelector('.document360-widget');
    expect(document360Widget).toBeInTheDocument();
    expect(document360Widget).toHaveClass('card');
    
    const articles = container.querySelector('.document360-articles');
    expect(articles).toBeInTheDocument();
  });

  test('devrait afficher les articles Document360', () => {
    render(<Methodes />);
    
    expect(screen.getByText('Méthodologie d\'analyse territoriale')).toBeInTheDocument();
    expect(screen.getByText('Processus de capitalisation des études')).toBeInTheDocument();
  });

  test('devrait être un fragment React', () => {
    const { container } = render(<Methodes />);
    
    // Methodes utilise un fragment React, donc plusieurs éléments enfants
    expect(container.children.length).toBeGreaterThan(1);
  });

  test('devrait s\'afficher sans erreur', () => {
    expect(() => {
      render(<Methodes />);
    }).not.toThrow();
  });

  test('devrait avoir des classes d\'impact pour les méthodologies', () => {
    const { container } = render(<Methodes />);
    
    const impactElements = container.querySelectorAll('.methodology-impact');
    expect(impactElements.length).toBeGreaterThan(0);
    
    // Vérifier qu'il y a des classes spécifiques d'impact
    const highImpact = container.querySelector('.methodology-impact--high');
    const mediumImpact = container.querySelector('.methodology-impact--medium');
    
    expect(highImpact || mediumImpact).toBeInTheDocument();
  });

  test('devrait avoir les numéros d\'étapes dans la timeline', () => {
    const { container } = render(<Methodes />);
    
    const timelineSteps = container.querySelectorAll('.timeline-step');
    expect(timelineSteps).toHaveLength(2);
    
    expect(timelineSteps[0]).toHaveTextContent('1');
    expect(timelineSteps[1]).toHaveTextContent('2');
  });
});