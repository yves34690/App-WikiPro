import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useConversationHistory } from '../hooks/useConversationHistory';
import { formatConversationDate, getContextIcon, CONTEXT_TYPES } from '../utils/conversationUtils';

/**
 * Sidebar d'historique des conversations avec recherche et gestion
 */
const ConversationSidebar = ({ isOpen, onToggle, onSelectConversation, currentConversationId }) => {
  const {
    conversations,
    loading,
    searchTerm,
    setSearchTerm,
    selectedContextType,
    setSelectedContextType,
    createNewConversation,
    deleteConversation,
    refreshConversations,
    conversationStats
  } = useConversationHistory();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [expandedConversation, setExpandedConversation] = useState(null);
  const searchInputRef = useRef(null);

  // Focus automatique sur la recherche quand la sidebar s'ouvre
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleNewConversation = useCallback(async () => {
    try {
      const newConversation = await createNewConversation({
        title: 'Nouvelle conversation',
        contextType: selectedContextType || 'general'
      });
      onSelectConversation(newConversation.id);
    } catch (error) {
      console.error('Erreur création conversation:', error);
    }
  }, [createNewConversation, selectedContextType, onSelectConversation]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      // Escape pour fermer la sidebar
      if (e.key === 'Escape') {
        onToggle();
      }
      // Ctrl+N pour nouvelle conversation
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        handleNewConversation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle, handleNewConversation]);

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation();
    try {
      await deleteConversation(conversationId);
      setShowDeleteConfirm(null);
      
      // Si c'était la conversation courante, désélectionner
      if (conversationId === currentConversationId) {
        onSelectConversation(null);
      }
    } catch (error) {
      console.error('Erreur suppression conversation:', error);
    }
  };

  const contextTypes = [
    { value: '', label: 'Tous les types' },
    ...CONTEXT_TYPES
  ];

  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        left: '0',
        top: '80px',
        zIndex: 1000,
        background: 'var(--color-surface)',
        borderRadius: '0 8px 8px 0',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        border: '1px solid var(--color-border)',
        borderLeft: 'none'
      }}>
        <button
          onClick={onToggle}
          style={{
            padding: '12px 8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            fontSize: '16px',
            transition: 'color 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Ouvrir l'historique des conversations (Ctrl+H)"
        >
          <i className="fas fa-history" />
          <span style={{ fontSize: '12px', writingMode: 'vertical-lr' }}>
            Historique
          </span>
        </button>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      left: '0',
      top: '80px',
      bottom: '0',
      width: '380px',
      background: 'var(--color-surface)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      boxShadow: '2px 0 12px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-subtle)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h3 style={{
            margin: '0',
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="fas fa-history" />
            Conversations
          </h3>
          <button
            onClick={onToggle}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: 'var(--color-text-secondary)',
              transition: 'background-color 0.2s ease'
            }}
            title="Fermer (Escape)"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Stats rapides */}
        <div style={{
          display: 'flex',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          marginBottom: '12px'
        }}>
          <span>
            <i className="fas fa-comment" style={{ marginRight: '4px' }} />
            {conversationStats.totalConversations} conv.
          </span>
          <span>
            <i className="fas fa-message" style={{ marginRight: '4px' }} />
            {conversationStats.totalMessages} msg.
          </span>
        </div>

        {/* Recherche */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Rechercher dans les conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '14px',
              transition: 'border-color 0.2s ease'
            }}
          />
          <i className="fas fa-search" style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-secondary)',
            fontSize: '14px'
          }} />
        </div>

        {/* Filtre par type de contexte */}
        <select
          value={selectedContextType}
          onChange={(e) => setSelectedContextType(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: '13px',
            marginBottom: '12px'
          }}
        >
          {contextTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleNewConversation}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              borderRadius: '6px',
              background: 'var(--color-primary)',
              color: 'white',
              fontSize: '13px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            title="Nouvelle conversation (Ctrl+N)"
          >
            <i className="fas fa-plus" />
            Nouveau
          </button>
          <button
            onClick={refreshConversations}
            disabled={loading}
            style={{
              padding: '10px 12px',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              background: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
            title="Actualiser"
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Liste des conversations */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '8px'
      }}>
        {loading && conversations.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }} />
            Chargement...
          </div>
        ) : conversations.length === 0 ? (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}>
            <i className="fas fa-comment-slash" style={{ fontSize: '24px', marginBottom: '8px' }} />
            <p>Aucune conversation trouvée</p>
            <button
              onClick={handleNewConversation}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: 'var(--color-primary)',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Créer la première conversation
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {conversations.map(conversation => (
              <div
                key={conversation.id}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  background: conversation.id === currentConversationId ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden'
                }}
                onClick={() => onSelectConversation(conversation.id)}
                onMouseEnter={(e) => {
                  if (conversation.id !== currentConversationId) {
                    e.currentTarget.style.background = 'var(--color-bg-subtle)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (conversation.id !== currentConversationId) {
                    e.currentTarget.style.background = 'var(--color-surface)';
                  }
                }}
              >
                <div style={{ padding: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <i className={getContextIcon(conversation.contextType)} style={{
                          fontSize: '12px',
                          color: 'var(--color-primary)',
                          flexShrink: 0
                        }} />
                        <h4 style={{
                          margin: '0',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--color-text)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {conversation.title}
                        </h4>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: 'var(--color-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <span>{formatConversationDate(conversation.updatedAt)}</span>
                        <span>
                          <i className="fas fa-message" style={{ marginRight: '4px' }} />
                          {conversation.messageCount}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedConversation(
                            expandedConversation === conversation.id ? null : conversation.id
                          );
                        }}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          color: 'var(--color-text-secondary)',
                          fontSize: '12px'
                        }}
                        title="Détails"
                      >
                        <i className={`fas fa-chevron-${expandedConversation === conversation.id ? 'up' : 'down'}`} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(conversation.id);
                        }}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          color: 'var(--color-text-secondary)',
                          fontSize: '12px',
                          transition: 'color 0.2s ease'
                        }}
                        title="Supprimer"
                        onMouseEnter={(e) => e.target.style.color = 'var(--color-danger)'}
                        onMouseLeave={(e) => e.target.style.color = 'var(--color-text-secondary)'}
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </div>

                  {/* Dernier message */}
                  {conversation.lastMessage && (
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--color-text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontStyle: 'italic'
                    }}>
                      {conversation.lastMessage.role === 'user' ? '👤 Vous: ' : '🤖 IA: '}
                      {conversation.lastMessage.content}
                    </div>
                  )}

                  {/* Détails étendus */}
                  {expandedConversation === conversation.id && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px',
                      background: 'var(--color-bg-subtle)',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: 'var(--color-text-secondary)'
                    }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Type:</strong> {contextTypes.find(t => t.value === conversation.contextType)?.label || 'Général'}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Créée:</strong> {new Date(conversation.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                      {conversation.aiSettings && (
                        <div>
                          <strong>IA:</strong> {conversation.aiSettings.provider || 'Non défini'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Modal de confirmation de suppression */}
                {showDeleteConfirm === conversation.id && (
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                  }}>
                    <div style={{
                      background: 'var(--color-surface)',
                      padding: '20px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      border: '1px solid var(--color-border)',
                      maxWidth: '300px'
                    }}>
                      <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text)' }}>
                        Supprimer la conversation ?
                      </h4>
                      <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                        Cette action est irréversible. Tous les messages seront perdus.
                      </p>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(null);
                          }}
                          style={{
                            padding: '8px 16px',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text)',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Annuler
                        </button>
                        <button
                          onClick={(e) => handleDeleteConversation(conversation.id, e)}
                          style={{
                            padding: '8px 16px',
                            border: 'none',
                            borderRadius: '6px',
                            background: 'var(--color-danger)',
                            color: 'white',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;