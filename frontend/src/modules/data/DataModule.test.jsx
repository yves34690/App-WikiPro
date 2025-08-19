/**
 * Tests unitaires pour le module DataModule
 */

import { render, screen, fireEvent } from '@testing-library/react';
import DataModule from './DataModule';

// Mock appData
jest.mock('../../data.js', () => ({
  appData: {
    dataSources: [
      {
        id: 1,
        name: 'Source Test 1',
        type: 'Démographie',
        description: 'Description test 1',
        status: 'active'
      },
      {
        id: 2,
        name: 'Source Test 2',
        type: 'Territorial',
        description: 'Description test 2',
        status: 'inactive'
      }
    ]
  }
}));

describe('DataModule', () => {
  test('devrait rendre la section de filtres', () => {
    render(<DataModule />);
    
    expect(screen.getByText('Type de données')).toBeInTheDocument();
    expect(screen.getByText('Rechercher')).toBeInTheDocument();
  });

  test('devrait afficher le titre de la section', () => {
    render(<DataModule />);
    
    expect(screen.getByText('Sources de données disponibles')).toBeInTheDocument();
  });

  test('devrait avoir un sélecteur pour le type de données', () => {
    render(<DataModule />);
    
    const typeSelect = screen.getByDisplayValue('Tous les types');
    expect(typeSelect).toBeInTheDocument();
    
    // Vérifier les options
    expect(screen.getByRole('option', { name: 'Tous les types' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Démographie' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Territorial' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Économique' })).toBeInTheDocument();
  });

  test('devrait avoir un champ de recherche', () => {
    render(<DataModule />);
    
    const searchInput = screen.getByPlaceholderText('Rechercher une source...');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  test('devrait gérer les changements du sélecteur de type', () => {
    render(<DataModule />);
    
    const typeSelect = screen.getByDisplayValue('Tous les types');
    
    fireEvent.change(typeSelect, { target: { value: 'Démographie' } });
    expect(typeSelect).toHaveValue('Démographie');
  });

  test('devrait gérer les changements de la recherche', () => {
    render(<DataModule />);
    
    const searchInput = screen.getByPlaceholderText('Rechercher une source...');
    
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(searchInput).toHaveValue('test search');
  });

  test('devrait avoir la structure CSS correcte', () => {
    const { container } = render(<DataModule />);
    
    // Vérifier la section de filtres
    const filtersSection = container.querySelector('.filters-section');
    expect(filtersSection).toBeInTheDocument();
    
    const filters = container.querySelector('.filters');
    expect(filters).toBeInTheDocument();
    
    // Vérifier la grille de graphiques (utilisée comme conteneur principal)
    const chartsGrid = container.querySelector('.charts-grid');
    expect(chartsGrid).toBeInTheDocument();
    
    const card = container.querySelector('.card');
    expect(card).toBeInTheDocument();
  });

  test('devrait avoir des groupes de filtres', () => {
    const { container } = render(<DataModule />);
    
    const filterGroups = container.querySelectorAll('.filter-group');
    expect(filterGroups).toHaveLength(2);
    
    // Chaque groupe devrait avoir un label et un contrôle
    filterGroups.forEach(group => {
      expect(group.querySelector('.form-label')).toBeInTheDocument();
      expect(group.querySelector('.form-control')).toBeInTheDocument();
    });
  });

  test('devrait être un fragment React', () => {
    const { container } = render(<DataModule />);
    
    // DataModule utilise un fragment React, donc plusieurs éléments enfants
    expect(container.children.length).toBeGreaterThan(1);
  });

  test('devrait s\'afficher sans erreur', () => {
    expect(() => {
      render(<DataModule />);
    }).not.toThrow();
  });

  test('devrait afficher la grille de méthodologies', () => {
    const { container } = render(<DataModule />);
    
    const methodologiesGrid = container.querySelector('.methodologies-grid');
    expect(methodologiesGrid).toBeInTheDocument();
  });

  test('devrait avoir des éléments de formulaire accessibles', () => {
    render(<DataModule />);
    
    // Vérifier que les labels sont associés aux contrôles
    const typeLabel = screen.getByText('Type de données');
    const searchLabel = screen.getByText('Rechercher');
    
    expect(typeLabel).toBeInTheDocument();
    expect(searchLabel).toBeInTheDocument();
    
    // Vérifier que les contrôles sont présents
    const typeSelect = screen.getByDisplayValue('Tous les types');
    const searchInput = screen.getByPlaceholderText('Rechercher une source...');
    
    expect(typeSelect).toBeEnabled();
    expect(searchInput).toBeEnabled();
  });

  test('devrait permettre de réinitialiser les filtres', () => {
    render(<DataModule />);
    
    const typeSelect = screen.getByDisplayValue('Tous les types');
    const searchInput = screen.getByPlaceholderText('Rechercher une source...');
    
    // Changer les valeurs
    fireEvent.change(typeSelect, { target: { value: 'Démographie' } });
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    expect(typeSelect).toHaveValue('Démographie');
    expect(searchInput).toHaveValue('test');
    
    // Réinitialiser
    fireEvent.change(typeSelect, { target: { value: '' } });
    fireEvent.change(searchInput, { target: { value: '' } });
    
    expect(typeSelect).toHaveValue('');
    expect(searchInput).toHaveValue('');
  });
});