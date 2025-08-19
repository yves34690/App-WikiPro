/**
 * Tests unitaires pour les constantes chartColors
 */

import { chartColors } from './chartColors';
import chartColorsDefault from './chartColors';

describe('chartColors Constants', () => {
  test('devrait exporter chartColors comme named export', () => {
    expect(chartColors).toBeDefined();
    expect(Array.isArray(chartColors)).toBe(true);
  });

  test('devrait exporter chartColors comme default export', () => {
    expect(chartColorsDefault).toBeDefined();
    expect(Array.isArray(chartColorsDefault)).toBe(true);
  });

  test('devrait avoir le bon nombre de couleurs', () => {
    expect(chartColors).toHaveLength(10);
  });

  test('devrait contenir des codes couleur hexadécimaux valides', () => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    
    chartColors.forEach((color, index) => {
      expect(typeof color).toBe('string');
      expect(color).toMatch(hexColorRegex);
    });
  });

  test('devrait avoir des couleurs spécifiques aux bonnes positions', () => {
    expect(chartColors[0]).toBe('#1FB8CD'); // Primary teal
    expect(chartColors[1]).toBe('#FFC185'); // Orange
    expect(chartColors[2]).toBe('#B4413C'); // Red
    expect(chartColors[9]).toBe('#13343B'); // Dark blue
  });

  test('devrait avoir toutes les couleurs uniques', () => {
    const uniqueColors = [...new Set(chartColors)];
    expect(uniqueColors).toHaveLength(chartColors.length);
  });

  test('devrait être utilisable comme array standard', () => {
    const originalLength = chartColors.length;
    const originalFirstColor = chartColors[0];
    
    // Vérifier les propriétés de base
    expect(chartColors).toHaveLength(originalLength);
    expect(chartColors[0]).toBe(originalFirstColor);
    
    // Vérifier qu'on peut lire les couleurs
    expect(typeof chartColors[0]).toBe('string');
  });

  test('devrait être utilisable avec Array methods', () => {
    // Test avec slice
    const firstThreeColors = chartColors.slice(0, 3);
    expect(firstThreeColors).toHaveLength(3);
    expect(firstThreeColors[0]).toBe('#1FB8CD');
    
    // Test avec map
    const colorsWithOpacity = chartColors.map(color => color + '20');
    expect(colorsWithOpacity[0]).toBe('#1FB8CD20');
    
    // Test avec filter
    const tealColors = chartColors.filter(color => color.includes('CD'));
    expect(tealColors).toContain('#1FB8CD');
  });

  test('devrait supporter l\'usage avec Chart.js', () => {
    // Test d'utilisation typique avec Chart.js
    const chartData = {
      datasets: [{
        backgroundColor: chartColors.slice(0, 5),
        borderColor: chartColors[0]
      }]
    };
    
    expect(chartData.datasets[0].backgroundColor).toHaveLength(5);
    expect(chartData.datasets[0].borderColor).toBe('#1FB8CD');
  });
});