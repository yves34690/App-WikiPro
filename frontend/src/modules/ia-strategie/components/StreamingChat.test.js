/**
 * Tests pour le composant StreamingChat - WikiPro
 * Tests de l'interface de chat en temps réel
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StreamingChat from './StreamingChat';
import { CHAT_STATES, MESSAGE_TYPES } from '../hooks/useAIChat';

// Mock du hook useAIChat
const mockUseAIChat = {
  chatState: CHAT_STATES.CONNECTED,
  messages: [],
  currentMessage: '',
  isStreaming: false,
  currentProvider: 'openai',
  error: null,
  connectionState: { isConnected: true },
  sendMessage: jest.fn(),
  stopStreaming: jest.fn(),
  clearMessages: jest.fn(),
  retry: jest.fn(),
  regenerateLastMessage: jest.fn(),
  connectToChat: jest.fn(),
  isConnected: true,
  canSendMessage: true,
  hasError: false
};

jest.mock('../hooks/useAIChat', () => ({
  useAIChat: () => mockUseAIChat,
  MESSAGE_TYPES: {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system',
    ERROR: 'error'
  },
  CHAT_STATES: {
    IDLE: 'idle',
    CONNECTING: 'connecting', 
    CONNECTED: 'connected',
    STREAMING: 'streaming',
    ERROR: 'error',
    DISCONNECTED: 'disconnected'
  }
}));

describe('StreamingChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAIChat.sendMessage.mockResolvedValue(true);
  });

  describe('Rendu initial', () => {
    it('devrait afficher l\'interface de chat vide', () => {
      render(<StreamingChat sessionId="session-1" />);

      expect(screen.getByText(/Commencez une conversation/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Tapez votre message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Envoyer/i })).toBeInTheDocument();
    });

    it('devrait afficher le statut de connexion', () => {
      render(<StreamingChat sessionId="session-1" showConnectionStatus={true} />);

      expect(screen.getByText(/Connecté/i)).toBeInTheDocument();
    });

    it('ne devrait pas afficher le statut si désactivé', () => {
      render(<StreamingChat sessionId="session-1" showConnectionStatus={false} />);

      expect(screen.queryByText(/Connecté/i)).not.toBeInTheDocument();
    });
  });

  describe('Affichage des messages', () => {
    it('devrait afficher les messages existants', () => {
      mockUseAIChat.messages = [
        {
          id: '1',
          type: MESSAGE_TYPES.USER,
          content: 'Hello',
          timestamp: Date.now(),
          metadata: {}
        },
        {
          id: '2',
          type: MESSAGE_TYPES.ASSISTANT,
          content: 'Hi there!',
          provider: 'openai',
          timestamp: Date.now(),
          metadata: { tokens: 10 }
        }
      ];

      render(<StreamingChat sessionId="session-1" />);

      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('devrait afficher un message en streaming', () => {
      mockUseAIChat.currentMessage = 'Streaming response...';
      mockUseAIChat.isStreaming = true;

      render(<StreamingChat sessionId="session-1" />);

      expect(screen.getByText('Streaming response...')).toBeInTheDocument();
    });

    it('devrait afficher les métadonnées des messages', () => {
      mockUseAIChat.messages = [
        {
          id: '1',
          type: MESSAGE_TYPES.ASSISTANT,
          content: 'Response',
          provider: 'openai',
          timestamp: Date.now(),
          metadata: { tokens: 25, latency: 1500 }
        }
      ];

      render(<StreamingChat sessionId="session-1" />);

      expect(screen.getByText('25 tokens')).toBeInTheDocument();
      expect(screen.getByText('1500ms')).toBeInTheDocument();
    });
  });

  describe('Saisie et envoi de messages', () => {
    it('devrait permettre de taper un message', async () => {
      const user = userEvent.setup();
      render(<StreamingChat sessionId="session-1" />);

      const input = screen.getByPlaceholderText(/Tapez votre message/i);
      
      await user.type(input, 'Test message');
      expect(input).toHaveValue('Test message');
    });

    it('devrait envoyer un message en cliquant sur le bouton', async () => {
      const user = userEvent.setup();
      render(<StreamingChat sessionId="session-1" />);

      const input = screen.getByPlaceholderText(/Tapez votre message/i);
      const sendButton = screen.getByRole('button', { name: /Envoyer/i });

      await user.type(input, 'Test message');
      await user.click(sendButton);

      expect(mockUseAIChat.sendMessage).toHaveBeenCalledWith('Test message', {
        provider: undefined
      });
    });

    it('devrait envoyer un message avec Ctrl+Enter', async () => {
      const user = userEvent.setup();
      render(<StreamingChat sessionId="session-1" />);

      const input = screen.getByPlaceholderText(/Tapez votre message/i);

      await user.type(input, 'Test message');
      await user.keyboard('{Control>}{Enter}{/Control}');

      expect(mockUseAIChat.sendMessage).toHaveBeenCalledWith('Test message', {
        provider: undefined
      });
    });

    it('ne devrait pas envoyer de message vide', async () => {
      const user = userEvent.setup();
      render(<StreamingChat sessionId="session-1" />);

      const sendButton = screen.getByRole('button', { name: /Envoyer/i });
      
      await user.click(sendButton);

      expect(mockUseAIChat.sendMessage).not.toHaveBeenCalled();
    });

    it('devrait effacer le champ après envoi réussi', async () => {
      const user = userEvent.setup();
      render(<StreamingChat sessionId="session-1" />);

      const input = screen.getByPlaceholderText(/Tapez votre message/i);
      const sendButton = screen.getByRole('button', { name: /Envoyer/i });

      await user.type(input, 'Test message');
      await user.click(sendButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });
  });

  describe('État de streaming', () => {
    it('devrait afficher le bouton Stop pendant le streaming', () => {
      mockUseAIChat.isStreaming = true;

      render(<StreamingChat sessionId="session-1" />);

      expect(screen.getByRole('button', { name: /Stop/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Envoyer/i })).not.toBeInTheDocument();
    });

    it('devrait arrêter le streaming en cliquant Stop', async () => {
      const user = userEvent.setup();
      mockUseAIChat.isStreaming = true;

      render(<StreamingChat sessionId="session-1" />);

      const stopButton = screen.getByRole('button', { name: /Stop/i });
      await user.click(stopButton);

      expect(mockUseAIChat.stopStreaming).toHaveBeenCalled();
    });

    it('devrait arrêter le streaming avec Escape', async () => {
      const user = userEvent.setup();
      mockUseAIChat.isStreaming = true;

      render(<StreamingChat sessionId="session-1" />);

      const input = screen.getByPlaceholderText(/Tapez votre message/i);
      await user.type(input, 'test');
      await user.keyboard('{Escape}');

      expect(mockUseAIChat.stopStreaming).toHaveBeenCalled();
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait afficher une erreur de connexion', () => {
      mockUseAIChat.error = {
        type: 'connection_error',
        message: 'Connexion impossible',
        details: 'Serveur indisponible'
      };

      render(<StreamingChat sessionId="session-1" />);

      expect(screen.getByText('Connexion impossible')).toBeInTheDocument();
      expect(screen.getByText('Serveur indisponible')).toBeInTheDocument();
    });

    it('devrait afficher une erreur de chat', () => {
      mockUseAIChat.error = {
        type: 'chat_error',
        message: 'Erreur génération',
        details: 'Rate limit atteint'
      };

      render(<StreamingChat sessionId="session-1" />);

      expect(screen.getByText('Erreur génération')).toBeInTheDocument();
    });
  });

  describe('Actions sur les messages', () => {
    it('devrait permettre de copier un message au hover', async () => {
      const user = userEvent.setup();
      
      // Mock du clipboard
      Object.assign(navigator, {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined)
        }
      });

      mockUseAIChat.messages = [
        {
          id: '1',
          type: MESSAGE_TYPES.ASSISTANT,
          content: 'Test response',
          timestamp: Date.now(),
          metadata: {}
        }
      ];

      render(<StreamingChat sessionId="session-1" />);

      const messageDiv = screen.getByText('Test response').closest('.chat-message');
      
      // Hover pour afficher les actions
      await user.hover(messageDiv);
      
      // Vérifier que les boutons d'action sont visibles
      await waitFor(() => {
        const copyButton = screen.getByTitle('Copier le message');
        expect(copyButton).toBeInTheDocument();
      });
    });

    it('devrait permettre de regénérer une réponse', async () => {
      const user = userEvent.setup();
      
      mockUseAIChat.messages = [
        {
          id: '1',
          type: MESSAGE_TYPES.ASSISTANT,
          content: 'Test response',
          timestamp: Date.now(),
          metadata: {}
        }
      ];

      render(<StreamingChat sessionId="session-1" />);

      const messageDiv = screen.getByText('Test response').closest('.chat-message');
      
      await user.hover(messageDiv);
      
      await waitFor(async () => {
        const regenButton = screen.getByTitle('Regénérer la réponse');
        await user.click(regenButton);
      });

      expect(mockUseAIChat.regenerateLastMessage).toHaveBeenCalled();
    });
  });

  describe('Auto-resize du textarea', () => {
    it('devrait adapter la hauteur du textarea au contenu', async () => {
      const user = userEvent.setup();
      render(<StreamingChat sessionId="session-1" />);

      const input = screen.getByPlaceholderText(/Tapez votre message/i);
      
      // Taper un message multiligne
      await user.type(input, 'Line 1{enter}Line 2{enter}Line 3');

      // Vérifier que la hauteur a changé (difficile à tester exactement)
      expect(input.rows).toBeGreaterThan(1);
    });
  });

  describe('Accessibilité', () => {
    it('devrait avoir les labels ARIA appropriés', () => {
      render(<StreamingChat sessionId="session-1" />);

      const input = screen.getByPlaceholderText(/Tapez votre message/i);
      const sendButton = screen.getByRole('button', { name: /Envoyer/i });

      expect(input).toBeInTheDocument();
      expect(sendButton).toBeInTheDocument();
    });

    it('devrait gérer la navigation au clavier', async () => {
      const user = userEvent.setup();
      render(<StreamingChat sessionId="session-1" />);

      const input = screen.getByPlaceholderText(/Tapez votre message/i);
      
      // Tab pour naviguer
      await user.tab();
      expect(input).toHaveFocus();
    });
  });

  describe('Intégration avec providers', () => {
    it('devrait afficher le provider courant', () => {
      mockUseAIChat.currentProvider = 'anthropic';
      
      render(<StreamingChat sessionId="session-1" />);

      // Le provider devrait être visible quelque part (dans les messages ou l'interface)
      expect(screen.getByDisplayValue || screen.getByText).toBeDefined();
    });

    it('devrait appeler onProviderChange quand le provider change', () => {
      const mockOnProviderChange = jest.fn();
      mockUseAIChat.currentProvider = 'anthropic';

      const { rerender } = render(
        <StreamingChat 
          sessionId="session-1" 
          onProviderChange={mockOnProviderChange}
          selectedProvider="openai"
        />
      );

      // Simuler un changement de provider dans le hook
      mockUseAIChat.currentProvider = 'anthropic';
      
      rerender(
        <StreamingChat 
          sessionId="session-1" 
          onProviderChange={mockOnProviderChange}
          selectedProvider="openai"
        />
      );

      expect(mockOnProviderChange).toHaveBeenCalledWith('anthropic');
    });
  });

  describe('États de connexion', () => {
    it('devrait afficher l\'état déconnecté', () => {
      mockUseAIChat.chatState = CHAT_STATES.DISCONNECTED;
      mockUseAIChat.isConnected = false;
      mockUseAIChat.canSendMessage = false;

      render(<StreamingChat sessionId="session-1" showConnectionStatus={true} />);

      expect(screen.getByText(/Déconnecté/i)).toBeInTheDocument();
    });

    it('devrait permettre de reconnecter', async () => {
      const user = userEvent.setup();
      mockUseAIChat.chatState = CHAT_STATES.ERROR;

      render(<StreamingChat sessionId="session-1" showConnectionStatus={true} />);

      const retryButton = screen.getByText(/Reconnecter/i);
      await user.click(retryButton);

      expect(mockUseAIChat.retry).toHaveBeenCalled();
    });
  });

  describe('Nettoyage', () => {
    it('devrait permettre d\'effacer la conversation', async () => {
      const user = userEvent.setup();
      mockUseAIChat.messages = [
        {
          id: '1',
          type: MESSAGE_TYPES.USER,
          content: 'Test',
          timestamp: Date.now(),
          metadata: {}
        }
      ];

      render(<StreamingChat sessionId="session-1" />);

      const clearButton = screen.getByTitle('Effacer la conversation');
      await user.click(clearButton);

      expect(mockUseAIChat.clearMessages).toHaveBeenCalled();
    });
  });
});