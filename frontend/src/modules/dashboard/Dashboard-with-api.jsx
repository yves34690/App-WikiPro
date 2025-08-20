/**
 * Module Dashboard avec intégration API - WikiPro
 * Version migrée utilisant les hooks API pour récupérer les données
 */

import React from 'react';
import { 
  LoadingState, 
  SkeletonCard, 
  ErrorState 
} from '../../components/common';
import { useTenantDashboard } from '../../hooks/api';
import { Kpis, Document360Widget, SyntheseTable } from './components';
import { EvolutionChart, PolesChart } from '../../components/charts';

/**
 * Composant Dashboard avec API
 */
const Dashboard = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useTenantDashboard();

  // Gestion du chargement
  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="kpis-grid">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonCard key={i} height="120px" showImage={false} lines={2} />
          ))}
        </div>
        <div className="widget-loading">
          <SkeletonCard height="200px" showImage={false} lines={4} />
        </div>
        <div className="charts-grid">
          <LoadingState type="chart" height="300px" />
          <LoadingState type="chart" type="pie" height="300px" />
        </div>
        <div className="table-loading">
          <LoadingState type="list" items={5} height="60px" />
        </div>
      </div>
    );
  }

  // Gestion des erreurs
  if (error) {
    return (
      <ErrorState
        title="Erreur de chargement du dashboard"
        message="Impossible de récupérer les données du dashboard"
        error={process.env.NODE_ENV === 'development' ? error : null}
        showDetails={process.env.NODE_ENV === 'development'}
        onRetry={refetch}
      />
    );
  }

  // Gestion des données manquantes
  if (!dashboardData) {
    return (
      <LoadingState
        type="empty"
        icon="fas fa-tachometer-alt"
        title="Dashboard non disponible"
        message="Aucune donnée de dashboard disponible pour ce tenant"
        action={
          <button 
            className="btn-primary"
            onClick={refetch}
            type="button"
          >
            <i className="fas fa-redo"></i>
            Actualiser
          </button>
        }
      />
    );
  }

  return (
    <div className="dashboard-with-api">
      {/* KPIs avec données API */}
      <Kpis data={dashboardData.kpis} />
      
      {/* Widget Document360 */}
      <Document360Widget data={dashboardData} />
      
      {/* Graphiques avec données API */}
      <div className="charts-grid">
        <EvolutionChart data={dashboardData.evolution} />
        <PolesChart data={dashboardData.poles} />
      </div>
      
      {/* Table de synthèse */}
      <SyntheseTable data={dashboardData.synthese || []} />
    </div>
  );
};

export default Dashboard;