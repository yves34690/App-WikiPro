/**
 * API Sessions - WikiPro
 * Gère toutes les requêtes liées aux sessions IA et conversations
 */

import { apiGet, apiPost, apiPut, apiDelete, buildApiUrl } from './client';
import { API_ENDPOINTS } from './config';

/**
 * Récupère la liste des sessions pour un tenant
 */
export const getSessions = async (tenantSlug, filters = {}) => {
  try {
    const url = buildApiUrl(API_ENDPOINTS.sessions.list, { tenant: tenantSlug });
    
    const response = await apiGet(url, {
      params: {
        ...filters,
        page: filters.page || 1,
        limit: filters.limit || 20,
      }
    });
    
    console.debug('Sessions récupérées:', {
      tenant: tenantSlug,
      count: response.data?.sessions?.length || 0,
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur récupération sessions:', error);
    throw error;
  }
};

/**
 * Crée une nouvelle session
 */
export const createSession = async (tenantSlug, sessionData) => {
  try {
    const url = buildApiUrl(API_ENDPOINTS.sessions.create, { tenant: tenantSlug });
    
    const response = await apiPost(url, {
      title: sessionData.title,
      description: sessionData.description,
      type: sessionData.type || 'general',
      metadata: sessionData.metadata || {},
    });
    
    console.info('Session créée:', {
      tenant: tenantSlug,
      sessionId: response.data?.id,
      title: response.data?.title,
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur création session:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la création');
  }
};

/**
 * Récupère les détails d'une session
 */
export const getSession = async (tenantSlug, sessionId) => {
  try {
    const url = buildApiUrl(API_ENDPOINTS.sessions.detail, { 
      tenant: tenantSlug, 
      sessionId 
    });
    
    const response = await apiGet(url);
    
    console.debug('Détails session récupérés:', {
      tenant: tenantSlug,
      sessionId,
      title: response.data?.title,
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur récupération session:', error);
    throw error;
  }
};

/**
 * Met à jour une session
 */
export const updateSession = async (tenantSlug, sessionId, updates) => {
  try {
    const url = buildApiUrl(API_ENDPOINTS.sessions.detail, { 
      tenant: tenantSlug, 
      sessionId 
    });
    
    const response = await apiPut(url, updates);
    
    console.info('Session mise à jour:', {
      tenant: tenantSlug,
      sessionId,
      updates: Object.keys(updates),
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur mise à jour session:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour');
  }
};

/**
 * Supprime une session
 */
export const deleteSession = async (tenantSlug, sessionId) => {
  try {
    const url = buildApiUrl(API_ENDPOINTS.sessions.detail, { 
      tenant: tenantSlug, 
      sessionId 
    });
    
    await apiDelete(url);
    
    console.info('Session supprimée:', {
      tenant: tenantSlug,
      sessionId,
    });
    
    return true;
  } catch (error) {
    console.error('Erreur suppression session:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la suppression');
  }
};

/**
 * Récupère les conversations d'une session
 */
export const getSessionConversations = async (tenantSlug, sessionId, filters = {}) => {
  try {
    const url = buildApiUrl(API_ENDPOINTS.sessions.conversations, { 
      tenant: tenantSlug, 
      sessionId 
    });
    
    const response = await apiGet(url, {
      params: {
        ...filters,
        page: filters.page || 1,
        limit: filters.limit || 50,
      }
    });
    
    console.debug('Conversations récupérées:', {
      tenant: tenantSlug,
      sessionId,
      count: response.data?.conversations?.length || 0,
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur récupération conversations:', error);
    throw error;
  }
};

/**
 * Ajoute une conversation à une session
 */
export const addConversation = async (tenantSlug, sessionId, conversationData) => {
  try {
    const url = buildApiUrl(API_ENDPOINTS.sessions.conversations, { 
      tenant: tenantSlug, 
      sessionId 
    });
    
    const response = await apiPost(url, {
      message: conversationData.message,
      type: conversationData.type || 'user',
      metadata: conversationData.metadata || {},
    });
    
    console.info('Conversation ajoutée:', {
      tenant: tenantSlug,
      sessionId,
      conversationId: response.data?.id,
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur ajout conversation:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de l\'ajout');
  }
};

/**
 * Recherche dans les sessions
 */
export const searchSessions = async (tenantSlug, searchQuery, filters = {}) => {
  try {
    const url = buildApiUrl(API_ENDPOINTS.sessions.list, { tenant: tenantSlug });
    
    const response = await apiGet(url, {
      params: {
        search: searchQuery,
        ...filters,
        page: filters.page || 1,
        limit: filters.limit || 20,
      }
    });
    
    console.debug('Recherche sessions:', {
      tenant: tenantSlug,
      query: searchQuery,
      count: response.data?.sessions?.length || 0,
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur recherche sessions:', error);
    throw error;
  }
};

/**
 * Archive/désarchive une session
 */
export const toggleSessionArchive = async (tenantSlug, sessionId, archived = true) => {
  try {
    return await updateSession(tenantSlug, sessionId, { 
      archived,
      archived_at: archived ? new Date().toISOString() : null,
    });
  } catch (error) {
    console.error('Erreur archivage session:', error);
    throw error;
  }
};