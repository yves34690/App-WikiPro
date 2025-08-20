/**
 * Hook useAIChat pour gestion du streaming IA en temps réel - WikiPro
 * Gère la connexion WebSocket, les conversations et l'état du chat
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getStreamingClient, WS_EVENTS } from '../services/streamingClient';
import { getProvidersManager, PROVIDER_STATUS } from '../services/aiProviders';
import { useAddConversation } from '../../../hooks/api';

// Types de messages
export const MESSAGE_TYPES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
  ERROR: 'error'
};

// États du chat
export const CHAT_STATES = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  STREAMING: 'streaming',
  ERROR: 'error',
  DISCONNECTED: 'disconnected'
};

/**
 * Hook principal pour le chat IA streaming
 */
export const useAIChat = (options = {}) => {
  const {
    sessionId,
    autoConnect = true,
    preferredProvider = null,
    enableFallback = true,
    maxRetries = 3
  } = options;

  // État du chat
  const [chatState, setChatState] = useState(CHAT_STATES.IDLE);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(preferredProvider);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({});

  // Refs pour la gestion
  const streamingClientRef = useRef(null);
  const providersManagerRef = useRef(null);
  const currentStreamRef = useRef(null);
  const retryCountRef = useRef(0);
  const addConversationMutation = useAddConversation();

  // Initialisation
  useEffect(() => {
    streamingClientRef.current = getStreamingClient();
    providersManagerRef.current = getProvidersManager();

    if (autoConnect) {
      connectToChat();
    }

    return () => {
      disconnectFromChat();
    };
  }, [autoConnect]);

  /**
   * Connexion au chat WebSocket
   */
  const connectToChat = useCallback(async () => {
    if (chatState === CHAT_STATES.CONNECTING || chatState === CHAT_STATES.CONNECTED) {
      return;
    }

    setChatState(CHAT_STATES.CONNECTING);
    setError(null);

    try {
      const client = streamingClientRef.current;
      
      // Configuration des listeners
      setupEventListeners();
      
      // Connexion
      await client.connect();
      setChatState(CHAT_STATES.CONNECTED);
      
      console.info('Chat connecté avec succès');
      
    } catch (error) {
      console.error('Erreur connexion chat:', error);
      setChatState(CHAT_STATES.ERROR);
      setError({
        type: 'connection_error',
        message: 'Impossible de se connecter au service de chat',
        details: error.message
      });
    }
  }, [chatState]);

  /**
   * Déconnexion du chat
   */
  const disconnectFromChat = useCallback(() => {
    const client = streamingClientRef.current;
    if (client) {
      removeEventListeners();
      client.disconnect();
    }
    
    setChatState(CHAT_STATES.DISCONNECTED);
    setIsStreaming(false);
    setCurrentMessage('');
  }, []);

  /**
   * Configuration des listeners WebSocket
   */
  const setupEventListeners = useCallback(() => {
    const client = streamingClientRef.current;
    if (!client) return;

    // Événements de connexion
    client.on(WS_EVENTS.CONNECTED, handleConnected);
    client.on(WS_EVENTS.DISCONNECTED, handleDisconnected);
    client.on(WS_EVENTS.ERROR, handleError);

    // Événements de chat
    client.on(WS_EVENTS.CHAT_CHUNK, handleChatChunk);
    client.on(WS_EVENTS.CHAT_COMPLETE, handleChatComplete);
    client.on(WS_EVENTS.CHAT_ERROR, handleChatError);
    client.on(WS_EVENTS.PROVIDER_SWITCH, handleProviderSwitch);
    client.on(WS_EVENTS.METRICS_UPDATE, handleMetricsUpdate);
  }, []);

  /**
   * Suppression des listeners
   */
  const removeEventListeners = useCallback(() => {
    const client = streamingClientRef.current;
    if (!client) return;

    client.off(WS_EVENTS.CONNECTED, handleConnected);
    client.off(WS_EVENTS.DISCONNECTED, handleDisconnected);
    client.off(WS_EVENTS.ERROR, handleError);
    client.off(WS_EVENTS.CHAT_CHUNK, handleChatChunk);
    client.off(WS_EVENTS.CHAT_COMPLETE, handleChatComplete);
    client.off(WS_EVENTS.CHAT_ERROR, handleChatError);
    client.off(WS_EVENTS.PROVIDER_SWITCH, handleProviderSwitch);
    client.off(WS_EVENTS.METRICS_UPDATE, handleMetricsUpdate);
  }, []);

  /**
   * Handlers d'événements WebSocket
   */
  const handleConnected = useCallback(() => {
    setChatState(CHAT_STATES.CONNECTED);
    setError(null);
    retryCountRef.current = 0;
  }, []);

  const handleDisconnected = useCallback((data) => {
    setChatState(CHAT_STATES.DISCONNECTED);
    setIsStreaming(false);
    
    if (data?.code !== 1000) { // Pas une déconnexion volontaire
      setError({
        type: 'disconnection_error',
        message: 'Connexion interrompue',
        details: data?.reason || 'Raison inconnue'
      });
    }
  }, []);

  const handleError = useCallback((data) => {
    console.error('Erreur WebSocket:', data);
    setChatState(CHAT_STATES.ERROR);
    setIsStreaming(false);
    
    setError({
      type: data.code || 'unknown_error',
      message: 'Erreur de communication',
      details: data.error?.message || 'Erreur inconnue'
    });
  }, []);

  const handleChatChunk = useCallback((data) => {
    const { content, messageId, provider } = data;
    
    setCurrentMessage(prev => prev + content);
    setCurrentProvider(provider);
    
    // Mise à jour du stream ref
    if (currentStreamRef.current) {
      currentStreamRef.current.content += content;
      currentStreamRef.current.lastUpdate = Date.now();
    }
  }, []);

  const handleChatComplete = useCallback(async (data) => {
    const { messageId, provider, totalTokens, latency } = data;
    
    setIsStreaming(false);
    
    // Ajout du message complet à la liste
    const completeMessage = {
      id: messageId,
      type: MESSAGE_TYPES.ASSISTANT,
      content: currentMessage,
      provider,
      timestamp: Date.now(),
      metadata: {
        tokens: totalTokens,
        latency,
        sessionId
      }
    };
    
    setMessages(prev => [...prev, completeMessage]);
    setCurrentMessage('');
    
    // Enregistrement de la conversation dans l'API
    if (sessionId && completeMessage.content.trim()) {
      try {
        await addConversationMutation.mutateAsync({
          sessionId,
          conversationData: {
            message: completeMessage.content,
            type: MESSAGE_TYPES.ASSISTANT,
            metadata: {
              provider,
              tokens: totalTokens,
              latency,
              messageId
            }
          }
        });
      } catch (error) {
        console.error('Erreur sauvegarde conversation:', error);
      }
    }
    
    // Mise à jour des métriques du provider
    const providersManager = providersManagerRef.current;
    if (providersManager) {
      providersManager.recordSuccess(provider, latency, totalTokens);
    }
    
    // Reset du stream ref
    currentStreamRef.current = null;
    
    console.info('Chat complété:', { provider, tokens: totalTokens, latency });
  }, [currentMessage, sessionId, addConversationMutation]);

  const handleChatError = useCallback((data) => {
    const { error, provider, canRetry } = data;
    
    setIsStreaming(false);
    setCurrentMessage('');
    
    // Mise à jour des métriques du provider
    const providersManager = providersManagerRef.current;
    if (providersManager) {
      providersManager.recordError(provider, error);
    }
    
    const errorMessage = {
      id: `error_${Date.now()}`,
      type: MESSAGE_TYPES.ERROR,
      content: `Erreur ${provider}: ${error.message}`,
      timestamp: Date.now(),
      provider,
      metadata: { error, canRetry }
    };
    
    setMessages(prev => [...prev, errorMessage]);
    
    // Tentative de fallback si activé
    if (enableFallback && canRetry && retryCountRef.current < maxRetries) {
      retryCountRef.current++;
      
      const nextProvider = providersManager?.getNextAvailableProvider();
      if (nextProvider && nextProvider !== provider) {
        console.warn(`Fallback vers ${nextProvider} après erreur ${provider}`);
        setCurrentProvider(nextProvider);
        
        // Notification de fallback
        const fallbackMessage = {
          id: `fallback_${Date.now()}`,
          type: MESSAGE_TYPES.SYSTEM,
          content: `Basculement automatique vers ${nextProvider}`,
          timestamp: Date.now(),
          provider: nextProvider,
          metadata: { type: 'fallback', fromProvider: provider }
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
      }
    }
    
    setError({
      type: 'chat_error',
      message: `Erreur lors de la génération (${provider})`,
      details: error.message,
      canRetry
    });
  }, [enableFallback, maxRetries]);

  const handleProviderSwitch = useCallback((data) => {
    const { fromProvider, toProvider, reason } = data;
    
    setCurrentProvider(toProvider);
    
    const switchMessage = {
      id: `switch_${Date.now()}`,
      type: MESSAGE_TYPES.SYSTEM,
      content: `Changement de provider: ${fromProvider} → ${toProvider} (${reason})`,
      timestamp: Date.now(),
      provider: toProvider,
      metadata: { type: 'provider_switch', fromProvider, reason }
    };
    
    setMessages(prev => [...prev, switchMessage]);
  }, []);

  const handleMetricsUpdate = useCallback((data) => {
    setMetrics(data);
  }, []);

  /**
   * Envoi d'un message
   */
  const sendMessage = useCallback(async (message, options = {}) => {
    if (!message.trim() || isStreaming || chatState !== CHAT_STATES.CONNECTED) {
      return false;
    }

    const {
      provider = currentProvider,
      temperature = 0.7,
      maxTokens = 2000,
      context = {}
    } = options;

    // Ajout du message utilisateur
    const userMessage = {
      id: `user_${Date.now()}`,
      type: MESSAGE_TYPES.USER,
      content: message.trim(),
      timestamp: Date.now(),
      metadata: { sessionId }
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Sauvegarde du message utilisateur
    if (sessionId) {
      try {
        await addConversationMutation.mutateAsync({
          sessionId,
          conversationData: {
            message: userMessage.content,
            type: MESSAGE_TYPES.USER,
            metadata: {
              provider,
              timestamp: userMessage.timestamp
            }
          }
        });
      } catch (error) {
        console.error('Erreur sauvegarde message utilisateur:', error);
      }
    }

    // Détermination du provider à utiliser
    const providersManager = providersManagerRef.current;
    const selectedProvider = providersManager?.getNextAvailableProvider(provider) || provider;
    
    if (!selectedProvider) {
      setError({
        type: 'no_provider_available',
        message: 'Aucun provider IA disponible',
        details: 'Tous les providers sont temporairement indisponibles'
      });
      return false;
    }

    setCurrentProvider(selectedProvider);
    setIsStreaming(true);
    setError(null);
    
    // Initialisation du stream ref
    currentStreamRef.current = {
      messageId: `stream_${Date.now()}`,
      content: '',
      startTime: Date.now(),
      lastUpdate: Date.now()
    };

    // Envoi via WebSocket
    const client = streamingClientRef.current;
    const sent = client?.startChat({
      message: message.trim(),
      provider: selectedProvider,
      sessionId,
      temperature,
      maxTokens,
      context
    });

    if (!sent) {
      setIsStreaming(false);
      setError({
        type: 'send_error',
        message: 'Impossible d\'envoyer le message',
        details: 'Problème de connexion WebSocket'
      });
      return false;
    }

    return true;
  }, [isStreaming, chatState, currentProvider, sessionId, addConversationMutation]);

  /**
   * Arrêt du streaming en cours
   */
  const stopStreaming = useCallback(() => {
    if (!isStreaming) return;

    const client = streamingClientRef.current;
    client?.stopChat();
    
    setIsStreaming(false);
    setCurrentMessage('');
    currentStreamRef.current = null;
  }, [isStreaming]);

  /**
   * Effacement des messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentMessage('');
    setError(null);
  }, []);

  /**
   * Retry de la dernière action
   */
  const retry = useCallback(() => {
    if (chatState === CHAT_STATES.ERROR || chatState === CHAT_STATES.DISCONNECTED) {
      connectToChat();
    }
  }, [chatState, connectToChat]);

  /**
   * Changement de provider
   */
  const switchProvider = useCallback((newProvider) => {
    const providersManager = providersManagerRef.current;
    
    if (!providersManager?.isProviderAvailable(newProvider)) {
      setError({
        type: 'provider_unavailable',
        message: `Provider ${newProvider} non disponible`,
        details: 'Sélectionnez un autre provider'
      });
      return false;
    }

    setCurrentProvider(newProvider);
    setError(null);
    return true;
  }, []);

  /**
   * Génération d'un nouveau message
   */
  const regenerateLastMessage = useCallback(() => {
    const lastUserMessage = messages
      .slice()
      .reverse()
      .find(msg => msg.type === MESSAGE_TYPES.USER);
    
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  // État de connexion actuel
  const connectionState = streamingClientRef.current?.getConnectionState() || {};

  return {
    // État
    chatState,
    messages,
    currentMessage,
    isStreaming,
    currentProvider,
    error,
    metrics,
    connectionState,
    
    // Actions
    sendMessage,
    stopStreaming,
    clearMessages,
    retry,
    switchProvider,
    regenerateLastMessage,
    connectToChat,
    disconnectFromChat,
    
    // Helpers
    isConnected: chatState === CHAT_STATES.CONNECTED,
    canSendMessage: chatState === CHAT_STATES.CONNECTED && !isStreaming,
    hasError: !!error,
    retryCount: retryCountRef.current
  };
};

export default useAIChat;