import React from 'react';
import { Kpis, Document360Widget, SyntheseTable } from './components';
import { EvolutionChart, PolesChart } from '../../components/charts';

/**
 * Module Dashboard - Vue d'ensemble de WikiPro
 * Affiche les KPIs, widgets et graphiques principaux
 */
const Dashboard = () => (
  <>
    <Kpis />
    <Document360Widget />
    <div className="charts-grid">
      <EvolutionChart />
      <PolesChart />
    </div>
    <SyntheseTable />
  </>
);

export default Dashboard;