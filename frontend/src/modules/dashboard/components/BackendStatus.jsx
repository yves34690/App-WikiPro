import React from 'react';
import { useConnectionStatus, useDashboardData, useSyncStatus } from '../../../hooks/useApi';
import LoginForm from '../../../components/auth/LoginForm';

/**
 * Composant de test de connectivité avec le backend
 * Utilise React Query et Context API pour la gestion d'état
 */
const BackendStatus = () => {
  const connectionStatus = useConnectionStatus();
  const dashboardData = useDashboardData();
  const syncStatus = useSyncStatus();

  return (
    <div className="backend-status-widget">
      <div className="widget-header">
        <h3>🔗 Intégration Frontend-Backend (React Query + Context)</h3>
        <div className="widget-actions">
          <div className="sync-indicator">
            {syncStatus.isSyncing && <span className="syncing">🔄 Synchronisation...</span>}
            {!syncStatus.isSyncing && <span className="idle">✨ Synchronisé</span>}
          </div>
        </div>
      </div>

      <div className="status-grid">
        {/* Backend Health */}
        <div className="status-card">
          <div className="status-header">
            <h4>Backend API</h4>
            <span className={`status-badge ${connectionStatus.backend.status === 'connected' ? 'status-success' : 'status-error'}`}>
              {connectionStatus.backend.status === 'connected' ? '✅ OK' : '❌ KO'}
            </span>
          </div>
          {connectionStatus.backend.data && (
            <div className="status-details">
              <p><strong>Status:</strong> {connectionStatus.backend.data.status}</p>
              <p><strong>Version:</strong> {connectionStatus.backend.data.version}</p>
              <p><strong>URL:</strong> http://localhost:3001</p>
            </div>
          )}
          {connectionStatus.backend.isLoading && (
            <p className="loading">⏳ Connexion en cours...</p>
          )}
        </div>

        {/* Auth Service */}
        <div className="status-card">
          <div className="status-header">
            <h4>Service Auth</h4>
            <span className={`status-badge ${connectionStatus.auth.status === 'connected' ? 'status-success' : 'status-error'}`}>
              {connectionStatus.auth.status === 'connected' ? '✅ OK' : '❌ KO'}
            </span>
          </div>
          {connectionStatus.auth.data && (
            <div className="status-details">
              <p><strong>Service:</strong> {connectionStatus.auth.data.service}</p>
              <p><strong>JWT:</strong> Opérationnel</p>
            </div>
          )}
        </div>

        {/* React Query Stats */}
        <div className="status-card">
          <div className="status-header">
            <h4>React Query</h4>
            <span className="status-badge status-info">
              📊 {syncStatus.activeQueries}/{syncStatus.totalQueries}
            </span>
          </div>
          <div className="status-details">
            <p><strong>Queries actives:</strong> {syncStatus.activeQueries}</p>
            <p><strong>Cache total:</strong> {syncStatus.totalQueries}</p>
            <p><strong>Fetching:</strong> {syncStatus.isFetching ? '🔄' : '✅'}</p>
            <p><strong>Mutations:</strong> {syncStatus.isMutating ? '⚡' : '💤'}</p>
          </div>
        </div>

        {/* Dashboard Data Preview */}
        {dashboardData.data && (
          <div className="status-card">
            <div className="status-header">
              <h4>Dashboard Data</h4>
              <span className="status-badge status-success">✅ Loaded</span>
            </div>
            <div className="status-details">
              <p><strong>Études:</strong> {dashboardData.data.kpis?.totalEtudes}</p>
              <p><strong>Mots-clés:</strong> {dashboardData.data.kpis?.motsCles}</p>
              <p><strong>Backend Status:</strong> {dashboardData.data.backendStatus?.status}</p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {(connectionStatus.backend.error || connectionStatus.auth.error) && (
          <div className="status-card status-error-card">
            <div className="status-header">
              <h4>❌ Erreur de connexion</h4>
            </div>
            <div className="error-details">
              {connectionStatus.backend.error && (
                <p><strong>Backend:</strong> {connectionStatus.backend.error.message}</p>
              )}
              {connectionStatus.auth.error && (
                <p><strong>Auth:</strong> {connectionStatus.auth.error.message}</p>
              )}
              <small>Vérifiez que le backend est démarré sur le port 3001</small>
            </div>
          </div>
        )}
      </div>

      {/* Formulaire d'authentification intégré */}
      <div className="auth-section">
        <LoginForm />
      </div>
    </div>
  );
};

export default BackendStatus;