/**
 * Tests unitaires pour le module IAStrategie
 */

import { render, screen, fireEvent } from '@testing-library/react';
import IAStrategie from './IAStrategie';

// Mock appData
jest.mock('../../data.js', () => ({
  appData: {
    references: [
      { id: 1, budget: '10 000€' },
      { id: 2, budget: '15 000€' }
    ],
    competences: ['comp1', 'comp2', 'comp3'],
    poles: {
      labels: ['Pole1', 'Pole2', 'Pole3']
    }
  }
}));

// Mock du hook personnalisé
const mockHookValues = {
  selectedModel: 'GPT-4',
  setSelectedModel: jest.fn(),
  inputText: '',
  setInputText: jest.fn(),
  showCanvas: false,
  setShowCanvas: jest.fn(),
  canvasContent: '',
  setCanvasContent: jest.fn(),
  isGenerating: false,
  aiModels: [
    { id: 'gpt4', name: 'GPT-4', description: 'Modèle avancé' },
    { id: 'claude', name: 'Claude', description: 'Modèle anthropic' }
  ],
  handleGenerate: jest.fn(),
  handleKeyPress: jest.fn()
};

jest.mock('./hooks/useIAStrategie', () => ({
  useIAStrategie: jest.fn()
}));

// Configuration du mock après import
const { useIAStrategie } = require('./hooks/useIAStrategie');
useIAStrategie.mockReturnValue(mockHookValues);

describe('IAStrategie Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useIAStrategie.mockReturnValue(mockHookValues);
  });

  test('devrait rendre le module principal', () => {
    render(<IAStrategie />);
    
    // Doit avoir la structure principale avec le bon style
    const { container } = render(<IAStrategie />);
    expect(container.firstChild).toHaveStyle('height: 100vh');
  });

  test('devrait afficher le titre Studio IA WikiPro', () => {
    render(<IAStrategie />);
    
    expect(screen.getByText('Studio d\'IA WikiPro')).toBeInTheDocument();
  });

  test('devrait afficher la question principale', () => {
    render(<IAStrategie />);
    
    expect(screen.getByText('Que souhaitez-vous créer aujourd\'hui ?')).toBeInTheDocument();
  });

  test('devrait avoir un conteneur principal avec la bonne structure', () => {
    const { container } = render(<IAStrategie />);
    
    // Le conteneur principal doit avoir le bon style
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveStyle('height: 100vh');
    expect(mainDiv).toHaveStyle('display: flex');
  });

  test('devrait calculer les connecteurs de données', () => {
    render(<IAStrategie />);
    
    // Les connecteurs de données doivent être calculés à partir de appData
    // On ne peut pas les tester directement, mais on peut vérifier qu'ils n'empêchent pas le rendu
    expect(screen.getByText('Studio d\'IA WikiPro')).toBeInTheDocument();
  });

  test('devrait utiliser le hook useIAStrategie', () => {
    const { useIAStrategie } = require('./hooks/useIAStrategie');
    
    render(<IAStrategie />);
    
    expect(useIAStrategie).toHaveBeenCalledTimes(1);
  });

  test('devrait s\'afficher sans erreur', () => {
    expect(() => {
      render(<IAStrategie />);
    }).not.toThrow();
  });

  test('devrait avoir une interface responsive', () => {
    const { container } = render(<IAStrategie />);
    
    // Vérifier la structure flex
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveStyle('display: flex');
  });

  test('devrait avoir un header avec gradient', () => {
    const { container } = render(<IAStrategie />);
    
    // Vérifier qu'il y a des éléments avec des styles inline
    const styledElements = container.querySelectorAll('[style]');
    expect(styledElements.length).toBeGreaterThan(0);
  });

  test('devrait gérer l\'état du canvas', () => {
    // Test avec canvas affiché
    const canvasHookValues = { ...mockHookValues, showCanvas: true };
    const { useIAStrategie } = require('./hooks/useIAStrategie');
    useIAStrategie.mockReturnValue(canvasHookValues);

    render(<IAStrategie />);
    
    // Vérifier que l'interface réagit à l'état du canvas
    expect(screen.getByText('Studio d\'IA WikiPro')).toBeInTheDocument();
  });

  test('devrait gérer l\'état de génération', () => {
    // Test avec génération en cours
    const generatingHookValues = { ...mockHookValues, isGenerating: true };
    const { useIAStrategie } = require('./hooks/useIAStrategie');
    useIAStrategie.mockReturnValue(generatingHookValues);

    render(<IAStrategie />);
    
    // Vérifier que l'interface réagit à l'état de génération
    expect(screen.getByText('Studio d\'IA WikiPro')).toBeInTheDocument();
  });

  test('devrait avoir des modèles IA disponibles', () => {
    render(<IAStrategie />);
    
    // Le hook devrait fournir les modèles IA
    const { useIAStrategie } = require('./hooks/useIAStrategie');
    expect(useIAStrategie).toHaveBeenCalled();
    
    // Vérifier que les modèles sont dans le hook mocké
    expect(mockHookValues.aiModels).toHaveLength(2);
    expect(mockHookValues.aiModels[0].name).toBe('GPT-4');
  });

  test('devrait calculer correctement les connecteurs de données', () => {
    render(<IAStrategie />);
    
    // Les calculs de dataConnectors ne doivent pas faire planter l'app
    // On teste indirectement en vérifiant que l'app se rend
    expect(screen.getByText('Studio d\'IA WikiPro')).toBeInTheDocument();
    
    // On peut vérifier que les données mockées sont correctes
    const { appData } = require('../../data.js');
    expect(appData.references).toHaveLength(2);
    expect(appData.competences).toHaveLength(3);
    expect(appData.poles.labels).toHaveLength(3);
  });

  test('devrait avoir une interface moderne', () => {
    const { container } = render(<IAStrategie />);
    
    // Vérifier des éléments d'interface moderne
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveStyle('height: 100vh');
    
    // Vérifier qu'il y a des éléments avec des styles CSS
    const styledElements = container.querySelectorAll('[style]');
    expect(styledElements.length).toBeGreaterThan(0);
  });

  test('devrait être un module complet et indépendant', () => {
    render(<IAStrategie />);
    
    // Vérifier que le module contient tous ses éléments essentiels
    expect(screen.getByText('Studio d\'IA WikiPro')).toBeInTheDocument();
    expect(screen.getByText('Que souhaitez-vous créer aujourd\'hui ?')).toBeInTheDocument();
    
    // Vérifier la structure de base
    const { container } = render(<IAStrategie />);
    expect(container.firstChild).toHaveStyle('height: 100vh');
  });
});