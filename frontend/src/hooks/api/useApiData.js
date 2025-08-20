/**
 * Hook générique pour les données API - WikiPro
 * Fournit une interface unifiée pour récupérer les données métier
 */

import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { QUERY_KEYS } from '../../services/api/config';
import { 
  getTenantData,
  getTenantDashboard,
  getTenantModuleData,
  getTenantKPIs,
  getTenantEvolution,
  getTenantPoles,
  getTenantReferences,
  getTenantTendances,
  getTenantKeywords,
  getTenantCompetences,
  getTenantCVtheque,
} from '../../services/api/tenants';

/**
 * Hook principal pour récupérer les données API
 */
export const useApiData = (module, options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  // Mapping des modules vers les fonctions et query keys appropriées
  const moduleConfig = {
    dashboard: {
      queryKey: QUERY_KEYS.dashboard(tenantSlug),
      queryFn: () => getTenantDashboard(tenantSlug),
    },
    all: {
      queryKey: QUERY_KEYS.tenantData(tenantSlug),
      queryFn: () => getTenantData(tenantSlug),
    },
    kpis: {
      queryKey: ['kpis', tenantSlug],
      queryFn: () => getTenantKPIs(tenantSlug),
    },
    evolution: {
      queryKey: ['evolution', tenantSlug],
      queryFn: () => getTenantEvolution(tenantSlug),
    },
    poles: {
      queryKey: QUERY_KEYS.poles(tenantSlug),
      queryFn: () => getTenantPoles(tenantSlug),
    },
    references: {
      queryKey: QUERY_KEYS.references(tenantSlug),
      queryFn: () => getTenantReferences(tenantSlug, options.filters),
    },
    tendances: {
      queryKey: QUERY_KEYS.tendances(tenantSlug),
      queryFn: () => getTenantTendances(tenantSlug),
    },
    keywords: {
      queryKey: QUERY_KEYS.keywords(tenantSlug),
      queryFn: () => getTenantKeywords(tenantSlug),
    },
    competences: {
      queryKey: QUERY_KEYS.competences(tenantSlug),
      queryFn: () => getTenantCompetences(tenantSlug),
    },
    cvtheque: {
      queryKey: QUERY_KEYS.cvtheque(tenantSlug),
      queryFn: () => getTenantCVtheque(tenantSlug),
    },
  };
  
  const config = moduleConfig[module];
  
  if (!config) {
    throw new Error(`Module "${module}" non supporté. Modules disponibles: ${Object.keys(moduleConfig).join(', ')}`);
  }
  
  return useQuery({
    queryKey: config.queryKey,
    queryFn: config.queryFn,
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    onSuccess: (data) => {
      console.debug(`Données ${module} récupérées:`, {
        tenant: tenantSlug,
        hasData: !!data,
        keys: data ? Object.keys(data) : [],
      });
      options.onSuccess?.(data);
    },
    
    onError: (error) => {
      console.error(`Erreur récupération ${module}:`, error);
      options.onError?.(error);
    },
    
    ...options,
  });
};

/**
 * Hook pour récupérer plusieurs modules en parallèle
 */
export const useMultipleApiData = (modules, options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  const queries = modules.map(module => ({
    queryKey: QUERY_KEYS[module]?.(tenantSlug) || [module, tenantSlug],
    queryFn: () => getTenantModuleData(tenantSlug, module),
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 5 * 60 * 1000,
    ...options,
  }));
  
  return useQueries({
    queries,
  });
};

/**
 * Hook pour les données du dashboard (optimisé)
 */
export const useDashboardData = (options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useQuery({
    queryKey: QUERY_KEYS.dashboard(tenantSlug),
    queryFn: () => getTenantDashboard(tenantSlug),
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 2 * 60 * 1000, // 2 minutes pour le dashboard
    
    select: (data) => ({
      kpis: data.kpis || {},
      evolution: data.evolution_annuelle || {},
      poles: data.poles || {},
      typologies: data.top_typologies || {},
      lastUpdated: data.last_updated,
    }),
    
    onSuccess: (data) => {
      console.debug('Dashboard récupéré:', {
        tenant: tenantSlug,
        kpis: Object.keys(data.kpis),
      });
      options.onSuccess?.(data);
    },
    
    ...options,
  });
};

/**
 * Hook pour les références avec filtres
 */
export const useReferences = (filters = {}, options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  // Création d'une query key incluant les filtres
  const queryKey = [
    ...QUERY_KEYS.references(tenantSlug),
    'filtered',
    filters,
  ];
  
  return useQuery({
    queryKey,
    queryFn: () => getTenantReferences(tenantSlug, filters),
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 3 * 60 * 1000, // 3 minutes
    
    select: (data) => ({
      references: data.references || [],
      total: data.total || 0,
      filters: data.availableFilters || {},
      pagination: data.pagination || {},
    }),
    
    onSuccess: (data) => {
      console.debug('Références récupérées:', {
        tenant: tenantSlug,
        count: data.references.length,
        total: data.total,
        filters: Object.keys(filters),
      });
      options.onSuccess?.(data);
    },
    
    ...options,
  });
};

/**
 * Hook pour invalider les données d'un module
 */
export const useInvalidateModule = () => {
  const queryClient = useQueryClient();
  const { tenant } = useAuth();
  const tenantSlug = tenant?.slug;
  
  const invalidateModule = (module) => {
    const queryKey = QUERY_KEYS[module]?.(tenantSlug) || [module, tenantSlug];
    return queryClient.invalidateQueries({ queryKey });
  };
  
  const invalidateAllModules = () => {
    return queryClient.invalidateQueries({
      predicate: (query) => {
        return query.queryKey.includes(tenantSlug);
      },
    });
  };
  
  return {
    invalidateModule,
    invalidateAllModules,
  };
};

/**
 * Hook pour les mutations génériques
 */
export const useApiMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();
  const { tenant } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useMutation({
    mutationFn,
    
    onSuccess: (data, variables, context) => {
      // Invalidation automatique des caches liés au tenant
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes(tenantSlug);
        },
      });
      
      console.info('Mutation réussie:', {
        tenant: tenantSlug,
        variables,
      });
      
      options.onSuccess?.(data, variables, context);
    },
    
    onError: (error, variables, context) => {
      console.error('Erreur mutation:', {
        tenant: tenantSlug,
        error: error.message,
        variables,
      });
      
      options.onError?.(error, variables, context);
    },
    
    ...options,
  });
};

/**
 * Hook pour précharger des données
 */
export const usePrefetchData = () => {
  const queryClient = useQueryClient();
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  const prefetchModule = async (module) => {
    if (!isAuthenticated || !tenantSlug) return;
    
    const queryKey = QUERY_KEYS[module]?.(tenantSlug) || [module, tenantSlug];
    
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: () => getTenantModuleData(tenantSlug, module),
      staleTime: 5 * 60 * 1000,
    });
  };
  
  const prefetchDashboard = async () => {
    if (!isAuthenticated || !tenantSlug) return;
    
    await queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.dashboard(tenantSlug),
      queryFn: () => getTenantDashboard(tenantSlug),
      staleTime: 2 * 60 * 1000,
    });
  };
  
  return {
    prefetchModule,
    prefetchDashboard,
  };
};