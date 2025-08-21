/**
 * Composant de formulaire de connexion avec React Query et Context
 * Interface unifiée pour l'authentification WikiPro
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLoginMutation, useConnectionStatus } from '../../hooks/useApi';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({
    username: 'admin',
    password: 'adminpassword'
  });
  
  const { isAuthenticated, user, error } = useAuth();
  const loginMutation = useLoginMutation();
  const connectionStatus = useConnectionStatus();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync(credentials);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Indicateur de statut de connexion
  const ConnectionIndicator = () => (
    <div className="connection-status">
      <div className={`status-indicator ${connectionStatus.overall}`}>
        <div className="status-dot"></div>
        <span>Backend: {connectionStatus.backend.status}</span>
      </div>
      <div className="connection-details">
        <small>
          Auth: {connectionStatus.auth.status} | 
          Sync: {connectionStatus.backend.isLoading ? 'loading...' : 'ready'}
        </small>
      </div>
    </div>
  );

  if (isAuthenticated && user) {
    return (
      <div className="auth-success">
        <h3>✅ Authentification réussie</h3>
        <div className="user-info">
          <p><strong>Utilisateur:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Tenant:</strong> {user.tenantId}</p>
          <p><strong>Rôles:</strong> {user.roles?.join(', ') || 'N/A'}</p>
        </div>
        <ConnectionIndicator />
        <div className="query-status">
          <p><strong>React Query Status:</strong></p>
          <ul>
            <li>Profile Query: Active</li>
            <li>Dashboard Cache: Ready</li>
            <li>Backend Health: {connectionStatus.backend.status}</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="login-form">
      <h3>🔐 Authentification WikiPro</h3>
      
      <ConnectionIndicator />
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Nom d'utilisateur:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={credentials.username}
            onChange={handleInputChange}
            disabled={loginMutation.isPending}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Mot de passe:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            disabled={loginMutation.isPending}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loginMutation.isPending || connectionStatus.backend.status === 'disconnected'}
          className="btn-primary"
        >
          {loginMutation.isPending ? '🔄 Connexion...' : '🚀 Se connecter'}
        </button>
      </form>
      
      {error && (
        <div className="error-message">
          <p>❌ Erreur: {error}</p>
        </div>
      )}
      
      {loginMutation.error && (
        <div className="error-message">
          <p>❌ Mutation Error: {loginMutation.error.message}</p>
        </div>
      )}
      
      <div className="debug-info">
        <h4>🔧 Debug Info</h4>
        <ul>
          <li>Backend Status: {connectionStatus.backend.status}</li>
          <li>Auth Status: {connectionStatus.auth.status}</li>
          <li>Mutation Status: {loginMutation.status}</li>
          <li>Connection Overall: {connectionStatus.overall}</li>
        </ul>
      </div>
    </div>
  );
};

export default LoginForm;