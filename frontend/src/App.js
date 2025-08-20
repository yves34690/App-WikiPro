/**
 * App.js principal - WikiPro avec intégration API complète
 * Version finale intégrant React Query, authentification et tous les modules migrés
 */

import React, { useState, Suspense } from 'react';
import './index.css';
import './components/common/LoadingState.css';
import './components/common/AuthGuard.css';
import './components/common/Login.css';
import './styles/api-integration.css';
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
import { ApiProvider, useApi } from './contexts/ApiContext';
import { AuthProvider } from './contexts/AuthContext';

// Imports des composants partagés
import { 
  Header, 
  Navigation, 
  TabContent, 
  AuthGuard, 
  LoadingState,
  SuspenseWrapper,
  ErrorState,
} from './components/common';
import { useTheme } from './shared/hooks';
import { useAuth, useLoginForm } from './hooks/api/useAuth';

// Lazy loading des modules migrés vers API
const Dashboard = React.lazy(() => import('./modules/dashboard/Dashboard-with-api'));
const IAStrategie = React.lazy(() => import('./modules/ia-strategie/IAStrategie-with-api'));
const References = React.lazy(() => import('./modules/references/References-with-api'));
const Tendances = React.lazy(() => import('./modules/tendances/Tendances-with-api'));

// Imports des modules non migrés (utilisent encore data.js)
import { MotsCles } from './modules/mots-cles';
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
 * Composant de connexion avec formulaire intégré
 */
const LoginComponent = () => {
  const {
    formData,
    formErrors,
    isSubmitting,
    updateField,
    handleSubmit,
    resetForm,
  } = useLoginForm({
    email: 'admin@demo-company.com',
    password: 'AdminDemo123!',
    tenantSlug: 'demo-company',
  });

  return (
    <div className="login-container">
      <div className="login-form">
        <div className="login-header">
          <h1>WikiPro</h1>
          <p>Connectez-vous pour accéder à votre espace de connaissances</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
              disabled={isSubmitting}
              className={formErrors.email ? 'error' : ''}
            />
            {formErrors.email && (
              <span className="field-error">{formErrors.email}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              required
              disabled={isSubmitting}
              className={formErrors.password ? 'error' : ''}
            />
            {formErrors.password && (
              <span className="field-error">{formErrors.password}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="tenant">Organisation</label>
            <input
              type="text"
              id="tenant"
              value={formData.tenantSlug}
              onChange={(e) => updateField('tenantSlug', e.target.value)}
              required
              disabled={isSubmitting}
              className={formErrors.tenantSlug ? 'error' : ''}
            />
            {formErrors.tenantSlug && (
              <span className="field-error">{formErrors.tenantSlug}</span>
            )}
          </div>
          
          {formErrors.general && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {formErrors.general}
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingState type="spinner" size="small" />
                Connexion en cours...
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
          <small>WikiPro v2.0 - Intégration API complète</small>
          <div className="demo-credentials">
            <details>
              <summary>Informations de test</summary>
              <div className="credentials-info">
                <p><strong>Email:</strong> admin@demo-company.com</p>
                <p><strong>Mot de passe:</strong> AdminDemo123!</p>
                <p><strong>Tenant:</strong> demo-company</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Indicateur de statut API
 */
const ApiStatusIndicator = () => {
  const { apiStatus, isApiOnline, lastCheckTime, forceApiCheck } = useApi();
  
  if (apiStatus === 'checking') return null;

  return (
    <div className={`api-status ${apiStatus}`}>
      <div className="api-status-content">
        <i className={`fas ${isApiOnline ? 'fa-circle' : 'fa-exclamation-triangle'}`}></i>
        <span>
          API {isApiOnline ? 'en ligne' : 'hors ligne'}
          {lastCheckTime && (
            <small>
              {' '}• {new Date(lastCheckTime).toLocaleTimeString('fr-FR')}
            </small>
          )}
        </span>
        {!isApiOnline && (
          <button 
            className="retry-api-btn"
            onClick={forceApiCheck}
            title="Vérifier la connexion API"
          >
            <i className="fas fa-redo"></i>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Composant principal de l'application authentifiée
 */
const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { theme, toggleTheme } = useTheme();
  const { user, tenant, logout } = useAuth();

  // Liste des tabs/modules avec indication de migration API
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', apiMigrated: true },
    { id: 'ia-strategie', label: 'IA Stratégie', icon: 'fas fa-robot', apiMigrated: true },
    { id: 'references', label: 'Références', icon: 'fas fa-folder-open', apiMigrated: true },
    { id: 'tendances', label: 'Tendances', icon: 'fas fa-chart-line', apiMigrated: true },
    { id: 'mots-cles', label: 'Mots-clés', icon: 'fas fa-tags', apiMigrated: false },
    { id: 'poles', label: 'Pôles', icon: 'fas fa-sitemap', apiMigrated: false },
    { id: 'methodes', label: 'Méthodes', icon: 'fas fa-cogs', apiMigrated: false },
    { id: 'data', label: 'Data', icon: 'fas fa-database', apiMigrated: false },
    { id: 'illustrations', label: 'Illustrations', icon: 'fas fa-images', apiMigrated: false },
    { id: 'outils', label: 'Outils', icon: 'fas fa-tools', apiMigrated: false },
    { id: 'cvtheque', label: 'CVthèque', icon: 'fas fa-users', apiMigrated: false },
    { id: 'competences', label: 'Compétences', icon: 'fas fa-graduation-cap', apiMigrated: false },
  ];

  // Mapping des composants par tab
  const tabComponents = {
    // Modules migrés vers API (lazy loading)
    'dashboard': Dashboard,
    'ia-strategie': IAStrategie,
    'references': References,
    'tendances': Tendances,
    
    // Modules non migrés (chargement synchrone)
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
      try {
        await logout();
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
      }
    }
  };

  const currentTab = tabs.find(t => t.id === activeTab);
  const isApiModule = currentTab?.apiMigrated;

  return (
    <div className={`app ${theme}`} data-color-scheme={theme}>
      {/* Indicateur de statut API */}
      <ApiStatusIndicator />
      
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
        {isApiModule ? (
          // Modules API avec Suspense
          <SuspenseWrapper
            fallback={
              <LoadingState 
                message={`Chargement du module ${currentTab?.label}...`}
                type="default"
              />
            }
            errorFallback={
              <ErrorState 
                title={`Erreur du module ${currentTab?.label}`}
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
        ) : (
          // Modules non API (chargement direct)
          <div className="legacy-module">
            {/* Badge indiquant que le module utilise les données statiques */}
            <div className="module-badge">
              <i className="fas fa-database"></i>
              <span>Module utilisant les données statiques (data.js)</span>
            </div>
            <TabContent
              activeTab={activeTab}
              components={tabComponents}
            />
          </div>
        )}
      </main>

      {/* Debug panel en développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel">
          <details>
            <summary>🔧 Debug Info</summary>
            <div className="debug-content">
              <p><strong>Module actuel:</strong> {activeTab}</p>
              <p><strong>API intégré:</strong> {isApiModule ? '✅' : '❌'}</p>
              <p><strong>Utilisateur:</strong> {user?.email}</p>
              <p><strong>Tenant:</strong> {tenant?.name} ({tenant?.slug})</p>
              <p><strong>Thème:</strong> {theme}</p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

/**
 * Composant App principal avec tous les providers
 */
const App = () => {
  return (
    <ApiProvider>
      <AuthProvider>
        <AuthGuard 
          fallback={<LoginComponent />}
          showLogin={false}
        >
          <AppContent />
        </AuthGuard>
      </AuthProvider>
    </ApiProvider>
  );
};

export default App;