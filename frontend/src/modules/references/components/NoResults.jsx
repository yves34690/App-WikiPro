import React from 'react';

/**
 * Composant NoResults - Affichage quand aucune référence n'est trouvée
 */
const NoResults = () => (
  <div className="no-results">
    <i className="fas fa-search" style={{fontSize: '48px', color: 'var(--color-text-muted)', marginBottom: 'var(--space-16)'}}></i>
    <h4>Aucune référence trouvée</h4>
    <p>Essayez de modifier vos critères de recherche ou filtres.</p>
  </div>
);

export default NoResults;