/**
 * Tests unitaires pour le composant Navigation
 */

import { render, screen, fireEvent } from '@testing-library/react';
import Navigation from './Navigation';

describe('Navigation Component', () => {
  const mockSetActiveTab = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devrait rendre tous les onglets de navigation', () => {
    render(<Navigation activeTab="dashboard" setActiveTab={mockSetActiveTab} />);
    
    // Vérifier la présence de tous les onglets
    expect(screen.getByText('Vue d\'ensemble')).toBeInTheDocument();
    expect(screen.getByText('Tendances')).toBeInTheDocument();
    expect(screen.getByText('Mots-clés')).toBeInTheDocument();
    expect(screen.getByText('Pôles')).toBeInTheDocument();
    expect(screen.getByText('Méthodes')).toBeInTheDocument();
    expect(screen.getByText('Références')).toBeInTheDocument();
    expect(screen.getByText('Data')).toBeInTheDocument();
    expect(screen.getByText('Illustrations')).toBeInTheDocument();
    expect(screen.getByText('Outils')).toBeInTheDocument();
    expect(screen.getByText('CVthèque')).toBeInTheDocument();
    expect(screen.getByText('Compétences')).toBeInTheDocument();
    expect(screen.getByText('IA')).toBeInTheDocument();
  });

  test('devrait avoir le bon nombre d\'onglets', () => {
    render(<Navigation activeTab="dashboard" setActiveTab={mockSetActiveTab} />);
    
    const tabs = screen.getAllByRole('button');
    expect(tabs).toHaveLength(12);
  });

  test('devrait marquer l\'onglet actif', () => {
    render(<Navigation activeTab="references" setActiveTab={mockSetActiveTab} />);
    
    const activeTab = screen.getByText('Références').closest('button');
    const inactiveTab = screen.getByText('Vue d\'ensemble').closest('button');
    
    expect(activeTab).toHaveClass('active');
    expect(inactiveTab).not.toHaveClass('active');
  });

  test('devrait appeler setActiveTab quand on clique sur un onglet', () => {
    render(<Navigation activeTab="dashboard" setActiveTab={mockSetActiveTab} />);
    
    const tendancesTab = screen.getByText('Tendances').closest('button');
    fireEvent.click(tendancesTab);
    
    expect(mockSetActiveTab).toHaveBeenCalledWith('tendances');
    expect(mockSetActiveTab).toHaveBeenCalledTimes(1);
  });

  test('devrait avoir la structure HTML correcte', () => {
    const { container } = render(<Navigation activeTab="dashboard" setActiveTab={mockSetActiveTab} />);
    
    // Vérifier la structure nav > container > nav-tabs
    const nav = container.querySelector('nav.navigation');
    const containerDiv = nav.querySelector('div.container');
    const navTabs = containerDiv.querySelector('div.nav-tabs');
    
    expect(nav).toBeInTheDocument();
    expect(containerDiv).toBeInTheDocument();
    expect(navTabs).toBeInTheDocument();
  });

  test('devrait avoir des icônes pour chaque onglet', () => {
    render(<Navigation activeTab="dashboard" setActiveTab={mockSetActiveTab} />);
    
    // Vérifier quelques icônes spécifiques
    expect(document.querySelector('.fa-tachometer-alt')).toBeInTheDocument(); // Dashboard
    expect(document.querySelector('.fa-chart-line')).toBeInTheDocument(); // Tendances
    expect(document.querySelector('.fa-tags')).toBeInTheDocument(); // Mots-clés
    expect(document.querySelector('.fa-brain')).toBeInTheDocument(); // IA
  });

  test('devrait être accessible', () => {
    render(<Navigation activeTab="dashboard" setActiveTab={mockSetActiveTab} />);
    
    // Vérifier que c'est un élément nav
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    // Tous les onglets doivent être des boutons cliquables
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeEnabled();
    });
  });

  test('devrait gérer les props manquantes gracieusement', () => {
    expect(() => {
      render(<Navigation activeTab={undefined} setActiveTab={undefined} />);
    }).not.toThrow();
  });

  test('devrait permettre de naviguer entre plusieurs onglets', () => {
    const { rerender } = render(<Navigation activeTab="dashboard" setActiveTab={mockSetActiveTab} />);
    
    // Cliquer sur Références
    fireEvent.click(screen.getByText('Références'));
    expect(mockSetActiveTab).toHaveBeenCalledWith('references');
    
    // Simuler le changement d'état
    rerender(<Navigation activeTab="references" setActiveTab={mockSetActiveTab} />);
    
    // Vérifier que Références est maintenant actif
    expect(screen.getByText('Références').closest('button')).toHaveClass('active');
    
    // Cliquer sur IA
    fireEvent.click(screen.getByText('IA'));
    expect(mockSetActiveTab).toHaveBeenCalledWith('ia-strategie');
  });

  test('devrait conserver les identifiants d\'onglets corrects', () => {
    render(<Navigation activeTab="dashboard" setActiveTab={mockSetActiveTab} />);
    
    // Test de quelques mappings spécifiques
    fireEvent.click(screen.getByText('Mots-clés'));
    expect(mockSetActiveTab).toHaveBeenCalledWith('mots-cles');
    
    fireEvent.click(screen.getByText('Méthodes'));
    expect(mockSetActiveTab).toHaveBeenCalledWith('capitalisation');
    
    fireEvent.click(screen.getByText('CVthèque'));
    expect(mockSetActiveTab).toHaveBeenCalledWith('cvtheque');
  });
});