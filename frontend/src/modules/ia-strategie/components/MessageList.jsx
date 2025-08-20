import React from 'react';

/**
 * Liste des messages avec affichage streaming
 */
const MessageList = ({ messages, currentStreamContent, selectedProvider, availableProviders }) => {
  const getProviderInfo = (providerId) => {
    const providerMap = {
      'gemini': { name: 'Gemini', icon: '🟢', color: 'var(--color-success)' },
      'openai': { name: 'GPT-4', icon: '🟡', color: 'var(--color-warning)' },
      'anthropic': { name: 'Claude', icon: '🔵', color: 'var(--color-info)' },
      'mistral': { name: 'Mistral', icon: '🟠', color: 'var(--color-orange)' }
    };
    return providerMap[providerId] || { name: providerId, icon: '🤖', color: 'var(--color-text-muted)' };
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message, index) => {
    const isUser = message.role === 'user';
    const providerInfo = getProviderInfo(message.provider);

    return (
      <div
        key={message.id || index}
        style={{
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          gap: 'var(--space-12)',
          marginBottom: 'var(--space-20)',
          paddingLeft: isUser ? '20%' : '0',
          paddingRight: isUser ? '0' : '20%'
        }}
      >
        {/* Avatar */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: isUser ? 'var(--color-primary)' : providerInfo.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: '600',
          color: 'white',
          flexShrink: 0,
          boxShadow: 'var(--shadow-sm)'
        }}>
          {isUser ? (
            <i className="fas fa-user"></i>
          ) : (
            <span>{providerInfo.icon}</span>
          )}
        </div>

        {/* Message content */}
        <div style={{
          maxWidth: '100%',
          backgroundColor: isUser ? 'var(--color-primary)' : 'var(--color-surface)',
          color: isUser ? 'white' : 'var(--color-text-primary)',
          padding: 'var(--space-16)',
          borderRadius: isUser ? 
            'var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)' :
            'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)',
          border: isUser ? 'none' : '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative'
        }}>
          {/* Provider info pour les messages IA */}
          {!isUser && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-8)',
              marginBottom: 'var(--space-8)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
              fontWeight: '500'
            }}>
              <span>{providerInfo.icon}</span>
              <span>{providerInfo.name}</span>
              {message.tokensUsed && (
                <span style={{ marginLeft: 'auto', fontSize: 'var(--font-size-xs)' }}>
                  {message.tokensUsed} tokens
                </span>
              )}
            </div>
          )}

          {/* Message text */}
          <div style={{
            fontSize: 'var(--font-size-base)',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {message.error ? (
              <div style={{ color: 'var(--color-error)' }}>
                <i className="fas fa-exclamation-triangle" style={{ marginRight: 'var(--space-8)' }}></i>
                {message.content}
              </div>
            ) : (
              message.content
            )}
          </div>

          {/* Timestamp */}
          <div style={{
            fontSize: 'var(--font-size-xs)',
            color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)',
            marginTop: 'var(--space-8)',
            textAlign: isUser ? 'right' : 'left'
          }}>
            {formatTimestamp(message.timestamp)}
          </div>

          {/* Status indicators */}
          {message.finishReason && message.finishReason !== 'stop' && (
            <div style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-warning)',
              marginTop: 'var(--space-4)',
              fontStyle: 'italic'
            }}>
              <i className="fas fa-info-circle" style={{ marginRight: 'var(--space-4)' }}></i>
              Arrêté: {message.finishReason}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStreamingMessage = () => {
    if (!currentStreamContent) return null;

    const providerInfo = getProviderInfo(selectedProvider);

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-12)',
          marginBottom: 'var(--space-20)',
          paddingRight: '20%'
        }}
      >
        {/* Avatar avec animation */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: providerInfo.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: '600',
          color: 'white',
          flexShrink: 0,
          boxShadow: '0 0 20px rgba(20, 184, 166, 0.3)',
          animation: 'pulse 2s infinite'
        }}>
          <span>{providerInfo.icon}</span>
        </div>

        {/* Message content */}
        <div style={{
          maxWidth: '100%',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          padding: 'var(--space-16)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 12px rgba(20, 184, 166, 0.1)',
          position: 'relative'
        }}>
          {/* Provider info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-8)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            fontWeight: '500'
          }}>
            <span>{providerInfo.icon}</span>
            <span>{providerInfo.name}</span>
            <div style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              color: 'var(--color-success)'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success)',
                animation: 'pulse 1s infinite'
              }}></div>
              <span style={{ fontSize: 'var(--font-size-xs)' }}>En cours...</span>
            </div>
          </div>

          {/* Streaming text */}
          <div style={{
            fontSize: 'var(--font-size-base)',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {currentStreamContent}
            <span style={{
              display: 'inline-block',
              width: '2px',
              height: '1.2em',
              backgroundColor: 'var(--color-primary)',
              marginLeft: '2px',
              animation: 'blink 1s infinite'
            }}></span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '100%' }}>
      {messages.map(renderMessage)}
      {renderStreamingMessage()}
      
      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MessageList;