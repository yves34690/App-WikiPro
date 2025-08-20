/**
 * Composant ProviderMetrics - Dashboard métriques providers IA - WikiPro
 * Quotas, latence, disponibilité et historique d'usage en temps réel
 */

import React, { useState, useMemo } from 'react';
import { useProviderSelection } from '../hooks/useProviderSelection';
import { 
  getProviderColor, 
  getProviderIcon, 
  formatLatency, 
  formatQuotaUsage,
  PROVIDER_STATUS 
} from '../services/aiProviders';

/**
 * Gauge circulaire pour les quotas
 */
const CircularGauge = ({ 
  value, 
  max = 100, 
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  showPercentage = true,
  label = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min(100, (value / max) * 100);
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  // Couleur dynamique selon le pourcentage
  const getColor = () => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#f59e0b';
    return color;
  };

  return (
    <div style={{ 
      position: 'relative', 
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dasharray 0.5s ease, stroke 0.3s ease'
          }}
        />
      </svg>
      
      {/* Center content */}
      <div style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        {showPercentage && (
          <div style={{
            fontSize: `${size * 0.15}px`,
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            lineHeight: 1
          }}>
            {Math.round(percentage)}%
          </div>
        )}
        {label && (
          <div style={{
            fontSize: `${size * 0.08}px`,
            color: 'var(--color-text-secondary)',
            marginTop: '2px'
          }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Barre de progression horizontale
 */
const ProgressBar = ({ 
  value, 
  max = 100, 
  height = 8,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  showLabel = true,
  label = ''
}) => {
  const percentage = Math.min(100, (value / max) * 100);
  
  // Couleur dynamique
  const getColor = () => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 70) return '#f59e0b';
    return color;
  };

  return (
    <div>
      {showLabel && label && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)'
        }}>
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div style={{
        width: '100%',
        height: `${height}px`,
        backgroundColor,
        borderRadius: `${height / 2}px`,
        overflow: 'hidden'
      }}>
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: getColor(),
            transition: 'width 0.5s ease, background-color 0.3s ease'
          }}
        />
      </div>
    </div>
  );
};

/**
 * Card de métriques pour un provider
 */
const ProviderMetricCard = ({ provider, data, isSelected, onSelect }) => {
  const { id, displayName, description } = provider;
  const { state, metrics } = data;
  const isAvailable = state?.isAvailable;
  const providerColor = getProviderColor(id);
  const icon = getProviderIcon(id);

  // Calcul du quota
  const quotaUsage = metrics?.quotaUsage || 0;
  
  // Status color
  const getStatusColor = () => {
    switch (state?.status) {
      case PROVIDER_STATUS.ONLINE: return '#22c55e';
      case PROVIDER_STATUS.OFFLINE: return '#6b7280';
      case PROVIDER_STATUS.ERROR: return '#ef4444';
      case PROVIDER_STATUS.RATE_LIMITED: return '#f59e0b';
      case PROVIDER_STATUS.QUOTA_EXCEEDED: return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <div
      onClick={() => onSelect(id)}
      style={{
        padding: 'var(--space-16)',
        background: isSelected 
          ? `linear-gradient(135deg, ${providerColor}10, ${providerColor}05)` 
          : 'var(--color-surface)',
        border: `2px solid ${isSelected ? providerColor : 'var(--color-border)'}`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        opacity: isAvailable ? 1 : 0.7
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--space-12)',
        marginBottom: 'var(--space-16)'
      }}>
        <div style={{ fontSize: '24px' }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            margin: 0, 
            fontSize: 'var(--font-size-base)',
            fontWeight: '600',
            color: isSelected ? providerColor : 'var(--color-text-primary)'
          }}>
            {displayName}
          </h4>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)',
            marginTop: '2px'
          }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(),
                boxShadow: `0 0 6px ${getStatusColor()}50`
              }}
            />
            <span style={{ 
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              textTransform: 'capitalize'
            }}>
              {state?.status || 'unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Métriques principales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-16)',
        marginBottom: 'var(--space-16)'
      }}>
        {/* Quota gauge */}
        <div style={{ textAlign: 'center' }}>
          <CircularGauge
            value={quotaUsage}
            max={100}
            size={80}
            strokeWidth={6}
            color={providerColor}
            label="Quota"
          />
        </div>

        {/* Métriques textuelles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <div>
            <div style={{ 
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              marginBottom: '2px'
            }}>
              Latence moyenne
            </div>
            <div style={{ 
              fontSize: 'var(--font-size-sm)',
              fontWeight: '600',
              color: 'var(--color-text-primary)'
            }}>
              {formatLatency(metrics?.averageLatency)}
            </div>
          </div>

          <div>
            <div style={{ 
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              marginBottom: '2px'
            }}>
              Taux de succès
            </div>
            <div style={{ 
              fontSize: 'var(--font-size-sm)',
              fontWeight: '600',
              color: metrics?.successRate >= 95 ? '#22c55e' : 
                     metrics?.successRate >= 80 ? '#f59e0b' : '#ef4444'
            }}>
              {Math.round(metrics?.successRate || 0)}%
            </div>
          </div>

          <div>
            <div style={{ 
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)',
              marginBottom: '2px'
            }}>
              Requêtes aujourd'hui
            </div>
            <div style={{ 
              fontSize: 'var(--font-size-sm)',
              fontWeight: '600',
              color: 'var(--color-text-primary)'
            }}>
              {(metrics?.requestsToday || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Tokens utilisés */}
      <div>
        <ProgressBar
          value={metrics?.tokensUsed || 0}
          max={1000000} // Ajuster selon le provider
          label={`Tokens: ${(metrics?.tokensUsed || 0).toLocaleString()}`}
          color={providerColor}
        />
      </div>

      {/* Badge indisponible */}
      {!isAvailable && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: '#ef4444',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: '500',
          textTransform: 'uppercase'
        }}>
          Indisponible
        </div>
      )}
    </div>
  );
};

/**
 * Vue globale des métriques
 */
const GlobalMetricsView = ({ globalStats, providersData }) => {
  const totalProviders = Object.keys(providersData).length;
  const availableProviders = Object.values(providersData).filter(p => p.state?.isAvailable).length;
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: 'var(--space-16)',
      marginBottom: 'var(--space-24)'
    }}>
      {/* Disponibilité générale */}
      <div style={{
        padding: 'var(--space-16)',
        background: 'var(--color-surface)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <CircularGauge
            value={availableProviders}
            max={totalProviders}
            size={100}
            color="#22c55e"
            showPercentage={false}
            label="Disponibilité"
          />
        </div>
        <div style={{ 
          fontSize: 'var(--font-size-lg)',
          fontWeight: '600',
          color: 'var(--color-text-primary)'
        }}>
          {availableProviders}/{totalProviders}
        </div>
        <div style={{ 
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-secondary)'
        }}>
          Providers disponibles
        </div>
      </div>

      {/* Requêtes totales */}
      <div style={{
        padding: 'var(--space-16)',
        background: 'var(--color-surface)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-8)'
        }}>
          <i className="fas fa-chart-line" style={{ color: 'var(--color-primary)' }}></i>
          <span style={{ 
            fontSize: 'var(--font-size-sm)',
            fontWeight: '500',
            color: 'var(--color-text-secondary)'
          }}>
            Requêtes aujourd'hui
          </span>
        </div>
        <div style={{ 
          fontSize: 'var(--font-size-2xl)',
          fontWeight: '600',
          color: 'var(--color-text-primary)'
        }}>
          {globalStats.totalRequests.toLocaleString()}
        </div>
      </div>

      {/* Latence moyenne globale */}
      <div style={{
        padding: 'var(--space-16)',
        background: 'var(--color-surface)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-8)'
        }}>
          <i className="fas fa-clock" style={{ color: 'var(--color-teal-500)' }}></i>
          <span style={{ 
            fontSize: 'var(--font-size-sm)',
            fontWeight: '500',
            color: 'var(--color-text-secondary)'
          }}>
            Latence moyenne
          </span>
        </div>
        <div style={{ 
          fontSize: 'var(--font-size-2xl)',
          fontWeight: '600',
          color: 'var(--color-text-primary)'
        }}>
          {formatLatency(globalStats.averageLatency)}
        </div>
      </div>

      {/* Taux de succès global */}
      <div style={{
        padding: 'var(--space-16)',
        background: 'var(--color-surface)',
        borderRadius: '12px',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-8)'
        }}>
          <i className="fas fa-check-circle" style={{ color: '#22c55e' }}></i>
          <span style={{ 
            fontSize: 'var(--font-size-sm)',
            fontWeight: '500',
            color: 'var(--color-text-secondary)'
          }}>
            Taux de succès
          </span>
        </div>
        <div style={{ 
          fontSize: 'var(--font-size-2xl)',
          fontWeight: '600',
          color: globalStats.overallSuccessRate >= 95 ? '#22c55e' : 
                 globalStats.overallSuccessRate >= 80 ? '#f59e0b' : '#ef4444'
        }}>
          {globalStats.overallSuccessRate}%
        </div>
      </div>
    </div>
  );
};

/**
 * Vue détaillée d'un provider sélectionné
 */
const ProviderDetailView = ({ provider, data }) => {
  const { displayName, capabilities, quotaInfo } = provider;
  const { state, metrics } = data;

  return (
    <div style={{
      padding: 'var(--space-20)',
      background: 'var(--color-surface)',
      borderRadius: '12px',
      border: '1px solid var(--color-border)',
      marginTop: 'var(--space-16)'
    }}>
      <h4 style={{
        margin: '0 0 var(--space-16) 0',
        fontSize: 'var(--font-size-lg)',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-8)'
      }}>
        <span style={{ fontSize: '24px' }}>{getProviderIcon(provider.id)}</span>
        Détails - {displayName}
      </h4>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--space-20)'
      }}>
        {/* Métriques détaillées */}
        <div>
          <h5 style={{ 
            margin: '0 0 var(--space-12) 0',
            fontSize: 'var(--font-size-base)',
            fontWeight: '600'
          }}>
            Métriques détaillées
          </h5>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-8)',
              background: 'var(--color-bg-subtle)',
              borderRadius: '6px'
            }}>
              <span style={{ fontSize: 'var(--font-size-sm)' }}>Requêtes totales</span>
              <span style={{ fontWeight: '600' }}>{(metrics?.requestsToday || 0).toLocaleString()}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-8)',
              background: 'var(--color-bg-subtle)',
              borderRadius: '6px'
            }}>
              <span style={{ fontSize: 'var(--font-size-sm)' }}>Tokens consommés</span>
              <span style={{ fontWeight: '600' }}>{(metrics?.tokensUsed || 0).toLocaleString()}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-8)',
              background: 'var(--color-bg-subtle)',
              borderRadius: '6px'
            }}>
              <span style={{ fontSize: 'var(--font-size-sm)' }}>Dernière requête</span>
              <span style={{ fontWeight: '600' }}>
                {metrics?.lastRequest 
                  ? new Date(metrics.lastRequest).toLocaleTimeString('fr-FR')
                  : 'Jamais'
                }
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--space-8)',
              background: 'var(--color-bg-subtle)',
              borderRadius: '6px'
            }}>
              <span style={{ fontSize: 'var(--font-size-sm)' }}>Temps de réponse</span>
              <span style={{ fontWeight: '600' }}>{formatLatency(state?.responseTime)}</span>
            </div>
          </div>
        </div>

        {/* Capacités */}
        <div>
          <h5 style={{ 
            margin: '0 0 var(--space-12) 0',
            fontSize: 'var(--font-size-base)',
            fontWeight: '600'
          }}>
            Capacités
          </h5>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            {Object.entries(capabilities || {}).map(([capability, level]) => {
              const getCapabilityColor = (level) => {
                switch (level) {
                  case 'excellent': return '#22c55e';
                  case 'très bon': return '#3b82f6';
                  case 'bon': return '#f59e0b';
                  default: return '#6b7280';
                }
              };

              return (
                <div key={capability} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  <span style={{ textTransform: 'capitalize' }}>{capability}</span>
                  <span style={{ 
                    color: getCapabilityColor(level),
                    fontWeight: '500'
                  }}>
                    {level === true ? '✓' : level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Informations quota */}
      {quotaInfo && (
        <div style={{ marginTop: 'var(--space-16)' }}>
          <h5 style={{ 
            margin: '0 0 var(--space-8) 0',
            fontSize: 'var(--font-size-base)',
            fontWeight: '600'
          }}>
            Informations quota
          </h5>
          <div style={{
            padding: 'var(--space-12)',
            background: 'var(--color-bg-subtle)',
            borderRadius: '6px',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)'
          }}>
            Limite: {quotaInfo.limit.toLocaleString()} {quotaInfo.type} par {quotaInfo.period} • 
            Reset: {quotaInfo.period === 'day' 
              ? `${quotaInfo.resetHour}h00` 
              : `le ${quotaInfo.resetDay} du mois`}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Composant principal ProviderMetrics
 */
const ProviderMetrics = ({ 
  selectedProvider,
  onProviderSelect,
  className = '',
  autoRefresh = true,
  refreshInterval = 30000
}) => {
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'detail'
  const [detailProvider, setDetailProvider] = useState(selectedProvider);

  const {
    providersData,
    isLoading,
    lastUpdate,
    refreshMetrics,
    getGlobalStats
  } = useProviderSelection({
    autoRefreshMetrics: autoRefresh,
    refreshInterval
  });

  // Statistiques globales
  const globalStats = useMemo(() => getGlobalStats(), [getGlobalStats]);

  // Providers ordonnés par disponibilité et performance
  const orderedProviders = useMemo(() => {
    return Object.entries(providersData)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => {
        // Disponibles en premier
        if (a.state?.isAvailable && !b.state?.isAvailable) return -1;
        if (!a.state?.isAvailable && b.state?.isAvailable) return 1;
        
        // Puis par taux de succès
        const aSuccess = a.metrics?.successRate || 0;
        const bSuccess = b.metrics?.successRate || 0;
        return bSuccess - aSuccess;
      });
  }, [providersData]);

  const handleProviderSelect = (providerId) => {
    setDetailProvider(providerId);
    if (onProviderSelect) {
      onProviderSelect(providerId);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 'var(--space-24)',
        color: 'var(--color-text-secondary)'
      }}>
        <div className="loading-spinner" style={{ marginRight: '8px' }} />
        Chargement des métriques...
      </div>
    );
  }

  return (
    <div className={`provider-metrics ${className}`}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-20)'
      }}>
        <div>
          <h3 style={{ 
            margin: 0, 
            fontSize: 'var(--font-size-xl)', 
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)'
          }}>
            <i className="fas fa-chart-bar" style={{ color: 'var(--color-primary)' }}></i>
            Métriques des Providers
          </h3>
          <p style={{ 
            margin: '4px 0 0 0',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)'
          }}>
            Surveillance en temps réel des performances et quotas
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
          {lastUpdate && (
            <span style={{ 
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-secondary)'
            }}>
              Mis à jour: {new Date(lastUpdate).toLocaleTimeString('fr-FR')}
            </span>
          )}
          
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
      </div>

      {/* Vue globale */}
      <GlobalMetricsView 
        globalStats={globalStats}
        providersData={providersData}
      />

      {/* Grid des providers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 'var(--space-16)'
      }}>
        {orderedProviders.map(provider => (
          <ProviderMetricCard
            key={provider.id}
            provider={provider}
            data={provider}
            isSelected={detailProvider === provider.id}
            onSelect={handleProviderSelect}
          />
        ))}
      </div>

      {/* Vue détaillée du provider sélectionné */}
      {detailProvider && providersData[detailProvider] && (
        <ProviderDetailView
          provider={providersData[detailProvider]}
          data={providersData[detailProvider]}
        />
      )}
    </div>
  );
};

export default ProviderMetrics;