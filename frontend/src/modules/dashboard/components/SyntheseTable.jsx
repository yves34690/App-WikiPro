import React from 'react';
import { appData } from '../../../data.js';

/**
 * Composant SyntheseTable - Tableau de synthèse par année
 */
const SyntheseTable = () => (
  <div className="card">
    <div className="card__body">
      <h3>Tableau de synthèse par année</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Année</th>
            <th>Nombre d'études</th>
            <th>Pôles actifs</th>
          </tr>
        </thead>
        <tbody>
          {appData.synthese_annuelle.map(item => (
            <tr key={item.annee}>
              <td>{item.annee}</td>
              <td>{item.nb_etudes}</td>
              <td>{item.nb_poles_actifs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default SyntheseTable;