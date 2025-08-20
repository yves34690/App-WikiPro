/**
 * Service de stockage pour l'authentification
 * Gère la persistance des tokens JWT dans localStorage
 */

const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'wikipro_access_token',
  REFRESH_TOKEN: 'wikipro_refresh_token',
  USER: 'wikipro_user',
  TENANT: 'wikipro_tenant',
  EXPIRES_AT: 'wikipro_expires_at',
};

/**
 * Stocke les données d'authentification
 */
export const storeAuthData = (authData) => {
  try {
    const { access_token, refresh_token, user, tenant, expires_in } = authData;
    
    if (access_token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, access_token);
    }
    
    if (refresh_token) {
      localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
    }
    
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    }
    
    if (tenant) {
      localStorage.setItem(AUTH_STORAGE_KEYS.TENANT, JSON.stringify(tenant));
    }
    
    // Calcul de l'expiration si expires_in est fourni
    if (expires_in) {
      const expiresAt = Date.now() + (expires_in * 1000);
      localStorage.setItem(AUTH_STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
    }
  } catch (error) {
    console.error('Erreur lors du stockage des données d\'authentification:', error);
  }
};

/**
 * Récupère le token d'accès stocké
 */
export const getAccessToken = () => {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Erreur lors de la récupération du token d\'accès:', error);
    return null;
  }
};

/**
 * Récupère le token de refresh stocké
 */
export const getRefreshToken = () => {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Erreur lors de la récupération du refresh token:', error);
    return null;
  }
};

/**
 * Récupère les données utilisateur stockées
 */
export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    return null;
  }
};

/**
 * Récupère les données tenant stockées
 */
export const getStoredTenant = () => {
  try {
    const tenantData = localStorage.getItem(AUTH_STORAGE_KEYS.TENANT);
    return tenantData ? JSON.parse(tenantData) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération des données tenant:', error);
    return null;
  }
};

/**
 * Vérifie si le token est expiré
 */
export const isTokenExpired = () => {
  try {
    const expiresAt = localStorage.getItem(AUTH_STORAGE_KEYS.EXPIRES_AT);
    if (!expiresAt) return false; // Si pas d'expiration définie, considère comme valide
    
    return Date.now() > parseInt(expiresAt);
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'expiration du token:', error);
    return true; // En cas d'erreur, considère comme expiré
  }
};

/**
 * Vérifie si l'utilisateur est authentifié
 */
export const isAuthenticated = () => {
  const accessToken = getAccessToken();
  const user = getStoredUser();
  const tenant = getStoredTenant();
  
  return !!(accessToken && user && tenant && !isTokenExpired());
};

/**
 * Met à jour uniquement le token d'accès (utile pour le refresh)
 */
export const updateAccessToken = (accessToken, expiresIn = null) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    
    if (expiresIn) {
      const expiresAt = Date.now() + (expiresIn * 1000);
      localStorage.setItem(AUTH_STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du token d\'accès:', error);
  }
};

/**
 * Supprime toutes les données d'authentification
 */
export const clearAuthData = () => {
  try {
    Object.values(AUTH_STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Erreur lors de la suppression des données d\'authentification:', error);
  }
};

/**
 * Récupère toutes les données d'authentification stockées
 */
export const getAuthData = () => {
  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
    user: getStoredUser(),
    tenant: getStoredTenant(),
    isAuthenticated: isAuthenticated(),
    isExpired: isTokenExpired(),
  };
};