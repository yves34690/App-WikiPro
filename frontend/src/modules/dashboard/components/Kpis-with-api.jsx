/**
 * Composant Kpis avec intégration API - WikiPro
 * Version migrée utilisant les données API
 */

import React from 'react';
import { KpiCard } from '../../../components/charts';
import { LoadingState, SkeletonCard } from '../../../components/common';
import { useTenantKPIs } from '../../../hooks/api';

/**
 * Composant KPI avec animation et gestion d'état
 */
const AnimatedKpiCard = ({ icon, value, label, isLoading, color = 'primary' }) => {
  if (isLoading) {
    return <SkeletonCard height="120px" showImage={false} lines={2} />;
  }

  return (
    <div className={`kpi-card-wrapper ${color}`}>
      <KpiCard 
        icon={icon} 
        value={value || 0} 
        label={label}
        color={color}
        animated={true}
      />
    </div>
  );
};

/**
 * Composant Kpis principal avec API
 */
const Kpis = ({ data: propData }) => {
  const {
    data: apiData,
    isLoading,
    error,
    refetch,
  } = useTenantKPIs({
    // N'utiliser l'API que si pas de données en props
    enabled: !propData,
  });

  // Utiliser les données des props si disponibles, sinon l'API
  const kpisData = propData || apiData;

  // Configuration des KPIs
  const kpisConfig = [
    {
      key: 'total_etudes',
      icon: 'fa-file-alt',
      label: 'Études totales',
      color: 'primary',
      fallback: 0,
    },
    {
      key: 'total_mots_cles',
      icon: 'fa-tags',
      label: 'Mots-clés uniques',
      color: 'success',
      fallback: 0,
    },
    {
      key: 'nb_poles',
      icon: 'fa-sitemap',
      label: 'Pôles d\'expertise',
      color: 'info',
      fallback: 0,
    },
    {
      key: 'nb_typologies',
      icon: 'fa-layer-group',
      label: 'Typologies d\'études',
      color: 'warning',
      fallback: 0,
    },
  ];

  // Gestion des erreurs
  if (error && !propData) {
    return (
      <div className="kpis-error">
        <LoadingState
          type="error"
          title="Erreur KPIs"
          message="Impossible de charger les indicateurs"
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="kpis-container">
      <div className="kpis-header">
        <h2>
          <i className="fas fa-tachometer-alt"></i>
          Indicateurs clés
        </h2>
        {!propData && (
          <button 
            className="refresh-btn"
            onClick={refetch}
            title="Actualiser les KPIs"
            disabled={isLoading}
          >
            <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
          </button>
        )}
      </div>

      <div className="kpis-grid">
        {kpisConfig.map((kpi) => (
          <AnimatedKpiCard
            key={kpi.key}
            icon={kpi.icon}
            value={kpisData?.[kpi.key] ?? kpi.fallback}
            label={kpi.label}
            color={kpi.color}
            isLoading={isLoading && !propData}
          />
        ))}
      </div>

      {/* Informations supplémentaires */}
      {kpisData && (
        <div className="kpis-meta">
          <span className="last-update">
            {kpisData.last_updated ? (
              <>
                <i className="fas fa-clock"></i>
                Mis à jour: {new Date(kpisData.last_updated).toLocaleDateString('fr-FR')}
              </>
            ) : (
              <>
                <i className="fas fa-info-circle"></i>
                Données en temps réel
              </>
            )}
          </span>
          
          {kpisData.growth_rate && (
            <span className={`growth-indicator ${kpisData.growth_rate >= 0 ? 'positive' : 'negative'}`}>
              <i className={`fas ${kpisData.growth_rate >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
              {Math.abs(kpisData.growth_rate)}% ce mois
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Kpis;