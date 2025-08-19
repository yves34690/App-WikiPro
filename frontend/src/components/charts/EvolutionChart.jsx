import React from 'react';
import { Line } from 'react-chartjs-2';
import { chartColors } from '../../shared/constants';
import { appData } from '../../data.js';

/**
 * Composant EvolutionChart - Graphique d'évolution du nombre d'études par année
 */
const EvolutionChart = () => (
  <div className="card chart-container">
    <div className="card__body">
      <h3>Évolution du nombre d'études par année</h3>
      <Line
        data={{
          labels: appData.evolution_annuelle.annees,
          datasets: [{
            label: 'Nombre d\'études',
            data: appData.evolution_annuelle.nombres,
            borderColor: chartColors[0],
            backgroundColor: chartColors[0] + '20',
            tension: 0.4,
            fill: true
          }]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }}
      />
    </div>
  </div>
);

export default EvolutionChart;