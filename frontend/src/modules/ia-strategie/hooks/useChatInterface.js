import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../services/api';

/**
 * Hook pour interface ChatGPT avec backend multi-provider et streaming WebSocket
 */
export const useChatInterface = () => {
  // État principal
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [availableProviders, setAvailableProviders] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // État du streaming
  const [currentStreamContent, setCurrentStreamContent] = useState('');
  const [currentMessageId, setCurrentMessageId] = useState(null);
  
  // Refs
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // Context auth
  const { user, token } = useAuth();

  // Initialisation WebSocket
  useEffect(() => {
    if (!token) return;

    const socket = io('http://localhost:3001', {
      auth: { token },
      transports: ['websocket']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 WebSocket connecté');
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket déconnecté');
      setConnectionStatus('disconnected');
    });

    socket.on('chat-stream-chunk', (data) => {
      console.log('📡 Chunk reçu:', data);
      setCurrentStreamContent(prev => prev + data.content);
    });

    socket.on('chat-stream-complete', (data) => {
      console.log('✅ Stream terminé:', data);
      setIsStreaming(false);
      
      // Ajouter le message final
      setMessages(prev => [
        ...prev,
        {
          id: currentMessageId || Date.now(),
          role: 'assistant',
          content: currentStreamContent || data.fullContent,
          provider: selectedProvider,
          timestamp: new Date(),
          tokensUsed: data.tokensUsed,
          finishReason: data.finishReason
        }
      ]);
      
      setCurrentStreamContent('');
      setCurrentMessageId(null);
    });

    socket.on('chat-stream-error', (error) => {
      console.error('❌ Erreur stream:', error);
      setIsStreaming(false);
      setCurrentStreamContent('');
      setCurrentMessageId(null);
      
      // Ajouter message d'erreur
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          role: 'assistant',
          content: `Erreur: ${error.message}`,
          provider: selectedProvider,
          timestamp: new Date(),
          error: true
        }
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, currentMessageId, currentStreamContent, selectedProvider]);

  // Charger les providers disponibles
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const providers = await apiService.getAvailableProviders();
        setAvailableProviders(providers);
        
        // Sélectionner le premier provider disponible par défaut
        if (providers.length > 0 && !selectedProvider) {
          setSelectedProvider(providers[0].id);
        }
      } catch (error) {
        console.error('Erreur chargement providers:', error);
      }
    };

    if (token) {
      loadProviders();
    }
  }, [token, selectedProvider]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamContent]);

  // Envoyer un message
  const sendMessage = async () => {
    if (!inputText.trim() || isStreaming || !socketRef.current) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    // Ajouter le message utilisateur
    setMessages(prev => [...prev, userMessage]);
    
    // Réinitialiser l'input
    const prompt = inputText.trim();
    setInputText('');
    
    // Démarrer le streaming
    setIsStreaming(true);
    setCurrentStreamContent('');
    const messageId = Date.now() + 1;
    setCurrentMessageId(messageId);

    try {
      // Envoyer la requête de streaming via WebSocket
      socketRef.current.emit('start-streaming', {
        prompt,
        provider: selectedProvider,
        tenantId: user?.tenantId || 'default',
        options: {
          maxTokens: 2048,
          temperature: 0.7
        }
      });
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setIsStreaming(false);
      setCurrentStreamContent('');
      setCurrentMessageId(null);
    }
  };

  // Stopper le streaming
  const stopStreaming = () => {
    if (socketRef.current && isStreaming) {
      socketRef.current.emit('stop-streaming');
      setIsStreaming(false);
      setCurrentStreamContent('');
      setCurrentMessageId(null);
    }
  };

  // Gérer les touches
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Effacer la conversation
  const clearConversation = () => {
    setMessages([]);
    setCurrentStreamContent('');
    setCurrentMessageId(null);
  };

  // Test de connexion provider
  const testProvider = async (providerId) => {
    try {
      const result = await apiService.testProvider(providerId);
      return result;
    } catch (error) {
      console.error(`Erreur test provider ${providerId}:`, error);
      return { success: false, error: error.message };
    }
  };

  return {
    // État principal
    messages,
    inputText,
    setInputText,
    isStreaming,
    selectedProvider,
    setSelectedProvider,
    availableProviders,
    connectionStatus,
    
    // État streaming
    currentStreamContent,
    
    // Actions
    sendMessage,
    stopStreaming,
    handleKeyPress,
    clearConversation,
    testProvider,
    
    // Refs
    messagesEndRef
  };
};