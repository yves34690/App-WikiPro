import React, { useState } from 'react';

/**
 * Sélecteur de providers IA avec test de connexion
 */
const ProviderSelector = ({ selectedProvider, setSelectedProvider, availableProviders, testProvider }) => {
  const [isTestingProvider, setIsTestingProvider] = useState(null);
  const [providerResults, setProviderResults] = useState({});

  const getProviderInfo = (providerId) => {
    const providerMap = {
      'gemini': { name: 'Gemini 2.5', icon: '🟢', company: 'Google', color: 'var(--color-success)' },
      'openai': { name: 'GPT-4o', icon: '🟡', company: 'OpenAI', color: 'var(--color-warning)' },
      'anthropic': { name: 'Claude 3.5', icon: '🔵', company: 'Anthropic', color: 'var(--color-info)' },
      'mistral': { name: 'Mistral Large', icon: '🟠', company: 'Mistral AI', color: 'var(--color-orange)' }
    };
    return providerMap[providerId] || { name: providerId, icon: '🤖', company: 'Unknown', color: 'var(--color-text-muted)' };
  };

  const handleTestProvider = async (providerId) => {
    setIsTestingProvider(providerId);
    try {
      const result = await testProvider(providerId);
      setProviderResults(prev => ({
        ...prev,
        [providerId]: { success: result.success, timestamp: Date.now() }
      }));
    } catch (error) {
      setProviderResults(prev => ({
        ...prev,
        [providerId]: { success: false, error: error.message, timestamp: Date.now() }
      }));
    } finally {
      setIsTestingProvider(null);
    }
  };

  const getProviderStatus = (providerId) => {
    const result = providerResults[providerId];
    if (!result) return 'unknown';
    if (Date.now() - result.timestamp > 300000) return 'stale'; // 5 minutes
    return result.success ? 'success' : 'error';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'var(--color-success)';
      case 'error': return 'var(--color-error)';
      case 'stale': return 'var(--color-warning)';
      default: return 'var(--color-text-muted)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-times-circle';
      case 'stale': return 'fas fa-clock';
      default: return 'fas fa-question-circle';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Sélecteur principal */}
      <select
        value={selectedProvider}
        onChange={(e) => setSelectedProvider(e.target.value)}
        style={{
          padding: 'var(--space-8) var(--space-12)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          fontSize: 'var(--font-size-sm)',
          cursor: 'pointer',
          color: 'white',
          fontWeight: '500',
          boxShadow: 'var(--shadow-xs)',
          minWidth: '160px',
          appearance: 'none',
          backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 4 5\'><path fill=\'white\' d=\'M2 0L0 2h4zm0 5L0 3h4z\'/></svg>")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          backgroundSize: '12px',
          paddingRight: 'var(--space-32)'
        }}
      >
        <option value="" disabled>Choisir un provider IA</option>
        {availableProviders.map(provider => {
          const info = getProviderInfo(provider.id);
          const status = getProviderStatus(provider.id);
          return (
            <option key={provider.id} value={provider.id} style={{ color: 'black' }}>
              {info.icon} {info.name} {status === 'success' ? '✅' : status === 'error' ? '❌' : ''}
            </option>
          );
        })}
      </select>

      {/* Panel détaillé */}
      {availableProviders.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: 'var(--space-8)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: 'var(--space-16)',
          minWidth: '320px',
          zIndex: 1000,
          transform: 'translateY(0)',
          opacity: 1,
          visibility: 'visible'
        }}>
          <h4 style={{
            margin: '0 0 var(--space-12) 0',
            fontSize: 'var(--font-size-sm)',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)'
          }}>
            <i className="fas fa-robot"></i>
            Providers IA disponibles
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {availableProviders.map(provider => {
              const info = getProviderInfo(provider.id);
              const status = getProviderStatus(provider.id);
              const isSelected = selectedProvider === provider.id;
              const isTesting = isTestingProvider === provider.id;

              return (
                <div
                  key={provider.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-8)',
                    backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  {/* Info provider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                    <span style={{ fontSize: '18px' }}>{info.icon}</span>
                    <div>
                      <div style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: '500',
                        color: isSelected ? 'white' : 'var(--color-text-primary)'
                      }}>
                        {info.name}
                      </div>
                      <div style={{
                        fontSize: 'var(--font-size-xs)',
                        color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)'
                      }}>
                        {info.company}
                      </div>
                    </div>
                  </div>

                  {/* Status et actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                    {/* Status indicator */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-4)',
                      fontSize: 'var(--font-size-xs)'
                    }}>
                      <i
                        className={getStatusIcon(status)}
                        style={{ color: getStatusColor(status) }}
                      ></i>
                      <span style={{
                        color: isSelected ? 'rgba(255,255,255,0.8)' : getStatusColor(status)
                      }}>
                        {status === 'success' ? 'OK' : 
                         status === 'error' ? 'Erreur' :
                         status === 'stale' ? 'Ancien' : 'Non testé'}
                      </span>
                    </div>

                    {/* Test button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestProvider(provider.id);
                      }}
                      disabled={isTesting}
                      style={{
                        padding: 'var(--space-4) var(--space-8)',
                        backgroundColor: isTesting ? 'var(--color-bg-muted)' : 'var(--color-info)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        cursor: isTesting ? 'not-allowed' : 'pointer',
                        fontSize: 'var(--font-size-xs)',
                        color: 'white',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        minWidth: '60px'
                      }}
                    >
                      {isTesting ? (
                        <div style={{
                          width: '12px',
                          height: '12px',
                          border: '2px solid currentColor',
                          borderTop: '2px solid transparent',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                      ) : (
                        'Test'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Informations sur le provider sélectionné */}
          {selectedProvider && (
            <div style={{
              marginTop: 'var(--space-16)',
              padding: 'var(--space-12)',
              backgroundColor: 'var(--color-bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}>
              <div style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-muted)',
                fontWeight: '500',
                marginBottom: 'var(--space-4)'
              }}>
                Provider actuel
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-8)'
              }}>
                <span style={{ fontSize: '16px' }}>
                  {getProviderInfo(selectedProvider).icon}
                </span>
                <span style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '500',
                  color: 'var(--color-text-primary)'
                }}>
                  {getProviderInfo(selectedProvider).name}
                </span>
                <span style={{
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-muted)'
                }}>
                  par {getProviderInfo(selectedProvider).company}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSS pour l'animation */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ProviderSelector;