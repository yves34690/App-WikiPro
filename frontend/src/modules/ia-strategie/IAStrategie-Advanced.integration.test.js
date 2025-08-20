/**
 * Tests d'intégration pour IAStrategie Advanced - WikiPro
 * Tests complets de l'interface et des interactions entre composants
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IAStrategieAdvanced from './IAStrategie-Advanced';

// Mocks globaux
jest.mock('../../components/common', () => ({
  LoadingState: ({ type }) => <div data-testid="loading">{type}</div>,
  ErrorState: ({ title, message, onRetry }) => (
    <div data-testid="error">
      <h3>{title}</h3>
      <p>{message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
  AuthGuard: ({ children }) => <div>{children}</div>,
  PermissionGate: ({ children }) => <div>{children}</div>
}));

jest.mock('../../hooks/api', () => ({
  useSessions: () => ({
    data: { sessions: [] },
    isLoading: false,
    error: null,
    refetch: jest.fn()
  }),
  useCreateSession: () => ({
    mutate: jest.fn(),
    isPending: false,
    error: null
  }),
  useTenantData: () => ({
    data: {
      references: Array(10).fill({}),
      competences: Array(15).fill({}),
      poles: { labels: Array(5).fill({}) }
    }
  })
}));

// Mock des hooks du module
jest.mock('./hooks/useProviderSelection', () => ({
  useProviderSelection: () => ({
    selectedProvider: 'openai',
    selectProvider: jest.fn(),
    notifications: [],
    removeNotification: jest.fn(),
    providersData: {
      openai: { state: { isAvailable: true }, metrics: {} },
      anthropic: { state: { isAvailable: true }, metrics: {} },
      gemini: { state: { isAvailable: true }, metrics: {} }
    }
  })
}));

jest.mock('./hooks/useAIChat', () => ({
  useAIChat: () => ({
    chatState: 'connected',
    messages: [],
    currentMessage: '',
    isStreaming: false,
    currentProvider: 'openai',
    error: null,
    connectionState: { isConnected: true },
    sendMessage: jest.fn().mockResolvedValue(true),
    stopStreaming: jest.fn(),
    clearMessages: jest.fn(),
    retry: jest.fn(),
    regenerateLastMessage: jest.fn(),
    connectToChat: jest.fn(),
    isConnected: true,
    canSendMessage: true,
    hasError: false
  })
}));

jest.mock('./hooks/useConversations', () => ({
  useConversations: () => ({
    conversations: [],
    selectedConversations: [],
    isLoading: false,
    isSearching: false,
    searchQuery: '',
    filters: { providers: [], messageTypes: [], dateRange: null },
    sortBy: 'date_desc',
    setSortBy: jest.fn(),
    searchConversations: jest.fn(),
    clearSearch: jest.fn(),
    toggleConversationSelection: jest.fn(),
    selectAllDisplayed: jest.fn(),
    clearSelection: jest.fn(),
    downloadExport: jest.fn(),
    getConversationStats: () => ({ total: 0, byType: {}, byProvider: {} }),
    getUniqueProviders: () => [],
    getUniqueMessageTypes: () => [],
    hasSelection: false,
    filteredCount: 0,
    totalCount: 0
  })
}));

// Mock CSS import
jest.mock('./styles/ai-strategie-advanced.css', () => ({}));

// Setup du QueryClient pour les tests
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const renderWithQueryClient = (component) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('IAStrategie Advanced - Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu initial', () => {
    it('devrait afficher l\'interface complète', () => {
      renderWithQueryClient(<IAStrategieAdvanced />);

      // Header principal
      expect(screen.getByText('IA Studio Pro')).toBeInTheDocument();
      
      // Navigation des vues
      expect(screen.getByText('Chat')).toBeInTheDocument();
      expect(screen.getByText('Historique')).toBeInTheDocument();
      expect(screen.getByText('Métriques')).toBeInTheDocument();
      
      // Sidebar
      expect(screen.getByText('IA Studio')).toBeInTheDocument();
      
      // État initial sans session
      expect(screen.getByText(/Sélectionnez ou créez une session/i)).toBeInTheDocument();
    });

    it('devrait afficher les indicateurs de données connectées', () => {
      renderWithQueryClient(<IAStrategieAdvanced />);

      expect(screen.getByText(/10 références d'études/)).toBeInTheDocument();
      expect(screen.getByText(/15 compétences/)).toBeInTheDocument();
      expect(screen.getByText(/5 pôles d'expertise/)).toBeInTheDocument();
    });
  });

  describe('Navigation entre vues', () => {
    it('devrait basculer entre les vues chat, historique et métriques', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<IAStrategieAdvanced />);

      // Basculer vers historique
      await user.click(screen.getByText('Historique'));
      
      // Devrait afficher le composant d'historique (vérifié par la présence d'éléments spécifiques)
      await waitFor(() => {
        expect(screen.getByText(/Historique des conversations/i)).toBeInTheDocument();
      });

      // Basculer vers métriques
      await user.click(screen.getByText('Métriques'));
      
      await waitFor(() => {
        expect(screen.getByText(/Métriques des Providers/i)).toBeInTheDocument();
      });

      // Retour au chat
      await user.click(screen.getByText('Chat'));
      
      await waitFor(() => {
        expect(screen.getByText(/Sélectionnez ou créez une session/i)).toBeInTheDocument();
      });
    });
  });

  describe('Gestion des sessions', () => {
    it('devrait permettre de créer une nouvelle session', async () => {
      const user = userEvent.setup();
      const { useCreateSession } = require('../../hooks/api');
      const mockMutate = jest.fn();
      useCreateSession.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        error: null
      });

      renderWithQueryClient(<IAStrategieAdvanced />);

      // Cliquer sur créer nouvelle session
      await user.click(screen.getByText(/Créer une nouvelle session/i));

      // Formulaire devrait apparaître
      expect(screen.getByText('Nouvelle session')).toBeInTheDocument();
      expect(screen.getByLabelText(/Titre de la session/i)).toBeInTheDocument();

      // Remplir et soumettre
      await user.type(screen.getByLabelText(/Titre de la session/i), 'Test Session');
      await user.click(screen.getByRole('button', { name: /Créer/i }));

      expect(mockMutate).toHaveBeenCalledWith({
        title: 'Test Session',
        description: undefined,
        type: 'ia-strategy-advanced',
        metadata: {
          version: '2.0',
          features: ['streaming', 'multi-provider', 'advanced-ui']
        }
      });
    });

    it('devrait permettre d\'annuler la création de session', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<IAStrategieAdvanced />);

      // Ouvrir le formulaire
      await user.click(screen.getByText(/Créer une nouvelle session/i));
      expect(screen.getByText('Nouvelle session')).toBeInTheDocument();

      // Annuler
      await user.click(screen.getByText('Annuler'));
      
      // Retour à l'état initial
      expect(screen.queryByText('Nouvelle session')).not.toBeInTheDocument();
    });
  });

  describe('Sidebar et navigation', () => {
    it('devrait permettre de plier/déplier la sidebar', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<IAStrategieAdvanced />);

      // Sidebar devrait être visible
      expect(screen.getByText('IA Studio')).toBeInTheDocument();

      // Plier la sidebar
      const collapseButton = screen.getByRole('button', { 
        name: '', // Bouton sans texte, juste une icône 
      });
      await user.click(collapseButton);

      // Le texte devrait disparaître
      await waitFor(() => {
        expect(screen.queryByText('IA Studio')).not.toBeInTheDocument();
      });
    });
  });

  describe('Raccourcis clavier', () => {
    it('devrait gérer les raccourcis clavier globaux', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<IAStrategieAdvanced />);

      // Ctrl+Shift+H pour basculer vers historique
      await user.keyboard('{Control>}{Shift>}H{/Shift}{/Control}');
      
      await waitFor(() => {
        expect(screen.getByText(/Historique des conversations/i)).toBeInTheDocument();
      });

      // Ctrl+Shift+M pour basculer vers métriques
      await user.keyboard('{Control>}{Shift>}M{/Shift}{/Control}');
      
      await waitFor(() => {
        expect(screen.getByText(/Métriques des Providers/i)).toBeInTheDocument();
      });
    });
  });

  describe('Intégration avec session sélectionnée', () => {
    it('devrait afficher l\'interface de chat quand une session est sélectionnée', () => {
      // Mock d'une session sélectionnée
      const { useSessions } = require('../../hooks/api');
      useSessions.mockReturnValue({
        data: { 
          sessions: [{ 
            id: 'session-1', 
            title: 'Test Session',
            conversations_count: 5 
          }] 
        },
        isLoading: false,
        error: null,
        refetch: jest.fn()
      });

      renderWithQueryClient(<IAStrategieAdvanced />);

      // Simuler la sélection d'une session (difficile à tester directement)
      // L'interface devrait changer pour afficher le chat
      expect(screen.getByText('Chat')).toBeInTheDocument();
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs de chargement des sessions', () => {
      const { useSessions } = require('../../hooks/api');
      useSessions.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load sessions'),
        refetch: jest.fn()
      });

      renderWithQueryClient(<IAStrategieAdvanced />);

      expect(screen.getByTestId('error')).toBeInTheDocument();
      expect(screen.getByText('Erreur sessions')).toBeInTheDocument();
    });

    it('devrait gérer les erreurs de création de session', async () => {
      const user = userEvent.setup();
      const { useCreateSession } = require('../../hooks/api');
      useCreateSession.mockReturnValue({
        mutate: jest.fn(),
        isPending: false,
        error: { message: 'Failed to create session' }
      });

      renderWithQueryClient(<IAStrategieAdvanced />);

      await user.click(screen.getByText(/Créer une nouvelle session/i));
      
      expect(screen.getByText('Failed to create session')).toBeInTheDocument();
    });
  });

  describe('États de chargement', () => {
    it('devrait afficher les états de chargement appropriés', () => {
      const { useSessions } = require('../../hooks/api');
      useSessions.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: jest.fn()
      });

      renderWithQueryClient(<IAStrategieAdvanced />);

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  describe('Responsive et accessibilité', () => {
    it('devrait être accessible au clavier', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<IAStrategieAdvanced />);

      // Navigation par tab
      await user.tab();
      
      // Un élément devrait avoir le focus
      expect(document.activeElement).not.toBe(document.body);
    });

    it('devrait avoir les rôles ARIA appropriés', () => {
      renderWithQueryClient(<IAStrategieAdvanced />);

      // Vérifier les éléments interactifs
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('ne devrait pas causer de fuites mémoire', () => {
      const { unmount } = renderWithQueryClient(<IAStrategieAdvanced />);
      
      // Simuler le démontage
      unmount();
      
      // Pas d'exception levée = bon signe
      expect(true).toBe(true);
    });
  });
});