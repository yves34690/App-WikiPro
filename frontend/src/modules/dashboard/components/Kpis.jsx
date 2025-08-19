import React from 'react';
import { KpiCard } from '../../../components/charts';
import { appData } from '../../../data.js';

/**
 * Composant Kpis - Affichage des KPIs principaux
 */
const Kpis = () => (
  <div className="kpis-grid">
    <KpiCard icon="fa-file-alt" value={appData.kpis.total_etudes} label="Études totales" />
    <KpiCard icon="fa-tags" value={appData.kpis.total_mots_cles} label="Mots-clés uniques" />
    <KpiCard icon="fa-sitemap" value={appData.kpis.nb_poles} label="Pôles d'expertise" />
    <KpiCard icon="fa-layer-group" value={appData.kpis.nb_typologies} label="Typologies d'études" />
  </div>
);

export default Kpis;