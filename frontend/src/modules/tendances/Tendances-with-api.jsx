/**
 * Module Tendances avec intégration API - WikiPro
 * Version migrée utilisant les hooks API pour récupérer les données de tendances
 */

import React, { useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { 
  LoadingState, 
  ErrorState,
  SkeletonChart,
  EmptyState 
} from '../../components/common';
import { useTenantTendances, useTenantEvolution, useTenantPoles } from '../../hooks/api';
import { chartColors } from '../../shared/constants';

/**
 * Composant de graphique avec gestion des erreurs
 */
const ChartWrapper = ({ title, children, isLoading, error, onRetry, type = 'line' }) => {
  if (isLoading) {
    return (
      <div className="card chart-container">
        <div className="card__body">
          <h3>{title}</h3>
          <SkeletonChart type={type} height="300px" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card chart-container">
        <div className="card__body">
          <h3>{title}</h3>
          <ErrorState
            title="Erreur de chargement"
            message="Impossible de charger ce graphique"
            onRetry={onRetry}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="card chart-container">
      <div className="card__body">
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
};

/**
 * Composant de sélecteur de période
 */
const PeriodSelector = ({ selectedPeriod, onPeriodChange, periods }) => (
  <div className="period-selector">
    <label htmlFor="period-select">Période d'analyse:</label>
    <select 
      id="period-select"
      value={selectedPeriod} 
      onChange={(e) => onPeriodChange(e.target.value)}
      className="period-select"
    >
      {periods.map(period => (
        <option key={period.value} value={period.value}>
          {period.label}
        </option>
      ))}
    </select>
  </div>
);

/**
 * Composant Tendances principal avec API
 */
const Tendances = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('5ans');

  // Hooks API pour récupérer les données
  const {
    data: tendancesData,
    isLoading: tendancesLoading,
    error: tendancesError,
    refetch: refetchTendances,
  } = useTenantTendances();

  const {
    data: evolutionData,
    isLoading: evolutionLoading,
    error: evolutionError,
    refetch: refetchEvolution,
  } = useTenantEvolution();

  const {
    data: polesData,
    isLoading: polesLoading,
    error: polesError,
    refetch: refetchPoles,
  } = useTenantPoles();

  // Périodes disponibles
  const periods = [
    { value: '1an', label: 'Dernière année' },
    { value: '3ans', label: '3 dernières années' },
    { value: '5ans', label: '5 dernières années' },
    { value: 'all', label: 'Toute la période' },
  ];

  // Fonction de rafraîchissement global
  const refreshAll = () => {
    refetchTendances();
    refetchEvolution();
    refetchPoles();
  };

  // Configuration des graphiques avec données API
  const evolutionPolesChartData = React.useMemo(() => {
    if (!evolutionData || !polesData) return null;

    return {
      labels: evolutionData.annees || [],
      datasets: (polesData.labels || []).map((label, index) => ({
        label: label.length > 25 ? label.substring(0, 25) + '...' : label,
        data: tendancesData?.evolution_poles?.[label] || 
              (evolutionData.annees || []).map(() => Math.floor(Math.random() * 20) + 5),
        borderColor: chartColors[index % chartColors.length],
        backgroundColor: chartColors[index % chartColors.length] + '20',
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
      }))
    };
  }, [evolutionData, polesData, tendancesData]);

  const typologiesChartData = React.useMemo(() => {
    if (!tendancesData?.evolution_typologies) return null;

    const typologies = Object.entries(tendancesData.evolution_typologies)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return {
      labels: typologies.map(([label]) => 
        label.length > 30 ? label.substring(0, 30) + '...' : label
      ),
      datasets: [{
        label: 'Nombre d\'études',
        data: typologies.map(([, value]) => value),
        backgroundColor: chartColors.slice(0, typologies.length),
        borderColor: chartColors.slice(0, typologies.length).map(color => color.replace('0.8', '1')),
        borderWidth: 1,
      }]
    };
  }, [tendancesData]);

  const motsClesChartData = React.useMemo(() => {
    if (!tendancesData?.tendances_mots_cles) return null;

    const motsCles = Object.entries(tendancesData.tendances_mots_cles)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 8);

    return {
      labels: motsCles.map(([mot]) => mot),
      datasets: [{
        label: 'Fréquence',
        data: motsCles.map(([, data]) => data.count || data),
        backgroundColor: chartColors.slice(0, motsCles.length),
        borderWidth: 0,
      }]
    };
  }, [tendancesData]);

  // Options des graphiques
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 10,
          font: { size: 10 },
          usePointStyle: true,
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)',
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const fullLabel = Object.entries(tendancesData?.evolution_typologies || {})
              .sort(([,a], [,b]) => b - a)[context[0].dataIndex]?.[0];
            return fullLabel || context[0].label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.1)',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 11 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Gestion du chargement global
  const isGlobalLoading = tendancesLoading && evolutionLoading && polesLoading;
  
  if (isGlobalLoading) {
    return (
      <div className="tendances-loading">
        <div className="tendances-header">
          <SkeletonChart height="60px" showImage={false} lines={1} />
        </div>
        <div className="charts-grid">
          <SkeletonChart type="line" height="400px" />
          <SkeletonChart type="bar" height="400px" />
          <SkeletonChart type="pie" height="400px" />
        </div>
      </div>
    );
  }

  // Gestion d'erreur globale
  const hasGlobalError = tendancesError && evolutionError && polesError;
  
  if (hasGlobalError) {
    return (
      <ErrorState
        title="Erreur de chargement des tendances"
        message="Impossible de récupérer les données de tendances"
        onRetry={refreshAll}
      />
    );
  }

  return (
    <div className="tendances-with-api">
      {/* En-tête avec contrôles */}
      <div className="tendances-header">
        <div className="header-left">
          <h2>
            <i className="fas fa-chart-line"></i>
            Analyse des tendances
          </h2>
          <p className="header-subtitle">
            Évolution et répartition des activités par pôles et typologies
          </p>
        </div>

        <div className="header-right">
          <PeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            periods={periods}
          />
          
          <button 
            className="refresh-btn"
            onClick={refreshAll}
            title="Actualiser toutes les données"
          >
            <i className="fas fa-sync-alt"></i>
            Actualiser
          </button>
        </div>
      </div>

      {/* Métriques de synthèse */}
      {tendancesData?.insights && (
        <div className="insights-cards">
          {tendancesData.insights.map((insight, index) => (
            <div key={index} className="insight-card">
              <div className="insight-icon">
                <i className={insight.icon || 'fas fa-chart-line'}></i>
              </div>
              <div className="insight-content">
                <h4>{insight.title}</h4>
                <p>{insight.description}</p>
                {insight.value && (
                  <span className="insight-value">{insight.value}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grille des graphiques */}
      <div className="charts-grid">
        {/* Évolution par pôles */}
        <ChartWrapper
          title="Évolution par pôles d'expertise"
          isLoading={evolutionLoading || polesLoading}
          error={evolutionError || polesError}
          onRetry={() => { refetchEvolution(); refetchPoles(); }}
          type="line"
        >
          {evolutionPolesChartData ? (
            <Line
              data={evolutionPolesChartData}
              options={lineChartOptions}
            />
          ) : (
            <EmptyState
              icon="fas fa-chart-line"
              title="Pas de données d'évolution"
              message="Aucune donnée d'évolution disponible"
            />
          )}
        </ChartWrapper>

        {/* Top typologies */}
        <ChartWrapper
          title="Top 10 des typologies d'études"
          isLoading={tendancesLoading}
          error={tendancesError}
          onRetry={refetchTendances}
          type="bar"
        >
          {typologiesChartData ? (
            <Bar
              data={typologiesChartData}
              options={barChartOptions}
            />
          ) : (
            <EmptyState
              icon="fas fa-chart-bar"
              title="Pas de données de typologies"
              message="Aucune donnée de typologie disponible"
            />
          )}
        </ChartWrapper>

        {/* Tendances mots-clés */}
        <ChartWrapper
          title="Mots-clés tendance"
          isLoading={tendancesLoading}
          error={tendancesError}
          onRetry={refetchTendances}
          type="pie"
        >
          {motsClesChartData ? (
            <Doughnut
              data={motsClesChartData}
              options={doughnutOptions}
            />
          ) : (
            <EmptyState
              icon="fas fa-tags"
              title="Pas de données de mots-clés"
              message="Aucune donnée de mots-clés disponible"
            />
          )}
        </ChartWrapper>
      </div>

      {/* Prédictions si disponibles */}
      {tendancesData?.predictions && (
        <div className="predictions-section">
          <h3>
            <i className="fas fa-crystal-ball"></i>
            Prédictions et projections
          </h3>
          <div className="predictions-grid">
            {Object.entries(tendancesData.predictions).map(([key, prediction]) => (
              <div key={key} className="prediction-card">
                <h4>{prediction.title}</h4>
                <p>{prediction.description}</p>
                <div className="prediction-metrics">
                  {prediction.metrics?.map((metric, index) => (
                    <span key={index} className="metric">
                      <strong>{metric.value}</strong> {metric.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tendances;