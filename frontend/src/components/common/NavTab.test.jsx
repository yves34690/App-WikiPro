/**
 * Tests unitaires pour le composant NavTab
 */

import { render, screen, fireEvent } from '@testing-library/react';
import NavTab from './NavTab';

describe('NavTab Component', () => {
  const defaultProps = {
    tabId: 'test-tab',
    activeTab: 'dashboard',
    setActiveTab: jest.fn(),
    icon: 'fa-test-icon',
    label: 'Test Label'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devrait rendre l\'onglet avec le bon libellé', () => {
    render(<NavTab {...defaultProps} />);
    
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  test('devrait afficher l\'icône correcte', () => {
    const { container } = render(<NavTab {...defaultProps} />);
    
    const icon = container.querySelector('.fas.fa-test-icon');
    expect(icon).toBeInTheDocument();
  });

  test('devrait être marqué comme actif quand tabId correspond à activeTab', () => {
    render(<NavTab {...defaultProps} tabId="dashboard" activeTab="dashboard" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('nav-tab', 'active');
  });

  test('ne devrait pas être marqué comme actif quand tabId ne correspond pas à activeTab', () => {
    render(<NavTab {...defaultProps} tabId="test-tab" activeTab="dashboard" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('nav-tab');
    expect(button).not.toHaveClass('active');
  });

  test('devrait appeler setActiveTab avec le bon tabId au clic', () => {
    const mockSetActiveTab = jest.fn();
    render(<NavTab {...defaultProps} setActiveTab={mockSetActiveTab} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockSetActiveTab).toHaveBeenCalledWith('test-tab');
    expect(mockSetActiveTab).toHaveBeenCalledTimes(1);
  });

  test('devrait avoir la structure HTML correcte', () => {
    const { container } = render(<NavTab {...defaultProps} />);
    
    const button = container.querySelector('button.nav-tab');
    const icon = button.querySelector('i.fas.fa-test-icon');
    const span = button.querySelector('span');
    
    expect(button).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent('Test Label');
  });

  test('devrait être cliquable et accessible', () => {
    render(<NavTab {...defaultProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeEnabled();
    // Les boutons HTML sans type explicite ont un type par défaut
    expect(button.tagName).toBe('BUTTON');
  });

  test('devrait gérer les changements d\'état actif', () => {
    const { rerender } = render(<NavTab {...defaultProps} tabId="test" activeTab="other" />);
    
    let button = screen.getByRole('button');
    expect(button).not.toHaveClass('active');
    
    // Changer pour que cet onglet devienne actif
    rerender(<NavTab {...defaultProps} tabId="test" activeTab="test" />);
    
    button = screen.getByRole('button');
    expect(button).toHaveClass('active');
  });

  test('devrait gérer différents types d\'icônes', () => {
    const { container, rerender } = render(<NavTab {...defaultProps} icon="fa-home" />);
    
    expect(container.querySelector('.fa-home')).toBeInTheDocument();
    
    // Changer d'icône
    rerender(<NavTab {...defaultProps} icon="fa-user" />);
    
    expect(container.querySelector('.fa-user')).toBeInTheDocument();
    expect(container.querySelector('.fa-home')).not.toBeInTheDocument();
  });

  test('devrait gérer les props manquantes gracieusement', () => {
    expect(() => {
      render(<NavTab tabId={undefined} activeTab={undefined} setActiveTab={undefined} icon={undefined} label={undefined} />);
    }).not.toThrow();
  });

  test('devrait permettre plusieurs clics', () => {
    const mockSetActiveTab = jest.fn();
    render(<NavTab {...defaultProps} setActiveTab={mockSetActiveTab} />);
    
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    
    expect(mockSetActiveTab).toHaveBeenCalledTimes(3);
    expect(mockSetActiveTab).toHaveBeenNthCalledWith(1, 'test-tab');
    expect(mockSetActiveTab).toHaveBeenNthCalledWith(2, 'test-tab');
    expect(mockSetActiveTab).toHaveBeenNthCalledWith(3, 'test-tab');
  });

  test('devrait gérer des libellés longs', () => {
    const longLabel = 'Ceci est un très long libellé d\'onglet qui pourrait poser des problèmes d\'affichage';
    render(<NavTab {...defaultProps} label={longLabel} />);
    
    expect(screen.getByText(longLabel)).toBeInTheDocument();
  });

  test('devrait gérer des caractères spéciaux dans le libellé', () => {
    const specialLabel = 'Mots-clés & Références (2024)';
    render(<NavTab {...defaultProps} label={specialLabel} />);
    
    expect(screen.getByText(specialLabel)).toBeInTheDocument();
  });
});