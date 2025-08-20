/**
 * Module IAStrategie avec intégration API - WikiPro
 * Version migrée utilisant les hooks API pour les sessions et l'IA
 */

import React, { useState, useEffect } from 'react';
import { 
  LoadingState, 
  ErrorState,
  SkeletonList,
  AuthGuard,
  PermissionGate,
} from '../../components/common';
import { 
  useSessions, 
  useCreateSession, 
  useAddConversation, 
  useIAStrategie,
  useTenantData 
} from '../../hooks/api';
import { useIAStrategie as useIAStrategieHook } from './hooks/useIAStrategie';

/**
 * Composant de liste des sessions
 */
const SessionsList = ({ onSelectSession, selectedSessionId }) => {
  const { 
    data: sessionsData, 
    isLoading, 
    error, 
    refetch 
  } = useSessions({ 
    limit: 10, 
    sort: 'updated_at', 
    order: 'desc' 
  });

  if (isLoading) {
    return <SkeletonList items={5} height="80px" />;
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
    <div className="sessions-list">
      <div className="sessions-header">
        <h3>
          <i className="fas fa-history"></i>
          Sessions récentes
        </h3>
        <span className="sessions-count">{sessions.length}</span>
      </div>

      {sessions.length === 0 ? (
        <div className="sessions-empty">
          <i className="fas fa-comments"></i>
          <p>Aucune session disponible</p>
        </div>
      ) : (
        <div className="sessions-items">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`session-item ${selectedSessionId === session.id ? 'active' : ''}`}
              onClick={() => onSelectSession(session)}
            >
              <div className="session-info">
                <h4>{session.title || 'Session sans titre'}</h4>
                <p>{session.description || 'Aucune description'}</p>
                <span className="session-date">
                  {new Date(session.updated_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="session-meta">
                <span className="conversations-count">
                  <i className="fas fa-comment"></i>
                  {session.conversations_count || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Composant de création de session
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
      type: 'ia-strategy',
    });
  };

  return (
    <div className="create-session-form">
      <h3>
        <i className="fas fa-plus"></i>
        Nouvelle session
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="session-title">Titre de la session *</label>
          <input
            id="session-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Étude de faisabilité projet XYZ"
            required
            disabled={createSessionMutation.isPending}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="session-description">Description</label>
          <textarea
            id="session-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description optionnelle de la session"
            rows="3"
            disabled={createSessionMutation.isPending}
          />
        </div>
        
        {createSessionMutation.error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {createSessionMutation.error.message}
          </div>
        )}
        
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={createSessionMutation.isPending}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={createSessionMutation.isPending || !title.trim()}
          >
            {createSessionMutation.isPending ? (
              <>
                <LoadingState type="spinner" size="small" />
                Création...
              </>
            ) : (
              <>
                <i className="fas fa-plus"></i>
                Créer la session
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * Module IAStrategie principal avec API
 */
const IAStrategie = () => {
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Hooks pour l'interface existante
  const {
    selectedModel,
    setSelectedModel,
    inputText,
    setInputText,
    showCanvas,
    setShowCanvas,
    canvasContent,
    setCanvasContent,
    isGenerating,
    aiModels,
    handleGenerate: handleGenerateLocal,
    handleKeyPress
  } = useIAStrategieHook();

  // Hook pour les données tenant (remplace appData)
  const { data: tenantData } = useTenantData();

  // Hook pour ajouter des conversations
  const addConversationMutation = useAddConversation();

  // Calcul des connecteurs de données avec l'API
  const dataConnectors = React.useMemo(() => {
    if (!tenantData) return {};
    
    return {
      references: `Données disponibles : ${tenantData.references?.length || 0} références d'études`,
      competences: `${tenantData.competences?.length || 0} compétences répertoriées`,
      poles: `${tenantData.poles?.labels?.length || 0} pôles d'expertise actifs`,
      budget: tenantData.references ? 
        `Budget total : ${Math.round(tenantData.references.reduce((acc, r) => 
          acc + parseInt(r.budget?.replace(/[€\s]/g, '') || '0'), 0) / 1000)}K€` 
        : 'Budget non disponible'
    };
  }, [tenantData]);

  // Gestion de la génération avec API
  const handleGenerate = async () => {
    if (!selectedSession) {
      alert('Veuillez sélectionner ou créer une session');
      return;
    }

    try {
      // Appel de la génération locale
      await handleGenerateLocal();

      // Ajout de la conversation à la session
      if (inputText.trim()) {
        await addConversationMutation.mutateAsync({
          sessionId: selectedSession.id,
          conversationData: {
            message: inputText.trim(),
            type: 'user',
            metadata: {
              model: selectedModel,
              context: dataConnectors,
            },
          },
        });
      }
    } catch (error) {
      console.error('Erreur génération:', error);
    }
  };

  // Gestion de sélection de session
  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setShowCreateForm(false);
  };

  // Gestion de création de session
  const handleSessionCreated = (newSession) => {
    setSelectedSession(newSession);
    setShowCreateForm(false);
  };

  return (
    <AuthGuard requirePermissions={['ai:use']} requireAll={false}>
      <div style={{ height: '100vh', display: 'flex', backgroundColor: 'var(--color-bg-subtle)' }}>
        
        {/* Sidebar des sessions */}
        <div style={{ 
          width: '300px', 
          backgroundColor: 'var(--color-surface)', 
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ padding: 'var(--space-16)', borderBottom: '1px solid var(--color-border)' }}>
            <button
              className="btn-primary"
              onClick={() => setShowCreateForm(true)}
              style={{ width: '100%' }}
            >
              <i className="fas fa-plus"></i>
              Nouvelle session
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            {showCreateForm ? (
              <div style={{ padding: 'var(--space-16)' }}>
                <CreateSessionForm
                  onSessionCreated={handleSessionCreated}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            ) : (
              <div style={{ padding: 'var(--space-16)', height: '100%', overflow: 'auto' }}>
                <SessionsList
                  onSelectSession={handleSelectSession}
                  selectedSessionId={selectedSession?.id}
                />
              </div>
            )}
          </div>
        </div>

        {/* Zone principale */}
        <div style={{ flex: showCanvas ? '1' : '1', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface)', borderRight: showCanvas ? '1px solid var(--color-border)' : 'none' }}>

          {/* Header avec bandeau coloré */}
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-teal-400) 50%, var(--color-teal-600) 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Motif décoratif en arrière-plan */}
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
              padding: 'var(--space-24)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              position: 'relative',
              zIndex: 1
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                    <h2 style={{
                      margin: '0',
                      fontSize: 'var(--font-size-2xl)',
                      fontWeight: '600',
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      letterSpacing: '-0.025em'
                    }}>
                      IA Stratégie
                    </h2>
                    {selectedSession && (
                      <p style={{
                        margin: '0',
                        fontSize: 'var(--font-size-sm)',
                        color: 'rgba(255, 255, 255, 0.8)',
                      }}>
                        Session: {selectedSession.title}
                      </p>
                    )}
                  </div>
                </div>

                <PermissionGate permissions={['ai:advanced']}>
                  <button
                    onClick={() => setShowCanvas(!showCanvas)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <i className={`fas ${showCanvas ? 'fa-eye-slash' : 'fa-eye'}`} style={{ marginRight: '8px' }}></i>
                    {showCanvas ? 'Masquer canvas' : 'Afficher canvas'}
                  </button>
                </PermissionGate>
              </div>
            </div>

            {/* Indicateurs de connexion données */}
            <div style={{
              display: 'flex',
              gap: 'var(--space-8)',
              padding: '0 var(--space-24) var(--space-16)',
              position: 'relative',
              zIndex: 1
            }}>
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

          {/* Zone de saisie et génération */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            padding: 'var(--space-24)',
            gap: 'var(--space-16)'
          }}>
            {/* Sélecteur de modèle */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-12)',
              padding: 'var(--space-16)',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: '8px',
              border: '1px solid var(--color-border)'
            }}>
              <i className="fas fa-robot" style={{ color: 'var(--color-text-secondary)' }}></i>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '500' }}>Modèle:</span>
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  minWidth: '200px'
                }}
              >
                {aiModels.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>

            {/* Zone de saisie */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedSession 
                  ? "Décrivez votre demande d'analyse ou de génération de contenu..."
                  : "Sélectionnez ou créez une session pour commencer"
                }
                disabled={isGenerating || !selectedSession}
                style={{
                  flex: 1,
                  padding: 'var(--space-16)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  resize: 'none',
                  fontSize: 'var(--font-size-base)',
                  lineHeight: '1.6',
                  backgroundColor: 'var(--color-surface)',
                  minHeight: '200px'
                }}
              />

              <div style={{ 
                marginTop: 'var(--space-12)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ 
                  fontSize: 'var(--font-size-xs)', 
                  color: 'var(--color-text-secondary)'
                }}>
                  {inputText.length} caractères
                  {!selectedSession && (
                    <span style={{ marginLeft: '8px', color: 'var(--color-warning)' }}>
                      • Session requise
                    </span>
                  )}
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !inputText.trim() || !selectedSession}
                  style={{
                    background: isGenerating ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: isGenerating || !selectedSession ? 'not-allowed' : 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-8)'
                  }}
                >
                  {isGenerating ? (
                    <>
                      <LoadingState type="spinner" size="small" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic"></i>
                      Générer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas de droite */}
        {showCanvas && (
          <div style={{
            width: '400px',
            backgroundColor: 'var(--color-surface)',
            borderLeft: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: 'var(--space-16)',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-bg-subtle)'
            }}>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>
                <i className="fas fa-file-alt" style={{ marginRight: '8px' }}></i>
                Résultat
              </h3>
            </div>
            
            <div style={{
              flex: 1,
              padding: 'var(--space-16)',
              overflow: 'auto'
            }}>
              {canvasContent ? (
                <div dangerouslySetInnerHTML={{ __html: canvasContent }} />
              ) : (
                <div style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-secondary)',
                  textAlign: 'center'
                }}>
                  <div>
                    <i className="fas fa-robot" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
                    <p>Le contenu généré s'affichera ici</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
};

export default IAStrategie;