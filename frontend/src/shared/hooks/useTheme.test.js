/**
 * Tests unitaires pour le hook useTheme
 */

import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

// Mock de document.documentElement.setAttribute
const mockSetAttribute = jest.fn();
Object.defineProperty(document.documentElement, 'setAttribute', {
  value: mockSetAttribute,
  writable: true
});

describe('useTheme Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('devrait initialiser avec le thème light par défaut', () => {
    const { result } = renderHook(() => useTheme());
    
    expect(result.current.theme).toBe('light');
    expect(mockSetAttribute).toHaveBeenCalledWith('data-color-scheme', 'light');
  });

  test('devrait avoir une fonction toggleTheme', () => {
    const { result } = renderHook(() => useTheme());
    
    expect(typeof result.current.toggleTheme).toBe('function');
  });

  test('devrait basculer de light vers dark', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('dark');
    expect(mockSetAttribute).toHaveBeenLastCalledWith('data-color-scheme', 'dark');
  });

  test('devrait basculer de dark vers light', () => {
    const { result } = renderHook(() => useTheme());
    
    // Premier toggle: light -> dark
    act(() => {
      result.current.toggleTheme();
    });
    
    // Deuxième toggle: dark -> light
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('light');
    expect(mockSetAttribute).toHaveBeenLastCalledWith('data-color-scheme', 'light');
  });

  test('devrait appliquer l\'attribut DOM à chaque changement de thème', () => {
    const { result } = renderHook(() => useTheme());
    
    // Vérification de l'appel initial
    expect(mockSetAttribute).toHaveBeenCalledTimes(1);
    
    // Premier toggle
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(mockSetAttribute).toHaveBeenCalledTimes(2);
    expect(mockSetAttribute).toHaveBeenLastCalledWith('data-color-scheme', 'dark');
    
    // Deuxième toggle
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(mockSetAttribute).toHaveBeenCalledTimes(3);
    expect(mockSetAttribute).toHaveBeenLastCalledWith('data-color-scheme', 'light');
  });

  test('devrait persister l\'état entre les renders', () => {
    const { result, rerender } = renderHook(() => useTheme());
    
    // Change to dark
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.theme).toBe('dark');
    
    // Rerender component
    rerender();
    
    expect(result.current.theme).toBe('dark');
  });
});