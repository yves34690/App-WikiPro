import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { chartColors } from '../../shared/constants';
import { appData } from '../../data.js';

const Poles = () => (
  <>
    <div className="charts-grid">
      <div className="card chart-container">
        <div className="card__body">
          <h3>Répartition par pôles</h3>
          <Pie
            data={{
              labels: appData.poles.labels.map(label => label.length > 20 ? label.substring(0, 20) + '...' : label),
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
                  position: 'right',
                  labels: {
                    boxWidth: 12,
                    padding: 8,
                    font: {
                      size: 10
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>
      <div className="card chart-container">
        <div className="card__body">
          <h3>Top 15 des typologies</h3>
          <Bar
            data={{
              labels: appData.top_typologies.labels.slice(0, 15).map(label => label.length > 20 ? label.substring(0, 20) + '...' : label),
              datasets: [{
                label: 'Nombre d\'études',
                data: appData.top_typologies.values.slice(0, 15),
                backgroundColor: chartColors[2],
                borderColor: chartColors[2],
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
    </div>
    <div className="card">
      <div className="card__body">
        <h3>Tableau détaillé par pôle et typologie</h3>
        <div className="poles-details" id="polesDetails">
          {appData.poles.labels.map((pole, index) => (
            <div key={pole} className="pole-detail">
              <h4>{pole}</h4>
              <div className="pole-studies">{appData.poles.values[index]} études</div>
              <ul className="pole-typologies">
                {appData.top_typologies.labels.slice(0, 3).map(typo => <li key={typo}>• {typo}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
);

export default Poles;