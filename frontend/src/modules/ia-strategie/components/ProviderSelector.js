/**
 * Composant ProviderSelector - Sélection intelligente des providers IA - WikiPro
 * Interface moderne avec métriques temps réel et gestion fallback
 */

import React, { useState } from 'react';
import { useProviderSelection } from '../hooks/useProviderSelection';
import { getProviderColor, getProviderIcon, formatLatency, formatQuotaUsage } from '../services/aiProviders';

/**
 * Card d'un provider avec métriques
 */
const ProviderCard = ({ 
  provider, 
  isSelected, 
  onSelect, 
  showDetails = false,
  isCompact = false 
}) => {
  const { id, displayName, description, state, metrics } = provider;
  const isAvailable = state?.isAvailable;
  const quotaUsage = metrics?.quotaUsage || 0;
  
  // Couleurs et statuts
  const statusColor = isAvailable ? '#22c55e' : '#ef4444';
  const providerColor = getProviderColor(id);
  const icon = getProviderIcon(id);

  return (
    <div
      className={`provider-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''} ${isCompact ? 'compact' : ''}`}
      onClick={() => isAvailable && onSelect(id)}
      style={{
        border: `2px solid ${isSelected ? providerColor : 'var(--color-border)'}`,
        borderRadius: '12px',
        padding: isCompact ? 'var(--space-12)' : 'var(--space-16)',
        background: isSelected 
          ? `linear-gradient(135deg, ${providerColor}15, ${providerColor}05)` 
          : 'var(--color-surface)',
        cursor: isAvailable ? 'pointer' : 'not-allowed',
        transition: 'all 0.2s ease',
        opacity: isAvailable ? 1 : 0.6,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Badge de statut */}
      <div
        className="provider-status"
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: statusColor,
          boxShadow: `0 0 8px ${statusColor}50`
        }}
      />

      {/* Header avec icône et nom */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--space-12)',
        marginBottom: isCompact ? 'var(--space-8)' : 'var(--space-12)'
      }}>
        <div
          style={{
            fontSize: isCompact ? '20px' : '24px',
            filter: isAvailable ? 'none' : 'grayscale(100%)'
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: 0, 
            fontSize: isCompact ? 'var(--font-size-sm)' : 'var(--font-size-base)',
            fontWeight: '600',
            color: isSelected ? providerColor : 'var(--color-text-primary)'
          }}>
            {displayName}
          </h4>
          {!isCompact && (
            <p style={{ 
              margin: 0, 
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.4
            }}>
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Métriques principales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isCompact ? '1fr 1fr' : '1fr 1fr 1fr',
        gap: 'var(--space-8)',
        marginBottom: showDetails ? 'var(--space-12)' : 0
      }}>
        {/* Latence */}
        <div className="metric-item">
          <div style={{ 
            fontSize: 'var(--font-size-xs)', 
            color: 'var(--color-text-secondary)' 
          }}>
            Latence
          </div>
          <div style={{ 
            fontSize: 'var(--font-size-sm)', 
            fontWeight: '600',
            color: 'var(--color-text-primary)'
          }}>
            {formatLatency(metrics?.averageLatency)}
          </div>
        </div>

        {/* Taux de succès */}
        <div className="metric-item">
          <div style={{ 
            fontSize: 'var(--font-size-xs)', 
            color: 'var(--color-text-secondary)' 
          }}>
            Succès
          </div>
          <div style={{ 
            fontSize: 'var(--font-size-sm)', 
            fontWeight: '600',
            color: metrics?.successRate >= 95 ? '#22c55e' : metrics?.successRate >= 80 ? '#f59e0b' : '#ef4444'
          }}>
            {Math.round(metrics?.successRate || 0)}%
          </div>
        </div>

        {/* Quota (seulement en mode non-compact) */}
        {!isCompact && (
          <div className="metric-item">
            <div style={{ 
              fontSize: 'var(--font-size-xs)', 
              color: 'var(--color-text-secondary)' 
            }}>
              Quota
            </div>
            <div style={{ 
              fontSize: 'var(--font-size-sm)', 
              fontWeight: '600',
              color: quotaUsage >= 90 ? '#ef4444' : quotaUsage >= 70 ? '#f59e0b' : '#22c55e'
            }}>
              {formatQuotaUsage(quotaUsage)}
            </div>
          </div>
        )}
      </div>

      {/* Barre de quota */}
      <div style={{
        height: '3px',
        backgroundColor: 'var(--color-bg-subtle)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginTop: 'var(--space-8)'
      }}>
        <div
          style={{
            height: '100%',
            width: `${Math.min(100, quotaUsage)}%`,
            backgroundColor: quotaUsage >= 90 ? '#ef4444' : quotaUsage >= 70 ? '#f59e0b' : '#22c55e',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Détails étendus */}
      {showDetails && (
        <div style={{ 
          marginTop: 'var(--space-12)',
          paddingTop: 'var(--space-12)',
          borderTop: '1px solid var(--color-border)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-8)',
            fontSize: 'var(--font-size-xs)'
          }}>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Requêtes aujourd'hui:</span>
              <span style={{ marginLeft: '4px', fontWeight: '500' }}>
                {metrics?.requestsToday || 0}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-secondary)' }}>Tokens utilisés:</span>
              <span style={{ marginLeft: '4px', fontWeight: '500' }}>
                {(metrics?.tokensUsed || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Overlay si indisponible */}
      {!isAvailable && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px'
        }}>
          <div style={{
            background: '#ef4444',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: 'var(--font-size-xs)',
            fontWeight: '500'
          }}>
            Indisponible
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Toggle pour le fallback automatique
 */
const FallbackToggle = ({ enabled, onToggle, disabled = false }) => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 'var(--space-12)',
      padding: 'var(--space-12)',
      background: 'var(--color-bg-subtle)',
      borderRadius: '8px',
      border: '1px solid var(--color-border)'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: 'var(--font-size-sm)', 
          fontWeight: '500',
          marginBottom: '2px'
        }}>
          Fallback automatique
        </div>
        <div style={{ 
          fontSize: 'var(--font-size-xs)', 
          color: 'var(--color-text-secondary)'
        }}>
          Basculement automatique en cas d'erreur
        </div>
      </div>
      
      <button
        onClick={onToggle}
        disabled={disabled}
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          border: 'none',
          background: enabled ? '#22c55e' : '#e5e7eb',
          position: 'relative',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s ease',
          opacity: disabled ? 0.5 : 1
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'white',
            position: 'absolute',
            top: '2px',
            left: enabled ? '22px' : '2px',
            transition: 'left 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        />
      </button>
    </div>
  );
};

/**
 * Section des notifications providers
 */
const ProviderNotifications = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  return (
    <div style={{ marginBottom: 'var(--space-16)' }}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={{
            padding: 'var(--space-12)',
            borderRadius: '8px',
            marginBottom: 'var(--space-8)',
            background: 
              notification.type === 'error' ? '#fef2f2' :
              notification.type === 'warning' ? '#fffbeb' : '#f0f9ff',
            border: `1px solid ${
              notification.type === 'error' ? '#fecaca' :
              notification.type === 'warning' ? '#fed7aa' : '#bfdbfe'
            }`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-12)'
          }}
        >
          <div style={{ 
            fontSize: '16px',
            marginTop: '2px'
          }}>
            {notification.type === 'error' ? '❌' : 
             notification.type === 'warning' ? '⚠️' : 'ℹ️'}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500',
              marginBottom: '2px',
              color: 
                notification.type === 'error' ? '#dc2626' :
                notification.type === 'warning' ? '#d97706' : '#2563eb'
            }}>
              {notification.message}
            </div>
            {notification.details && (
              <div style={{ 
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)'
              }}>
                {notification.details}
              </div>
            )}
          </div>

          <button
            onClick={() => onDismiss(notification.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

/**
 * Composant principal ProviderSelector
 */
const ProviderSelector = ({ 
  onProviderChange,
  layout = 'grid', // 'grid' | 'list' | 'compact'
  showFallbackToggle = true,
  showNotifications = true,
  showDetails = false
}) => {
  const [expandedProvider, setExpandedProvider] = useState(null);
  
  const {
    selectedProvider,
    fallbackEnabled,
    providersData,
    isLoading,
    notifications,
    selectProvider,
    toggleFallback,
    removeNotification,
    getOrderedProviders,
    refreshMetrics
  } = useProviderSelection();

  // Providers ordonnés
  const orderedProviders = getOrderedProviders();

  // Gestion de la sélection
  const handleProviderSelect = (providerId) => {
    const success = selectProvider(providerId);
    if (success && onProviderChange) {
      onProviderChange(providerId);
    }
  };

  // Layout styles
  const getLayoutStyles = () => {
    switch (layout) {
      case 'list':
        return { display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' };
      case 'compact':
        return { display: 'flex', gap: 'var(--space-8)' };
      default: // grid
        return { 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-16)'
        };
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 'var(--space-24)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-12)',
          color: 'var(--color-text-secondary)'
        }}>
          <div className="loading-spinner" style={{ 
            width: '20px', 
            height: '20px',
            border: '2px solid var(--color-border)',
            borderTop: '2px solid var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          Chargement des providers...
        </div>
      </div>
    );
  }

  return (
    <div className="provider-selector">
      {/* Header avec refresh */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 'var(--space-16)'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>
            <i className="fas fa-robot" style={{ marginRight: '8px' }}></i>
            Providers IA
          </h3>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)'
          }}>
            Sélectionnez votre provider préféré
          </p>
        </div>
        
        <button
          onClick={refreshMetrics}
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            padding: '8px 12px',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <i className="fas fa-sync-alt"></i>
          Actualiser
        </button>
      </div>

      {/* Notifications */}
      {showNotifications && (
        <ProviderNotifications
          notifications={notifications}
          onDismiss={removeNotification}
        />
      )}

      {/* Toggle Fallback */}
      {showFallbackToggle && (
        <div style={{ marginBottom: 'var(--space-16)' }}>
          <FallbackToggle
            enabled={fallbackEnabled}
            onToggle={toggleFallback}
          />
        </div>
      )}

      {/* Grid/List des providers */}
      <div style={getLayoutStyles()}>
        {orderedProviders.map(provider => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            isSelected={selectedProvider === provider.id}
            onSelect={handleProviderSelect}
            showDetails={showDetails || expandedProvider === provider.id}
            isCompact={layout === 'compact'}
          />
        ))}
      </div>

      {/* Message si aucun provider disponible */}
      {orderedProviders.filter(p => p.isAvailable).length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-24)',
          color: 'var(--color-text-secondary)'
        }}>
          <i className="fas fa-exclamation-triangle" style={{ 
            fontSize: '24px', 
            marginBottom: '8px',
            color: '#f59e0b'
          }}></i>
          <p style={{ margin: 0 }}>
            Aucun provider IA disponible actuellement
          </p>
          <button
            onClick={refreshMetrics}
            style={{
              marginTop: 'var(--space-12)',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)'
            }}
          >
            Réessayer
          </button>
        </div>
      )}
    </div>
  );
};

export default ProviderSelector;