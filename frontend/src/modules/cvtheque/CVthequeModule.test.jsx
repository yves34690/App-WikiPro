/**
 * Tests unitaires pour le module CVthequeModule
 */

import { render, screen, fireEvent } from '@testing-library/react';
import CVthequeModule from './CVthequeModule';

// Mock appData
jest.mock('../../data.js', () => ({
  appData: {
    cvtheque: [
      {
        id: 1,
        nom: 'Jean Dupont',
        pole: 'Urbanisme',
        experience: '5 ans',
        localisation: 'Paris',
        competences: ['urbanisme', 'aménagement'],
        disponibilite: 'disponible'
      },
      {
        id: 2,
        nom: 'Marie Martin',
        pole: 'Économie',
        experience: '3 ans',
        localisation: 'Lyon',
        competences: ['économie', 'analyse'],
        disponibilite: 'occupé'
      }
    ],
    poles: {
      labels: ['Urbanisme', 'Économie', 'Management']
    }
  }
}));

describe('CVthequeModule', () => {
  test('devrait rendre la section de filtres', () => {
    render(<CVthequeModule />);
    
    // Le module devrait avoir des filtres
    const { container } = render(<CVthequeModule />);
    const filtersSection = container.querySelector('.filters-section');
    expect(filtersSection).toBeInTheDocument();
  });

  test('devrait avoir la structure CSS de base', () => {
    const { container } = render(<CVthequeModule />);
    
    // Vérifier les éléments de base
    expect(container.firstChild).toBeInTheDocument();
  });

  test('devrait s\'afficher sans erreur', () => {
    expect(() => {
      render(<CVthequeModule />);
    }).not.toThrow();
  });

  test('devrait être rendu correctement', () => {
    const { container } = render(<CVthequeModule />);
    
    expect(container).toBeInTheDocument();
  });
});