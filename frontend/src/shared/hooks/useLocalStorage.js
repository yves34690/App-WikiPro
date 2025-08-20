/**
 * Hook useLocalStorage pour persistance locale - WikiPro
 * Gère la synchronisation avec localStorage avec support SSR
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour gérer les données dans localStorage
 */
export const useLocalStorage = (key, initialValue) => {
  // État pour stocker la valeur
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Récupération de la valeur depuis localStorage
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error(`Erreur lecture localStorage pour ${key}:`, error);
      return initialValue;
    }
  });

  // Fonction pour modifier la valeur
  const setValue = useCallback((value) => {
    try {
      // Accepte une fonction comme valeur (comme useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Mise à jour de l'état
      setStoredValue(valueToStore);
      
      // Sauvegarde dans localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch d'un événement pour synchroniser les autres hooks
        window.dispatchEvent(new CustomEvent('localStorageChange', {
          detail: { key, value: valueToStore }
        }));
      }
    } catch (error) {
      console.error(`Erreur écriture localStorage pour ${key}:`, error);
    }
  }, [key, storedValue]);

  // Fonction pour supprimer la valeur
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        
        // Dispatch de l'événement
        window.dispatchEvent(new CustomEvent('localStorageChange', {
          detail: { key, value: null, removed: true }
        }));
      }
    } catch (error) {
      console.error(`Erreur suppression localStorage pour ${key}:`, error);
    }
  }, [key, initialValue]);

  // Synchronisation avec les changements externes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.detail.key === key && !e.detail.removed) {
        setStoredValue(e.detail.value);
      } else if (e.detail.key === key && e.detail.removed) {
        setStoredValue(initialValue);
      }
    };

    // Écoute des changements du localStorage
    const handleNativeStorageChange = (e) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.error(`Erreur parsing localStorage pour ${key}:`, error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('localStorageChange', handleStorageChange);
      window.addEventListener('storage', handleNativeStorageChange);
      
      return () => {
        window.removeEventListener('localStorageChange', handleStorageChange);
        window.removeEventListener('storage', handleNativeStorageChange);
      };
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;