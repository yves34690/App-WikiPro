/**
 * LoadingState - Composants d'état de chargement
 * Gère tous les états de chargement de l'application
 */

import React from 'react';

/**
 * Composant de chargement simple
 */
const LoadingSpinner = ({ size = 'medium', color = 'primary' }) => {
  const sizeClass = `spinner-${size}`;
  const colorClass = `spinner-${color}`;
  
  return (
    <div className={`spinner ${sizeClass} ${colorClass}`}>
      <div className="spinner-circle"></div>
    </div>
  );
};

/**
 * Composant de chargement avec texte
 */
const LoadingWithText = ({ message = 'Chargement...', size = 'medium' }) => (
  <div className="loading-with-text">
    <LoadingSpinner size={size} />
    <p className="loading-message">{message}</p>
  </div>
);

/**
 * Skeleton loader pour les cartes
 */
const SkeletonCard = ({ height = '200px', showImage = true, lines = 3 }) => (
  <div className="skeleton-card" style={{ height }}>
    {showImage && <div className="skeleton-image"></div>}
    <div className="skeleton-content">
      {Array.from({ length: lines }, (_, i) => (
        <div 
          key={i}
          className="skeleton-line"
          style={{ 
            width: i === lines - 1 ? '60%' : '100%',
            animationDelay: `${i * 0.1}s`
          }}
        ></div>
      ))}
    </div>
  </div>
);

/**
 * Skeleton loader pour les listes
 */
const SkeletonList = ({ items = 5, height = '60px' }) => (
  <div className="skeleton-list">
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="skeleton-list-item" style={{ height }}>
        <div className="skeleton-avatar"></div>
        <div className="skeleton-content">
          <div className="skeleton-line" style={{ width: '70%' }}></div>
          <div className="skeleton-line" style={{ width: '40%' }}></div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton loader pour les graphiques
 */
const SkeletonChart = ({ type = 'line', height = '300px' }) => {
  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <div className="skeleton-chart-pie">
            <div className="skeleton-pie-chart"></div>
          </div>
        );
      case 'bar':
        return (
          <div className="skeleton-chart-bars">
            {Array.from({ length: 6 }, (_, i) => (
              <div 
                key={i}
                className="skeleton-bar"
                style={{ 
                  height: `${40 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        );
      default: // line
        return (
          <div className="skeleton-chart-line">
            <svg viewBox="0 0 400 200" className="skeleton-line-chart">
              <path 
                d="M0,150 Q100,50 200,100 T400,80" 
                className="skeleton-path"
              />
              {Array.from({ length: 8 }, (_, i) => (
                <circle
                  key={i}
                  cx={i * 50 + 25}
                  cy={120 - Math.random() * 80}
                  r="3"
                  className="skeleton-point"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="skeleton-chart" style={{ height }}>
      {renderChart()}
    </div>
  );
};

/**
 * Composant d'erreur générique
 */
const ErrorState = ({ 
  title = 'Une erreur est survenue',
  message = 'Impossible de charger les données',
  error = null,
  onRetry = null,
  showDetails = false,
}) => (
  <div className="error-state">
    <div className="error-state-content">
      <div className="error-icon">
        <i className="fas fa-exclamation-circle"></i>
      </div>
      <h3>{title}</h3>
      <p className="error-message">{message}</p>
      
      {showDetails && error && (
        <details className="error-details">
          <summary>Détails de l'erreur</summary>
          <pre>{error.toString()}</pre>
        </details>
      )}
      
      {onRetry && (
        <button 
          className="btn-secondary"
          onClick={onRetry}
          type="button"
        >
          <i className="fas fa-redo"></i>
          Réessayer
        </button>
      )}
    </div>
  </div>
);

/**
 * Composant d'état vide
 */
const EmptyState = ({ 
  icon = 'fas fa-inbox',
  title = 'Aucune donnée',
  message = 'Il n\'y a rien à afficher pour le moment',
  action = null,
}) => (
  <div className="empty-state">
    <div className="empty-state-content">
      <div className="empty-icon">
        <i className={icon}></i>
      </div>
      <h3>{title}</h3>
      <p className="empty-message">{message}</p>
      {action}
    </div>
  </div>
);

/**
 * Composant principal LoadingState
 */
const LoadingState = ({
  type = 'default',
  message = 'Chargement...',
  size = 'medium',
  overlay = false,
  ...props
}) => {
  const content = (() => {
    switch (type) {
      case 'spinner':
        return <LoadingSpinner size={size} {...props} />;
      case 'card':
        return <SkeletonCard {...props} />;
      case 'list':
        return <SkeletonList {...props} />;
      case 'chart':
        return <SkeletonChart {...props} />;
      case 'error':
        return <ErrorState {...props} />;
      case 'empty':
        return <EmptyState {...props} />;
      default:
        return <LoadingWithText message={message} size={size} />;
    }
  })();

  if (overlay) {
    return (
      <div className="loading-overlay">
        <div className="loading-overlay-content">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

/**
 * Hook pour gérer les états de chargement
 */
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [error, setError] = React.useState(null);

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const setErrorState = React.useCallback((error) => {
    setIsLoading(false);
    setError(error);
  }, []);

  const reset = React.useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError: setErrorState,
    reset,
  };
};

/**
 * Composant de suspension avec fallback
 */
export const SuspenseWrapper = ({ 
  children, 
  fallback = <LoadingState message="Chargement du module..." />,
  errorFallback = null,
}) => {
  return (
    <React.Suspense fallback={fallback}>
      {errorFallback ? (
        <ErrorBoundary fallback={errorFallback}>
          {children}
        </ErrorBoundary>
      ) : (
        children
      )}
    </React.Suspense>
  );
};

/**
 * Error Boundary simple
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <LoadingState
          type="error"
          title="Erreur du composant"
          message="Une erreur est survenue lors du rendu de ce composant"
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

export {
  LoadingSpinner,
  LoadingWithText,
  SkeletonCard,
  SkeletonList,
  SkeletonChart,
  ErrorState,
  EmptyState,
  ErrorBoundary,
};

export default LoadingState;