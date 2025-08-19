/**
 * Tests unitaires pour le hook useMotsClesFilters
 */

import { renderHook, act } from '@testing-library/react';
import { useMotsClesFilters } from './useMotsClesFilters';

describe('useMotsClesFilters Hook', () => {
  test('devrait initialiser avec les valeurs par défaut', () => {
    const { result } = renderHook(() => useMotsClesFilters());

    expect(result.current.categorieFilter).toBe('');
    expect(result.current.poleFilter).toBe('');
    expect(result.current.typologieFilter).toBe('');
  });

  test('devrait avoir les bonnes fonctions de setter', () => {
    const { result } = renderHook(() => useMotsClesFilters());

    expect(typeof result.current.setCategorieFilter).toBe('function');
    expect(typeof result.current.setPoleFilter).toBe('function');
    expect(typeof result.current.setTypologieFilter).toBe('function');
  });

  test('devrait mettre à jour le filtre de catégorie', () => {
    const { result } = renderHook(() => useMotsClesFilters());

    act(() => {
      result.current.setCategorieFilter('Urbanisme');
    });

    expect(result.current.categorieFilter).toBe('Urbanisme');
  });

  test('devrait mettre à jour le filtre de pôle', () => {
    const { result } = renderHook(() => useMotsClesFilters());

    act(() => {
      result.current.setPoleFilter('Économie');
    });

    expect(result.current.poleFilter).toBe('Économie');
  });

  test('devrait mettre à jour le filtre de typologie', () => {
    const { result } = renderHook(() => useMotsClesFilters());

    act(() => {
      result.current.setTypologieFilter('Diagnostic');
    });

    expect(result.current.typologieFilter).toBe('Diagnostic');
  });

  test('devrait permettre de mettre à jour plusieurs filtres', () => {
    const { result } = renderHook(() => useMotsClesFilters());

    act(() => {
      result.current.setCategorieFilter('Technique');
      result.current.setPoleFilter('Urbanisme');
      result.current.setTypologieFilter('Étude');
    });

    expect(result.current.categorieFilter).toBe('Technique');
    expect(result.current.poleFilter).toBe('Urbanisme');
    expect(result.current.typologieFilter).toBe('Étude');
  });

  test('devrait permettre de réinitialiser les filtres', () => {
    const { result } = renderHook(() => useMotsClesFilters());

    // Définir des valeurs
    act(() => {
      result.current.setCategorieFilter('Test');
      result.current.setPoleFilter('Test');
      result.current.setTypologieFilter('Test');
    });

    expect(result.current.categorieFilter).toBe('Test');
    expect(result.current.poleFilter).toBe('Test');
    expect(result.current.typologieFilter).toBe('Test');

    // Réinitialiser
    act(() => {
      result.current.setCategorieFilter('');
      result.current.setPoleFilter('');
      result.current.setTypologieFilter('');
    });

    expect(result.current.categorieFilter).toBe('');
    expect(result.current.poleFilter).toBe('');
    expect(result.current.typologieFilter).toBe('');
  });

  test('devrait préserver l\'état entre les renders', () => {
    const { result, rerender } = renderHook(() => useMotsClesFilters());

    act(() => {
      result.current.setCategorieFilter('Persistent');
    });

    expect(result.current.categorieFilter).toBe('Persistent');

    // Rerender
    rerender();

    expect(result.current.categorieFilter).toBe('Persistent');
  });

  test('devrait gérer des chaînes vides et des espaces', () => {
    const { result } = renderHook(() => useMotsClesFilters());

    act(() => {
      result.current.setCategorieFilter('   ');
      result.current.setPoleFilter('');
      result.current.setTypologieFilter('  test  ');
    });

    expect(result.current.categorieFilter).toBe('   ');
    expect(result.current.poleFilter).toBe('');
    expect(result.current.typologieFilter).toBe('  test  ');
  });

  test('devrait gérer des caractères spéciaux', () => {
    const { result } = renderHook(() => useMotsClesFilters());

    act(() => {
      result.current.setCategorieFilter('Étude & Développement');
      result.current.setPoleFilter('Communication (interne)');
      result.current.setTypologieFilter('Pré-diagnostic');
    });

    expect(result.current.categorieFilter).toBe('Étude & Développement');
    expect(result.current.poleFilter).toBe('Communication (interne)');
    expect(result.current.typologieFilter).toBe('Pré-diagnostic');
  });

  test('devrait permettre des changements de filtres successifs', () => {
    const { result } = renderHook(() => useMotsClesFilters());

    // Premier changement
    act(() => {
      result.current.setCategorieFilter('Premier');
    });

    expect(result.current.categorieFilter).toBe('Premier');

    // Deuxième changement
    act(() => {
      result.current.setCategorieFilter('Deuxième');
    });

    expect(result.current.categorieFilter).toBe('Deuxième');

    // Troisième changement
    act(() => {
      result.current.setCategorieFilter('Troisième');
    });

    expect(result.current.categorieFilter).toBe('Troisième');
  });

  test('devrait exposer tous les éléments nécessaires', () => {
    const { result } = renderHook(() => useMotsClesFilters());

    const returnedObject = result.current;
    
    expect(returnedObject).toHaveProperty('categorieFilter');
    expect(returnedObject).toHaveProperty('setCategorieFilter');
    expect(returnedObject).toHaveProperty('poleFilter');
    expect(returnedObject).toHaveProperty('setPoleFilter');
    expect(returnedObject).toHaveProperty('typologieFilter');
    expect(returnedObject).toHaveProperty('setTypologieFilter');
    
    expect(Object.keys(returnedObject)).toHaveLength(6);
  });
});