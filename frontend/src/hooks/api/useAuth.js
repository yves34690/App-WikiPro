/**
 * Hook d'authentification - WikiPro
 * Wrapper autour du context d'authentification avec fonctionnalités étendues
 */

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth as useAuthContext } from '../../contexts/AuthContext';
import { getUserProfile, validateSession } from '../../services/api/auth';
import { QUERY_KEYS } from '../../services/api/config';

/**
 * Hook principal d'authentification
 */
export const useAuth = () => {
  return useAuthContext();
};

/**
 * Hook pour la mutation de connexion
 */
export const useLogin = (options = {}) => {
  const { login } = useAuthContext();
  
  return useMutation({
    mutationFn: ({ email, password, tenantSlug }) => 
      login(email, password, tenantSlug),
    
    onSuccess: (data, variables, context) => {
      console.info('Connexion réussie via hook');
      options.onSuccess?.(data, variables, context);
    },
    
    onError: (error, variables, context) => {
      console.error('Erreur connexion via hook:', error);
      options.onError?.(error, variables, context);
    },
    
    ...options,
  });
};

/**
 * Hook pour la mutation de déconnexion
 */
export const useLogout = (options = {}) => {
  const { logout } = useAuthContext();
  
  return useMutation({
    mutationFn: (serverLogout = true) => logout(serverLogout),
    
    onSuccess: (data, variables, context) => {
      console.info('Déconnexion réussie via hook');
      options.onSuccess?.(data, variables, context);
    },
    
    onError: (error, variables, context) => {
      console.error('Erreur déconnexion via hook:', error);
      options.onError?.(error, variables, context);
    },
    
    ...options,
  });
};

/**
 * Hook pour récupérer le profil utilisateur
 */
export const useProfile = (options = {}) => {
  const { isAuthenticated, user } = useAuthContext();
  
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: getUserProfile,
    enabled: isAuthenticated && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    onSuccess: (data) => {
      console.debug('Profil récupéré via hook');
      options.onSuccess?.(data);
    },
    
    onError: (error) => {
      console.error('Erreur récupération profil via hook:', error);
      options.onError?.(error);
    },
    
    ...options,
  });
};

/**
 * Hook pour valider la session
 */
export const useSessionValidation = (options = {}) => {
  const { isAuthenticated } = useAuthContext();
  
  return useQuery({
    queryKey: ['auth', 'validate'],
    queryFn: validateSession,
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Vérifier toutes les 5 minutes
    
    onSuccess: (data) => {
      if (!data.isValid) {
        console.warn('Session invalidée:', data.error);
      }
      options.onSuccess?.(data);
    },
    
    onError: (error) => {
      console.error('Erreur validation session:', error);
      options.onError?.(error);
    },
    
    ...options,
  });
};

/**
 * Hook pour les formulaires de connexion
 */
export const useLoginForm = (initialValues = {}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantSlug: 'demo-company', // Valeur par défaut
    rememberMe: false,
    ...initialValues,
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const loginMutation = useLogin({
    onSuccess: () => {
      setIsSubmitting(false);
      setFormErrors({});
    },
    onError: (error) => {
      setIsSubmitting(false);
      setFormErrors({
        general: error.message || 'Erreur de connexion',
      });
    },
  });

  /**
   * Met à jour un champ du formulaire
   */
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Efface l'erreur du champ modifié
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [formErrors]);

  /**
   * Valide le formulaire
   */
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (!formData.tenantSlug) {
      errors.tenantSlug = 'Le tenant est requis';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  /**
   * Soumet le formulaire
   */
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await loginMutation.mutateAsync({
        email: formData.email,
        password: formData.password,
        tenantSlug: formData.tenantSlug,
      });
    } catch (error) {
      // L'erreur est déjà gérée dans onError
    }
  }, [formData, validateForm, loginMutation]);

  /**
   * Réinitialise le formulaire
   */
  const resetForm = useCallback(() => {
    setFormData({
      email: '',
      password: '',
      tenantSlug: 'demo-company',
      rememberMe: false,
      ...initialValues,
    });
    setFormErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    // Données du formulaire
    formData,
    formErrors,
    isSubmitting: isSubmitting || loginMutation.isPending,
    
    // Actions
    updateField,
    handleSubmit,
    resetForm,
    validateForm,
    
    // État de la mutation
    isLoading: loginMutation.isPending,
    isError: loginMutation.isError,
    isSuccess: loginMutation.isSuccess,
    error: loginMutation.error,
  };
};

/**
 * Hook pour les permissions et rôles
 */
export const usePermissions = () => {
  const { user, hasPermission, hasRole } = useAuthContext();
  
  /**
   * Vérifie si l'utilisateur a toutes les permissions spécifiées
   */
  const hasAllPermissions = useCallback((permissions) => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);
  
  /**
   * Vérifie si l'utilisateur a au moins une des permissions spécifiées
   */
  const hasAnyPermission = useCallback((permissions) => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);
  
  /**
   * Vérifie si l'utilisateur a tous les rôles spécifiés
   */
  const hasAllRoles = useCallback((roles) => {
    return roles.every(role => hasRole(role));
  }, [hasRole]);
  
  /**
   * Vérifie si l'utilisateur a au moins un des rôles spécifiés
   */
  const hasAnyRole = useCallback((roles) => {
    return roles.some(role => hasRole(role));
  }, [hasRole]);
  
  /**
   * Vérifie si l'utilisateur est administrateur
   */
  const isAdmin = useCallback(() => {
    return hasRole('admin') || hasRole('super_admin');
  }, [hasRole]);
  
  return {
    user,
    hasPermission,
    hasRole,
    hasAllPermissions,
    hasAnyPermission,
    hasAllRoles,
    hasAnyRole,
    isAdmin,
    permissions: user?.permissions || [],
    roles: user?.roles || [],
  };
};