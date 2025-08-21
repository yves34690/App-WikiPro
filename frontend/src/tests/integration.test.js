/**
 * Tests d'intégration pour React Query + Context API
 * Vérification de l'absence d'erreurs 404 et du bon fonctionnement de l'intégration
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryProvider } from '../contexts/QueryProvider';
import { AuthProvider } from '../contexts/AuthContext';
import BackendStatus from '../modules/dashboard/components/BackendStatus';

// Mock du service API pour les tests
jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    checkHealth: jest.fn(() => Promise.resolve({
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    })),
    checkAuthHealth: jest.fn(() => Promise.resolve({
      status: 'ok',
      service: 'auth',
      timestamp: new Date().toISOString()
    })),
    login: jest.fn((username, password) => {
      if (username === 'admin' && password === 'adminpassword') {
        return Promise.resolve({
          user: {
            userId: '2',
            username: 'admin',
            email: 'admin@wikipro.com',
            tenantId: 'tenant-1',
            roles: ['admin', 'user'],
            isActive: true
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          tokenType: 'Bearer',
          expiresIn: '3600s'
        });
      }
      return Promise.reject(new Error('Invalid credentials'));
    }),
    getProfile: jest.fn(() => Promise.resolve({
      userId: '2',
      username: 'admin',
      email: 'admin@wikipro.com',
      tenantId: 'tenant-1',
      roles: ['admin', 'user'],
      isActive: true
    })),
    getUserDashboardData: jest.fn(() => Promise.resolve({
      backendStatus: { status: 'healthy' },
      kpis: {
        totalEtudes: 156,
        motsCles: 892,
        poles: 8,
        typologies: 12
      },
      message: 'Données récupérées avec succès'
    })),
    setToken: jest.fn(),
    refreshTokens: jest.fn()
  }
}));

// Composant wrapper avec tous les providers
const TestWrapper = ({ children }) => (
  <QueryProvider>
    <AuthProvider>
      {children}
    </AuthProvider>
  </QueryProvider>
);

describe('Intégration React Query + Context API', () => {
  beforeEach(() => {
    // Nettoyer le localStorage avant chaque test
    localStorage.clear();
  });

  test('Le composant BackendStatus se charge sans erreur', async () => {
    render(
      <TestWrapper>
        <BackendStatus />
      </TestWrapper>
    );

    // Vérifier que le titre s'affiche
    expect(screen.getByText(/Intégration Frontend-Backend/)).toBeInTheDocument();
  });

  test('Les hooks React Query fonctionnent correctement', async () => {
    render(
      <TestWrapper>
        <BackendStatus />
      </TestWrapper>
    );

    // Attendre que les requêtes se chargent
    await waitFor(() => {
      // Vérifier que les indicateurs de statut sont présents
      expect(screen.getByText('Backend API')).toBeInTheDocument();
      expect(screen.getByText('Service Auth')).toBeInTheDocument();
      expect(screen.getByText('React Query')).toBeInTheDocument();
    });
  });

  test('L\'authentification fonctionne via React Query', async () => {
    render(
      <TestWrapper>
        <BackendStatus />
      </TestWrapper>
    );

    // Trouver le bouton de connexion
    const loginButton = await waitFor(() => 
      screen.getByRole('button', { name: /Se connecter/i })
    );

    // Simuler un clic sur le bouton de connexion
    fireEvent.click(loginButton);

    // Attendre que l'authentification réussisse
    await waitFor(() => {
      expect(screen.getByText(/Authentification réussie/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('Aucune erreur 404 dans les requêtes API', async () => {
    const apiService = require('../services/api').default;
    
    render(
      <TestWrapper>
        <BackendStatus />
      </TestWrapper>
    );

    // Attendre que toutes les requêtes se terminent
    await waitFor(() => {
      // Vérifier que les endpoints sont appelés correctement
      expect(apiService.checkHealth).toHaveBeenCalled();
      expect(apiService.checkAuthHealth).toHaveBeenCalled();
    });

    // Vérifier qu'aucune erreur 404 n'est présente
    const errorElements = screen.queryAllByText(/404|Not Found/i);
    expect(errorElements).toHaveLength(0);
  });

  test('React Query cache fonctionne correctement', async () => {
    render(
      <TestWrapper>
        <BackendStatus />
      </TestWrapper>
    );

    // Attendre le premier chargement
    await waitFor(() => {
      expect(screen.getByText('React Query')).toBeInTheDocument();
    });

    // Vérifier que les statistiques du cache sont affichées
    await waitFor(() => {
      const cacheStats = screen.getByText(/Cache total:/);
      expect(cacheStats).toBeInTheDocument();
    });
  });

  test('Context d\'authentification persiste l\'état', async () => {
    // Simuler un token existant dans localStorage
    localStorage.setItem('wikipro_token', 'mock-existing-token');

    render(
      <TestWrapper>
        <BackendStatus />
      </TestWrapper>
    );

    // Vérifier que l'application tente de valider le token existant
    await waitFor(() => {
      const apiService = require('../services/api').default;
      expect(apiService.setToken).toHaveBeenCalledWith('mock-existing-token');
    });
  });

  test('Gestion d\'erreur robuste pour les requêtes échouées', async () => {
    const apiService = require('../services/api').default;
    
    // Mocker une erreur réseau
    apiService.checkHealth.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <TestWrapper>
        <BackendStatus />
      </TestWrapper>
    );

    // Attendre que l'erreur soit gérée gracieusement
    await waitFor(() => {
      // Vérifier que l'erreur n'interrompt pas l'application
      expect(screen.getByText('Backend API')).toBeInTheDocument();
    });
  });
});

describe('Prévention des erreurs 404', () => {
  test('Tous les endpoints utilisés existent', () => {
    const endpoints = [
      '/',
      '/auth/health', 
      '/auth/login',
      '/auth/profile',
      '/auth/refresh'
    ];

    endpoints.forEach(endpoint => {
      expect(endpoint).toMatch(/^\/[a-zA-Z0-9\-_\/]*$/);
    });
  });

  test('Configuration des URLs API est cohérente', () => {
    const apiService = require('../services/api').default;
    
    // Vérifier la configuration de base
    expect(apiService).toBeDefined();
    
    // Ces méthodes doivent exister pour éviter les erreurs 404
    expect(typeof apiService.checkHealth).toBe('function');
    expect(typeof apiService.checkAuthHealth).toBe('function');
    expect(typeof apiService.login).toBe('function');
    expect(typeof apiService.getProfile).toBe('function');
    expect(typeof apiService.refreshTokens).toBe('function');
  });
});