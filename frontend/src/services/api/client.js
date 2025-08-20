/**
 * Client HTTP centralisé pour WikiPro
 * Gère toutes les requêtes API avec authentification et gestion d'erreurs
 */

import axios from 'axios';
import { API_CONFIG, DEFAULT_HEADERS, RETRY_CONFIG } from './config';
import { 
  getAccessToken, 
  getRefreshToken, 
  getStoredTenant,
  updateAccessToken,
  clearAuthData,
  isTokenExpired 
} from '../storage/authStorage';

// Variable globale pour éviter les appels multiples de refresh
let isRefreshing = false;
let failedQueue = [];

/**
 * Traite la queue des requêtes en attente après refresh du token
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Instance axios configurée
 */
const apiClient = axios.create({
  baseURL: `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}`,
  timeout: API_CONFIG.TIMEOUT,
  headers: DEFAULT_HEADERS,
});

/**
 * Intercepteur de requête - Ajoute le token et le tenant
 */
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    const tenant = getStoredTenant();
    
    // Ajout du token d'authentification
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    
    // Injection du tenant slug dans l'URL
    if (tenant?.slug && config.url.includes('/:tenant')) {
      config.url = config.url.replace('/:tenant', `/${tenant.slug}`);
    }
    
    console.debug('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      tenant: tenant?.slug,
      hasAuth: !!accessToken,
    });
    
    return config;
  },
  (error) => {
    console.error('Erreur intercepteur requête:', error);
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponse - Gère le refresh du token et les erreurs
 */
apiClient.interceptors.response.use(
  (response) => {
    console.debug('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data ? Object.keys(response.data) : 'empty',
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message,
    });
    
    // Gestion du token expiré (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si un refresh est déjà en cours, ajouter à la queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        try {
          // Tentative de refresh du token
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}/auth/refresh`,
            { refresh_token: refreshToken },
            { headers: DEFAULT_HEADERS }
          );
          
          const { access_token, expires_in } = response.data;
          
          // Mise à jour du token
          updateAccessToken(access_token, expires_in);
          
          // Traitement de la queue
          processQueue(null, access_token);
          
          // Relance de la requête originale
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
          
        } catch (refreshError) {
          console.error('Erreur refresh token:', refreshError);
          
          // Échec du refresh - déconnexion
          processQueue(refreshError, null);
          clearAuthData();
          
          // Redirection vers login (sera géré par le contexte Auth)
          window.dispatchEvent(new CustomEvent('auth:logout', {
            detail: { reason: 'token_refresh_failed' }
          }));
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Pas de refresh token - déconnexion immédiate
        clearAuthData();
        window.dispatchEvent(new CustomEvent('auth:logout', {
          detail: { reason: 'no_refresh_token' }
        }));
      }
    }
    
    // Gestion des autres erreurs
    if (error.response?.status === 403) {
      // Accès interdit
      window.dispatchEvent(new CustomEvent('auth:forbidden', {
        detail: { url: error.config?.url }
      }));
    }
    
    // Gestion retry pour les erreurs serveur
    if (RETRY_CONFIG.retryCondition(error) && !originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }
    
    if (originalRequest._retryCount < RETRY_CONFIG.retryDelay && 
        RETRY_CONFIG.retryCondition(error)) {
      originalRequest._retryCount++;
      
      const delay = RETRY_CONFIG.retryDelay(originalRequest._retryCount - 1);
      console.warn(`Retry ${originalRequest._retryCount}/3 dans ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helpers pour les requêtes communes
 */
export const apiGet = (url, config = {}) => {
  return apiClient.get(url, config);
};

export const apiPost = (url, data = {}, config = {}) => {
  return apiClient.post(url, data, config);
};

export const apiPut = (url, data = {}, config = {}) => {
  return apiClient.put(url, data, config);
};

export const apiPatch = (url, data = {}, config = {}) => {
  return apiClient.patch(url, data, config);
};

export const apiDelete = (url, config = {}) => {
  return apiClient.delete(url, config);
};

/**
 * Fonction utilitaire pour construire les URLs avec paramètres
 */
export const buildApiUrl = (endpoint, params = {}) => {
  let url = endpoint;
  
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });
  
  return url;
};

/**
 * Fonction pour vérifier la santé de l'API
 */
export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.error('API non disponible:', error);
    return false;
  }
};

export default apiClient;