import React from 'react';

/**
 * Composant Header - Barre de navigation principale de WikiPro
 * @param {Function} toggleTheme - Fonction pour basculer le thème
 * @param {string} theme - Thème actuel ('light' ou 'dark')
 */
const Header = ({ toggleTheme, theme }) => (
  <header className="header">
    <div className="container">
      <div className="header__content">
        <div className="header__brand">
          <div className="logo">
            <i className="fas fa-chart-line"></i>
            <span className="logo__text">Groupe Elan</span>
          </div>
          <p className="header__subtitle">WikiPro</p>
        </div>
        <div className="header__actions">
          <div className="search-bar">
            <input type="text" placeholder="Recherche globale..." className="search-bar__input" />
            <button className="search-bar__button">
              <i className="fas fa-search"></i>
            </button>
          </div>
          <button className="theme-toggle" id="themeToggle" onClick={toggleTheme}>
            <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'}></i>
          </button>
        </div>
      </div>
    </div>
  </header>
);

export default Header;