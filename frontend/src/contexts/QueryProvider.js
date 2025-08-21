/**
 * Configuration et Provider React Query pour WikiPro
 * Gère la mise en cache, synchronisation et état global des requêtes API
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Configuration du client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Durée de cache par défaut : 5 minutes
      staleTime: 5 * 60 * 1000,
      // Durée de mise en cache inactive : 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry sur erreur réseau
      retry: (failureCount, error) => {
        // Ne pas retry sur les erreurs 4xx (client errors)
        if (error?.message?.includes('4')) {
          return false;
        }
        // Retry jusqu'à 2 fois pour les autres erreurs
        return failureCount < 2;
      },
      // Intervalle de retry (progressive)
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch en focus par défaut
      refetchOnWindowFocus: false,
      // Refetch quand la connexion revient
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry des mutations sur erreur réseau
      retry: (failureCount, error) => {
        // Ne pas retry sur les erreurs 4xx
        if (error?.message?.includes('4')) {
          return false;
        }
        return failureCount < 1; // Un seul retry pour les mutations
      },
    },
  },
});

// Configuration des query keys pour l'organisation
export const queryKeys = {
  // Auth queries
  auth: {
    profile: ['auth', 'profile'],
    health: ['auth', 'health'],
  },
  // Dashboard queries
  dashboard: {
    all: ['dashboard'],
    data: ['dashboard', 'data'],
    kpis: ['dashboard', 'kpis'],
  },
  // IA queries
  ia: {
    all: ['ia'],
    providers: ['ia', 'providers'],
    conversations: ['ia', 'conversations'],
    conversation: (id) => ['ia', 'conversations', id],
  },
  // Data queries
  data: {
    all: ['data'],
    etudes: ['data', 'etudes'],
    motscles: ['data', 'motscles'],
    poles: ['data', 'poles'],
    references: ['data', 'references'],
  },
};

// Provider React Query
export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools uniquement en développement */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

// Export du client pour utilisation directe si nécessaire
export { queryClient };

export default QueryProvider;