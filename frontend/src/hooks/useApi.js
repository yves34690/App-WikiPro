/**
 * Hooks personnalisés React Query pour WikiPro
 * Encapsule les appels API avec React Query pour le caching et la synchronisation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { queryKeys } from '../contexts/QueryProvider';

// ================================
// Hooks d'authentification
// ================================

export function useAuthProfile() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => apiService.getProfile(),
    enabled: isAuthenticated, // Ne s'exécute que si authentifié
    staleTime: 2 * 60 * 1000, // 2 minutes pour le profil
  });
}

export function useAuthHealth() {
  return useQuery({
    queryKey: queryKeys.auth.health,
    queryFn: () => apiService.checkAuthHealth(),
    staleTime: 30 * 1000, // 30 secondes pour health check
    refetchInterval: 60 * 1000, // Refetch toutes les minutes
  });
}

// ================================
// Hooks de Dashboard
// ================================

export function useDashboardData() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.dashboard.data,
    queryFn: () => apiService.getUserDashboardData(),
    enabled: isAuthenticated,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// ================================
// Hooks de Backend Status (pour tests)
// ================================

export function useBackendHealth() {
  return useQuery({
    queryKey: ['backend', 'health'],
    queryFn: () => apiService.checkHealth(),
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 30 * 1000, // Refetch automatique
    retry: 3,
  });
}

// ================================
// Mutations d'authentification
// ================================

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const { login } = useAuth();
  
  return useMutation({
    mutationFn: ({ username, password }) => login(username, password),
    onSuccess: (data) => {
      // Mettre à jour le cache avec les données utilisateur
      queryClient.setQueryData(queryKeys.auth.profile, data.user);
      // Invalider les queries qui pourraient avoir changé
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (error) => {
      console.error('Login failed:', error);
      // Nettoyer le cache en cas d'erreur
      queryClient.clear();
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  
  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      // Nettoyer tout le cache après déconnexion
      queryClient.clear();
    },
  });
}

// ================================
// Hooks d'état de connexion
// ================================

export function useConnectionStatus() {
  const authHealth = useAuthHealth();
  const backendHealth = useBackendHealth();
  
  return {
    backend: {
      status: backendHealth.isSuccess ? 'connected' : 'disconnected',
      data: backendHealth.data,
      isLoading: backendHealth.isLoading,
      error: backendHealth.error,
    },
    auth: {
      status: authHealth.isSuccess ? 'connected' : 'disconnected', 
      data: authHealth.data,
      isLoading: authHealth.isLoading,
      error: authHealth.error,
    },
    overall: backendHealth.isSuccess && authHealth.isSuccess ? 'connected' : 'disconnected',
  };
}

// ================================
// Hooks pour l'invalidation manuelle
// ================================

export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  return {
    invalidateAuth: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth });
    },
    invalidateDashboard: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries();
    },
    clearCache: () => {
      queryClient.clear();
    },
  };
}

// ================================
// Hook de synchronisation globale
// ================================

export function useSyncStatus() {
  const queryClient = useQueryClient();
  const queries = queryClient.getQueriesData();
  
  const isFetching = queryClient.isFetching() > 0;
  const isMutating = queryClient.isMutating() > 0;
  
  return {
    isFetching,
    isMutating,
    isSyncing: isFetching || isMutating,
    totalQueries: queries.length,
    activeQueries: queries.filter(([, data]) => data !== undefined).length,
  };
}