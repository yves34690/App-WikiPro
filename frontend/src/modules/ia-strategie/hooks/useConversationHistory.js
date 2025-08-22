import { useState, useEffect, useCallback } from 'react';

// Configuration de base de l'API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_ENDPOINTS = {
  conversations: `${API_BASE_URL}/api/chat/conversations`,
  search: `${API_BASE_URL}/api/chat/search`,
  stats: `${API_BASE_URL}/api/chat/stats`
};

/**
 * Hook personnalisé pour gérer l'historique des conversations
 * Intègre les APIs REST du backend pour CRUD complet
 */
export const useConversationHistory = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContextType, setSelectedContextType] = useState('');
  const [conversationStats, setConversationStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    totalTokens: 0,
    avgMessagesPerConversation: 0,
    lastChatDate: null
  });

  // Token d'authentification - sera intégré avec le système auth existant
  const getAuthToken = useCallback(() => {
    // TODO: Intégrer avec le système d'authentification WikiPro
    return localStorage.getItem('authToken') || 'mock-jwt-token-dev';
  }, []);

  // Headers par défaut pour les requêtes
  const getHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    };
  }, [getAuthToken]);

  // Gestion d'erreur centralisée
  const handleApiError = useCallback((error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Token expiré - redirection vers login
      setError('Session expirée. Veuillez vous reconnecter.');
      // TODO: Intégrer avec le système de routing WikiPro
      return;
    }
    
    if (error.response?.status === 403) {
      setError('Accès non autorisé.');
      return;
    }
    
    if (error.response?.status >= 500) {
      setError('Erreur serveur. Veuillez réessayer plus tard.');
      return;
    }
    
    setError(error.message || 'Une erreur est survenue');
  }, []);

  // Charger les conversations avec pagination et filtres
  const loadConversations = useCallback(async (options = {}) => {
    const {
      page = 1,
      limit = 50,
      search = searchTerm,
      contextType = selectedContextType,
      refresh = false
    } = options;

    if (!refresh && loading) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (search) params.append('search', search);
      if (contextType) params.append('contextType', contextType);

      const response = await fetch(`${API_ENDPOINTS.conversations}?${params}`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setConversations(data.conversations || []);
      
      // Log pour debug en développement
      if (process.env.NODE_ENV === 'development') {
        console.log('Conversations chargées:', data.conversations?.length || 0);
      }

    } catch (error) {
      handleApiError(error);
      // En cas d'erreur, utiliser des données mockées en développement
      if (process.env.NODE_ENV === 'development') {
        setConversations(getMockConversations());
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedContextType, loading, getHeaders, handleApiError]);

  // Charger les statistiques utilisateur
  const loadStats = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.stats, {
        headers: getHeaders()
      });

      if (response.ok) {
        const stats = await response.json();
        setConversationStats(stats);
      }
    } catch (error) {
      console.warn('Impossible de charger les statistiques:', error);
      // Utiliser des stats par défaut
      if (process.env.NODE_ENV === 'development') {
        setConversationStats({
          totalConversations: 5,
          totalMessages: 47,
          totalTokens: 12450,
          avgMessagesPerConversation: 9.4,
          lastChatDate: new Date().toISOString()
        });
      }
    }
  }, [getHeaders]);

  // Créer une nouvelle conversation
  const createNewConversation = useCallback(async (conversationData) => {
    try {
      setLoading(true);

      const response = await fetch(API_ENDPOINTS.conversations, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title: conversationData.title || 'Nouvelle conversation',
          contextType: conversationData.contextType || 'general',
          aiSettings: conversationData.aiSettings || {
            provider: 'openai',
            model: 'gpt-4',
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur création: ${response.statusText}`);
      }

      const newConversation = await response.json();
      
      // Rafraîchir la liste
      await loadConversations({ refresh: true });
      await loadStats();

      return newConversation;

    } catch (error) {
      handleApiError(error);
      
      // Fallback en développement
      if (process.env.NODE_ENV === 'development') {
        const mockConversation = {
          id: `mock-${Date.now()}`,
          title: conversationData.title,
          contextType: conversationData.contextType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messageCount: 0,
          lastMessage: null
        };
        
        setConversations(prev => [mockConversation, ...prev]);
        return mockConversation;
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getHeaders, handleApiError, loadConversations, loadStats]);

  // Supprimer une conversation
  const deleteConversation = useCallback(async (conversationId) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_ENDPOINTS.conversations}/${conversationId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur suppression: ${response.statusText}`);
      }

      // Supprimer localement
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      // Rafraîchir les stats
      await loadStats();

    } catch (error) {
      handleApiError(error);
      
      // Fallback en développement
      if (process.env.NODE_ENV === 'development') {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
      } else {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  }, [getHeaders, handleApiError, loadStats]);

  // Rechercher dans les conversations
  const searchConversations = useCallback(async (query) => {
    if (!query || query.length < 2) {
      loadConversations({ search: '' });
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams({
        q: query,
        limit: '20',
        contextType: selectedContextType || ''
      });

      const response = await fetch(`${API_ENDPOINTS.search}?${params}`, {
        headers: getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        // Transformer les résultats de recherche au format attendu
        const searchResults = data.results.map(result => ({
          id: result.conversationId,
          title: result.conversationTitle,
          contextType: result.contextType,
          messageCount: result.messageCount,
          createdAt: result.createdAt,
          updatedAt: result.createdAt // Utilisé comme fallback
        }));
        
        setConversations(searchResults);
      } else {
        // Fallback sur le chargement normal avec recherche locale
        loadConversations({ search: query });
      }
    } catch (error) {
      console.warn('Erreur recherche, fallback local:', error);
      loadConversations({ search: query });
    } finally {
      setLoading(false);
    }
  }, [selectedContextType, getHeaders, loadConversations]);

  // Obtenir une conversation spécifique avec ses messages
  const getConversation = useCallback(async (conversationId, includeMessages = true) => {
    try {
      const params = includeMessages ? '?includeMessages=true&messageLimit=100' : '';
      const response = await fetch(`${API_ENDPOINTS.conversations}/${conversationId}${params}`, {
        headers: getHeaders()
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error(`Conversation non trouvée: ${response.statusText}`);
      }
    } catch (error) {
      handleApiError(error);
      
      // Mock en développement
      if (process.env.NODE_ENV === 'development') {
        return getMockConversationDetails(conversationId);
      }
      
      throw error;
    }
  }, [getHeaders, handleApiError]);

  // Évaluer un message
  const rateMessage = useCallback(async (messageId, rating, feedback = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/messages/${messageId}/rating`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ rating, feedback })
      });

      if (!response.ok) {
        throw new Error(`Erreur évaluation: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, [getHeaders, handleApiError]);

  // Rafraîchir les conversations
  const refreshConversations = useCallback(() => {
    loadConversations({ refresh: true });
    loadStats();
  }, [loadConversations, loadStats]);

  // Chargement initial et mise à jour sur changement de filtres
  useEffect(() => {
    loadConversations();
    loadStats();
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchConversations(searchTerm);
      } else {
        loadConversations();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchConversations, loadConversations]);

  // Mise à jour sur changement de contexte
  useEffect(() => {
    loadConversations();
  }, [selectedContextType]);

  // Données mockées pour le développement
  const getMockConversations = () => [
    {
      id: 'mock-1',
      title: 'Analyse des tendances 2024',
      contextType: 'analysis',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T14:45:00Z',
      messageCount: 12,
      lastMessage: {
        id: 'msg-1',
        role: 'assistant',
        content: 'Voici les principales tendances identifiées pour 2024...',
        createdAt: '2024-01-15T14:45:00Z',
        aiProvider: 'openai'
      },
      aiSettings: { provider: 'openai', model: 'gpt-4' }
    },
    {
      id: 'mock-2',
      title: 'Rédaction rapport WikiPro',
      contextType: 'writing',
      createdAt: '2024-01-14T09:15:00Z',
      updatedAt: '2024-01-14T16:20:00Z',
      messageCount: 8,
      lastMessage: {
        id: 'msg-2',
        role: 'user',
        content: 'Peux-tu m\'aider à structurer la conclusion ?',
        createdAt: '2024-01-14T16:20:00Z'
      },
      aiSettings: { provider: 'claude', model: 'claude-3' }
    },
    {
      id: 'mock-3',
      title: 'Questions techniques PostgreSQL',
      contextType: 'technical',
      createdAt: '2024-01-13T15:00:00Z',
      updatedAt: '2024-01-13T17:30:00Z',
      messageCount: 15,
      lastMessage: {
        id: 'msg-3',
        role: 'assistant',
        content: 'Pour optimiser cette requête, tu peux utiliser un index composé...',
        createdAt: '2024-01-13T17:30:00Z',
        aiProvider: 'gemini'
      },
      aiSettings: { provider: 'gemini', model: 'gemini-pro' }
    }
  ];

  const getMockConversationDetails = (conversationId) => {
    const conversation = getMockConversations().find(c => c.id === conversationId);
    if (!conversation) return null;

    return {
      ...conversation,
      messages: [
        {
          id: `msg-${conversationId}-1`,
          role: 'user',
          content: 'Bonjour, j\'aimerais ton aide sur ce sujet...',
          createdAt: conversation.createdAt
        },
        {
          id: `msg-${conversationId}-2`,
          role: 'assistant',
          content: 'Bien sûr ! Je serais ravi de t\'aider. Peux-tu me donner plus de détails ?',
          createdAt: conversation.updatedAt,
          aiProvider: conversation.aiSettings.provider
        }
      ]
    };
  };

  return {
    // État
    conversations,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedContextType,
    setSelectedContextType,
    conversationStats,

    // Actions
    createNewConversation,
    deleteConversation,
    searchConversations,
    refreshConversations,
    getConversation,
    rateMessage,

    // Utils
    loadConversations
  };
};