/**
 * Hook pour les données tenant - WikiPro
 * Hooks spécialisés pour les données spécifiques au tenant
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { QUERY_KEYS } from '../../services/api/config';
import {
  getCurrentTenant,
  getTenantDashboard,
  getTenantData,
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
 * Hook pour les informations du tenant courant
 */
export const useTenant = (options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useQuery({
    queryKey: QUERY_KEYS.tenant(tenantSlug),
    queryFn: () => getCurrentTenant(tenantSlug),
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 10 * 60 * 1000, // 10 minutes (les données tenant changent rarement)
    
    onSuccess: (data) => {
      console.debug('Tenant récupéré:', {
        slug: tenantSlug,
        name: data.name,
      });
      options.onSuccess?.(data);
    },
    
    ...options,
  });
};

/**
 * Hook pour le dashboard tenant
 */
export const useTenantDashboard = (options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useQuery({
    queryKey: QUERY_KEYS.tenantDashboard(tenantSlug),
    queryFn: () => getTenantDashboard(tenantSlug),
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 2 * 60 * 1000, // 2 minutes
    
    select: (data) => ({
      kpis: data.kpis || {},
      evolution: data.evolution_annuelle || {},
      poles: data.poles || {},
      typologies: data.top_typologies || {},
      synthese: data.synthese || [],
      lastUpdated: data.last_updated,
    }),
    
    onSuccess: (data) => {
      console.debug('Dashboard tenant récupéré:', {
        tenant: tenantSlug,
        kpis: Object.keys(data.kpis),
        hasEvolution: !!data.evolution?.annees,
      });
      options.onSuccess?.(data);
    },
    
    ...options,
  });
};

/**
 * Hook pour toutes les données tenant (équivalent data.js)
 */
export const useTenantData = (options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useQuery({
    queryKey: QUERY_KEYS.tenantData(tenantSlug),
    queryFn: () => getTenantData(tenantSlug),
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    select: (data) => {
      // Structure similaire à data.js pour compatibilité
      return {
        kpis: data.kpis || {},
        evolution_annuelle: data.evolution_annuelle || {},
        poles: data.poles || {},
        top_typologies: data.top_typologies || {},
        mots_cles_par_categorie: data.mots_cles_par_categorie || {},
        references: data.references || [],
        tendances: data.tendances || {},
        competences: data.competences || {},
        cvtheque: data.cvtheque || {},
        methodes: data.methodes || {},
        outils: data.outils || {},
        data: data.data || {},
        illustrations: data.illustrations || {},
        lastUpdated: data.last_updated,
      };
    },
    
    onSuccess: (data) => {
      console.debug('Données complètes tenant récupérées:', {
        tenant: tenantSlug,
        modules: Object.keys(data).filter(key => key !== 'lastUpdated'),
      });
      options.onSuccess?.(data);
    },
    
    ...options,
  });
};

/**
 * Hook pour les KPIs
 */
export const useTenantKPIs = (options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useQuery({
    queryKey: ['kpis', tenantSlug],
    queryFn: () => getTenantKPIs(tenantSlug),
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 3 * 60 * 1000, // 3 minutes
    
    select: (data) => ({
      total_etudes: data.total_etudes || 0,
      total_mots_cles: data.total_mots_cles || 0,
      nb_poles: data.nb_poles || 0,
      nb_typologies: data.nb_typologies || 0,
      ...data,
    }),
    
    ...options,
  });
};

/**
 * Hook pour l'évolution annuelle
 */
export const useTenantEvolution = (options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useQuery({
    queryKey: ['evolution', tenantSlug],
    queryFn: () => getTenantEvolution(tenantSlug),
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    select: (data) => ({
      annees: data.annees || [],
      nombres: data.nombres || [],
      tendance: data.tendance || 'stable',
      croissance: data.croissance || 0,
    }),
    
    ...options,
  });
};

/**
 * Hook pour les pôles
 */
export const useTenantPoles = (options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useQuery({
    queryKey: QUERY_KEYS.poles(tenantSlug),
    queryFn: () => getTenantPoles(tenantSlug),
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    select: (data) => ({
      labels: data.labels || [],
      values: data.values || [],
      colors: data.colors || [],
      total: data.values?.reduce((sum, val) => sum + val, 0) || 0,
    }),
    
    ...options,
  });
};

/**
 * Hook pour les tendances
 */
export const useTenantTendances = (options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useQuery({
    queryKey: QUERY_KEYS.tendances(tenantSlug),
    queryFn: () => getTenantTendances(tenantSlug),
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    select: (data) => ({
      evolution_poles: data.evolution_poles || {},
      evolution_typologies: data.evolution_typologies || {},
      tendances_mots_cles: data.tendances_mots_cles || {},
      predictions: data.predictions || {},
      insights: data.insights || [],
    }),
    
    ...options,
  });
};

/**
 * Hook pour les mots-clés
 */
export const useTenantKeywords = (options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useQuery({
    queryKey: QUERY_KEYS.keywords(tenantSlug),
    queryFn: () => getTenantKeywords(tenantSlug),
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    select: (data) => ({
      mots_cles_par_categorie: data.mots_cles_par_categorie || {},
      nuage: data.nuage || [],
      heatmap: data.heatmap || {},
      stats: data.stats || {},
    }),
    
    ...options,
  });
};

/**
 * Hook pour les compétences
 */
export const useTenantCompetences = (options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useQuery({
    queryKey: QUERY_KEYS.competences(tenantSlug),
    queryFn: () => getTenantCompetences(tenantSlug),
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    
    select: (data) => ({
      matrice: data.matrice || [],
      domaines: data.domaines || [],
      niveaux: data.niveaux || {},
      gaps: data.gaps || [],
      formations: data.formations || [],
    }),
    
    ...options,
  });
};

/**
 * Hook pour la CVthèque
 */
export const useTenantCVtheque = (options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useQuery({
    queryKey: QUERY_KEYS.cvtheque(tenantSlug),
    queryFn: () => getTenantCVtheque(tenantSlug),
    enabled: isAuthenticated && !!tenantSlug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    
    select: (data) => ({
      profils: data.profils || [],
      competences: data.competences || {},
      experiences: data.experiences || {},
      formations: data.formations || {},
      disponibilites: data.disponibilites || {},
    }),
    
    ...options,
  });
};

/**
 * Hook générique pour un module spécifique
 */
export const useTenantModule = (moduleName, options = {}) => {
  const { tenant, isAuthenticated } = useAuth();
  const tenantSlug = tenant?.slug;
  
  return useQuery({
    queryKey: [moduleName, tenantSlug],
    queryFn: () => getTenantModuleData(tenantSlug, moduleName),
    enabled: isAuthenticated && !!tenantSlug && !!moduleName,
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    onSuccess: (data) => {
      console.debug(`Module ${moduleName} récupéré:`, {
        tenant: tenantSlug,
        hasData: !!data,
        keys: data ? Object.keys(data) : [],
      });
      options.onSuccess?.(data);
    },
    
    ...options,
  });
};