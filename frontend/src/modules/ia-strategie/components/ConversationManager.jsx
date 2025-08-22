import React, { useState, useEffect, useCallback } from 'react';
import ChatInterface from './ChatInterface';
import ConversationSidebar from './ConversationSidebar';
import { useConversationHistory } from '../hooks/useConversationHistory';

/**
 * Gestionnaire principal des conversations avec sidebar intégrée
 * Combine l'interface chat avec l'historique des conversations
 */
const ConversationManager = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loadingConversation, setLoadingConversation] = useState(false);

  const { getConversation } = useConversationHistory();

  // Raccourcis clavier globaux
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+H pour toggle sidebar
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      
      // Ctrl+Shift+N pour nouvelle conversation
      if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        setSidebarOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Charger une conversation sélectionnée
  const handleSelectConversation = useCallback(async (conversationId) => {
    if (!conversationId) {
      setCurrentConversationId(null);
      setCurrentConversation(null);
      return;
    }

    if (conversationId === currentConversationId) {
      // Fermer la sidebar si on sélectionne la conversation déjà active
      setSidebarOpen(false);
      return;
    }

    try {
      setLoadingConversation(true);
      setCurrentConversationId(conversationId);

      const conversationDetails = await getConversation(conversationId, true);
      setCurrentConversation(conversationDetails);

      // Fermer la sidebar sur mobile après sélection
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }

      // Log pour debug
      if (process.env.NODE_ENV === 'development') {
        console.log('Conversation chargée:', conversationDetails);
      }

    } catch (error) {
      console.error('Erreur chargement conversation:', error);
      setCurrentConversationId(null);
      setCurrentConversation(null);
    } finally {
      setLoadingConversation(false);
    }
  }, [currentConversationId, getConversation]);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Sidebar des conversations */}
      <ConversationSidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        onSelectConversation={handleSelectConversation}
        currentConversationId={currentConversationId}
      />

      {/* Interface de chat principale */}
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? '380px' : '0',
        transition: 'margin-left 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        {/* Overlay mobile pour fermer la sidebar */}
        {sidebarOpen && window.innerWidth < 768 && (
          <div
            style={{
              position: 'fixed',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: 'rgba(0,0,0,0.5)',
              zIndex: 999
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Bouton d'ouverture de la sidebar */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: 100,
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              background: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            title="Ouvrir l'historique (Ctrl+H)"
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--color-bg-subtle)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--color-surface)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <i className="fas fa-history" />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              Historique
            </span>
          </button>
        )}

        {/* Indicateur de conversation active */}
        {currentConversation && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 100,
            padding: '8px 12px',
            background: 'var(--color-primary-subtle)',
            border: '1px solid var(--color-primary)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <i className="fas fa-comment" />
            <span style={{ fontWeight: '500' }}>
              {currentConversation.title}
            </span>
            {loadingConversation && (
              <i className="fas fa-spinner fa-spin" style={{ marginLeft: '6px' }} />
            )}
          </div>
        )}

        {/* Interface de chat */}
        <ChatInterface
          conversationId={currentConversationId}
          conversation={currentConversation}
          onConversationUpdate={handleSelectConversation}
        />
      </div>

      {/* Styles responsives */}
      <style jsx>{`
        @media (max-width: 768px) {
          .conversation-sidebar {
            width: 100% !important;
            left: ${sidebarOpen ? '0' : '-100%'} !important;
          }
          
          .chat-container {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ConversationManager;