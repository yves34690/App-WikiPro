/**
 * App.js avec intégration API - WikiPro
 * Version intégrée avec React Query et authentification
 */

import React, { useState } from 'react';
import './index.css';
import './components/common/LoadingState.css';
import './components/common/AuthGuard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Imports Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale
} from 'chart.js';

// Imports des providers et contexts
import { ApiProvider } from './contexts/ApiContext';
import { AuthProvider } from './contexts/AuthContext';

// Imports des composants partagés
import { 
  Header, 
  Navigation, 
  TabContent, 
  AuthGuard, 
  LoadingState,
  SuspenseWrapper,
} from './components/common';
import { useTheme } from './shared/hooks';
import { useAuth } from './hooks/api/useAuth';

// Imports des modules
import { Dashboard } from './modules/dashboard';
import { References } from './modules/references';
import { MotsCles } from './modules/mots-cles';
import { IAStrategie } from './modules/ia-strategie';
import { Tendances } from './modules/tendances';
import { Poles } from './modules/poles';
import { Methodes } from './modules/methodes';
import { DataModule } from './modules/data';
import { IllustrationModule } from './modules/illustrations';
import { OutilsModule } from './modules/outils';
import { CVthequeModule } from './modules/cvtheque';
import { CompetencesModule } from './modules/competences';

// Configuration Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale
);

/**
 * Composant de connexion simple
 */
const LoginComponent = () => {
  const [formData, setFormData] = useState({
    email: 'admin@demo-company.com',
    password: 'AdminDemo123!',
    tenantSlug: 'demo-company',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(formData.email, formData.password, formData.tenantSlug);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <h1>WikiPro</h1>
          <p>Connectez-vous pour accéder à votre espace</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="tenant">Organisation</label>
            <input
              type="text"
              id="tenant"
              value={formData.tenantSlug}
              onChange={(e) => setFormData(prev => ({ ...prev, tenantSlug: e.target.value }))}
              required
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingState type="spinner" size="small" />
                Connexion...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                Se connecter
              </>
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Environnement de démonstration</p>
          <small>Version avec intégration API</small>
        </div>
      </div>
    </div>
  );
};

/**
 * Composant principal de l'application
 */
const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { theme, toggleTheme } = useTheme();
  const { user, tenant, logout } = useAuth();

  // Liste des tabs/modules
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { id: 'ia-strategie', label: 'IA Stratégie', icon: 'fas fa-robot' },
    { id: 'references', label: 'Références', icon: 'fas fa-folder-open' },
    { id: 'tendances', label: 'Tendances', icon: 'fas fa-chart-line' },
    { id: 'mots-cles', label: 'Mots-clés', icon: 'fas fa-tags' },
    { id: 'poles', label: 'Pôles', icon: 'fas fa-sitemap' },
    { id: 'methodes', label: 'Méthodes', icon: 'fas fa-cogs' },
    { id: 'data', label: 'Data', icon: 'fas fa-database' },
    { id: 'illustrations', label: 'Illustrations', icon: 'fas fa-images' },
    { id: 'outils', label: 'Outils', icon: 'fas fa-tools' },
    { id: 'cvtheque', label: 'CVthèque', icon: 'fas fa-users' },
    { id: 'competences', label: 'Compétences', icon: 'fas fa-graduation-cap' },
  ];

  // Mapping des composants par tab
  const tabComponents = {
    'dashboard': Dashboard,
    'ia-strategie': IAStrategie,
    'references': References,
    'tendances': Tendances,
    'mots-cles': MotsCles,
    'poles': Poles,
    'methodes': Methodes,
    'data': DataModule,
    'illustrations': IllustrationModule,
    'outils': OutilsModule,
    'cvtheque': CVthequeModule,
    'competences': CompetencesModule,
  };

  const handleLogout = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      await logout();
    }
  };

  return (
    <div className={`app ${theme}`} data-color-scheme={theme}>
      <Header 
        user={user}
        tenant={tenant}
        onThemeToggle={toggleTheme}
        onLogout={handleLogout}
      />
      
      <Navigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <main className="main-content">
        <SuspenseWrapper
          fallback={<LoadingState message={`Chargement du module ${tabs.find(t => t.id === activeTab)?.label}...`} />}
          errorFallback={
            <LoadingState 
              type="error"
              title="Erreur du module"
              message="Impossible de charger ce module"
              onRetry={() => window.location.reload()}
            />
          }
        >
          <TabContent
            activeTab={activeTab}
            components={tabComponents}
          />
        </SuspenseWrapper>
      </main>
    </div>
  );
};

/**
 * Composant App principal avec providers
 */
const App = () => {
  return (
    <ApiProvider>
      <AuthProvider>
        <AuthGuard 
          fallback={<LoadingState message="Initialisation de l'application..." />}
          showLogin={false}
        >
          <AppContent />
        </AuthGuard>
        
        {/* Composant de connexion affiché si non authentifié */}
        <AuthGuard 
          fallback={<LoginComponent />}
          showLogin={false}
          onUnauthorized={() => <LoginComponent />}
        />
      </AuthProvider>
    </ApiProvider>
  );
};

export default App;