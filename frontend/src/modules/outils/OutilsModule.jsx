import React, { useState } from 'react';
import { appData } from '../../data.js';

const OutilsModule = () => {
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredOutils = appData.outils.filter(outil => 
    !selectedCategory || outil.category === selectedCategory
  );

  return (
    <>
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Catégorie</label>
            <select className="form-control" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">Toutes les catégories</option>
              <option value="Diagnostic">Diagnostic</option>
              <option value="Gouvernance">Gouvernance</option>
              <option value="Analyse">Analyse</option>
            </select>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card__body">
            <h3>Outils disponibles</h3>
            <div className="methodologies-grid">
              {filteredOutils.map(outil => (
                <div key={outil.id} className="methodology-card">
                  <div className="methodology-header">
                    <h4>{outil.name}</h4>
                    <span className={`methodology-impact methodology-impact--${outil.impact.toLowerCase()}`}>
                      {outil.impact}
                    </span>
                  </div>
                  <p className="methodology-description">{outil.description}</p>
                  
                  <div className="methodology-section">
                    <h5><i className="fas fa-list-ul"></i> Instructions d'utilisation</h5>
                    <div className="instructions-list">
                      {outil.instructions.split('\n').map((instruction, index) => (
                        <div key={index} className="instruction-item">
                          <i className="fas fa-chevron-right"></i>
                          <span>{instruction}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="methodology-section">
                    <h5><i className="fas fa-cog"></i> Mobilisation</h5>
                    <p className="mobilisation-text">{outil.mobilisation}</p>
                  </div>

                  <div className="methodology-meta">
                    <span className={`status status--${outil.category.toLowerCase() === 'diagnostic' ? 'info' : outil.category.toLowerCase() === 'gouvernance' ? 'success' : 'warning'}`}>
                      {outil.category}
                    </span>
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

export default OutilsModule;