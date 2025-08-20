/**
 * Hook pour les sessions IA - WikiPro
 * Gère toutes les interactions avec les sessions et conversations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { QUERY_KEYS } from '../../services/api/config';
import {
  getSessions,
  createSession,
  getSession,
  updateSession,
  deleteSession,
  getSessionConversations,
  addConversation,
  searchSessions,
  toggleSessionArchive,
} from '../../services/api/sessions';

/**
 * Hook pour récupérer la liste des sessions
 */
export const useSessions = (filters = {}, options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  const queryKey = [
    ...QUERY_KEYS.sessions(tenantSlug),
    'list',
    filters,
  ];
  
  return useQuery({
    queryKey,
    queryFn: () => getSessions(tenantSlug, filters),
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 2 * 60 * 1000, // 2 minutes
    
    select: (data) => ({
      sessions: data.sessions || [],
      total: data.total || 0,
      pagination: data.pagination || {},
    }),
    
    onSuccess: (data) => {
      console.debug('Sessions récupérées:', {
        tenant: tenantSlug,
        count: data.sessions.length,
        total: data.total,
      });
      options.onSuccess?.(data);
    },
    
    ...options,
  });
};

/**
 * Hook pour récupérer une session spécifique
 */
export const useSession = (sessionId, options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useQuery({
    queryKey: QUERY_KEYS.session(tenantSlug, sessionId),
    queryFn: () => getSession(tenantSlug, sessionId),
    enabled: isAuthenticated && !!tenantSlug && !!sessionId,
    staleTime: 1 * 60 * 1000, // 1 minute
    
    onSuccess: (data) => {
      console.debug('Session récupérée:', {
        tenant: tenantSlug,
        sessionId,
        title: data.title,
      });
      options.onSuccess?.(data);
    },
    
    ...options,
  });
};

/**
 * Hook pour récupérer les conversations d'une session
 */
export const useConversations = (sessionId, filters = {}, options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  const queryKey = [
    ...QUERY_KEYS.conversations(tenantSlug, sessionId),
    filters,
  ];
  
  return useQuery({
    queryKey,
    queryFn: () => getSessionConversations(tenantSlug, sessionId, filters),
    enabled: isAuthenticated && !!tenantSlug && !!sessionId,
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 60 * 1000, // Refetch toutes les minutes
    
    select: (data) => ({
      conversations: data.conversations || [],
      total: data.total || 0,
      hasMore: data.has_more || false,
    }),
    
    onSuccess: (data) => {
      console.debug('Conversations récupérées:', {
        tenant: tenantSlug,
        sessionId,
        count: data.conversations.length,
      });
      options.onSuccess?.(data);
    },
    
    ...options,
  });
};

/**
 * Hook pour créer une nouvelle session
 */
export const useCreateSession = (options = {}) => {
  const queryClient = useQueryClient();
  const { tenant } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useMutation({
    mutationFn: (sessionData) => createSession(tenantSlug, sessionData),
    
    onSuccess: (data, variables, context) => {
      // Invalider la liste des sessions
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sessions(tenantSlug),
      });
      
      // Mettre en cache la nouvelle session
      queryClient.setQueryData(
        QUERY_KEYS.session(tenantSlug, data.id),
        data
      );
      
      console.info('Session créée:', {
        tenant: tenantSlug,
        sessionId: data.id,
        title: data.title,
      });
      
      options.onSuccess?.(data, variables, context);
    },
    
    onError: (error, variables, context) => {
      console.error('Erreur création session:', error);
      options.onError?.(error, variables, context);
    },
    
    ...options,
  });
};

/**
 * Hook pour mettre à jour une session
 */
export const useUpdateSession = (options = {}) => {
  const queryClient = useQueryClient();
  const { tenant } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useMutation({
    mutationFn: ({ sessionId, updates }) => updateSession(tenantSlug, sessionId, updates),
    
    onSuccess: (data, variables, context) => {
      const { sessionId } = variables;
      
      // Mettre à jour le cache de la session
      queryClient.setQueryData(
        QUERY_KEYS.session(tenantSlug, sessionId),
        data
      );
      
      // Invalider la liste des sessions pour refléter les changements
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sessions(tenantSlug),
      });
      
      console.info('Session mise à jour:', {
        tenant: tenantSlug,
        sessionId,
      });
      
      options.onSuccess?.(data, variables, context);
    },
    
    onError: (error, variables, context) => {
      console.error('Erreur mise à jour session:', error);
      options.onError?.(error, variables, context);
    },
    
    ...options,
  });
};

/**
 * Hook pour supprimer une session
 */
export const useDeleteSession = (options = {}) => {
  const queryClient = useQueryClient();
  const { tenant } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useMutation({
    mutationFn: (sessionId) => deleteSession(tenantSlug, sessionId),
    
    onSuccess: (data, sessionId, context) => {
      // Retirer la session du cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.session(tenantSlug, sessionId),
      });
      
      // Invalider la liste des sessions
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sessions(tenantSlug),
      });
      
      console.info('Session supprimée:', {
        tenant: tenantSlug,
        sessionId,
      });
      
      options.onSuccess?.(data, sessionId, context);
    },
    
    onError: (error, variables, context) => {
      console.error('Erreur suppression session:', error);
      options.onError?.(error, variables, context);
    },
    
    ...options,
  });
};

/**
 * Hook pour ajouter une conversation
 */
export const useAddConversation = (options = {}) => {
  const queryClient = useQueryClient();
  const { tenant } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useMutation({
    mutationFn: ({ sessionId, conversationData }) => 
      addConversation(tenantSlug, sessionId, conversationData),
    
    onSuccess: (data, variables, context) => {
      const { sessionId } = variables;
      
      // Invalider les conversations de la session
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.conversations(tenantSlug, sessionId),
      });
      
      // Mettre à jour la session si nécessaire (date de dernière activité)
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.session(tenantSlug, sessionId),
      });
      
      console.info('Conversation ajoutée:', {
        tenant: tenantSlug,
        sessionId,
        conversationId: data.id,
      });
      
      options.onSuccess?.(data, variables, context);
    },
    
    onError: (error, variables, context) => {
      console.error('Erreur ajout conversation:', error);
      options.onError?.(error, variables, context);
    },
    
    ...options,
  });
};

/**
 * Hook pour la recherche dans les sessions
 */
export const useSearchSessions = (searchQuery, filters = {}, options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  const queryKey = [
    'search',
    'sessions',
    tenantSlug,
    searchQuery,
    filters,
  ];
  
  return useQuery({
    queryKey,
    queryFn: () => searchSessions(tenantSlug, searchQuery, filters),
    enabled: isAuthenticated && !!tenantSlug && !!searchQuery && searchQuery.length >= 2,
    staleTime: 30 * 1000, // 30 secondes
    
    select: (data) => ({
      sessions: data.sessions || [],
      total: data.total || 0,
      highlights: data.highlights || {},
    }),
    
    onSuccess: (data) => {
      console.debug('Recherche sessions:', {
        tenant: tenantSlug,
        query: searchQuery,
        count: data.sessions.length,
      });
      options.onSuccess?.(data);
    },
    
    ...options,
  });
};

/**
 * Hook pour archiver/désarchiver une session
 */
export const useToggleArchiveSession = (options = {}) => {
  const queryClient = useQueryClient();
  const { tenant } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useMutation({
    mutationFn: ({ sessionId, archived }) => 
      toggleSessionArchive(tenantSlug, sessionId, archived),
    
    onSuccess: (data, variables, context) => {
      const { sessionId } = variables;
      
      // Mettre à jour le cache de la session
      queryClient.setQueryData(
        QUERY_KEYS.session(tenantSlug, sessionId),
        data
      );
      
      // Invalider la liste des sessions
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.sessions(tenantSlug),
      });
      
      console.info('Session archivée/désarchivée:', {
        tenant: tenantSlug,
        sessionId,
        archived: variables.archived,
      });
      
      options.onSuccess?.(data, variables, context);
    },
    
    onError: (error, variables, context) => {
      console.error('Erreur archivage session:', error);
      options.onError?.(error, variables, context);
    },
    
    ...options,
  });
};

/**
 * Hook optimisé pour le module IA-Stratégie
 */
export const useIAStrategie = (options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  // Récupération des sessions récentes
  const sessionsQuery = useSessions({
    limit: 10,
    sort: 'updated_at',
    order: 'desc',
  }, options);
  
  // Statistiques des sessions
  const statsQuery = useQuery({
    queryKey: ['sessions', tenantSlug, 'stats'],
    queryFn: () => getSessions(tenantSlug, { stats: true }),
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    select: (data) => ({
      totalSessions: data.total || 0,
      activeSessions: data.active || 0,
      archivedSessions: data.archived || 0,
      totalConversations: data.total_conversations || 0,
    }),
  });
  
  return {
    sessions: sessionsQuery,
    stats: statsQuery,
    isLoading: sessionsQuery.isLoading || statsQuery.isLoading,
    error: sessionsQuery.error || statsQuery.error,
  };
};