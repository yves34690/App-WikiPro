// Utilitaires pour la gestion des conversations

/**
 * Formater la date pour l'affichage dans la sidebar
 */
export const formatConversationDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 1) {
    return 'À l\'instant';
  } else if (diffMinutes < 60) {
    return `Il y a ${diffMinutes}min`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours}h`;
  } else if (diffDays === 1) {
    return 'Hier';
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jours`;
  } else {
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit',
      year: diffDays > 365 ? '2-digit' : undefined
    });
  }
};

/**
 * Obtenir l'icône appropriée pour un type de contexte
 */
export const getContextIcon = (contextType) => {
  const icons = {
    general: 'fas fa-comment',
    analysis: 'fas fa-chart-line',
    research: 'fas fa-search',
    writing: 'fas fa-pen',
    technical: 'fas fa-code',
    creative: 'fas fa-palette',
    support: 'fas fa-life-ring',
    planning: 'fas fa-calendar-alt',
    review: 'fas fa-clipboard-check'
  };
  return icons[contextType] || icons.general;
};

/**
 * Obtenir la couleur appropriée pour un type de contexte
 */
export const getContextColor = (contextType) => {
  const colors = {
    general: 'var(--color-primary)',
    analysis: 'var(--color-teal-500)',
    research: 'var(--color-blue-500)',
    writing: 'var(--color-purple-500)',
    technical: 'var(--color-green-500)',
    creative: 'var(--color-pink-500)',
    support: 'var(--color-orange-500)',
    planning: 'var(--color-indigo-500)',
    review: 'var(--color-red-500)'
  };
  return colors[contextType] || colors.general;
};

/**
 * Tronquer le texte pour l'affichage dans la sidebar
 */
export const truncateText = (text, maxLength = 60) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

/**
 * Générer un titre automatique basé sur le premier message
 */
export const generateConversationTitle = (firstMessage, maxLength = 50) => {
  if (!firstMessage) return 'Nouvelle conversation';
  
  // Nettoyer le message
  let title = firstMessage
    .replace(/[^\w\sàáâäèéêëìíîïòóôöùúûüÿç]/gi, '') // Garder lettres, espaces et accents
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim();
  
  // Tronquer et capitaliser
  title = title.substring(0, maxLength);
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
  }
  
  return title || 'Nouvelle conversation';
};

/**
 * Valider les données de conversation
 */
export const validateConversationData = (data) => {
  const errors = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Le titre est requis');
  }
  
  if (data.title && data.title.length > 100) {
    errors.push('Le titre ne peut pas dépasser 100 caractères');
  }
  
  if (data.contextType && !['general', 'analysis', 'research', 'writing', 'technical', 'creative', 'support', 'planning', 'review'].includes(data.contextType)) {
    errors.push('Type de contexte invalide');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Exporter les conversations au format JSON
 */
export const exportConversationsToJson = (conversations, userInfo = {}) => {
  const exportData = {
    exportedAt: new Date().toISOString(),
    format: 'WikiPro Conversations Export v1.0',
    userInfo,
    totalConversations: conversations.length,
    conversations: conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      contextType: conv.contextType,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messageCount: conv.messageCount,
      aiSettings: conv.aiSettings,
      messages: conv.messages || []
    }))
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `wikipro-conversations-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

/**
 * Types de contexte disponibles avec métadonnées
 */
export const CONTEXT_TYPES = [
  { 
    value: 'general', 
    label: 'Général', 
    description: 'Discussion générale et questions diverses',
    icon: 'fas fa-comment',
    color: 'var(--color-primary)'
  },
  { 
    value: 'analysis', 
    label: 'Analyse', 
    description: 'Analyse de données et études approfondies',
    icon: 'fas fa-chart-line',
    color: 'var(--color-teal-500)'
  },
  { 
    value: 'research', 
    label: 'Recherche', 
    description: 'Recherche documentaire et veille',
    icon: 'fas fa-search',
    color: 'var(--color-blue-500)'
  },
  { 
    value: 'writing', 
    label: 'Rédaction', 
    description: 'Aide à la rédaction et correction',
    icon: 'fas fa-pen',
    color: 'var(--color-purple-500)'
  },
  { 
    value: 'technical', 
    label: 'Technique', 
    description: 'Questions techniques et développement',
    icon: 'fas fa-code',
    color: 'var(--color-green-500)'
  },
  { 
    value: 'creative', 
    label: 'Créatif', 
    description: 'Brainstorming et idéation',
    icon: 'fas fa-palette',
    color: 'var(--color-pink-500)'
  },
  { 
    value: 'support', 
    label: 'Support', 
    description: 'Aide et support technique',
    icon: 'fas fa-life-ring',
    color: 'var(--color-orange-500)'
  },
  { 
    value: 'planning', 
    label: 'Planification', 
    description: 'Organisation et planification de projets',
    icon: 'fas fa-calendar-alt',
    color: 'var(--color-indigo-500)'
  },
  { 
    value: 'review', 
    label: 'Révision', 
    description: 'Révision et amélioration de contenu',
    icon: 'fas fa-clipboard-check',
    color: 'var(--color-red-500)'
  }
];

/**
 * Configuration par défaut pour les nouvelles conversations
 */
export const DEFAULT_CONVERSATION_CONFIG = {
  contextType: 'general',
  aiSettings: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 2000
  }
};

/**
 * Raccourcis clavier pour l'interface de conversation
 */
export const KEYBOARD_SHORTCUTS = [
  { key: 'Ctrl+H', description: 'Ouvrir/fermer l\'historique' },
  { key: 'Ctrl+N', description: 'Nouvelle conversation' },
  { key: 'Ctrl+Shift+N', description: 'Nouvelle conversation avec sidebar' },
  { key: 'Escape', description: 'Fermer la sidebar' },
  { key: 'Ctrl+Enter', description: 'Envoyer le message' },
  { key: 'Ctrl+K', description: 'Focus sur la recherche' }
];