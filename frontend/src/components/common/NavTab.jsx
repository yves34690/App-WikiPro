import React from 'react';

/**
 * Composant NavTab - Onglet individuel de navigation
 * @param {string} tabId - Identifiant unique de l'onglet
 * @param {string} activeTab - Onglet actuellement actif
 * @param {Function} setActiveTab - Fonction pour changer d'onglet
 * @param {string} icon - Classe d'icône FontAwesome
 * @param {string} label - Libellé affiché sur l'onglet
 */
const NavTab = ({ tabId, activeTab, setActiveTab, icon, label }) => (
  <button className={`nav-tab ${activeTab === tabId ? 'active' : ''}`} onClick={() => setActiveTab(tabId)}>
    <i className={`fas ${icon}`}></i>
    <span>{label}</span>
  </button>
);

export default NavTab;