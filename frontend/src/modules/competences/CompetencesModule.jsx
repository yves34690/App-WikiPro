import React, { useState } from 'react';
import { appData } from '../../data.js';

const CompetencesModule = () => {
  const [selectedPole, setSelectedPole] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('');

  const filteredMatrice = appData.matriceCompetences.data.filter(item => 
    (!selectedPole || item.pole === selectedPole) &&
    (!selectedNiveau || item.niveau_requis === selectedNiveau)
  );

  return (
    <>
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Pôle</label>
            <select className="form-control" value={selectedPole} onChange={(e) => setSelectedPole(e.target.value)}>
              <option value="">Tous les pôles</option>
              {appData.matriceCompetences.poles.map((pole, index) => (
                <option key={index} value={pole}>{pole}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Niveau requis</label>
            <select className="form-control" value={selectedNiveau} onChange={(e) => setSelectedNiveau(e.target.value)}>
              <option value="">Tous les niveaux</option>
              {appData.matriceCompetences.niveaux.map((niveau, index) => (
                <option key={index} value={niveau}>{niveau}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card__body">
            <h3>Liste des compétences disponibles</h3>
            <div className="word-cloud">
              {appData.competences.map((competence, index) => (
                <span 
                  key={index} 
                  className="word-item word-size-2"
                  title={`Compétence: ${competence}`}
                >
                  {competence}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card__body">
            <h3>Matrice de compétences</h3>
            <div className="matrice-legend" style={{marginBottom: 'var(--space-16)'}}>
              <div className="filters" style={{justifyContent: 'center', gap: 'var(--space-24)'}}>
                {appData.matriceCompetences.niveaux.map(niveau => (
                  <div key={niveau} className="legend-item">
                    <span className={`status ${niveau === 'Débutant' ? 'status--info' : niveau === 'Intermédiaire' ? 'status--warning' : niveau === 'Confirmé' ? 'status--success' : 'status--error'}`}>
                      {niveau}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="methodologies-grid">
              {filteredMatrice.map((item, index) => (
                <div key={index} className="methodology-card">
                  <div className="methodology-header">
                    <h4>{item.competence}</h4>
                    <span className={`methodology-impact methodology-impact--${item.niveau_requis.toLowerCase()}`}>
                      {item.niveau_requis}
                    </span>
                  </div>
                  <p className="methodology-pole">{item.pole}</p>
                  <div className="methodology-meta">
                    <div className="kpi-item">
                      <span className="kpi-value">{item.disponible}</span>
                      <span className="kpi-label">personnes disponibles</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompetencesModule;