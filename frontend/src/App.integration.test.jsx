/**
 * Tests d'intégration simplifiés pour le composant App principal
 */

import { render, screen } from '@testing-library/react';
import App from './App';

// Mock complet des modules Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart Mock</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart Mock</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart Mock</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart Mock</div>
}));

// Suppressions complètes des erreurs console pour les tests d'intégration
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = () => {};
  console.warn = () => {};
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

describe('App Integration Tests', () => {
  test('devrait rendre l\'application sans crash', () => {
    render(<App />);
    
    // Vérifier que l'en-tête est rendue
    expect(screen.getByText('WikiPro')).toBeInTheDocument();
    expect(screen.getByText('Groupe Elan')).toBeInTheDocument();
  });

  test('devrait afficher la navigation principale', () => {
    render(<App />);
    
    // Vérifier quelques onglets principaux
    expect(screen.getByText('Vue d\'ensemble')).toBeInTheDocument();
    expect(screen.getByText('Tendances')).toBeInTheDocument();
    expect(screen.getByText('Mots-clés')).toBeInTheDocument();
    expect(screen.getByText('Références')).toBeInTheDocument();
  });

  test('devrait avoir le toggle de thème', () => {
    render(<App />);
    
    // Vérifier que le bouton de thème existe
    const themeToggle = document.getElementById('themeToggle');
    expect(themeToggle).toBeInTheDocument();
  });

  test('devrait avoir une barre de recherche', () => {
    render(<App />);
    
    // Vérifier la présence de la barre de recherche
    const searchInput = screen.getByPlaceholderText('Recherche globale...');
    expect(searchInput).toBeInTheDocument();
  });

  test('devrait rendre les graphiques sans erreur', () => {
    render(<App />);
    
    // Les mocks des graphiques devraient être présents
    const charts = screen.getAllByTestId(/-chart$/);
    expect(charts.length).toBeGreaterThan(0);
  });

  test('devrait avoir la structure HTML de base', () => {
    render(<App />);
    
    // Vérifier la présence des éléments structurels
    expect(document.querySelector('header.header')).toBeInTheDocument();
    expect(document.querySelector('nav.navigation')).toBeInTheDocument();
    expect(document.querySelector('.nav-tabs')).toBeInTheDocument();
  });

  test('devrait avoir tous les onglets de navigation principaux', () => {
    render(<App />);
    
    // Vérifier la présence de quelques onglets principaux
    const navTabs = [
      'Vue d\'ensemble', 'Tendances', 'Mots-clés', 'Pôles', 
      'Références', 'Data', 'Illustrations', 'Outils', 'CVthèque',
      'Compétences'
    ];
    
    navTabs.forEach(tabName => {
      // Vérifier qu'au moins une occurrence du nom d'onglet existe
      const elements = screen.queryAllByText(tabName);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('devrait afficher le contenu par défaut', () => {
    render(<App />);
    
    // Par défaut, le dashboard devrait être visible avec certains éléments
    expect(screen.getByText('Vue d\'ensemble')).toBeInTheDocument();
    
    // Vérifier qu'il y a du contenu dans la page
    expect(document.body.textContent.length).toBeGreaterThan(100);
  });

  test('devrait avoir les icônes FontAwesome', () => {
    render(<App />);
    
    // Vérifier la présence d'icônes FontAwesome
    const icons = document.querySelectorAll('.fas, .fa');
    expect(icons.length).toBeGreaterThan(0);
  });
});