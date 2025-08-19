import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { chartColors } from '../../shared/constants';
import { appData } from '../../data.js';

/**
 * Composant PolesChart - Graphique en doughnut de la répartition par pôles
 */
const PolesChart = () => (
  <div className="card chart-container">
    <div className="card__body">
      <h3>Répartition par pôles</h3>
      <Doughnut
        data={{
          labels: appData.poles.labels.map(label => label.length > 30 ? label.substring(0, 30) + '...' : label),
          datasets: [{
            data: appData.poles.values,
            backgroundColor: chartColors.slice(0, appData.poles.values.length)
          }]
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 10,
                font: {
                  size: 11
                }
              }
            }
          }
        }}
      />
    </div>
  </div>
);

export default PolesChart;