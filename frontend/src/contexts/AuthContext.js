/**
 * Context d'authentification pour WikiPro
 * Gère l'état global de l'authentification et l'utilisateur connecté
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

// Types d'actions pour le reducer
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// État initial
const initialState = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  token: localStorage.getItem('wikipro_token'),
};

// Reducer pour gérer les actions d'authentification
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.accessToken,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        token: null,
        error: null,
      };
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
}

// Création du contexte
const AuthContext = createContext();

// Provider d'authentification
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Vérification de l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('wikipro_token');
      if (token) {
        try {
          apiService.setToken(token);
          const user = await apiService.getProfile();
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
        } catch (error) {
          // Token invalide, on nettoie
          localStorage.removeItem('wikipro_token');
          apiService.setToken(null);
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      }
    };

    checkAuth();
  }, []);

  // Méthodes d'authentification
  const login = async (username, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await apiService.login(username, password);
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_SUCCESS, 
        payload: response 
      });
      return response;
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_ERROR, 
        payload: error.message 
      });
      throw error;
    }
  };

  const logout = async () => {
    await apiService.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const refreshToken = async (refreshToken) => {
    try {
      const response = await apiService.refreshTokens(refreshToken);
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_SUCCESS, 
        payload: response 
      });
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      throw error;
    }
  };

  const value = {
    ...state,
    login,
    logout,
    clearError,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;