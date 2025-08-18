import React from 'react';

/**
 * Composant SortControls - Contrôles de tri pour les références
 */
const SortControls = ({ sortBy, sortOrder, toggleSort, resultsCount }) => (
  <div className="references-header">
    <h3>Références ({resultsCount} études)</h3>
    <div className="sort-controls">
      <label className="form-label">Trier par:</label>
      <div className="sort-buttons">
        <button 
          className={`btn btn--outline btn--sm ${sortBy === 'annee' ? 'active' : ''}`}
          onClick={() => toggleSort('annee')}
        >
          Année {sortBy === 'annee' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button 
          className={`btn btn--outline btn--sm ${sortBy === 'titre' ? 'active' : ''}`}
          onClick={() => toggleSort('titre')}
        >
          Titre {sortBy === 'titre' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
        <button 
          className={`btn btn--outline btn--sm ${sortBy === 'budget' ? 'active' : ''}`}
          onClick={() => toggleSort('budget')}
        >
          Budget {sortBy === 'budget' && (sortOrder === 'desc' ? '↓' : '↑')}
        </button>
      </div>
    </div>
  </div>
);

export default SortControls;