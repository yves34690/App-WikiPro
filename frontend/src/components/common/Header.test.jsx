/**
 * Tests unitaires pour le composant Header
 */

import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';

describe('Header Component', () => {
  const mockToggleTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devrait rendre tous les éléments du header', () => {
    render(<Header toggleTheme={mockToggleTheme} theme="light" />);
    
    // Vérifier la présence du logo et du texte
    expect(screen.getByText('Groupe Elan')).toBeInTheDocument();
    expect(screen.getByText('WikiPro')).toBeInTheDocument();
    
    // Vérifier la barre de recherche
    expect(screen.getByPlaceholderText('Recherche globale...')).toBeInTheDocument();
    
    // Vérifier qu'il y a des boutons (recherche et theme toggle)
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  test('devrait afficher l\'icône moon pour le thème light', () => {
    render(<Header toggleTheme={mockToggleTheme} theme="light" />);
    
    // Le bouton theme toggle avec l'ID themeToggle doit être présent
    const themeButton = document.getElementById('themeToggle');
    expect(themeButton).toBeInTheDocument();
    
    // L'icône moon doit être présente pour le thème light
    const moonIcon = themeButton.querySelector('.fa-moon');
    expect(moonIcon).toBeInTheDocument();
  });

  test('devrait afficher l\'icône sun pour le thème dark', () => {
    render(<Header toggleTheme={mockToggleTheme} theme="dark" />);
    
    const themeButton = document.getElementById('themeToggle');
    expect(themeButton).toBeInTheDocument();
    
    // L'icône sun doit être présente pour le thème dark
    const sunIcon = themeButton.querySelector('.fa-sun');
    expect(sunIcon).toBeInTheDocument();
  });

  test('devrait appeler toggleTheme quand on clique sur le bouton thème', () => {
    render(<Header toggleTheme={mockToggleTheme} theme="light" />);
    
    const themeButton = document.getElementById('themeToggle');
    fireEvent.click(themeButton);
    
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  test('devrait avoir la bonne structure CSS', () => {
    render(<Header toggleTheme={mockToggleTheme} theme="light" />);
    
    // Vérifier les classes CSS principales
    expect(screen.getByRole('banner')).toHaveClass('header');
    expect(screen.getByText('Groupe Elan').closest('div')).toHaveClass('logo');
    expect(screen.getByPlaceholderText('Recherche globale...').closest('div')).toHaveClass('search-bar');
  });

  test('devrait gérer le changement de valeur de la barre de recherche', () => {
    render(<Header toggleTheme={mockToggleTheme} theme="light" />);
    
    const searchInput = screen.getByPlaceholderText('Recherche globale...');
    
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(searchInput).toHaveValue('test search');
  });

  test('devrait avoir les bonnes propriétés d\'accessibilité', () => {
    render(<Header toggleTheme={mockToggleTheme} theme="light" />);
    
    // Le header devrait être un landmark
    expect(screen.getByRole('banner')).toBeInTheDocument();
    
    // Le champ de recherche devrait être accessible
    const searchInput = screen.getByPlaceholderText('Recherche globale...');
    expect(searchInput).toHaveAttribute('type', 'text');
    
    // Les boutons devraient être cliquables
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeEnabled();
    });
  });

  test('devrait préserver les props passées', () => {
    const { rerender } = render(<Header toggleTheme={mockToggleTheme} theme="light" />);
    
    // Changer de thème via les props
    rerender(<Header toggleTheme={mockToggleTheme} theme="dark" />);
    
    // Vérifier que le composant s'est mis à jour
    expect(mockToggleTheme).not.toHaveBeenCalled(); // Ne devrait pas être appelé automatiquement
  });

  test('devrait gérer les props manquantes gracieusement', () => {
    // Test avec des props undefined (ne devrait pas planter)
    expect(() => {
      render(<Header toggleTheme={undefined} theme={undefined} />);
    }).not.toThrow();
  });
});