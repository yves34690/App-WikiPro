import React from 'react';
import { Kpis, Document360Widget, SyntheseTable, BackendStatus } from './components';
import { EvolutionChart, PolesChart } from '../../components/charts';

/**
 * Module Dashboard - Vue d'ensemble de WikiPro
 * Affiche les KPIs, widgets et graphiques principaux
 * Inclut un test d'intégration backend pour le Sprint 1
 */
const Dashboard = () => (
  <>
    <Kpis />
    <BackendStatus />
    <Document360Widget />
    <div className="charts-grid">
      <EvolutionChart />
      <PolesChart />
    </div>
    <SyntheseTable />
  </>
);

export default Dashboard;