/**
 * AuthGuard - Composant de protection des routes
 * Gère l'accès aux composants nécessitant une authentification
 */

import React from 'react';
import { useAuth } from '../../hooks/api/useAuth';
import LoadingState from './LoadingState';

/**
 * Composant de login simple
 */
const LoginPrompt = ({ onRetry }) => (
  <div className="auth-guard-login">
    <div className="auth-guard-content">
      <div className="auth-guard-icon">
        <i className="fas fa-shield-alt"></i>
      </div>
      <h2>Authentification requise</h2>
      <p>Vous devez être connecté pour accéder à cette page.</p>
      <button 
        className="btn-primary"
        onClick={onRetry}
        type="button"
      >
        <i className="fas fa-sign-in-alt"></i>
        Se connecter
      </button>
    </div>
  </div>
);

/**
 * Composant d'erreur d'authentification
 */
const AuthError = ({ error, onRetry }) => (
  <div className="auth-guard-error">
    <div className="auth-guard-content">
      <div className="auth-guard-icon error">
        <i className="fas fa-exclamation-triangle"></i>
      </div>
      <h2>Erreur d'authentification</h2>
      <p>{error || 'Une erreur est survenue lors de la vérification de votre authentification.'}</p>
      <div className="auth-guard-actions">
        <button 
          className="btn-primary"
          onClick={onRetry}
          type="button"
        >
          <i className="fas fa-redo"></i>
          Réessayer
        </button>
      </div>
    </div>
  </div>
);

/**
 * Composant principal AuthGuard
 */
const AuthGuard = ({ 
  children, 
  fallback = null, 
  showLogin = true,
  requirePermissions = [],
  requireRoles = [],
  requireAll = true, // true = AND logic, false = OR logic
  onUnauthorized = null,
  redirectTo = null,
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    error, 
    user,
    hasPermission,
    hasRole,
    clearError
  } = useAuth();

  // Gestion du chargement
  if (isLoading) {
    return fallback || <LoadingState message="Vérification de l'authentification..." />;
  }

  // Gestion des erreurs d'authentification
  if (error && !isAuthenticated) {
    return (
      <AuthError 
        error={error}
        onRetry={() => {
          clearError();
          window.location.reload();
        }}
      />
    );
  }

  // Vérification de l'authentification de base
  if (!isAuthenticated) {
    // Redirection si spécifiée
    if (redirectTo) {
      window.location.href = redirectTo;
      return <LoadingState message="Redirection..." />;
    }

    // Callback personnalisé pour unauthorized
    if (onUnauthorized) {
      return onUnauthorized();
    }

    // Affichage du prompt de connexion
    if (showLogin) {
      return (
        <LoginPrompt 
          onRetry={() => window.location.reload()} 
        />
      );
    }

    // Fallback personnalisé
    return fallback;
  }

  // Vérification des permissions
  if (requirePermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? requirePermissions.every(permission => hasPermission(permission))
      : requirePermissions.some(permission => hasPermission(permission));

    if (!hasRequiredPermissions) {
      return (
        <div className="auth-guard-forbidden">
          <div className="auth-guard-content">
            <div className="auth-guard-icon error">
              <i className="fas fa-ban"></i>
            </div>
            <h2>Accès non autorisé</h2>
            <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            <p><strong>Permissions requises:</strong> {requirePermissions.join(requireAll ? ' ET ' : ' OU ')}</p>
          </div>
        </div>
      );
    }
  }

  // Vérification des rôles
  if (requireRoles.length > 0) {
    const hasRequiredRoles = requireAll
      ? requireRoles.every(role => hasRole(role))
      : requireRoles.some(role => hasRole(role));

    if (!hasRequiredRoles) {
      return (
        <div className="auth-guard-forbidden">
          <div className="auth-guard-content">
            <div className="auth-guard-icon error">
              <i className="fas fa-user-slash"></i>
            </div>
            <h2>Accès non autorisé</h2>
            <p>Votre rôle ne vous permet pas d'accéder à cette page.</p>
            <p><strong>Rôles requis:</strong> {requireRoles.join(requireAll ? ' ET ' : ' OU ')}</p>
          </div>
        </div>
      );
    }
  }

  // Utilisateur authentifié et autorisé
  return children;
};

/**
 * HOC pour protéger les composants
 */
export const withAuthGuard = (Component, guardOptions = {}) => {
  return function GuardedComponent(props) {
    return (
      <AuthGuard {...guardOptions}>
        <Component {...props} />
      </AuthGuard>
    );
  };
};

/**
 * Hook pour vérifier l'autorisation sans rendu conditionnel
 */
export const useAuthGuard = (options = {}) => {
  const {
    requirePermissions = [],
    requireRoles = [],
    requireAll = true,
  } = options;

  const { 
    isAuthenticated, 
    isLoading, 
    hasPermission,
    hasRole 
  } = useAuth();

  const hasRequiredPermissions = requirePermissions.length === 0 || (
    requireAll
      ? requirePermissions.every(permission => hasPermission(permission))
      : requirePermissions.some(permission => hasPermission(permission))
  );

  const hasRequiredRoles = requireRoles.length === 0 || (
    requireAll
      ? requireRoles.every(role => hasRole(role))
      : requireRoles.some(role => hasRole(role))
  );

  return {
    isAuthenticated,
    isLoading,
    isAuthorized: isAuthenticated && hasRequiredPermissions && hasRequiredRoles,
    hasPermissions: hasRequiredPermissions,
    hasRoles: hasRequiredRoles,
  };
};

/**
 * Composant pour affichage conditionnel basé sur les permissions
 */
export const PermissionGate = ({ 
  permissions = [], 
  roles = [],
  requireAll = true,
  fallback = null,
  children 
}) => {
  const { isAuthorized } = useAuthGuard({
    requirePermissions: permissions,
    requireRoles: roles,
    requireAll,
  });

  return isAuthorized ? children : fallback;
};

export default AuthGuard;