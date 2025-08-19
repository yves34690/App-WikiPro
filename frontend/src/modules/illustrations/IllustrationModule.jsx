import React, { useState } from 'react';
import { appData } from '../../data.js';

const IllustrationModule = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [searchTags, setSearchTags] = useState('');

  const filteredIllustrations = appData.illustrations.filter(illustration => 
    (!selectedCategory || illustration.category === selectedCategory) &&
    (!selectedType || illustration.type === selectedType) &&
    (!searchTags || illustration.tags.some(tag => 
      tag.toLowerCase().includes(searchTags.toLowerCase())
    ))
  );

  return (
    <>
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label className="form-label">Catégorie</label>
            <select className="form-control" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">Toutes les catégories</option>
              <option value="Urbanisme">Urbanisme</option>
              <option value="Démographie">Démographie</option>
              <option value="Économie">Économie</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Type</label>
            <select className="form-control" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="">Tous les types</option>
              <option value="Schéma">Schéma</option>
              <option value="Graphique">Graphique</option>
              <option value="Cartographie">Cartographie</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Recherche par tags</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ex: aménagement, urbain..."
              value={searchTags}
              onChange={(e) => setSearchTags(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card__body">
            <h3>Illustrations disponibles ({filteredIllustrations.length})</h3>
            <div className="methodologies-grid">
              {filteredIllustrations.map(illustration => (
                <div key={illustration.id} className="methodology-card">
                  <div className="illustration-preview">
                    <i className="fas fa-image" style={{fontSize: '48px', color: 'var(--color-text-muted)'}}></i>
                  </div>
                  <div className="methodology-content">
                    <h4>{illustration.title}</h4>
                    <p>{illustration.description}</p>
                    <div className="methodology-meta">
                      <span className={`methodology-impact methodology-impact--${illustration.category.toLowerCase()}`}>
                        {illustration.category}
                      </span>
                      <span className="status status--info">
                        {illustration.type}
                      </span>
                    </div>
                    <div className="tags-container">
                      {illustration.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                    <div className="methodology-usage">
                      <i className="fas fa-info-circle"></i>
                      <span>{illustration.usage}</span>
                    </div>
                    <div className="methodology-actions">
                      <button className="btn btn--primary btn--sm">Sélectionner</button>
                      <button className="btn btn--outline btn--sm">Aperçu</button>
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

export default IllustrationModule;