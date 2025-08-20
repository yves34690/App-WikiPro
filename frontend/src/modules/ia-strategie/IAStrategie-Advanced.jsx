/**
 * Module IAStrategie Advanced - Interface complète avec streaming multi-providers - WikiPro
 * Version avancée avec chat temps réel, sélection providers et historique
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  LoadingState, 
  ErrorState,
  AuthGuard,
  PermissionGate,
} from '../../components/common';
import { 
  useSessions, 
  useCreateSession, 
  useTenantData 
} from '../../hooks/api';
import { useProviderSelection } from './hooks/useProviderSelection';
import { useAIChat } from './hooks/useAIChat';
import { useConversations } from './hooks/useConversations';
import {
  ProviderSelector,
  StreamingChat,
  ConversationHistory,
  ProviderMetrics
} from './components';

// Import des styles
import './styles/ai-strategie-advanced.css';

/**
 * Composant de liste des sessions (amélioré)
 */
const SessionsList = ({ 
  onSelectSession, 
  selectedSessionId, 
  onCreateNew,
  showMetrics = false 
}) => {
  const { 
    data: sessionsData, 
    isLoading, 
    error, 
    refetch 
  } = useSessions({ 
    limit: 20, 
    sort: 'updated_at', 
    order: 'desc' 
  });

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-16)' }}>
        <LoadingState type="skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Erreur sessions"
        message="Impossible de charger les sessions"
        onRetry={refetch}
      />
    );
  }

  const sessions = sessionsData?.sessions || [];

  return (
    <div className="sessions-list custom-scrollbar" style={{ 
      height: '100%', 
      overflow: 'auto',
      padding: 'var(--space-12)'
    }}>
      {/* Header avec bouton nouveau */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-16)',
        padding: 'var(--space-12)',
        background: 'var(--color-bg-subtle)',
        borderRadius: '8px'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: 'var(--font-size-base)',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-8)'
        }}>
          <i className="fas fa-history"></i>
          Sessions ({sessions.length})
        </h3>
        
        <button
          onClick={onCreateNew}
          style={{
            background: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: 'var(--font-size-xs)',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease'
          }}
        >
          <i className="fas fa-plus"></i>
          Nouveau
        </button>
      </div>

      {/* Liste des sessions */}
      {sessions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-24)',
          color: 'var(--color-text-secondary)'
        }}>
          <i className="fas fa-comments" style={{ 
            fontSize: '32px', 
            marginBottom: '12px',
            opacity: 0.5 
          }}></i>
          <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
            Aucune session
          </p>
          <button
            onClick={onCreateNew}
            style={{
              marginTop: 'var(--space-8)',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)'
            }}
          >
            Créer la première session
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {sessions.map(session => {
            const isSelected = selectedSessionId === session.id;
            const hasConversations = (session.conversations_count || 0) > 0;
            
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session)}
                className={`session-item hover-lift ${isSelected ? 'selected' : ''}`}
                style={{
                  padding: 'var(--space-12)',
                  border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: '8px',
                  background: isSelected 
                    ? 'var(--color-primary)08' 
                    : 'var(--color-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Header de la session */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--space-8)'
                }}>
                  <h4 style={{ 
                    margin: 0,
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '600',
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.4,
                    flex: 1,
                    paddingRight: 'var(--space-8)'
                  }}>
                    {session.title || 'Session sans titre'}
                  </h4>
                  
                  {isSelected && (
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--color-primary)',
                      flexShrink: 0,
                      marginTop: '6px'
                    }} />
                  )}
                </div>

                {/* Description si disponible */}
                {session.description && (
                  <p style={{
                    margin: '0 0 var(--space-8) 0',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {session.description}
                  </p>
                )}

                {/* Métadonnées */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                    <span>
                      <i className="fas fa-comment" style={{ marginRight: '4px' }}></i>
                      {session.conversations_count || 0}
                    </span>
                    
                    {hasConversations && showMetrics && (
                      <span>
                        <i className="fas fa-clock" style={{ marginRight: '4px' }}></i>
                        {new Date(session.updated_at).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                  
                  <span>
                    {new Date(session.updated_at).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {/* Indicateur actif */}
                {hasConversations && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#22c55e'
                  }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Formulaire de création de session (amélioré)
 */
const CreateSessionForm = ({ onSessionCreated, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const createSessionMutation = useCreateSession({
    onSuccess: (newSession) => {
      onSessionCreated(newSession);
      setTitle('');
      setDescription('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createSessionMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      type: 'ia-strategy-advanced',
      metadata: {
        version: '2.0',
        features: ['streaming', 'multi-provider', 'advanced-ui']
      }
    });
  };

  return (
    <div className="create-session-form animate-fade-in" style={{ 
      padding: 'var(--space-16)' 
    }}>
      <h3 style={{
        margin: '0 0 var(--space-16) 0',
        fontSize: 'var(--font-size-base)',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-8)'
      }}>
        <i className="fas fa-plus"></i>
        Nouvelle session
      </h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: 'var(--font-size-xs)',
            fontWeight: '500',
            marginBottom: 'var(--space-4)',
            color: 'var(--color-text-secondary)'
          }}>
            Titre de la session *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Analyse stratégique Q4 2024"
            required
            disabled={createSessionMutation.isPending}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: 'var(--font-size-sm)',
              background: 'var(--color-surface)'
            }}
          />
        </div>
        
        <div>
          <label style={{
            display: 'block',
            fontSize: 'var(--font-size-xs)',
            fontWeight: '500',
            marginBottom: 'var(--space-4)',
            color: 'var(--color-text-secondary)'
          }}>
            Description (optionnel)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description de la session..."
            rows="3"
            disabled={createSessionMutation.isPending}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: 'var(--font-size-sm)',
              background: 'var(--color-surface)',
              resize: 'vertical'
            }}
          />
        </div>
        
        {createSessionMutation.error && (
          <div style={{
            padding: 'var(--space-8)',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: 'var(--font-size-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)'
          }}>
            <i className="fas fa-exclamation-circle"></i>
            {createSessionMutation.error.message}
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          gap: 'var(--space-8)',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={createSessionMutation.isPending}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)'
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={createSessionMutation.isPending || !title.trim()}
            style={{
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: createSessionMutation.isPending || !title.trim() ? 'not-allowed' : 'pointer',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500',
              opacity: createSessionMutation.isPending || !title.trim() ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-6)'
            }}
          >
            {createSessionMutation.isPending ? (
              <>
                <div className="loading-spinner small" />
                Création...
              </>
            ) : (
              <>
                <i className="fas fa-plus"></i>
                Créer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * Composant principal IAStrategie Advanced
 */
const IAStrategieAdvanced = () => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeView, setActiveView] = useState('chat'); // 'chat' | 'history' | 'metrics'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Hooks
  const { data: tenantData } = useTenantData();
  const {
    selectedProvider,
    selectProvider,
    notifications: providerNotifications,
    removeNotification
  } = useProviderSelection();

  // Gestion de la sélection de session
  const handleSelectSession = useCallback((session) => {
    setSelectedSession(session);
    setShowCreateForm(false);
  }, []);

  // Gestion de création de session
  const handleSessionCreated = useCallback((newSession) => {
    setSelectedSession(newSession);
    setShowCreateForm(false);
  }, []);

  // Gestion du changement de provider
  const handleProviderChange = useCallback((providerId) => {
    selectProvider(providerId);
  }, [selectProvider]);

  // Raccourcis clavier globaux
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+N : Nouvelle session
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        setShowCreateForm(true);
      }
      
      // Ctrl+Shift+H : Basculer historique
      if (e.ctrlKey && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        setActiveView(activeView === 'history' ? 'chat' : 'history');
      }
      
      // Ctrl+Shift+M : Basculer métriques
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        setActiveView(activeView === 'metrics' ? 'chat' : 'metrics');
      }
      
      // Ctrl+Shift+S : Basculer sidebar
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, sidebarCollapsed]);

  // Calcul des connecteurs de données
  const dataConnectors = React.useMemo(() => {
    if (!tenantData) return {};
    
    return {
      references: `${tenantData.references?.length || 0} références d'études`,
      competences: `${tenantData.competences?.length || 0} compétences`,
      poles: `${tenantData.poles?.labels?.length || 0} pôles d'expertise`,
      budget: tenantData.references ? 
        `Budget: ${Math.round(tenantData.references.reduce((acc, r) => 
          acc + parseInt(r.budget?.replace(/[€\s]/g, '') || '0'), 0) / 1000)}K€` 
        : 'Budget N/A'
    };
  }, [tenantData]);

  return (
    <AuthGuard requirePermissions={['ai:use']} requireAll={false}>
      <div className="ia-strategie-advanced" style={{ 
        height: '100vh', 
        display: 'flex', 
        backgroundColor: 'var(--color-bg-subtle)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        
        {/* Sidebar des sessions */}
        <div style={{ 
          width: sidebarCollapsed ? '60px' : '320px',
          backgroundColor: 'var(--color-surface)', 
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease',
          overflow: 'hidden'
        }}>
          {/* Header sidebar */}
          <div style={{ 
            padding: 'var(--space-12)', 
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '60px'
          }}>
            {!sidebarCollapsed && (
              <h2 style={{ 
                margin: 0, 
                fontSize: 'var(--font-size-lg)', 
                fontWeight: '600',
                color: 'var(--color-text-primary)'
              }}>
                IA Studio
              </h2>
            )}
            
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
            >
              <i className={`fas fa-${sidebarCollapsed ? 'chevron-right' : 'chevron-left'}`}></i>
            </button>
          </div>

          {/* Contenu sidebar */}
          {!sidebarCollapsed && (
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {showCreateForm ? (
                <CreateSessionForm
                  onSessionCreated={handleSessionCreated}
                  onCancel={() => setShowCreateForm(false)}
                />
              ) : (
                <SessionsList
                  onSelectSession={handleSelectSession}
                  selectedSessionId={selectedSession?.id}
                  onCreateNew={() => setShowCreateForm(true)}
                  showMetrics={true}
                />
              )}
            </div>
          )}
        </div>

        {/* Zone principale */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header principal avec navigation */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-teal-400) 50%, var(--color-teal-600) 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background pattern */}
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)',
              pointerEvents: 'none'
            }}></div>

            <div style={{
              padding: 'var(--space-20)',
              position: 'relative',
              zIndex: 1
            }}>
              {/* Titre et session */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 'var(--space-16)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <i className="fas fa-brain" style={{ color: 'white', fontSize: '20px' }}></i>
                  </div>
                  
                  <div>
                    <h1 style={{
                      margin: '0',
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: '600',
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      letterSpacing: '-0.025em'
                    }}>
                      IA Studio Pro
                    </h1>
                    {selectedSession && (
                      <p style={{
                        margin: '0',
                        fontSize: 'var(--font-size-sm)',
                        color: 'rgba(255, 255, 255, 0.8)',
                      }}>
                        {selectedSession.title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Navigation des vues */}
                <div style={{ 
                  display: 'flex',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '4px',
                  backdropFilter: 'blur(10px)'
                }}>
                  {[
                    { id: 'chat', icon: 'fa-comments', label: 'Chat' },
                    { id: 'history', icon: 'fa-history', label: 'Historique' },
                    { id: 'metrics', icon: 'fa-chart-bar', label: 'Métriques' }
                  ].map(view => (
                    <button
                      key={view.id}
                      onClick={() => setActiveView(view.id)}
                      style={{
                        background: activeView === view.id 
                          ? 'rgba(255, 255, 255, 0.2)' 
                          : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <i className={`fas ${view.icon}`}></i>
                      {view.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Indicateurs de connexion données et provider */}
              <div style={{
                display: 'flex',
                gap: 'var(--space-8)',
                flexWrap: 'wrap'
              }}>
                {/* Provider actuel */}
                {selectedProvider && (
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontSize: 'var(--font-size-xs)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontWeight: '500'
                  }}>
                    🤖 {selectedProvider}
                  </span>
                )}
                
                {/* Connecteurs de données */}
                {Object.entries(dataConnectors).map(([key, value]) => (
                  <span key={key} style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    color: 'white',
                    fontSize: 'var(--font-size-xs)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contenu principal selon la vue active */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {!selectedSession && activeView === 'chat' ? (
              // État vide - pas de session sélectionnée
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                padding: 'var(--space-24)'
              }}>
                <div>
                  <i className="fas fa-robot" style={{ 
                    fontSize: '64px', 
                    marginBottom: '24px',
                    opacity: 0.3
                  }}></i>
                  <h3 style={{ 
                    margin: '0 0 12px 0', 
                    fontWeight: '500',
                    color: 'var(--color-text-primary)'
                  }}>
                    Sélectionnez ou créez une session
                  </h3>
                  <p style={{ margin: '0 0 24px 0', fontSize: 'var(--font-size-sm)' }}>
                    Commencez une nouvelle conversation IA ou continuez une session existante
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    style={{
                      background: 'var(--color-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '0 auto'
                    }}
                  >
                    <i className="fas fa-plus"></i>
                    Créer une nouvelle session
                  </button>
                </div>
              </div>
            ) : (
              // Interface selon la vue
              <>
                {activeView === 'chat' && selectedSession && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Sélecteur de provider */}
                    <div style={{ 
                      padding: 'var(--space-16)',
                      background: 'var(--color-surface)',
                      borderBottom: '1px solid var(--color-border)'
                    }}>
                      <ProviderSelector
                        onProviderChange={handleProviderChange}
                        layout="compact"
                        showFallbackToggle={true}
                        showNotifications={true}
                      />
                    </div>
                    
                    {/* Chat streaming */}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <StreamingChat
                        sessionId={selectedSession.id}
                        selectedProvider={selectedProvider}
                        onProviderChange={handleProviderChange}
                        enableMarkdown={true}
                        showConnectionStatus={true}
                      />
                    </div>
                  </div>
                )}

                {activeView === 'history' && (
                  <div style={{ flex: 1, overflow: 'hidden', padding: 'var(--space-16)' }}>
                    <ConversationHistory
                      sessionId={selectedSession?.id}
                      enableExport={true}
                      enableFilters={true}
                    />
                  </div>
                )}

                {activeView === 'metrics' && (
                  <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-16)' }}>
                    <ProviderMetrics
                      selectedProvider={selectedProvider}
                      onProviderSelect={handleProviderChange}
                      autoRefresh={true}
                      refreshInterval={30000}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Raccourcis clavier helper */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-text-secondary)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        display: 'none' // Affichable via CSS hover ou état
      }}>
        <div>Raccourcis: <kbd>Ctrl+Shift+N</kbd> Nouvelle session</div>
        <div><kbd>Ctrl+Shift+H</kbd> Historique • <kbd>Ctrl+Shift+M</kbd> Métriques</div>
      </div>
    </AuthGuard>
  );
};

export default IAStrategieAdvanced;