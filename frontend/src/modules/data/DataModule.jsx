import React, { useState } from 'react';
import { appData } from '../../data.js';

const DataModule = () => {
  const [selectedType, setSelectedType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSources = appData.dataSources.filter(source => 
    (!selectedType || source.type === selectedType) &&
    (!searchTerm || source.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     source.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Type de données</label>
            <select className="form-control" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="">Tous les types</option>
              <option value="Démographie">Démographie</option>
              <option value="Territorial">Territorial</option>
              <option value="Économique">Économique</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Rechercher</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Rechercher une source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="charts-grid">
        <div className="card">
          <div className="card__body">
            <h3>Sources de données disponibles</h3>
            <div className="methodologies-grid">
              {filteredSources.map(source => (
                <div key={source.id} className="methodology-card">
                  <div className="methodology-header">
                    <h4>{source.name}</h4>
                    <span className={`status ${source.status === 'active' ? 'status--success' : 'status--warning'}`}>
                      {source.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div className="methodology-meta">
                    <span className={`methodology-impact methodology-impact--${source.type.toLowerCase()}`}>
                      {source.type}
                    </span>
                  </div>
                  <p>{source.description}</p>
                  <div className="methodology-details">
                    <div className="detail-item">
                      <i className="fas fa-key"></i>
                      <span><strong>Accès:</strong> {source.access}</span>
                    </div>
                    <div className="detail-item">
                      <i className="fas fa-calendar"></i>
                      <span><strong>MAJ:</strong> {source.lastUpdate}</span>
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

export default DataModule;