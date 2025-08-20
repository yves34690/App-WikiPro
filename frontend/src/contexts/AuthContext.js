/**
 * Context d'authentification - WikiPro
 * Gère l'état global d'authentification de l'application
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loginUser, logoutUser, getUserProfile } from '../services/api/auth';
import { 
  isAuthenticated, 
  getStoredUser, 
  getStoredTenant,
  clearAuthData 
} from '../services/api';

// Actions du reducer
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT_START: 'LOGOUT_START',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  SET_USER: 'SET_USER',
  SET_TENANT: 'SET_TENANT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  REFRESH_SESSION: 'REFRESH_SESSION',
};

// État initial
const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  tenant: null,
  error: null,
  isLoginLoading: false,
  isLogoutLoading: false,
};

// Reducer d'authentification
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoginLoading: true,
        error: null,
      };
      
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        isLoginLoading: false,
        user: action.payload.user,
        tenant: action.payload.tenant,
        error: null,
      };
      
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        isLoginLoading: false,
        user: null,
        tenant: null,
        error: action.payload.error,
      };
      
    case AUTH_ACTIONS.LOGOUT_START:
      return {
        ...state,
        isLogoutLoading: true,
        error: null,
      };
      
    case AUTH_ACTIONS.LOGOUT_SUCCESS:
      return {
        ...initialState,
        isLoading: false,
        isLogoutLoading: false,
      };
      
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
      };
      
    case AUTH_ACTIONS.SET_TENANT:
      return {
        ...state,
        tenant: action.payload.tenant,
      };
      
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };
      
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload.error,
      };
      
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
      
    case AUTH_ACTIONS.REFRESH_SESSION:
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user,
        tenant: action.payload.tenant,
      };
      
    default:
      return state;
  }
};

// Création du context
const AuthContext = createContext(null);

/**
 * Provider d'authentification
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialisation de l'état d'authentification
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = getStoredUser();
        const storedTenant = getStoredTenant();
        const authStatus = isAuthenticated();
        
        if (authStatus && storedUser && storedTenant) {
          // Vérification de la validité de la session côté serveur
          try {
            const profileData = await getUserProfile();
            dispatch({
              type: AUTH_ACTIONS.REFRESH_SESSION,
              payload: {
                isAuthenticated: true,
                user: profileData.user || storedUser,
                tenant: profileData.tenant || storedTenant,
              },
            });
          } catch (error) {
            console.warn('Session expirée ou invalide, déconnexion:', error);
            clearAuthData();
            dispatch({ type: AUTH_ACTIONS.LOGOUT_SUCCESS });
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.LOGOUT_SUCCESS });
        }
      } catch (error) {
        console.error('Erreur initialisation auth:', error);
        dispatch({ type: AUTH_ACTIONS.LOGOUT_SUCCESS });
      } finally {
        dispatch({ 
          type: AUTH_ACTIONS.SET_LOADING, 
          payload: { isLoading: false } 
        });
      }
    };

    initializeAuth();
  }, []);

  // Écoute des événements de déconnexion automatique
  useEffect(() => {
    const handleAutoLogout = (event) => {
      const { reason } = event.detail || {};
      console.warn('Déconnexion automatique:', reason);
      handleLogout(false); // false = pas de requête serveur
    };

    const handleForbidden = (event) => {
      const { url } = event.detail || {};
      console.warn('Accès interdit:', url);
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: { error: 'Accès non autorisé à cette ressource' },
      });
    };

    window.addEventListener('auth:logout', handleAutoLogout);
    window.addEventListener('auth:forbidden', handleForbidden);

    return () => {
      window.removeEventListener('auth:logout', handleAutoLogout);
      window.removeEventListener('auth:forbidden', handleForbidden);
    };
  }, []);

  /**
   * Fonction de connexion
   */
  const handleLogin = async (email, password, tenantSlug) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const authData = await loginUser(email, password, tenantSlug);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: authData.user,
          tenant: authData.tenant,
        },
      });

      console.info('Connexion réussie:', { 
        user: authData.user?.email, 
        tenant: authData.tenant?.slug 
      });

      return authData;
    } catch (error) {
      const errorMessage = error.message || 'Erreur de connexion';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });

      throw error;
    }
  };

  /**
   * Fonction de déconnexion
   */
  const handleLogout = async (serverLogout = true) => {
    if (serverLogout) {
      dispatch({ type: AUTH_ACTIONS.LOGOUT_START });
    }

    try {
      if (serverLogout) {
        await logoutUser();
      } else {
        clearAuthData();
      }
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT_SUCCESS });
      
      console.info('Déconnexion effectuée');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      // Même en cas d'erreur, on effectue la déconnexion locale
      dispatch({ type: AUTH_ACTIONS.LOGOUT_SUCCESS });
    }
  };

  /**
   * Fonction de mise à jour du profil
   */
  const updateUserProfile = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.SET_USER,
      payload: { user: { ...state.user, ...userData } },
    });
  };

  /**
   * Fonction de nettoyage des erreurs
   */
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  /**
   * Fonction de vérification de permission
   */
  const hasPermission = (permission) => {
    if (!state.user?.permissions) return false;
    return state.user.permissions.includes(permission);
  };

  /**
   * Fonction de vérification de rôle
   */
  const hasRole = (role) => {
    if (!state.user?.roles) return false;
    return state.user.roles.includes(role);
  };

  const value = {
    // État
    ...state,
    
    // Actions
    login: handleLogin,
    logout: handleLogout,
    updateUserProfile,
    clearError,
    
    // Utilitaires
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook pour utiliser le context d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  
  return context;
};

/**
 * HOC pour les composants nécessitant une authentification
 */
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return <div className="auth-loading">Chargement...</div>;
    }
    
    if (!isAuthenticated) {
      return <div className="auth-required">Authentification requise</div>;
    }
    
    return <Component {...props} />;
  };
};

export default AuthContext;