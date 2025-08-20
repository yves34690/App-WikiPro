/**
 * Composant StreamingChat - Interface chat moderne type ChatGPT - WikiPro
 * Chat temps réel avec streaming, typing effect et interactions avancées
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAIChat, MESSAGE_TYPES, CHAT_STATES } from '../hooks/useAIChat';
import { getProviderIcon, getProviderColor } from '../services/aiProviders';

/**
 * Composant pour l'effet de typing
 */
const TypingEffect = ({ text, speed = 30, onComplete = null }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (currentIndex < text.length) {
      intervalRef.current = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
    } else if (onComplete) {
      onComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [text, currentIndex, speed, onComplete]);

  return <span>{displayedText}</span>;
};

/**
 * Composant pour un message de chat
 */
const ChatMessage = ({ 
  message, 
  isStreaming = false, 
  onCopy = null,
  onRegenerate = null,
  enableMarkdown = true 
}) => {
  const { type, content, provider, timestamp, metadata } = message;
  const isUser = type === MESSAGE_TYPES.USER;
  const isSystem = type === MESSAGE_TYPES.SYSTEM;
  const isError = type === MESSAGE_TYPES.ERROR;
  
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);

  // Formatage du contenu avec markdown basique
  const formatContent = (text) => {
    if (!enableMarkdown) return text;
    
    // Remplacements basiques markdown
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };

  // Copie du contenu
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onCopy) onCopy(message);
    } catch (error) {
      console.error('Erreur copie:', error);
    }
  };

  // Couleurs selon le type
  const getMessageColors = () => {
    if (isError) return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' };
    if (isSystem) return { bg: '#f0f9ff', border: '#bfdbfe', text: '#2563eb' };
    if (isUser) return { bg: '#f0f9ff', border: '#bfdbfe', text: '#1f2937' };
    return { bg: '#f9fafb', border: '#e5e7eb', text: '#1f2937' };
  };

  const colors = getMessageColors();
  const providerColor = provider ? getProviderColor(provider) : '#6b7280';

  return (
    <div
      className={`chat-message ${type}`}
      style={{
        display: 'flex',
        gap: 'var(--space-12)',
        padding: 'var(--space-16)',
        marginBottom: 'var(--space-12)',
        borderRadius: '12px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        position: 'relative',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: isUser 
            ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
            : `linear-gradient(135deg, ${providerColor}, ${providerColor}dd)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        {isUser ? (
          <span style={{ color: 'white' }}>👤</span>
        ) : (
          <span style={{ color: 'white' }}>
            {provider ? getProviderIcon(provider) : '🤖'}
          </span>
        )}
      </div>

      {/* Contenu du message */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header avec provider et timestamp */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-8)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)'
        }}>
          <span style={{ fontWeight: '500' }}>
            {isUser ? 'Vous' : 
             isSystem ? 'Système' :
             isError ? 'Erreur' :
             provider || 'Assistant'}
          </span>
          
          {provider && !isUser && (
            <span
              style={{
                background: providerColor,
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {provider}
            </span>
          )}
          
          <span>•</span>
          <span>{new Date(timestamp).toLocaleTimeString('fr-FR')}</span>
          
          {metadata?.tokens && (
            <>
              <span>•</span>
              <span>{metadata.tokens} tokens</span>
            </>
          )}
          
          {metadata?.latency && (
            <>
              <span>•</span>
              <span>{metadata.latency}ms</span>
            </>
          )}
        </div>

        {/* Contenu avec typing effect pour streaming */}
        <div
          style={{
            color: colors.text,
            lineHeight: 1.6,
            fontSize: 'var(--font-size-base)',
            wordBreak: 'break-word'
          }}
        >
          {isStreaming ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <TypingEffect text={content} speed={20} />
              <div
                className="typing-cursor"
                style={{
                  width: '2px',
                  height: '20px',
                  background: providerColor,
                  animation: 'blink 1s infinite',
                  marginTop: '2px'
                }}
              />
            </div>
          ) : (
            <div
              dangerouslySetInnerHTML={{
                __html: formatContent(content)
              }}
            />
          )}
        </div>

        {/* Actions de message */}
        {showActions && !isStreaming && (
          <div
            className="message-actions"
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              display: 'flex',
              gap: '4px',
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '6px',
              padding: '4px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Bouton copier */}
            <button
              onClick={handleCopy}
              title="Copier le message"
              style={{
                background: 'none',
                border: 'none',
                padding: '6px',
                borderRadius: '4px',
                cursor: 'pointer',
                color: copied ? '#22c55e' : '#6b7280',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
            </button>

            {/* Bouton regénérer (seulement pour assistant) */}
            {!isUser && !isSystem && !isError && onRegenerate && (
              <button
                onClick={() => onRegenerate(message)}
                title="Regénérer la réponse"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '6px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <i className="fas fa-redo"></i>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Zone de saisie avec support markdown et raccourcis
 */
const ChatInput = ({ 
  value, 
  onChange, 
  onSend, 
  onStop,
  isStreaming, 
  disabled,
  placeholder = "Tapez votre message...",
  maxLength = 4000
}) => {
  const textareaRef = useRef(null);
  const [rows, setRows] = useState(1);

  // Auto-resize du textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newRows = Math.min(Math.max(1, Math.ceil(textarea.scrollHeight / 24)), 8);
      setRows(newRows);
      textarea.style.height = `${newRows * 24}px`;
    }
  }, [value]);

  // Gestion des raccourcis clavier
  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter pour envoyer
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && value.trim() && !isStreaming) {
        onSend();
      }
    }
    
    // Escape pour arrêter le streaming
    if (e.key === 'Escape' && isStreaming) {
      e.preventDefault();
      onStop();
    }
  };

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: 'var(--space-12)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 'var(--space-12)',
        transition: 'border-color 0.2s ease',
        position: 'relative'
      }}
    >
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontSize: 'var(--font-size-base)',
          lineHeight: '24px',
          background: 'transparent',
          color: 'var(--color-text-primary)',
          fontFamily: 'inherit',
          minHeight: '24px'
        }}
      />

      {/* Compteur de caractères */}
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          right: '60px',
          fontSize: 'var(--font-size-xs)',
          color: value.length > maxLength * 0.9 ? '#ef4444' : 'var(--color-text-secondary)'
        }}
      >
        {value.length}/{maxLength}
      </div>

      {/* Bouton d'action */}
      <button
        onClick={isStreaming ? onStop : onSend}
        disabled={disabled || (!isStreaming && !value.trim())}
        style={{
          background: isStreaming ? '#ef4444' : 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 12px',
          cursor: disabled || (!isStreaming && !value.trim()) ? 'not-allowed' : 'pointer',
          fontSize: 'var(--font-size-sm)',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s ease',
          opacity: disabled || (!isStreaming && !value.trim()) ? 0.5 : 1,
          minWidth: '80px',
          justifyContent: 'center'
        }}
      >
        {isStreaming ? (
          <>
            <i className="fas fa-stop"></i>
            Stop
          </>
        ) : (
          <>
            <i className="fas fa-paper-plane"></i>
            Envoyer
          </>
        )}
      </button>
    </div>
  );
};

/**
 * Indicateur de connexion
 */
const ConnectionIndicator = ({ chatState, connectionState, onRetry }) => {
  const getStatusConfig = () => {
    switch (chatState) {
      case CHAT_STATES.CONNECTED:
        return { 
          color: '#22c55e', 
          icon: 'fa-circle', 
          text: 'Connecté',
          canRetry: false 
        };
      case CHAT_STATES.CONNECTING:
        return { 
          color: '#f59e0b', 
          icon: 'fa-circle', 
          text: 'Connexion...',
          canRetry: false 
        };
      case CHAT_STATES.DISCONNECTED:
        return { 
          color: '#6b7280', 
          icon: 'fa-circle', 
          text: 'Déconnecté',
          canRetry: true 
        };
      case CHAT_STATES.ERROR:
        return { 
          color: '#ef4444', 
          icon: 'fa-exclamation-circle', 
          text: 'Erreur',
          canRetry: true 
        };
      default:
        return { 
          color: '#6b7280', 
          icon: 'fa-circle', 
          text: 'Inactif',
          canRetry: false 
        };
    }
  };

  const status = getStatusConfig();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-8)',
        padding: 'var(--space-8) var(--space-12)',
        background: 'var(--color-bg-subtle)',
        borderRadius: '6px',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-text-secondary)'
      }}
    >
      <i
        className={`fas ${status.icon}`}
        style={{ color: status.color, fontSize: '8px' }}
      />
      <span>{status.text}</span>
      
      {connectionState.queueSize > 0 && (
        <>
          <span>•</span>
          <span>{connectionState.queueSize} en attente</span>
        </>
      )}
      
      {status.canRetry && onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            fontSize: 'inherit',
            marginLeft: 'var(--space-4)',
            textDecoration: 'underline'
          }}
        >
          Reconnecter
        </button>
      )}
    </div>
  );
};

/**
 * Composant principal StreamingChat
 */
const StreamingChat = ({ 
  sessionId,
  selectedProvider,
  onProviderChange,
  className = '',
  enableMarkdown = true,
  showConnectionStatus = true
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  
  const {
    chatState,
    messages,
    currentMessage,
    isStreaming,
    currentProvider,
    error,
    connectionState,
    sendMessage,
    stopStreaming,
    clearMessages,
    retry,
    regenerateLastMessage,
    connectToChat,
    canSendMessage
  } = useAIChat({
    sessionId,
    preferredProvider: selectedProvider,
    autoConnect: true,
    enableFallback: true
  });

  // Auto-scroll vers le bas
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentMessage, scrollToBottom]);

  // Notification de changement de provider
  useEffect(() => {
    if (currentProvider && currentProvider !== selectedProvider && onProviderChange) {
      onProviderChange(currentProvider);
    }
  }, [currentProvider, selectedProvider, onProviderChange]);

  // Envoi de message
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || !canSendMessage) return;
    
    const success = await sendMessage(inputValue, {
      provider: selectedProvider
    });
    
    if (success) {
      setInputValue('');
    }
  }, [inputValue, canSendMessage, sendMessage, selectedProvider]);

  // Arrêt du streaming
  const handleStop = useCallback(() => {
    stopStreaming();
  }, [stopStreaming]);

  // Regénération
  const handleRegenerate = useCallback(() => {
    regenerateLastMessage();
  }, [regenerateLastMessage]);

  // Copie de message
  const handleCopy = useCallback((message) => {
    console.info('Message copié:', message.id);
  }, []);

  // Messages à afficher (incluant le message en streaming)
  const displayMessages = React.useMemo(() => {
    const allMessages = [...messages];
    
    if (currentMessage && isStreaming) {
      allMessages.push({
        id: 'streaming',
        type: MESSAGE_TYPES.ASSISTANT,
        content: currentMessage,
        provider: currentProvider,
        timestamp: Date.now(),
        metadata: { streaming: true }
      });
    }
    
    return allMessages;
  }, [messages, currentMessage, isStreaming, currentProvider]);

  return (
    <div className={`streaming-chat ${className}`} style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      background: 'var(--color-bg-subtle)'
    }}>
      {/* Header avec statut de connexion */}
      {showConnectionStatus && (
        <div style={{
          padding: 'var(--space-12)',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <ConnectionIndicator
            chatState={chatState}
            connectionState={connectionState}
            onRetry={retry}
          />
          
          <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
            <button
              onClick={clearMessages}
              title="Effacer la conversation"
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-xs)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <i className="fas fa-trash"></i>
              Effacer
            </button>
          </div>
        </div>
      )}

      {/* Zone des messages */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 'var(--space-16)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {displayMessages.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'var(--color-text-secondary)'
          }}>
            <div>
              <i className="fas fa-comments" style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}></i>
              <h3 style={{ margin: '0 0 8px 0', fontWeight: '500' }}>
                Commencez une conversation
              </h3>
              <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                Posez une question ou décrivez ce que vous souhaitez analyser
              </p>
            </div>
          </div>
        ) : (
          <>
            {displayMessages.map((message, index) => (
              <ChatMessage
                key={message.id || index}
                message={message}
                isStreaming={message.metadata?.streaming}
                onCopy={handleCopy}
                onRegenerate={!isStreaming ? handleRegenerate : null}
                enableMarkdown={enableMarkdown}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Zone de saisie */}
      <div style={{
        padding: 'var(--space-16)',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-surface)'
      }}>
        {error && (
          <div style={{
            marginBottom: 'var(--space-12)',
            padding: 'var(--space-12)',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)'
          }}>
            <i className="fas fa-exclamation-triangle"></i>
            <div>
              <div style={{ fontWeight: '500' }}>{error.message}</div>
              {error.details && (
                <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
                  {error.details}
                </div>
              )}
            </div>
          </div>
        )}
        
        <ChatInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onSend={handleSend}
          onStop={handleStop}
          isStreaming={isStreaming}
          disabled={!canSendMessage}
          placeholder={
            chatState === CHAT_STATES.CONNECTED
              ? "Tapez votre message... (Ctrl+Enter pour envoyer)"
              : "Connexion en cours..."
          }
        />
        
        <div style={{
          marginTop: 'var(--space-8)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)',
          textAlign: 'center'
        }}>
          <kbd>Ctrl</kbd> + <kbd>Enter</kbd> pour envoyer • <kbd>Esc</kbd> pour arrêter
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        .chat-message:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .message-actions button:hover {
          background: rgba(0, 0, 0, 0.05);
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default StreamingChat;