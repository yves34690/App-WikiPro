/**
 * Tests unitaires pour le module OutilsModule
 */

import { render, screen, fireEvent } from '@testing-library/react';
import OutilsModule from './OutilsModule';

// Mock appData
jest.mock('../../data.js', () => ({
  appData: {
    outils: [
      {
        id: 1,
        name: 'Outil Test 1',
        category: 'Diagnostic',
        description: 'Description outil 1',
        impact: 'High',
        instructions: 'Instructions test 1'
      },
      {
        id: 2,
        name: 'Outil Test 2',
        category: 'Analyse',
        description: 'Description outil 2',
        impact: 'Medium',
        instructions: 'Instructions test 2'
      }
    ]
  }
}));

describe('OutilsModule', () => {
  test('devrait rendre la section de filtres', () => {
    render(<OutilsModule />);
    
    expect(screen.getByText('Catégorie')).toBeInTheDocument();
  });

  test('devrait avoir un sélecteur de catégorie', () => {
    render(<OutilsModule />);
    
    const categorySelect = screen.getByDisplayValue('Toutes les catégories');
    expect(categorySelect).toBeInTheDocument();
    
    // Vérifier les options
    expect(screen.getByRole('option', { name: 'Toutes les catégories' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Diagnostic' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Gouvernance' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Analyse' })).toBeInTheDocument();
  });

  test('devrait afficher le titre principal', () => {
    render(<OutilsModule />);
    
    expect(screen.getByText('Outils disponibles')).toBeInTheDocument();
  });

  test('devrait afficher les outils mockés', () => {
    render(<OutilsModule />);
    
    expect(screen.getByText('Outil Test 1')).toBeInTheDocument();
    expect(screen.getByText('Description outil 1')).toBeInTheDocument();
    expect(screen.getByText('Outil Test 2')).toBeInTheDocument();
    expect(screen.getByText('Description outil 2')).toBeInTheDocument();
  });

  test('devrait gérer les changements du filtre de catégorie', () => {
    render(<OutilsModule />);
    
    const categorySelect = screen.getByDisplayValue('Toutes les catégories');
    
    fireEvent.change(categorySelect, { target: { value: 'Diagnostic' } });
    expect(categorySelect).toHaveValue('Diagnostic');
  });

  test('devrait avoir la structure CSS correcte', () => {
    const { container } = render(<OutilsModule />);
    
    // Section de filtres
    const filtersSection = container.querySelector('.filters-section');
    expect(filtersSection).toBeInTheDocument();
    
    // Grille principale
    const chartsGrid = container.querySelector('.charts-grid');
    expect(chartsGrid).toBeInTheDocument();
    
    // Grille des méthodologies
    const methodologiesGrid = container.querySelector('.methodologies-grid');
    expect(methodologiesGrid).toBeInTheDocument();
  });

  test('devrait avoir des cartes d\'outils', () => {
    const { container } = render(<OutilsModule />);
    
    const methodologyCards = container.querySelectorAll('.methodology-card');
    expect(methodologyCards).toHaveLength(2);
    
    methodologyCards.forEach(card => {
      expect(card.querySelector('.methodology-header')).toBeInTheDocument();
      expect(card.querySelector('h4')).toBeInTheDocument();
      expect(card.querySelector('.methodology-description')).toBeInTheDocument();
    });
  });

  test('devrait être un fragment React', () => {
    const { container } = render(<OutilsModule />);
    
    expect(container.children.length).toBeGreaterThan(1);
  });

  test('devrait s\'afficher sans erreur', () => {
    expect(() => {
      render(<OutilsModule />);
    }).not.toThrow();
  });

  test('devrait avoir des éléments de formulaire accessibles', () => {
    render(<OutilsModule />);
    
    const categoryLabel = screen.getByText('Catégorie');
    expect(categoryLabel).toBeInTheDocument();
    
    const categorySelect = screen.getByDisplayValue('Toutes les catégories');
    expect(categorySelect).toBeEnabled();
  });

  test('devrait avoir des classes d\'impact', () => {
    const { container } = render(<OutilsModule />);
    
    const impactElements = container.querySelectorAll('.methodology-impact');
    expect(impactElements.length).toBeGreaterThan(0);
  });
});