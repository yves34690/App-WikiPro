/**
 * API Authentification - WikiPro
 * Gère toutes les requêtes liées à l'authentification
 */

import { apiPost, apiGet, buildApiUrl } from './client';
import { API_ENDPOINTS } from './config';
import { storeAuthData, clearAuthData } from '../storage/authStorage';

/**
 * Connexion utilisateur
 */
export const loginUser = async (email, password, tenantSlug) => {
  try {
    const response = await apiPost(API_ENDPOINTS.auth.login, {
      email,
      password,
      tenant_slug: tenantSlug,
    });

    const authData = response.data;
    
    // Stockage des données d'authentification
    storeAuthData(authData);
    
    console.info('Connexion réussie pour:', { 
      user: authData.user?.email, 
      tenant: authData.tenant?.slug 
    });
    
    return authData;
  } catch (error) {
    console.error('Erreur de connexion:', error);
    
    // Extraction du message d'erreur approprié
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        'Erreur de connexion';
    
    throw new Error(errorMessage);
  }
};

/**
 * Déconnexion utilisateur
 */
export const logoutUser = async () => {
  try {
    // Tentative de déconnexion côté serveur
    await apiPost(API_ENDPOINTS.auth.logout);
  } catch (error) {
    // En cas d'erreur, on continue quand même la déconnexion locale
    console.warn('Erreur lors de la déconnexion serveur:', error);
  } finally {
    // Nettoyage local obligatoire
    clearAuthData();
    console.info('Déconnexion effectuée');
  }
};

/**
 * Refresh du token d'authentification
 */
export const refreshAuthToken = async (refreshToken) => {
  try {
    const response = await apiPost(API_ENDPOINTS.auth.refresh, {
      refresh_token: refreshToken,
    });

    const { access_token, expires_in } = response.data;
    
    console.info('Token rafraîchi avec succès');
    
    return {
      access_token,
      expires_in,
    };
  } catch (error) {
    console.error('Erreur refresh token:', error);
    throw error;
  }
};

/**
 * Récupération du profil utilisateur
 */
export const getUserProfile = async () => {
  try {
    const response = await apiGet(API_ENDPOINTS.auth.profile);
    
    console.debug('Profil utilisateur récupéré');
    
    return response.data;
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    throw error;
  }
};

/**
 * Vérification de la validité de la session
 */
export const validateSession = async () => {
  try {
    const response = await apiGet(API_ENDPOINTS.auth.profile);
    return {
      isValid: true,
      user: response.data,
    };
  } catch (error) {
    console.error('Session invalide:', error);
    return {
      isValid: false,
      error: error.response?.data?.message || 'Session expirée',
    };
  }
};

/**
 * Demande de réinitialisation de mot de passe
 */
export const requestPasswordReset = async (email, tenantSlug) => {
  try {
    const response = await apiPost('/auth/password/reset-request', {
      email,
      tenant_slug: tenantSlug,
    });
    
    console.info('Demande de réinitialisation envoyée');
    
    return response.data;
  } catch (error) {
    console.error('Erreur demande réinitialisation:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la demande');
  }
};

/**
 * Réinitialisation du mot de passe
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await apiPost('/auth/password/reset', {
      token,
      new_password: newPassword,
    });
    
    console.info('Mot de passe réinitialisé');
    
    return response.data;
  } catch (error) {
    console.error('Erreur réinitialisation mot de passe:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la réinitialisation');
  }
};

/**
 * Changement de mot de passe (utilisateur connecté)
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await apiPost('/auth/password/change', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    
    console.info('Mot de passe modifié');
    
    return response.data;
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors du changement');
  }
};