import React from 'react';
import { Bar } from 'react-chartjs-2';
import { chartColors } from '../../../shared/constants';
import { appData } from '../../../data.js';

/**
 * Composant HeatmapChart - Heatmap de densité des mots-clés
 */
const HeatmapChart = () => {
  const allWords = [];
  Object.keys(appData.mots_cles_par_categorie).forEach(category => {
    appData.mots_cles_par_categorie[category].labels.forEach((word, index) => {
      allWords.push({
        word: word,
        value: appData.mots_cles_par_categorie[category].values[index],
        category: category
      });
    });
  });

  allWords.sort((a, b) => b.value - a.value);
  const topWords = allWords.slice(0, 15);

  return (
    <div className="card chart-container">
      <div className="card__body">
        <h3>Heatmap de densité des mots-clés</h3>
        <Bar
          data={{
            labels: topWords.map(item => item.word),
            datasets: [{
              label: 'Fréquence',
              data: topWords.map(item => item.value),
              backgroundColor: topWords.map((item, index) => chartColors[index % chartColors.length]),
              borderWidth: 1
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
              x: {
                ticks: {
                  maxRotation: 45
                }
              },
              y: {
                beginAtZero: true
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default HeatmapChart;