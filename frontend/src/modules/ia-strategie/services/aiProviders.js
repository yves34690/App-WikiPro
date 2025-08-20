/**
 * Configuration et gestion des providers IA - WikiPro
 * Gère OpenAI, Anthropic, Gemini avec leurs métadonnées et capacités
 */

// Configuration des providers IA
export const AI_PROVIDERS = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    displayName: 'GPT-4',
    icon: '🤖',
    color: '#10A37F',
    description: 'Modèle GPT-4 d\'OpenAI, excellent pour la génération de texte et l\'analyse',
    models: [
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Modèle le plus avancé d\'OpenAI',
        maxTokens: 8192,
        costPer1K: 0.03,
        speed: 'moyen'
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Version optimisée pour la vitesse',
        maxTokens: 128000,
        costPer1K: 0.01,
        speed: 'rapide'
      }
    ],
    capabilities: {
      streaming: true,
      reasoning: 'excellent',
      creativity: 'très bon',
      factual: 'bon',
      coding: 'excellent',
      analysis: 'très bon'
    },
    quotaInfo: {
      type: 'tokens',
      limit: 1000000,
      period: 'month',
      resetDay: 1
    }
  },

  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    displayName: 'Claude 3.5',
    icon: '🧠',
    color: '#FF6B35',
    description: 'Claude 3.5 Sonnet, spécialisé dans l\'analyse et le raisonnement',
    models: [
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: 'Excellent pour l\'analyse et le raisonnement',
        maxTokens: 200000,
        costPer1K: 0.015,
        speed: 'moyen'
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        description: 'Rapide et efficace pour les tâches simples',
        maxTokens: 200000,
        costPer1K: 0.0025,
        speed: 'très rapide'
      }
    ],
    capabilities: {
      streaming: true,
      reasoning: 'excellent',
      creativity: 'bon',
      factual: 'excellent',
      coding: 'très bon',
      analysis: 'excellent'
    },
    quotaInfo: {
      type: 'tokens',
      limit: 500000,
      period: 'month',
      resetDay: 1
    }
  },

  gemini: {
    id: 'gemini',
    name: 'Google',
    displayName: 'Gemini Pro',
    icon: '💎',
    color: '#4285F4',
    description: 'Gemini Pro de Google, polyvalent avec support multimodal',
    models: [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        description: 'Modèle polyvalent de Google',
        maxTokens: 32768,
        costPer1K: 0.0005,
        speed: 'rapide'
      },
      {
        id: 'gemini-pro-vision',
        name: 'Gemini Pro Vision',
        description: 'Avec support d\'images',
        maxTokens: 16384,
        costPer1K: 0.002,
        speed: 'moyen'
      }
    ],
    capabilities: {
      streaming: true,
      reasoning: 'bon',
      creativity: 'très bon',
      factual: 'très bon',
      coding: 'bon',
      analysis: 'bon',
      multimodal: true
    },
    quotaInfo: {
      type: 'requests',
      limit: 10000,
      period: 'day',
      resetHour: 0
    }
  }
};

// Configuration fallback par défaut
export const FALLBACK_CONFIG = {
  enabled: true,
  order: ['openai', 'anthropic', 'gemini'],
  retryAttempts: 2,
  retryDelay: 1000, // ms
  errorThreshold: 3, // erreurs consécutives avant fallback
  cooldownPeriod: 300000, // 5min avant retry d'un provider en erreur
};

// Statuts des providers
export const PROVIDER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  ERROR: 'error',
  RATE_LIMITED: 'rate_limited',
  QUOTA_EXCEEDED: 'quota_exceeded',
  MAINTENANCE: 'maintenance'
};

/**
 * Classe pour gérer l'état et les métriques des providers
 */
export class ProvidersManager {
  constructor() {
    this.providerStates = new Map();
    this.metrics = new Map();
    this.errorCounts = new Map();
    this.cooldowns = new Map();
    
    // Initialisation des états
    Object.keys(AI_PROVIDERS).forEach(providerId => {
      this.providerStates.set(providerId, {
        status: PROVIDER_STATUS.ONLINE,
        lastChecked: Date.now(),
        responseTime: null,
        availability: 100
      });
      
      this.metrics.set(providerId, {
        requestsToday: 0,
        tokensUsed: 0,
        averageLatency: 0,
        successRate: 100,
        lastRequest: null,
        quotaUsage: 0
      });
      
      this.errorCounts.set(providerId, 0);
    });
  }

  /**
   * Met à jour le statut d'un provider
   */
  updateProviderStatus(providerId, status, metadata = {}) {
    if (!this.providerStates.has(providerId)) return;

    const currentState = this.providerStates.get(providerId);
    this.providerStates.set(providerId, {
      ...currentState,
      status,
      lastChecked: Date.now(),
      ...metadata
    });

    // Reset du compteur d'erreurs si online
    if (status === PROVIDER_STATUS.ONLINE) {
      this.errorCounts.set(providerId, 0);
      this.cooldowns.delete(providerId);
    }
  }

  /**
   * Enregistre une erreur pour un provider
   */
  recordError(providerId, error) {
    const currentCount = this.errorCounts.get(providerId) || 0;
    const newCount = currentCount + 1;
    this.errorCounts.set(providerId, newCount);

    // Changement de statut si seuil atteint
    if (newCount >= FALLBACK_CONFIG.errorThreshold) {
      this.updateProviderStatus(providerId, PROVIDER_STATUS.ERROR);
      
      // Cooldown
      this.cooldowns.set(providerId, Date.now() + FALLBACK_CONFIG.cooldownPeriod);
    }

    // Mise à jour des métriques
    const metrics = this.metrics.get(providerId);
    if (metrics) {
      const totalRequests = metrics.requestsToday + 1;
      const failures = newCount;
      const successRate = Math.max(0, ((totalRequests - failures) / totalRequests) * 100);
      
      this.metrics.set(providerId, {
        ...metrics,
        successRate,
        requestsToday: totalRequests
      });
    }
  }

  /**
   * Enregistre une requête réussie
   */
  recordSuccess(providerId, latency, tokensUsed = 0) {
    // Reset du compteur d'erreurs
    this.errorCounts.set(providerId, 0);
    
    // Mise à jour du statut
    this.updateProviderStatus(providerId, PROVIDER_STATUS.ONLINE, {
      responseTime: latency
    });

    // Mise à jour des métriques
    const metrics = this.metrics.get(providerId);
    if (metrics) {
      const newRequestCount = metrics.requestsToday + 1;
      const newTokensUsed = metrics.tokensUsed + tokensUsed;
      const newAvgLatency = (metrics.averageLatency + latency) / 2;

      this.metrics.set(providerId, {
        ...metrics,
        requestsToday: newRequestCount,
        tokensUsed: newTokensUsed,
        averageLatency: Math.round(newAvgLatency),
        lastRequest: Date.now(),
        successRate: Math.min(100, metrics.successRate + 1)
      });
    }
  }

  /**
   * Retourne le prochain provider disponible selon l'ordre de fallback
   */
  getNextAvailableProvider(preferredProvider = null) {
    // Si un provider préféré est spécifié et disponible
    if (preferredProvider && this.isProviderAvailable(preferredProvider)) {
      return preferredProvider;
    }

    // Sinon, parcourir l'ordre de fallback
    for (const providerId of FALLBACK_CONFIG.order) {
      if (this.isProviderAvailable(providerId)) {
        return providerId;
      }
    }

    // Aucun provider disponible
    return null;
  }

  /**
   * Vérifie si un provider est disponible
   */
  isProviderAvailable(providerId) {
    const state = this.providerStates.get(providerId);
    if (!state) return false;

    // Vérifier le cooldown
    const cooldownEnd = this.cooldowns.get(providerId);
    if (cooldownEnd && Date.now() < cooldownEnd) {
      return false;
    }

    // Vérifier le statut
    return [
      PROVIDER_STATUS.ONLINE,
      PROVIDER_STATUS.RATE_LIMITED // peut être retryé
    ].includes(state.status);
  }

  /**
   * Retourne les métriques de tous les providers
   */
  getAllMetrics() {
    const result = {};
    
    for (const [providerId, provider] of Object.entries(AI_PROVIDERS)) {
      const state = this.providerStates.get(providerId);
      const metrics = this.metrics.get(providerId);
      const errorCount = this.errorCounts.get(providerId);
      const cooldownEnd = this.cooldowns.get(providerId);

      result[providerId] = {
        ...provider,
        state: {
          ...state,
          isAvailable: this.isProviderAvailable(providerId),
          errorCount,
          cooldownEnd,
          inCooldown: cooldownEnd && Date.now() < cooldownEnd
        },
        metrics
      };
    }

    return result;
  }

  /**
   * Retourne les providers ordonnés par préférence
   */
  getOrderedProviders() {
    return FALLBACK_CONFIG.order
      .map(providerId => ({
        id: providerId,
        ...AI_PROVIDERS[providerId],
        isAvailable: this.isProviderAvailable(providerId),
        metrics: this.metrics.get(providerId),
        state: this.providerStates.get(providerId)
      }))
      .sort((a, b) => {
        // Disponibles en premier
        if (a.isAvailable && !b.isAvailable) return -1;
        if (!a.isAvailable && b.isAvailable) return 1;
        
        // Puis par taux de succès
        const aSuccessRate = a.metrics?.successRate || 0;
        const bSuccessRate = b.metrics?.successRate || 0;
        return bSuccessRate - aSuccessRate;
      });
  }

  /**
   * Calcule l'utilisation des quotas pour un provider
   */
  calculateQuotaUsage(providerId) {
    const provider = AI_PROVIDERS[providerId];
    const metrics = this.metrics.get(providerId);
    
    if (!provider || !metrics) return 0;

    const { quotaInfo } = provider;
    
    if (quotaInfo.type === 'tokens') {
      return Math.min(100, (metrics.tokensUsed / quotaInfo.limit) * 100);
    } else if (quotaInfo.type === 'requests') {
      return Math.min(100, (metrics.requestsToday / quotaInfo.limit) * 100);
    }
    
    return 0;
  }

  /**
   * Reset quotas (appelé périodiquement)
   */
  resetQuotas() {
    const now = new Date();
    
    Object.keys(AI_PROVIDERS).forEach(providerId => {
      const provider = AI_PROVIDERS[providerId];
      const metrics = this.metrics.get(providerId);
      
      if (!metrics) return;

      let shouldReset = false;
      
      if (provider.quotaInfo.period === 'day') {
        shouldReset = now.getHours() === provider.quotaInfo.resetHour;
      } else if (provider.quotaInfo.period === 'month') {
        shouldReset = now.getDate() === provider.quotaInfo.resetDay;
      }

      if (shouldReset) {
        this.metrics.set(providerId, {
          ...metrics,
          requestsToday: 0,
          tokensUsed: 0,
          quotaUsage: 0
        });
      }
    });
  }
}

// Instance singleton
let providersManagerInstance = null;

/**
 * Retourne l'instance singleton du gestionnaire de providers
 */
export const getProvidersManager = () => {
  if (!providersManagerInstance) {
    providersManagerInstance = new ProvidersManager();
  }
  return providersManagerInstance;
};

/**
 * Utilitaires pour l'interface
 */
export const getProviderColor = (providerId) => {
  return AI_PROVIDERS[providerId]?.color || '#666';
};

export const getProviderIcon = (providerId) => {
  return AI_PROVIDERS[providerId]?.icon || '🤖';
};

export const getProviderDisplayName = (providerId) => {
  return AI_PROVIDERS[providerId]?.displayName || providerId;
};

export const formatLatency = (latency) => {
  if (!latency) return 'N/A';
  return latency < 1000 ? `${latency}ms` : `${(latency / 1000).toFixed(1)}s`;
};

export const formatQuotaUsage = (usage) => {
  return `${Math.round(usage)}%`;
};

export default {
  AI_PROVIDERS,
  FALLBACK_CONFIG,
  PROVIDER_STATUS,
  ProvidersManager,
  getProvidersManager,
  getProviderColor,
  getProviderIcon,
  getProviderDisplayName,
  formatLatency,
  formatQuotaUsage
};