import React from 'react';
import { appData } from '../../../data.js';

/**
 * Composant FiltersSection - Filtres pour les mots-clés
 */
const FiltersSection = ({
  categorieFilter,
  setCategorieFilter,
  poleFilter,
  setPoleFilter,
  typologieFilter,
  setTypologieFilter
}) => (
  <div className="filters-section">
    <div className="filters">
      <div className="filter-group">
        <label className="form-label">Catégorie</label>
        <select id="categorieFilter" className="form-control" value={categorieFilter} onChange={(e) => setCategorieFilter(e.target.value)}>
          <option value="">Toutes les catégories</option>
          <option value="Contexte">Contexte</option>
          <option value="Enjeux">Enjeux</option>
          <option value="Réponses">Réponses</option>
          <option value="Étude">Étude</option>
          <option value="Méthodes">Méthodes</option>
        </select>
      </div>
      <div className="filter-group">
        <label className="form-label">Pôle</label>
        <select id="poleFilter" className="form-control" value={poleFilter} onChange={(e) => setPoleFilter(e.target.value)}>
          <option value="">Tous les pôles</option>
          {appData.poles.labels.map((pole, index) => (
            <option key={index} value={pole}>{pole}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label className="form-label">Typologie</label>
        <select id="typologieFilter" className="form-control" value={typologieFilter} onChange={(e) => setTypologieFilter(e.target.value)}>
          <option value="">Toutes les typologies</option>
          {appData.top_typologies.labels.map((typologie, index) => (
            <option key={index} value={typologie}>{typologie}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label className="form-label">Année</label>
        <select id="anneeFilter" className="form-control">
          <option value="">Toutes les années</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>
        </select>
      </div>
    </div>
  </div>
);

export default FiltersSection;