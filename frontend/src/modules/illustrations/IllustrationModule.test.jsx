/**
 * Tests unitaires pour le module IllustrationModule
 */

import { render, screen, fireEvent } from '@testing-library/react';
import IllustrationModule from './IllustrationModule';

// Mock appData
jest.mock('../../data.js', () => ({
  appData: {
    illustrations: [
      {
        id: 1,
        name: 'Illustration Test 1',
        category: 'Urbanisme',
        type: 'Schéma',
        tags: ['test', 'urbanisme']
      },
      {
        id: 2,
        name: 'Illustration Test 2',
        category: 'Démographie',
        type: 'Graphique',
        tags: ['demo', 'statistiques']
      }
    ]
  }
}));

describe('IllustrationModule', () => {
  test('devrait rendre la section de filtres', () => {
    render(<IllustrationModule />);
    
    expect(screen.getByText('Catégorie')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Recherche par tags')).toBeInTheDocument();
  });

  test('devrait avoir un sélecteur pour les catégories', () => {
    render(<IllustrationModule />);
    
    const categorySelect = screen.getByDisplayValue('Toutes les catégories');
    expect(categorySelect).toBeInTheDocument();
    
    // Vérifier les options
    expect(screen.getByRole('option', { name: 'Toutes les catégories' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Urbanisme' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Démographie' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Économie' })).toBeInTheDocument();
  });

  test('devrait avoir un sélecteur pour les types', () => {
    render(<IllustrationModule />);
    
    const typeSelect = screen.getByDisplayValue('Tous les types');
    expect(typeSelect).toBeInTheDocument();
    
    // Vérifier les options
    expect(screen.getByRole('option', { name: 'Tous les types' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Schéma' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Graphique' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Cartographie' })).toBeInTheDocument();
  });

  test('devrait avoir un champ de recherche par tags', () => {
    render(<IllustrationModule />);
    
    const searchInput = screen.getByPlaceholderText('Ex: aménagement, urbain...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  test('devrait gérer les changements du sélecteur de catégorie', () => {
    render(<IllustrationModule />);
    
    const categorySelect = screen.getByDisplayValue('Toutes les catégories');
    
    fireEvent.change(categorySelect, { target: { value: 'Urbanisme' } });
    expect(categorySelect).toHaveValue('Urbanisme');
  });

  test('devrait gérer les changements du sélecteur de type', () => {
    render(<IllustrationModule />);
    
    const typeSelect = screen.getByDisplayValue('Tous les types');
    
    fireEvent.change(typeSelect, { target: { value: 'Schéma' } });
    expect(typeSelect).toHaveValue('Schéma');
  });

  test('devrait gérer les changements de la recherche par tags', () => {
    render(<IllustrationModule />);
    
    const searchInput = screen.getByPlaceholderText('Ex: aménagement, urbain...');
    
    fireEvent.change(searchInput, { target: { value: 'urbanisme' } });
    expect(searchInput).toHaveValue('urbanisme');
  });

  test('devrait avoir la structure CSS correcte', () => {
    const { container } = render(<IllustrationModule />);
    
    // Vérifier la section de filtres
    const filtersSection = container.querySelector('.filters-section');
    expect(filtersSection).toBeInTheDocument();
    
    const filters = container.querySelector('.filters');
    expect(filters).toBeInTheDocument();
  });

  test('devrait avoir trois groupes de filtres', () => {
    const { container } = render(<IllustrationModule />);
    
    const filterGroups = container.querySelectorAll('.filter-group');
    expect(filterGroups).toHaveLength(3);
    
    // Chaque groupe devrait avoir un label et un contrôle
    filterGroups.forEach(group => {
      expect(group.querySelector('.form-label')).toBeInTheDocument();
      expect(group.querySelector('.form-control')).toBeInTheDocument();
    });
  });

  test('devrait être un fragment React', () => {
    const { container } = render(<IllustrationModule />);
    
    // IllustrationModule utilise un fragment React, donc plusieurs éléments enfants
    expect(container.children.length).toBeGreaterThan(1);
  });

  test('devrait s\'afficher sans erreur', () => {
    expect(() => {
      render(<IllustrationModule />);
    }).not.toThrow();
  });

  test('devrait avoir des éléments de formulaire accessibles', () => {
    render(<IllustrationModule />);
    
    // Vérifier que les labels sont présents
    const categoryLabel = screen.getByText('Catégorie');
    const typeLabel = screen.getByText('Type');
    const tagsLabel = screen.getByText('Recherche par tags');
    
    expect(categoryLabel).toBeInTheDocument();
    expect(typeLabel).toBeInTheDocument();
    expect(tagsLabel).toBeInTheDocument();
    
    // Vérifier que les contrôles sont activés
    const categorySelect = screen.getByDisplayValue('Toutes les catégories');
    const typeSelect = screen.getByDisplayValue('Tous les types');
    const searchInput = screen.getByPlaceholderText('Ex: aménagement, urbain...');
    
    expect(categorySelect).toBeEnabled();
    expect(typeSelect).toBeEnabled();
    expect(searchInput).toBeEnabled();
  });

  test('devrait permettre de réinitialiser tous les filtres', () => {
    render(<IllustrationModule />);
    
    const categorySelect = screen.getByDisplayValue('Toutes les catégories');
    const typeSelect = screen.getByDisplayValue('Tous les types');
    const searchInput = screen.getByPlaceholderText('Ex: aménagement, urbain...');
    
    // Changer toutes les valeurs
    fireEvent.change(categorySelect, { target: { value: 'Urbanisme' } });
    fireEvent.change(typeSelect, { target: { value: 'Schéma' } });
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    expect(categorySelect).toHaveValue('Urbanisme');
    expect(typeSelect).toHaveValue('Schéma');
    expect(searchInput).toHaveValue('test');
    
    // Réinitialiser
    fireEvent.change(categorySelect, { target: { value: '' } });
    fireEvent.change(typeSelect, { target: { value: '' } });
    fireEvent.change(searchInput, { target: { value: '' } });
    
    expect(categorySelect).toHaveValue('');
    expect(typeSelect).toHaveValue('');
    expect(searchInput).toHaveValue('');
  });

  test('devrait gérer les changements simultanés de filtres', () => {
    render(<IllustrationModule />);
    
    const categorySelect = screen.getByDisplayValue('Toutes les catégories');
    const typeSelect = screen.getByDisplayValue('Tous les types');
    
    // Appliquer plusieurs filtres
    fireEvent.change(categorySelect, { target: { value: 'Urbanisme' } });
    fireEvent.change(typeSelect, { target: { value: 'Cartographie' } });
    
    expect(categorySelect).toHaveValue('Urbanisme');
    expect(typeSelect).toHaveValue('Cartographie');
  });
});