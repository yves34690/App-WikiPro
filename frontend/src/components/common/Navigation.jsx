import React from 'react';
import NavTab from './NavTab';

/**
 * Composant Navigation - Barre d'onglets pour les différents modules
 * @param {string} activeTab - Onglet actuellement actif
 * @param {Function} setActiveTab - Fonction pour changer d'onglet
 */
const Navigation = ({ activeTab, setActiveTab }) => (
  <nav className="navigation">
    <div className="container">
      <div className="nav-tabs">
        <NavTab tabId="dashboard" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-tachometer-alt" label="Vue d'ensemble" />
        <NavTab tabId="tendances" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-chart-line" label="Tendances" />
        <NavTab tabId="mots-cles" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-tags" label="Mots-clés" />
        <NavTab tabId="poles" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-sitemap" label="Pôles" />
        <NavTab tabId="capitalisation" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-book" label="Méthodes" />
        <NavTab tabId="references" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-folder-open" label="Références" />
        <NavTab tabId="data" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-database" label="Data" />
        <NavTab tabId="illustrations" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-images" label="Illustrations" />
        <NavTab tabId="outils" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-tools" label="Outils" />
        <NavTab tabId="cvtheque" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-users" label="CVthèque" />
        <NavTab tabId="competences" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-user-graduate" label="Compétences" />
        <NavTab tabId="ia-strategie" activeTab={activeTab} setActiveTab={setActiveTab} icon="fa-brain" label="IA" />
      </div>
    </div>
  </nav>
);

export default Navigation;