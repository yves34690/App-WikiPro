import React from 'react';

/**
 * Indicateur de statut de connexion WebSocket
 */
const ConnectionStatus = ({ status }) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return {
          icon: 'fas fa-wifi',
          text: 'Connecté',
          color: 'var(--color-success)',
          bgColor: 'rgba(34, 197, 94, 0.1)'
        };
      case 'connecting':
        return {
          icon: 'fas fa-spinner fa-spin',
          text: 'Connexion...',
          color: 'var(--color-warning)',
          bgColor: 'rgba(234, 179, 8, 0.1)'
        };
      case 'disconnected':
        return {
          icon: 'fas fa-wifi-slash',
          text: 'Déconnecté',
          color: 'var(--color-error)',
          bgColor: 'rgba(239, 68, 68, 0.1)'
        };
      case 'error':
        return {
          icon: 'fas fa-exclamation-triangle',
          text: 'Erreur',
          color: 'var(--color-error)',
          bgColor: 'rgba(239, 68, 68, 0.1)'
        };
      default:
        return {
          icon: 'fas fa-question-circle',
          text: 'Inconnu',
          color: 'var(--color-text-muted)',
          bgColor: 'rgba(107, 114, 128, 0.1)'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-6)',
      padding: 'var(--space-4) var(--space-8)',
      backgroundColor: statusInfo.bgColor,
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--font-size-xs)',
      fontWeight: '500',
      color: statusInfo.color,
      border: `1px solid ${statusInfo.color}`,
      backdropFilter: 'blur(10px)'
    }}>
      {/* Icon avec animation conditionnelle */}
      <i 
        className={statusInfo.icon}
        style={{ 
          fontSize: '10px',
          ...(status === 'connecting' ? { animation: 'spin 1s linear infinite' } : {})
        }}
      ></i>
      
      {/* Status text */}
      <span style={{ whiteSpace: 'nowrap' }}>
        {statusInfo.text}
      </span>

      {/* Pulse animation pour connected */}
      {status === 'connected' && (
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: statusInfo.color,
          animation: 'pulse 2s infinite'
        }}></div>
      )}

      {/* CSS pour les animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
};

export default ConnectionStatus;