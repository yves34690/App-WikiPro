import React from 'react';

/**
 * Composant Document360Widget - Widget de recherche dans la documentation
 */
const Document360Widget = () => (
  <div className="card document360-widget">
    <div className="card__body">
      <h3>posez une question</h3>
      <div className="document360-search">
        <input type="text" placeholder="Rechercher dans la documentation..." className="form-control" />
        <button className="btn btn--primary">Rechercher</button>
      </div>
      <div className="document360-results">
        <div className="result-item">
          <h4>Processus de capitalisation des études</h4>
          <p>Documentation du processus de capitalisation des connaissances...</p>
          <span className="status status--success">Capitalisation</span>
        </div>
        <div className="result-item">
          <h4>Processus de gains de productivité</h4>
          <p>Optimisation des processus pour améliorer l'efficacité...</p>
          <span className="status status--info">Productivité</span>
        </div>
        <div className="result-item">
          <h4>Processus d'extraction des connaissance</h4>
          <p>Méthodes d'extraction et de structuration des savoirs...</p>
          <span className="status status--warning">Extraction</span>
        </div>
        <div className="result-item">
          <h4>Corrélation entre problématiques et réponses apportées</h4>
          <p>Analyse des liens entre les enjeux identifiés et les solutions...</p>
          <span className="status status--info">Analyse</span>
        </div>
      </div>
    </div>
  </div>
);

export default Document360Widget;