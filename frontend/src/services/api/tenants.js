/**
 * API Tenants - WikiPro
 * Gère toutes les requêtes liées aux données des tenants
 */

import { apiGet, buildApiUrl } from './client';
import { API_ENDPOINTS } from './config';

/**
 * Récupère les données du tenant courant
 */
export const getCurrentTenant = async (tenantSlug) => {
  try {
    const url = buildApiUrl(API_ENDPOINTS.tenants.current, { tenant: tenantSlug });
    
    const response = await apiGet(url);
    
    console.debug('Données tenant récupérées:', {
      tenant: tenantSlug,
      name: response.data?.name,
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur récupération tenant:', error);
    throw error;
  }
};

/**
 * Récupère les données dashboard du tenant
 */
export const getTenantDashboard = async (tenantSlug) => {
  try {
    const url = buildApiUrl(API_ENDPOINTS.tenants.dashboard, { tenant: tenantSlug });
    
    const response = await apiGet(url);
    
    console.debug('Dashboard récupéré:', {
      tenant: tenantSlug,
      kpis: response.data?.kpis ? Object.keys(response.data.kpis) : [],
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur récupération dashboard:', error);
    throw error;
  }
};

/**
 * Récupère toutes les données du tenant (équivalent à data.js)
 */
export const getTenantData = async (tenantSlug) => {
  try {
    const url = buildApiUrl(API_ENDPOINTS.tenants.data, { tenant: tenantSlug });
    
    const response = await apiGet(url);
    
    console.debug('Données complètes récupérées:', {
      tenant: tenantSlug,
      modules: response.data ? Object.keys(response.data) : [],
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur récupération données tenant:', error);
    throw error;
  }
};

/**
 * Récupère les données pour un module spécifique
 */
export const getTenantModuleData = async (tenantSlug, moduleName) => {
  try {
    const url = buildApiUrl(API_ENDPOINTS.tenants.data, { tenant: tenantSlug });
    
    const response = await apiGet(`${url}/${moduleName}`);
    
    console.debug('Données module récupérées:', {
      tenant: tenantSlug,
      module: moduleName,
      hasData: !!response.data,
    });
    
    return response.data;
  } catch (error) {
    console.error(`Erreur récupération module ${moduleName}:`, error);
    throw error;
  }
};

/**
 * Récupère les KPIs du tenant
 */
export const getTenantKPIs = async (tenantSlug) => {
  try {
    const dashboardData = await getTenantDashboard(tenantSlug);
    return dashboardData.kpis || {};
  } catch (error) {
    console.error('Erreur récupération KPIs:', error);
    throw error;
  }
};

/**
 * Récupère l'évolution annuelle
 */
export const getTenantEvolution = async (tenantSlug) => {
  try {
    const dashboardData = await getTenantDashboard(tenantSlug);
    return dashboardData.evolution_annuelle || {};
  } catch (error) {
    console.error('Erreur récupération évolution:', error);
    throw error;
  }
};

/**
 * Récupère les données des pôles
 */
export const getTenantPoles = async (tenantSlug) => {
  try {
    const moduleData = await getTenantModuleData(tenantSlug, 'poles');
    return moduleData || {};
  } catch (error) {
    console.error('Erreur récupération pôles:', error);
    throw error;
  }
};

/**
 * Récupère les références/projets
 */
export const getTenantReferences = async (tenantSlug, filters = {}) => {
  try {
    const moduleData = await getTenantModuleData(tenantSlug, 'references');
    
    // Application des filtres côté client si nécessaire
    let references = moduleData?.references || [];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      references = references.filter(ref => 
        ref.titre?.toLowerCase().includes(searchLower) ||
        ref.description?.toLowerCase().includes(searchLower) ||
        ref.typologie?.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.pole) {
      references = references.filter(ref => ref.pole === filters.pole);
    }
    
    if (filters.typologie) {
      references = references.filter(ref => ref.typologie === filters.typologie);
    }
    
    if (filters.annee) {
      references = references.filter(ref => ref.annee === filters.annee);
    }
    
    return {
      ...moduleData,
      references,
      total: references.length,
    };
  } catch (error) {
    console.error('Erreur récupération références:', error);
    throw error;
  }
};

/**
 * Récupère les données de tendances
 */
export const getTenantTendances = async (tenantSlug) => {
  try {
    const moduleData = await getTenantModuleData(tenantSlug, 'tendances');
    return moduleData || {};
  } catch (error) {
    console.error('Erreur récupération tendances:', error);
    throw error;
  }
};

/**
 * Récupère les mots-clés
 */
export const getTenantKeywords = async (tenantSlug) => {
  try {
    const moduleData = await getTenantModuleData(tenantSlug, 'mots-cles');
    return moduleData || {};
  } catch (error) {
    console.error('Erreur récupération mots-clés:', error);
    throw error;
  }
};

/**
 * Récupère les compétences
 */
export const getTenantCompetences = async (tenantSlug) => {
  try {
    const moduleData = await getTenantModuleData(tenantSlug, 'competences');
    return moduleData || {};
  } catch (error) {
    console.error('Erreur récupération compétences:', error);
    throw error;
  }
};

/**
 * Récupère la CVthèque
 */
export const getTenantCVtheque = async (tenantSlug) => {
  try {
    const moduleData = await getTenantModuleData(tenantSlug, 'cvtheque');
    return moduleData || {};
  } catch (error) {
    console.error('Erreur récupération CVthèque:', error);
    throw error;
  }
};