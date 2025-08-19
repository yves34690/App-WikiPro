import React, { useState } from 'react';
import { appData } from '../../data.js';

const CVthequeModule = () => {
  const [searchName, setSearchName] = useState('');
  const [selectedPole, setSelectedPole] = useState('');
  const [selectedDisponibilite, setSelectedDisponibilite] = useState('');

  const filteredCVs = appData.cvtheque.filter(cv => 
    (!searchName || cv.nom.toLowerCase().includes(searchName.toLowerCase())) &&
    (!selectedPole || cv.pole === selectedPole) &&
    (!selectedDisponibilite || cv.disponibilite === selectedDisponibilite)
  );

  return (
    <>
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Nom</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Rechercher par nom..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="form-label">Pôle</label>
            <select className="form-control" value={selectedPole} onChange={(e) => setSelectedPole(e.target.value)}>
              <option value="">Tous les pôles</option>
              {appData.poles.labels.map((pole, index) => (
                <option key={index} value={pole}>{pole}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Disponibilité</label>
            <select className="form-control" value={selectedDisponibilite} onChange={(e) => setSelectedDisponibilite(e.target.value)}>
              <option value="">Toutes</option>
              <option value="Disponible">Disponible</option>
              <option value="Partiellement disponible">Partiellement disponible</option>
              <option value="Non disponible">Non disponible</option>
            </select>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card__body">
            <h3>Profils disponibles ({filteredCVs.length})</h3>
            <div className="methodologies-grid">
              {filteredCVs.map(cv => (
                <div key={cv.id} className="methodology-card">
                  <div className="cv-header">
                    <div className="cv-photo">
                      <i className="fas fa-user-circle" style={{fontSize: '40px', color: 'var(--color-primary)'}}></i>
                    </div>
                    <div className="cv-basic-info">
                      <h4>{cv.nom}</h4>
                      <p className="cv-poste">{cv.poste}</p>
                      <p className="cv-experience">{cv.experience} d'expérience</p>
                    </div>
                    <div className="cv-availability">
                      <span className={`status ${cv.disponibilite === 'Disponible' ? 'status--success' : cv.disponibilite === 'Partiellement disponible' ? 'status--warning' : 'status--error'}`}>
                        {cv.disponibilite}
                      </span>
                    </div>
                  </div>
                  
                  <div className="cv-details">
                    <div className="methodology-section">
                      <div className="detail-row">
                        <i className="fas fa-building"></i>
                        <span><strong>Pôle:</strong> {cv.pole}</span>
                      </div>
                      <div className="detail-row">
                        <i className="fas fa-map-marker-alt"></i>
                        <span><strong>Localisation:</strong> {cv.localisation}</span>
                      </div>
                    </div>

                    <div className="methodology-section">
                      <h5><i className="fas fa-skills"></i> Compétences clés</h5>
                      <div className="tags-container">
                        {cv.competences.map(competence => (
                          <span key={competence} className="tag">{competence}</span>
                        ))}
                      </div>
                    </div>

                    <div className="methodology-actions">
                      <button className="btn btn--primary btn--sm">Sélectionner</button>
                      <button className="btn btn--outline btn--sm">Voir détails</button>
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

export default CVthequeModule;