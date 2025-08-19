import React from 'react';

/**
 * Composant KpiCard - Carte d'affichage d'un KPI
 * @param {string} icon - Classe d'icône FontAwesome
 * @param {number|string} value - Valeur du KPI
 * @param {string} label - Libellé du KPI
 */
const KpiCard = ({ icon, value, label }) => (
  <div className="kpi-card">
    <div className="kpi-card__icon">
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="kpi-card__content">
      <div className="kpi-card__value">{value}</div>
      <div className="kpi-card__label">{label}</div>
    </div>
  </div>
);

export default KpiCard;