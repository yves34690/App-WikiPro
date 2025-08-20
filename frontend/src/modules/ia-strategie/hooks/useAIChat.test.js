/**
 * Tests pour le hook useAIChat - WikiPro
 * Tests des fonctionnalités de streaming et gestion de conversation
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIChat, MESSAGE_TYPES, CHAT_STATES } from './useAIChat';
import { WS_EVENTS } from '../services/streamingClient';

// Mocks
jest.mock('../services/streamingClient', () => ({
  getStreamingClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    startChat: jest.fn().mockReturnValue(true),
    stopChat: jest.fn(),
    getConnectionState: jest.fn(() => ({
      isConnected: true,
      isConnecting: false,
      reconnectAttempts: 0,
      queueSize: 0
    }))
  })),
  WS_EVENTS: {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    ERROR: 'error',
    CHAT_CHUNK: 'chat.chunk',
    CHAT_COMPLETE: 'chat.complete',
    CHAT_ERROR: 'chat.error',
    PROVIDER_SWITCH: 'provider.switch',
    METRICS_UPDATE: 'metrics.update'
  }
}));

jest.mock('../services/aiProviders', () => ({
  getProvidersManager: jest.fn(() => ({
    getNextAvailableProvider: jest.fn(() => 'openai'),
    isProviderAvailable: jest.fn(() => true),
    recordSuccess: jest.fn(),
    recordError: jest.fn()
  }))
}));

jest.mock('../../../hooks/api', () => ({
  useAddConversation: jest.fn(() => ({
    mutateAsync: jest.fn().mockResolvedValue({ id: 'conv-1' })
  }))
}));

describe('useAIChat', () => {
  let mockClient;

  beforeEach(() => {
    const { getStreamingClient } = require('../services/streamingClient');
    mockClient = getStreamingClient();
    jest.clearAllMocks();
  });

  describe('Initialisation', () => {
    it('devrait initialiser avec les valeurs par défaut', () => {
      const { result } = renderHook(() => useAIChat());

      expect(result.current.chatState).toBe(CHAT_STATES.IDLE);
      expect(result.current.messages).toEqual([]);
      expect(result.current.currentMessage).toBe('');
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('devrait se connecter automatiquement si autoConnect est true', async () => {
      renderHook(() => useAIChat({ autoConnect: true }));

      await waitFor(() => {
        expect(mockClient.connect).toHaveBeenCalled();
      });
    });

    it('ne devrait pas se connecter si autoConnect est false', () => {
      renderHook(() => useAIChat({ autoConnect: false }));

      expect(mockClient.connect).not.toHaveBeenCalled();
    });
  });

  describe('Gestion des messages', () => {
    it('devrait envoyer un message avec succès', async () => {
      const { result } = renderHook(() => useAIChat({
        sessionId: 'session-1',
        autoConnect: false
      }));

      // Simuler l'état connecté
      act(() => {
        result.current.connectToChat();
      });

      await act(async () => {
        const success = await result.current.sendMessage('Hello, world!');
        expect(success).toBe(true);
      });

      expect(mockClient.startChat).toHaveBeenCalledWith({
        message: 'Hello, world!',
        provider: null,
        sessionId: 'session-1',
        temperature: 0.7,
        maxTokens: 2000,
        context: {}
      });
    });

    it('ne devrait pas envoyer de message vide', async () => {
      const { result } = renderHook(() => useAIChat({
        sessionId: 'session-1'
      }));

      await act(async () => {
        const success = await result.current.sendMessage('   ');
        expect(success).toBe(false);
      });

      expect(mockClient.startChat).not.toHaveBeenCalled();
    });

    it('devrait ajouter les messages utilisateur à la liste', async () => {
      const { result } = renderHook(() => useAIChat({
        sessionId: 'session-1'
      }));

      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toMatchObject({
        type: MESSAGE_TYPES.USER,
        content: 'Test message'
      });
    });
  });

  describe('Streaming des réponses', () => {
    it('devrait gérer les chunks de streaming', () => {
      const { result } = renderHook(() => useAIChat());

      // Simuler la réception d'un chunk
      const eventHandlers = {};
      mockClient.on.mockImplementation((event, handler) => {
        eventHandlers[event] = handler;
      });

      // Simuler handleChatChunk
      act(() => {
        if (eventHandlers[WS_EVENTS.CHAT_CHUNK]) {
          eventHandlers[WS_EVENTS.CHAT_CHUNK]({
            content: 'Hello',
            messageId: 'msg-1',
            provider: 'openai'
          });
        }
      });

      expect(result.current.currentMessage).toBe('Hello');
      expect(result.current.currentProvider).toBe('openai');
    });

    it('devrait compléter le streaming et ajouter le message', () => {
      const { result } = renderHook(() => useAIChat({
        sessionId: 'session-1'
      }));

      const eventHandlers = {};
      mockClient.on.mockImplementation((event, handler) => {
        eventHandlers[event] = handler;
      });

      // Simuler un message en streaming
      act(() => {
        if (eventHandlers[WS_EVENTS.CHAT_CHUNK]) {
          eventHandlers[WS_EVENTS.CHAT_CHUNK]({
            content: 'Hello, how can I help you?',
            messageId: 'msg-1',
            provider: 'openai'
          });
        }
      });

      // Compléter le streaming
      act(() => {
        if (eventHandlers[WS_EVENTS.CHAT_COMPLETE]) {
          eventHandlers[WS_EVENTS.CHAT_COMPLETE]({
            messageId: 'msg-1',
            provider: 'openai',
            totalTokens: 50,
            latency: 1500
          });
        }
      });

      expect(result.current.isStreaming).toBe(false);
      expect(result.current.currentMessage).toBe('');
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0]).toMatchObject({
        type: MESSAGE_TYPES.ASSISTANT,
        content: 'Hello, how can I help you?',
        provider: 'openai'
      });
    });

    it('devrait arrêter le streaming', () => {
      const { result } = renderHook(() => useAIChat());

      act(() => {
        result.current.stopStreaming();
      });

      expect(mockClient.stopChat).toHaveBeenCalled();
      expect(result.current.isStreaming).toBe(false);
      expect(result.current.currentMessage).toBe('');
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait gérer les erreurs de chat', () => {
      const { result } = renderHook(() => useAIChat());

      const eventHandlers = {};
      mockClient.on.mockImplementation((event, handler) => {
        eventHandlers[event] = handler;
      });

      act(() => {
        if (eventHandlers[WS_EVENTS.CHAT_ERROR]) {
          eventHandlers[WS_EVENTS.CHAT_ERROR]({
            error: { message: 'Rate limit exceeded' },
            provider: 'openai',
            canRetry: true
          });
        }
      });

      expect(result.current.isStreaming).toBe(false);
      expect(result.current.error).toMatchObject({
        type: 'chat_error',
        message: 'Erreur lors de la génération (openai)',
        canRetry: true
      });
    });

    it('devrait gérer les erreurs de connexion', () => {
      const { result } = renderHook(() => useAIChat());

      const eventHandlers = {};
      mockClient.on.mockImplementation((event, handler) => {
        eventHandlers[event] = handler;
      });

      act(() => {
        if (eventHandlers[WS_EVENTS.ERROR]) {
          eventHandlers[WS_EVENTS.ERROR]({
            error: { message: 'Connection failed' },
            code: 'websocket_error'
          });
        }
      });

      expect(result.current.chatState).toBe(CHAT_STATES.ERROR);
      expect(result.current.error).toMatchObject({
        type: 'websocket_error',
        message: 'Erreur de communication'
      });
    });
  });

  describe('Changement de provider', () => {
    it('devrait changer de provider avec succès', () => {
      const { result } = renderHook(() => useAIChat());

      act(() => {
        const success = result.current.switchProvider('anthropic');
        expect(success).toBe(true);
      });

      expect(result.current.currentProvider).toBe('anthropic');
    });

    it('devrait échouer si le provider n\'est pas disponible', () => {
      const { getProvidersManager } = require('../services/aiProviders');
      const mockProvidersManager = getProvidersManager();
      mockProvidersManager.isProviderAvailable.mockReturnValue(false);

      const { result } = renderHook(() => useAIChat());

      act(() => {
        const success = result.current.switchProvider('unavailable');
        expect(success).toBe(false);
      });

      expect(result.current.error).toMatchObject({
        type: 'provider_unavailable',
        message: 'Provider unavailable non disponible'
      });
    });
  });

  describe('Actions diverses', () => {
    it('devrait effacer les messages', () => {
      const { result } = renderHook(() => useAIChat());

      // Ajouter des messages d'abord
      act(() => {
        result.current.sendMessage('Test');
      });

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toEqual([]);
      expect(result.current.currentMessage).toBe('');
      expect(result.current.error).toBeNull();
    });

    it('devrait regénérer le dernier message', async () => {
      const { result } = renderHook(() => useAIChat());

      // Ajouter un message utilisateur
      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      // Regénérer
      act(() => {
        result.current.regenerateLastMessage();
      });

      // Devrait envoyer le même message
      expect(mockClient.startChat).toHaveBeenCalledTimes(2);
    });

    it('devrait retourner l\'état de connexion correct', () => {
      const { result } = renderHook(() => useAIChat());

      expect(result.current.connectionState).toMatchObject({
        isConnected: true,
        isConnecting: false,
        reconnectAttempts: 0,
        queueSize: 0
      });
    });
  });

  describe('États dérivés', () => {
    it('devrait calculer les états dérivés correctement', () => {
      const { result } = renderHook(() => useAIChat());

      // État initial
      expect(result.current.isConnected).toBe(false);
      expect(result.current.canSendMessage).toBe(false);
      expect(result.current.hasError).toBe(false);

      // Simuler la connexion
      const eventHandlers = {};
      mockClient.on.mockImplementation((event, handler) => {
        eventHandlers[event] = handler;
      });

      act(() => {
        if (eventHandlers[WS_EVENTS.CONNECTED]) {
          eventHandlers[WS_EVENTS.CONNECTED]();
        }
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.canSendMessage).toBe(true);
    });
  });
});

describe('Integration avec les APIs', () => {
  it('devrait sauvegarder les conversations via l\'API', async () => {
    const { useAddConversation } = require('../../../hooks/api');
    const mockMutateAsync = jest.fn().mockResolvedValue({ id: 'conv-1' });
    useAddConversation.mockReturnValue({ mutateAsync: mockMutateAsync });

    const { result } = renderHook(() => useAIChat({
      sessionId: 'session-1'
    }));

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      sessionId: 'session-1',
      conversationData: expect.objectContaining({
        message: 'Test message',
        type: MESSAGE_TYPES.USER
      })
    });
  });

  it('devrait gérer les erreurs de sauvegarde sans bloquer l\'interface', async () => {
    const { useAddConversation } = require('../../../hooks/api');
    const mockMutateAsync = jest.fn().mockRejectedValue(new Error('API Error'));
    useAddConversation.mockReturnValue({ mutateAsync: mockMutateAsync });

    const { result } = renderHook(() => useAIChat({
      sessionId: 'session-1'
    }));

    await act(async () => {
      await result.current.sendMessage('Test message');
    });

    // Le message devrait être ajouté malgré l'erreur API
    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].content).toBe('Test message');
  });
});