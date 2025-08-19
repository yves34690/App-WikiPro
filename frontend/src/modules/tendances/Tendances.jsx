import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { chartColors } from '../../shared/constants';
import { appData } from '../../data.js';

const Tendances = () => (
    <div className="charts-grid">
        <div className="card chart-container">
            <div className="card__body">
                <h3>Évolution par pôles d'expertise</h3>
                <Line
                    data={{
                        labels: appData.evolution_annuelle.annees,
                        datasets: appData.poles.labels.map((label, index) => ({
                            label: label.length > 20 ? label.substring(0, 20) + '...' : label,
                            data: appData.evolution_annuelle.annees.map(() => Math.floor(Math.random() * 20) + 5),
                            borderColor: chartColors[index],
                            backgroundColor: chartColors[index] + '20',
                            tension: 0.3
                        }))
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
                                        size: 10
                                    }
                                }
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
        <div className="card chart-container">
            <div className="card__body">
                <h3>Top 10 des typologies d'études</h3>
                <Bar
                    data={{
                        labels: appData.top_typologies.labels.map(label => label.length > 25 ? label.substring(0, 25) + '...' : label),
                        datasets: [{
                            label: 'Nombre d\'études',
                            data: appData.top_typologies.values,
                            backgroundColor: chartColors[1],
                            borderColor: chartColors[1],
                            borderWidth: 1
                        }]
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true
                            }
                        }
                    }}
                />
            </div>
        </div>
    </div>
);

export default Tendances;