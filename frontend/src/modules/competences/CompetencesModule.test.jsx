/**
 * Tests unitaires pour le module CompetencesModule
 */

import { render, screen, fireEvent } from '@testing-library/react';
import CompetencesModule from './CompetencesModule';

// Mock appData
jest.mock('../../data.js', () => ({
  appData: {
    matriceCompetences: {
      data: [
        {
          id: 1,
          competence: 'Compétence Test 1',
          pole: 'Technique',
          niveau_requis: 'Expert',
          description: 'Description compétence 1'
        },
        {
          id: 2,
          competence: 'Compétence Test 2',
          pole: 'Management',
          niveau_requis: 'Intermédiaire',
          description: 'Description compétence 2'
        }
      ],
      poles: ['Technique', 'Management', 'Commercial'],
      niveaux: ['Débutant', 'Intermédiaire', 'Expert']
    },
    competences: [
      'Compétence Mock 1',
      'Compétence Mock 2',
      'Compétence Mock 3'
    ]
  }
}));

describe('CompetencesModule', () => {
  test('devrait rendre le module sans erreur', () => {
    expect(() => {
      render(<CompetencesModule />);
    }).not.toThrow();
  });

  test('devrait avoir la structure de base', () => {
    const { container } = render(<CompetencesModule />);
    
    expect(container).toBeInTheDocument();
    expect(container.firstChild).toBeInTheDocument();
  });

  test('devrait être rendu correctement', () => {
    render(<CompetencesModule />);
    
    // Test de base pour s'assurer que le composant se rend
    const { container } = render(<CompetencesModule />);
    expect(container).toBeInTheDocument();
  });
});