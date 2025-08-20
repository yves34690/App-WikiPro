/**
 * Context de configuration API - WikiPro
 * Gère la configuration globale de l'API et React Query
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QUERY_CONFIG } from '../services/api/config';
import { checkApiHealth } from '../services/api';

// Configuration du QueryClient
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_CONFIG.staleTime,
        gcTime: QUERY_CONFIG.cacheTime, // React Query v5 utilise gcTime au lieu de cacheTime
        retry: QUERY_CONFIG.retry,
        refetchOnWindowFocus: QUERY_CONFIG.refetchOnWindowFocus,
        refetchOnMount: QUERY_CONFIG.refetchOnMount,
        refetchOnReconnect: QUERY_CONFIG.refetchOnReconnect,
        // Fonction de retry personnalisée
        retryCondition: (failureCount, error) => {
          // Ne pas retry sur les erreurs d'authentification
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            return false;
          }
          // Limiter le retry à 3 tentatives
          return failureCount < 3;
        },
        // Délai entre les retry
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: false, // Pas de retry automatique pour les mutations
        // Fonction d'erreur globale pour les mutations
        onError: (error, variables, context) => {
          console.error('Erreur mutation:', {
            error: error.message,
            variables,
            context,
          });
        },
      },
    },
  });
};

// État de l'API
const API_STATUS = {
  CHECKING: 'checking',
  ONLINE: 'online',
  OFFLINE: 'offline',
  ERROR: 'error',
};

// Création du context
const ApiContext = createContext(null);

/**
 * Provider de configuration API
 */
export const ApiProvider = ({ children }) => {
  const [queryClient] = useState(() => createQueryClient());
  const [apiStatus, setApiStatus] = useState(API_STATUS.CHECKING);
  const [lastCheckTime, setLastCheckTime] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Vérification de l'état de l'API
  const checkApi = async () => {
    try {
      const isHealthy = await checkApiHealth();
      setApiStatus(isHealthy ? API_STATUS.ONLINE : API_STATUS.OFFLINE);
      setLastCheckTime(new Date());
      setRetryCount(0);
    } catch (error) {
      console.error('Erreur vérification API:', error);
      setApiStatus(API_STATUS.ERROR);
      setLastCheckTime(new Date());
    }
  };

  // Vérification initiale et périodique de l'API
  useEffect(() => {
    checkApi();

    // Vérification périodique toutes les 30 secondes
    const interval = setInterval(checkApi, 30000);

    return () => clearInterval(interval);
  }, []);

  // Retry automatique en cas d'erreur
  useEffect(() => {
    if (apiStatus === API_STATUS.ERROR || apiStatus === API_STATUS.OFFLINE) {
      if (retryCount < 5) {
        const retryTimeout = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          checkApi();
        }, Math.min(1000 * 2 ** retryCount, 30000));

        return () => clearTimeout(retryTimeout);
      }
    }
  }, [apiStatus, retryCount]);

  // Gestion des événements de connectivité
  useEffect(() => {
    const handleOnline = () => {
      console.info('Connexion rétablie');
      checkApi();
    };

    const handleOffline = () => {
      console.warn('Perte de connexion');
      setApiStatus(API_STATUS.OFFLINE);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Force une vérification de l'API
   */
  const forceApiCheck = () => {
    setRetryCount(0);
    checkApi();
  };

  /**
   * Invalide tout le cache React Query
   */
  const invalidateAllQueries = () => {
    queryClient.invalidateQueries();
  };

  /**
   * Efface tout le cache React Query
   */
  const clearAllCache = () => {
    queryClient.clear();
  };

  /**
   * Obtient les statistiques du cache
   */
  const getCacheStats = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(query => query.getObserversCount() > 0).length,
      staleQueries: queries.filter(query => query.isStale()).length,
      cachedQueries: queries.filter(query => query.state.data !== undefined).length,
    };
  };

  const value = {
    // État de l'API
    apiStatus,
    lastCheckTime,
    retryCount,
    isApiOnline: apiStatus === API_STATUS.ONLINE,
    isApiOffline: apiStatus === API_STATUS.OFFLINE,
    isApiError: apiStatus === API_STATUS.ERROR,
    
    // Actions
    forceApiCheck,
    invalidateAllQueries,
    clearAllCache,
    getCacheStats,
    
    // QueryClient (pour des utilisations avancées)
    queryClient,
  };

  return (
    <ApiContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ApiContext.Provider>
  );
};

/**
 * Hook pour utiliser le context API
 */
export const useApi = () => {
  const context = useContext(ApiContext);
  
  if (!context) {
    throw new Error('useApi doit être utilisé à l\'intérieur d\'un ApiProvider');
  }
  
  return context;
};

/**
 * Hook pour les statistiques de performance
 */
export const useApiStats = () => {
  const { getCacheStats, apiStatus, lastCheckTime } = useApi();
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const updateStats = () => {
      setStats(getCacheStats());
    };
    
    updateStats();
    const interval = setInterval(updateStats, 5000);
    
    return () => clearInterval(interval);
  }, [getCacheStats]);
  
  return {
    ...stats,
    apiStatus,
    lastCheckTime,
  };
};

export default ApiContext;