import React from 'react';
import { useChatInterface } from '../hooks/useChatInterface';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ProviderSelector from './ProviderSelector';
import ConnectionStatus from './ConnectionStatus';

/**
 * Interface ChatGPT-like avec streaming WebSocket
 */
const ChatInterface = () => {
  const {
    messages,
    inputText,
    setInputText,
    isStreaming,
    selectedProvider,
    setSelectedProvider,
    availableProviders,
    connectionStatus,
    currentStreamContent,
    sendMessage,
    stopStreaming,
    handleKeyPress,
    clearConversation,
    testProvider,
    messagesEndRef
  } = useChatInterface();

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'var(--color-bg-subtle)',
      overflow: 'hidden'
    }}>
      {/* Header avec contrôles */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-teal-400) 50%, var(--color-teal-600) 100%)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        {/* Motif décoratif */}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Titre et statut */}
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
                <i className="fas fa-comments" style={{ color: 'white', fontSize: '20px' }}></i>
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
                  Chat IA WikiPro
                </h2>
                <ConnectionStatus status={connectionStatus} />
              </div>
            </div>

            {/* Contrôles */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
              <ProviderSelector
                selectedProvider={selectedProvider}
                setSelectedProvider={setSelectedProvider}
                availableProviders={availableProviders}
                testProvider={testProvider}
              />
              
              {messages.length > 0 && (
                <button
                  onClick={clearConversation}
                  disabled={isStreaming}
                  style={{
                    padding: 'var(--space-8) var(--space-16)',
                    backgroundColor: isStreaming ? 'var(--color-bg-muted)' : 'rgba(255, 255, 255, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: isStreaming ? 'not-allowed' : 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    color: 'white',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <i className="fas fa-trash"></i> Effacer
                </button>
              )}

              {isStreaming && (
                <button
                  onClick={stopStreaming}
                  style={{
                    padding: 'var(--space-8) var(--space-16)',
                    backgroundColor: 'var(--color-error)',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-sm)',
                    color: 'white',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <i className="fas fa-stop"></i> Arrêter
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Zone de conversation */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Messages */}
        <div style={{ 
          flex: 1, 
          overflow: 'auto',
          padding: 'var(--space-20)',
          backgroundColor: 'var(--color-surface)'
        }}>
          {messages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              color: 'var(--color-text-muted)'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-teal-400))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 'var(--space-20)',
                opacity: 0.8
              }}>
                <i className="fas fa-robot" style={{ color: 'white', fontSize: '32px' }}></i>
              </div>
              <h3 style={{ 
                fontSize: 'var(--font-size-xl)', 
                fontWeight: '600',
                marginBottom: 'var(--space-12)',
                color: 'var(--color-text-primary)'
              }}>
                Bonjour ! Je suis votre assistant IA WikiPro
              </h3>
              <p style={{ 
                fontSize: 'var(--font-size-base)',
                maxWidth: '600px',
                lineHeight: '1.6'
              }}>
                Je peux vous aider à analyser vos données, rédiger des documents, générer des synthèses et bien plus encore. 
                Posez-moi votre question ci-dessous !
              </p>
              <div style={{ 
                marginTop: 'var(--space-24)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-12)',
                maxWidth: '800px',
                width: '100%'
              }}>
                {[
                  { icon: 'fas fa-chart-line', text: 'Analyser les tendances', desc: 'de nos études par pôle' },
                  { icon: 'fas fa-file-alt', text: 'Rédiger un rapport', desc: 'de synthèse annuelle' },
                  { icon: 'fas fa-lightbulb', text: 'Générer des idées', desc: 'pour nouveaux projets' },
                  { icon: 'fas fa-search', text: 'Rechercher dans', desc: 'nos références' }
                ].map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => setInputText(suggestion.text + ' ' + suggestion.desc)}
                    style={{
                      padding: 'var(--space-16)',
                      backgroundColor: 'var(--color-bg-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '1px solid var(--color-border)',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'var(--color-primary)';
                      e.target.style.color = 'white';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = 'var(--shadow-lg)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'var(--color-bg-subtle)';
                      e.target.style.color = 'inherit';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <i className={suggestion.icon} style={{ 
                      fontSize: 'var(--font-size-lg)', 
                      marginBottom: 'var(--space-8)',
                      display: 'block'
                    }}></i>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>
                      {suggestion.text}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>
                      {suggestion.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <MessageList 
              messages={messages}
              currentStreamContent={currentStreamContent}
              selectedProvider={selectedProvider}
              availableProviders={availableProviders}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de chat */}
        <ChatInput
          inputText={inputText}
          setInputText={setInputText}
          isStreaming={isStreaming}
          sendMessage={sendMessage}
          handleKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
};

export default ChatInterface;