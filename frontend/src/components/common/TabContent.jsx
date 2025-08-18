import React from 'react';

/**
 * Composant TabContent - Conteneur pour le contenu d'un onglet
 * @param {string} id - Identifiant de l'onglet
 * @param {string} activeTab - Onglet actuellement actif
 * @param {React.ReactNode} children - Contenu à afficher
 */
const TabContent = ({ id, activeTab, children }) => (
  <div id={id} className={`tab-content ${activeTab === id ? 'active' : ''}`}>
    {children}
  </div>
);

export default TabContent;