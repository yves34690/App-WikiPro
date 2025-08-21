import React, { useRef, useEffect } from 'react';

/**
 * Input de chat avec auto-resize et contrôles
 */
const ChatInput = ({ inputText, setInputText, isStreaming, sendMessage, handleKeyPress }) => {
  const textareaRef = useRef(null);

  // Auto-resize du textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [inputText]);

  // Focus automatique
  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  return (
    <div style={{
      padding: 'var(--space-20)',
      backgroundColor: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      flexShrink: 0
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Zone de saisie */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 'var(--space-12)',
          backgroundColor: 'var(--color-bg-subtle)',
          borderRadius: 'var(--radius-xl)',
          border: '2px solid var(--color-border)',
          padding: 'var(--space-12)',
          transition: 'all 0.2s',
          ...(inputText.trim() && !isStreaming ? {
            borderColor: 'var(--color-primary)',
            boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.1)'
          } : {})
        }}>
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isStreaming}
            placeholder={isStreaming ? "L'IA répond..." : "Écrivez votre message... (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              resize: 'none',
              backgroundColor: 'transparent',
              fontSize: 'var(--font-size-base)',
              lineHeight: '1.5',
              color: 'var(--color-text-primary)',
              fontFamily: 'inherit',
              minHeight: '24px',
              maxHeight: '200px',
              padding: 'var(--space-8)',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--color-border) transparent'
            }}
            rows={1}
          />

          {/* Bouton d'envoi */}
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isStreaming}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: inputText.trim() && !isStreaming ? 'var(--color-primary)' : 'var(--color-bg-muted)',
              color: 'white',
              cursor: inputText.trim() && !isStreaming ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--font-size-lg)',
              transition: 'all 0.2s',
              flexShrink: 0,
              boxShadow: inputText.trim() && !isStreaming ? '0 4px 12px rgba(20, 184, 166, 0.3)' : 'none',
              transform: inputText.trim() && !isStreaming ? 'scale(1.05)' : 'scale(1)'
            }}
            onMouseEnter={(e) => {
              if (inputText.trim() && !isStreaming) {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 6px 20px rgba(20, 184, 166, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (inputText.trim() && !isStreaming) {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 12px rgba(20, 184, 166, 0.3)';
              }
            }}
          >
            {isStreaming ? (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid currentColor',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </button>
        </div>

        {/* Indicateurs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'var(--space-8)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}>
            {/* Compteur de caractères */}
            <span style={{
              color: inputText.length > 4000 ? 'var(--color-error)' : 'var(--color-text-muted)'
            }}>
              {inputText.length}/4000
            </span>

            {/* Status de connexion */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isStreaming ? 'var(--color-warning)' : 'var(--color-success)'
              }}></div>
              <span>
                {isStreaming ? 'Génération en cours...' : 'Prêt à discuter'}
              </span>
            </div>
          </div>

          {/* Aide */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
            <span>
              <kbd style={{
                padding: '2px 6px',
                backgroundColor: 'var(--color-bg-muted)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)',
                fontFamily: 'monospace'
              }}>
                Entrée
              </kbd> pour envoyer
            </span>
            <span>•</span>
            <span>
              <kbd style={{
                padding: '2px 6px',
                backgroundColor: 'var(--color-bg-muted)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)',
                fontFamily: 'monospace'
              }}>
                Shift+Entrée
              </kbd> nouvelle ligne
            </span>
          </div>
        </div>

        {/* Suggestions rapides */}
        {!inputText && !isStreaming && (
          <div style={{
            marginTop: 'var(--space-12)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-8)'
          }}>
            {[
              'Analyse nos données par pôle',
              'Rédige un rapport mensuel',
              'Génère une synthèse',
              'Quelles sont nos tendances ?'
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputText(suggestion)}
                style={{
                  padding: 'var(--space-6) var(--space-12)',
                  backgroundColor: 'var(--color-bg-muted)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--color-primary)';
                  e.target.style.color = 'white';
                  e.target.style.borderColor = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--color-bg-muted)';
                  e.target.style.color = 'var(--color-text-muted)';
                  e.target.style.borderColor = 'var(--color-border)';
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CSS pour l'animation du spinner */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Scrollbar styling pour webkit */
        textarea::-webkit-scrollbar {
          width: 6px;
        }
        
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        
        textarea::-webkit-scrollbar-thumb {
          background: var(--color-border);
          border-radius: 3px;
        }
        
        textarea::-webkit-scrollbar-thumb:hover {
          background: var(--color-text-muted);
        }
      `}</style>
    </div>
  );
};

export default ChatInput;