/**
 * Hook useConversations pour gestion avancée des conversations - WikiPro
 * Gère l'historique, la recherche, l'export et la synchronisation API
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSessions, useSessionConversations } from '../../../hooks/api';
import { MESSAGE_TYPES } from './useAIChat';

// Types d'export
export const EXPORT_FORMATS = {
  MARKDOWN: 'markdown',
  JSON: 'json',
  TXT: 'txt',
  HTML: 'html'
};

// Types de tri
export const SORT_TYPES = {
  DATE_DESC: 'date_desc',
  DATE_ASC: 'date_asc',
  PROVIDER: 'provider',
  LENGTH: 'length'
};

/**
 * Hook pour la gestion des conversations
 */
export const useConversations = (options = {}) => {
  const {
    sessionId = null,
    autoLoad = true,
    pageSize = 50,
    enableSearch = true
  } = options;

  // État local
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedConversations, setSelectedConversations] = useState([]);
  const [sortBy, setSortBy] = useState(SORT_TYPES.DATE_DESC);
  const [filters, setFilters] = useState({
    providers: [],
    messageTypes: [],
    dateRange: null
  });
  const [isSearching, setIsSearching] = useState(false);

  // Hooks API
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    error: sessionsError,
    refetch: refetchSessions
  } = useSessions({
    limit: 100,
    sort: 'updated_at',
    order: 'desc'
  });

  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    error: conversationsError,
    refetch: refetchConversations
  } = useSessionConversations(sessionId, {
    enabled: !!sessionId && autoLoad
  });

  // Sessions disponibles
  const sessions = useMemo(() => {
    return sessionsData?.sessions || [];
  }, [sessionsData]);

  // Conversations de la session courante
  const conversations = useMemo(() => {
    return conversationsData?.conversations || [];
  }, [conversationsData]);

  // Conversations filtrées et triées
  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];

    // Filtrage par type de message
    if (filters.messageTypes.length > 0) {
      filtered = filtered.filter(conv => 
        filters.messageTypes.includes(conv.type)
      );
    }

    // Filtrage par provider
    if (filters.providers.length > 0) {
      filtered = filtered.filter(conv => 
        conv.metadata?.provider && filters.providers.includes(conv.metadata.provider)
      );
    }

    // Filtrage par plage de dates
    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter(conv => {
        const convDate = new Date(conv.created_at);
        return convDate >= start && convDate <= end;
      });
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case SORT_TYPES.DATE_ASC:
          return new Date(a.created_at) - new Date(b.created_at);
        case SORT_TYPES.DATE_DESC:
          return new Date(b.created_at) - new Date(a.created_at);
        case SORT_TYPES.PROVIDER:
          return (a.metadata?.provider || '').localeCompare(b.metadata?.provider || '');
        case SORT_TYPES.LENGTH:
          return (b.message?.length || 0) - (a.message?.length || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [conversations, filters, sortBy]);

  // Résultats de recherche ou conversations filtrées
  const displayedConversations = useMemo(() => {
    return searchQuery ? searchResults : filteredConversations;
  }, [searchQuery, searchResults, filteredConversations]);

  /**
   * Recherche dans les conversations
   */
  const searchConversations = useCallback(async (query) => {
    if (!query.trim() || !enableSearch) {
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);

    try {
      // Recherche locale (côté client)
      const results = conversations.filter(conv => {
        const searchText = query.toLowerCase();
        const messageText = (conv.message || '').toLowerCase();
        const providerText = (conv.metadata?.provider || '').toLowerCase();
        
        return messageText.includes(searchText) || 
               providerText.includes(searchText);
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Erreur recherche conversations:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [conversations, enableSearch]);

  /**
   * Effacement de la recherche
   */
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  /**
   * Ajout d'un filtre provider
   */
  const addProviderFilter = useCallback((provider) => {
    setFilters(prev => ({
      ...prev,
      providers: prev.providers.includes(provider) 
        ? prev.providers 
        : [...prev.providers, provider]
    }));
  }, []);

  /**
   * Suppression d'un filtre provider
   */
  const removeProviderFilter = useCallback((provider) => {
    setFilters(prev => ({
      ...prev,
      providers: prev.providers.filter(p => p !== provider)
    }));
  }, []);

  /**
   * Ajout d'un filtre type de message
   */
  const addMessageTypeFilter = useCallback((messageType) => {
    setFilters(prev => ({
      ...prev,
      messageTypes: prev.messageTypes.includes(messageType) 
        ? prev.messageTypes 
        : [...prev.messageTypes, messageType]
    }));
  }, []);

  /**
   * Suppression d'un filtre type de message
   */
  const removeMessageTypeFilter = useCallback((messageType) => {
    setFilters(prev => ({
      ...prev,
      messageTypes: prev.messageTypes.filter(t => t !== messageType)
    }));
  }, []);

  /**
   * Définition d'une plage de dates
   */
  const setDateRangeFilter = useCallback((startDate, endDate) => {
    setFilters(prev => ({
      ...prev,
      dateRange: startDate && endDate ? { start: startDate, end: endDate } : null
    }));
  }, []);

  /**
   * Effacement de tous les filtres
   */
  const clearFilters = useCallback(() => {
    setFilters({
      providers: [],
      messageTypes: [],
      dateRange: null
    });
  }, []);

  /**
   * Sélection/désélection de conversations
   */
  const toggleConversationSelection = useCallback((conversationId) => {
    setSelectedConversations(prev => 
      prev.includes(conversationId)
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  }, []);

  /**
   * Sélection de toutes les conversations affichées
   */
  const selectAllDisplayed = useCallback(() => {
    const allIds = displayedConversations.map(conv => conv.id);
    setSelectedConversations(allIds);
  }, [displayedConversations]);

  /**
   * Désélection de toutes les conversations
   */
  const clearSelection = useCallback(() => {
    setSelectedConversations([]);
  }, []);

  /**
   * Export des conversations sélectionnées
   */
  const exportConversations = useCallback((format = EXPORT_FORMATS.MARKDOWN, conversationIds = null) => {
    const toExport = conversationIds 
      ? conversations.filter(conv => conversationIds.includes(conv.id))
      : conversations.filter(conv => selectedConversations.includes(conv.id));

    if (toExport.length === 0) {
      console.warn('Aucune conversation à exporter');
      return null;
    }

    const sessionTitle = sessions.find(s => s.id === sessionId)?.title || 'Session sans titre';
    const exportDate = new Date().toISOString().split('T')[0];

    switch (format) {
      case EXPORT_FORMATS.MARKDOWN:
        return exportToMarkdown(toExport, sessionTitle, exportDate);
      
      case EXPORT_FORMATS.JSON:
        return exportToJSON(toExport, sessionTitle, exportDate);
      
      case EXPORT_FORMATS.TXT:
        return exportToText(toExport, sessionTitle, exportDate);
      
      case EXPORT_FORMATS.HTML:
        return exportToHTML(toExport, sessionTitle, exportDate);
      
      default:
        throw new Error(`Format d'export non supporté: ${format}`);
    }
  }, [conversations, selectedConversations, sessions, sessionId]);

  /**
   * Téléchargement d'un export
   */
  const downloadExport = useCallback((format, filename = null) => {
    try {
      const content = exportConversations(format);
      if (!content) return;

      const { data, mimeType, extension } = content;
      const finalFilename = filename || `conversations_${Date.now()}.${extension}`;

      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      console.info(`Export téléchargé: ${finalFilename}`);
    } catch (error) {
      console.error('Erreur téléchargement export:', error);
    }
  }, [exportConversations]);

  /**
   * Statistiques des conversations
   */
  const getConversationStats = useCallback(() => {
    const stats = {
      total: conversations.length,
      byType: {},
      byProvider: {},
      totalTokens: 0,
      averageLength: 0,
      dateRange: null
    };

    conversations.forEach(conv => {
      // Par type
      stats.byType[conv.type] = (stats.byType[conv.type] || 0) + 1;
      
      // Par provider
      const provider = conv.metadata?.provider || 'unknown';
      stats.byProvider[provider] = (stats.byProvider[provider] || 0) + 1;
      
      // Tokens
      stats.totalTokens += conv.metadata?.tokens || 0;
      
      // Longueur
      stats.averageLength += conv.message?.length || 0;
    });

    // Moyenne de longueur
    stats.averageLength = conversations.length > 0 
      ? Math.round(stats.averageLength / conversations.length)
      : 0;

    // Plage de dates
    if (conversations.length > 0) {
      const dates = conversations.map(conv => new Date(conv.created_at));
      stats.dateRange = {
        start: new Date(Math.min(...dates)),
        end: new Date(Math.max(...dates))
      };
    }

    return stats;
  }, [conversations]);

  /**
   * Providers uniques dans les conversations
   */
  const getUniqueProviders = useCallback(() => {
    const providers = new Set();
    conversations.forEach(conv => {
      const provider = conv.metadata?.provider;
      if (provider) providers.add(provider);
    });
    return Array.from(providers);
  }, [conversations]);

  /**
   * Types de messages uniques
   */
  const getUniqueMessageTypes = useCallback(() => {
    const types = new Set();
    conversations.forEach(conv => {
      if (conv.type) types.add(conv.type);
    });
    return Array.from(types);
  }, [conversations]);

  return {
    // Données
    sessions,
    conversations: displayedConversations,
    allConversations: conversations,
    selectedConversations,
    
    // État de chargement
    isLoading: isLoadingSessions || isLoadingConversations,
    isSearching,
    error: sessionsError || conversationsError,
    
    // Recherche
    searchQuery,
    searchConversations,
    clearSearch,
    
    // Filtres
    filters,
    sortBy,
    setSortBy,
    addProviderFilter,
    removeProviderFilter,
    addMessageTypeFilter,
    removeMessageTypeFilter,
    setDateRangeFilter,
    clearFilters,
    
    // Sélection
    toggleConversationSelection,
    selectAllDisplayed,
    clearSelection,
    
    // Export
    exportConversations,
    downloadExport,
    
    // Statistiques
    getConversationStats,
    getUniqueProviders,
    getUniqueMessageTypes,
    
    // Actions
    refetchSessions,
    refetchConversations,
    
    // État dérivé
    hasConversations: conversations.length > 0,
    hasSelection: selectedConversations.length > 0,
    hasFilters: filters.providers.length > 0 || filters.messageTypes.length > 0 || filters.dateRange,
    filteredCount: displayedConversations.length,
    totalCount: conversations.length
  };
};

/**
 * Fonctions d'export
 */

function exportToMarkdown(conversations, sessionTitle, exportDate) {
  let content = `# ${sessionTitle}\n\n`;
  content += `**Exporté le:** ${exportDate}\n`;
  content += `**Nombre de conversations:** ${conversations.length}\n\n`;
  content += '---\n\n';

  conversations.forEach((conv, index) => {
    const date = new Date(conv.created_at).toLocaleString('fr-FR');
    const provider = conv.metadata?.provider || 'N/A';
    const type = conv.type === MESSAGE_TYPES.USER ? '👤 **Utilisateur**' : '🤖 **Assistant**';
    
    content += `## Message ${index + 1}\n\n`;
    content += `${type} • ${provider} • ${date}\n\n`;
    content += `${conv.message}\n\n`;
    
    if (conv.metadata?.tokens) {
      content += `*Tokens: ${conv.metadata.tokens}*\n\n`;
    }
    
    content += '---\n\n';
  });

  return {
    data: content,
    mimeType: 'text/markdown',
    extension: 'md'
  };
}

function exportToJSON(conversations, sessionTitle, exportDate) {
  const data = {
    session: {
      title: sessionTitle,
      exportDate,
      conversationCount: conversations.length
    },
    conversations: conversations.map(conv => ({
      id: conv.id,
      type: conv.type,
      message: conv.message,
      provider: conv.metadata?.provider,
      tokens: conv.metadata?.tokens,
      latency: conv.metadata?.latency,
      timestamp: conv.created_at
    }))
  };

  return {
    data: JSON.stringify(data, null, 2),
    mimeType: 'application/json',
    extension: 'json'
  };
}

function exportToText(conversations, sessionTitle, exportDate) {
  let content = `${sessionTitle}\n`;
  content += `Exporté le: ${exportDate}\n`;
  content += `Nombre de conversations: ${conversations.length}\n`;
  content += '='.repeat(50) + '\n\n';

  conversations.forEach((conv, index) => {
    const date = new Date(conv.created_at).toLocaleString('fr-FR');
    const provider = conv.metadata?.provider || 'N/A';
    const type = conv.type === MESSAGE_TYPES.USER ? 'UTILISATEUR' : 'ASSISTANT';
    
    content += `Message ${index + 1} - ${type} (${provider}) - ${date}\n`;
    content += '-'.repeat(30) + '\n';
    content += `${conv.message}\n\n`;
  });

  return {
    data: content,
    mimeType: 'text/plain',
    extension: 'txt'
  };
}

function exportToHTML(conversations, sessionTitle, exportDate) {
  let content = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sessionTitle}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 2rem; }
        .header { border-bottom: 2px solid #eee; padding-bottom: 1rem; margin-bottom: 2rem; }
        .conversation { margin-bottom: 2rem; padding: 1rem; border-radius: 8px; }
        .user { background-color: #f0f9ff; border-left: 4px solid #0ea5e9; }
        .assistant { background-color: #f0fdf4; border-left: 4px solid #22c55e; }
        .meta { font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem; }
        .message { white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${sessionTitle}</h1>
        <p><strong>Exporté le:</strong> ${exportDate}</p>
        <p><strong>Nombre de conversations:</strong> ${conversations.length}</p>
    </div>
`;

  conversations.forEach((conv, index) => {
    const date = new Date(conv.created_at).toLocaleString('fr-FR');
    const provider = conv.metadata?.provider || 'N/A';
    const cssClass = conv.type === MESSAGE_TYPES.USER ? 'user' : 'assistant';
    const icon = conv.type === MESSAGE_TYPES.USER ? '👤' : '🤖';
    
    content += `    <div class="conversation ${cssClass}">
        <div class="meta">${icon} ${conv.type === MESSAGE_TYPES.USER ? 'Utilisateur' : 'Assistant'} • ${provider} • ${date}</div>
        <div class="message">${conv.message.replace(/\n/g, '<br>')}</div>
    </div>
`;
  });

  content += `</body>
</html>`;

  return {
    data: content,
    mimeType: 'text/html',
    extension: 'html'
  };
}

export default useConversations;