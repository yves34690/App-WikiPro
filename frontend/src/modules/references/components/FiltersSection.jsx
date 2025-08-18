import React from 'react';
import { appData } from '../../../data.js';

/**
 * Composant FiltersSection - Section de filtrage pour les références
 */
const FiltersSection = ({
  searchTerm,
  setSearchTerm,
  selectedPole,
  setSelectedPole,
  selectedTypologie,
  setSelectedTypologie,
  selectedObjet,
  setSelectedObjet,
  selectedAnnee,
  setSelectedAnnee,
  selectedStatut,
  setSelectedStatut
}) => (
  <div className="filters-section">
    <div className="filters">
      <div className="filter-group">
        <label className="form-label">Recherche</label>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Titre, client, description ou mots-clés..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
        <label className="form-label">Typologie</label>
        <select className="form-control" value={selectedTypologie} onChange={(e) => setSelectedTypologie(e.target.value)}>
          <option value="">Toutes les typologies</option>
          {appData.top_typologies.labels.map((typologie, index) => (
            <option key={index} value={typologie}>{typologie}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label className="form-label">Objet</label>
        <select className="form-control" value={selectedObjet} onChange={(e) => setSelectedObjet(e.target.value)}>
          <option value="">Tous les objets</option>
          {appData.objets_etudes.map((objet, index) => (
            <option key={index} value={objet}>{objet}</option>
          ))}
        </select>
      </div>
      <div className="filter-group">
        <label className="form-label">Année</label>
        <select className="form-control" value={selectedAnnee} onChange={(e) => setSelectedAnnee(e.target.value)}>
          <option value="">Toutes les années</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2020">2020</option>
        </select>
      </div>
      <div className="filter-group">
        <label className="form-label">Statut</label>
        <select className="form-control" value={selectedStatut} onChange={(e) => setSelectedStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="Terminé">Terminé</option>
          <option value="En cours">En cours</option>
          <option value="En attente">En attente</option>
        </select>
      </div>
    </div>
  </div>
);

export default FiltersSection;