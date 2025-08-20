/**
 * Hook useProviderSelection pour gestion avancée des providers IA - WikiPro
 * Gère la sélection, les métriques, le fallback et les préférences utilisateur
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getProvidersManager, AI_PROVIDERS, PROVIDER_STATUS } from '../services/aiProviders';
import { useLocalStorage } from '../../../shared/hooks';

// Clés de stockage local
const STORAGE_KEYS = {
  PREFERRED_PROVIDER: 'wikip:ia:preferred_provider',
  FALLBACK_ENABLED: 'wikip:ia:fallback_enabled',
  PROVIDER_PREFERENCES: 'wikip:ia:provider_preferences'
};

/**
 * Hook pour la gestion des providers IA
 */
export const useProviderSelection = (options = {}) => {
  const {
    autoRefreshMetrics = true,
    refreshInterval = 30000, // 30s
    enableNotifications = true
  } = options;

  // État local
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [fallbackEnabled, setFallbackEnabled] = useLocalStorage(STORAGE_KEYS.FALLBACK_ENABLED, true);
  const [providerPreferences, setProviderPreferences] = useLocalStorage(STORAGE_KEYS.PROVIDER_PREFERENCES, {});
  const [providersData, setProvidersData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Refs
  const providersManagerRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const notificationTimeoutRef = useRef(new Map());

  // Initialisation
  useEffect(() => {
    providersManagerRef.current = getProvidersManager();
    
    // Chargement initial
    loadInitialData();
    
    // Auto-refresh des métriques
    if (autoRefreshMetrics) {
      startMetricsRefresh();
    }

    return () => {
      stopMetricsRefresh();
      clearAllNotificationTimeouts();
    };
  }, [autoRefreshMetrics, refreshInterval]);

  /**
   * Chargement initial des données
   */
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Récupération des préférences stockées
      const storedPreferred = localStorage.getItem(STORAGE_KEYS.PREFERRED_PROVIDER);
      
      // Mise à jour des métriques
      await refreshMetrics();
      
      // Sélection du provider par défaut
      const defaultProvider = storedPreferred || getDefaultProvider();
      if (defaultProvider && isProviderAvailable(defaultProvider)) {
        setSelectedProvider(defaultProvider);
      } else {
        // Fallback sur le premier disponible
        const firstAvailable = getFirstAvailableProvider();
        setSelectedProvider(firstAvailable);
      }
      
    } catch (error) {
      console.error('Erreur chargement initial providers:', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors du chargement des providers',
        details: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Démarrage du refresh automatique des métriques
   */
  const startMetricsRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      refreshMetrics();
    }, refreshInterval);
  }, [refreshInterval]);

  /**
   * Arrêt du refresh automatique
   */
  const stopMetricsRefresh = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  }, []);

  /**
   * Refresh des métriques providers
   */
  const refreshMetrics = useCallback(async () => {
    const manager = providersManagerRef.current;
    if (!manager) return;

    try {
      // Récupération des métriques à jour
      const allMetrics = manager.getAllMetrics();
      
      // Mise à jour de l'état
      setProvidersData(allMetrics);
      setLastUpdate(Date.now());
      
      // Vérification des changements de statut pour notifications
      if (enableNotifications) {
        checkForStatusChanges(allMetrics);
      }
      
    } catch (error) {
      console.error('Erreur refresh métriques:', error);
    }
  }, [enableNotifications]);

  /**
   * Vérification des changements de statut
   */
  const checkForStatusChanges = useCallback((newMetrics) => {
    Object.entries(newMetrics).forEach(([providerId, data]) => {
      const { state } = data;
      
      // Notification si provider devient indisponible
      if (!state.isAvailable && selectedProvider === providerId) {
        addNotification({
          type: 'warning',
          message: `Provider ${data.displayName} indisponible`,
          details: 'Basculement automatique si fallback activé',
          providerId
        });
        
        // Auto-switch si fallback activé
        if (fallbackEnabled) {
          const nextProvider = getNextAvailableProvider();
          if (nextProvider && nextProvider !== providerId) {
            switchToProvider(nextProvider, 'automatic_fallback');
          }
        }
      }
      
      // Notification quota faible
      const quotaUsage = manager.calculateQuotaUsage(providerId);
      if (quotaUsage > 80 && quotaUsage <= 90) {
        addNotification({
          type: 'warning',
          message: `Quota ${data.displayName} bientôt épuisé`,
          details: `${Math.round(quotaUsage)}% utilisé`,
          providerId,
          autoHide: true
        });
      } else if (quotaUsage > 90) {
        addNotification({
          type: 'error',
          message: `Quota ${data.displayName} critique`,
          details: `${Math.round(quotaUsage)}% utilisé`,
          providerId
        });
      }
    });
  }, [selectedProvider, fallbackEnabled]);

  /**
   * Sélection d'un provider
   */
  const selectProvider = useCallback((providerId) => {
    if (!providerId || !AI_PROVIDERS[providerId]) {
      console.warn('Provider invalide:', providerId);
      return false;
    }

    // Vérification de disponibilité
    if (!isProviderAvailable(providerId)) {
      addNotification({
        type: 'error',
        message: `Provider ${AI_PROVIDERS[providerId].displayName} indisponible`,
        details: 'Sélectionnez un autre provider'
      });
      return false;
    }

    switchToProvider(providerId, 'manual_selection');
    return true;
  }, []);

  /**
   * Basculement vers un provider
   */
  const switchToProvider = useCallback((providerId, reason = 'manual') => {
    const previousProvider = selectedProvider;
    setSelectedProvider(providerId);
    
    // Sauvegarde de la préférence
    localStorage.setItem(STORAGE_KEYS.PREFERRED_PROVIDER, providerId);
    
    // Mise à jour des préférences
    const newPreferences = {
      ...providerPreferences,
      [providerId]: {
        ...providerPreferences[providerId],
        lastSelected: Date.now(),
        selectionCount: (providerPreferences[providerId]?.selectionCount || 0) + 1
      }
    };
    setProviderPreferences(newPreferences);

    // Notification si changement automatique
    if (reason === 'automatic_fallback' && enableNotifications) {
      addNotification({
        type: 'info',
        message: `Basculement vers ${AI_PROVIDERS[providerId].displayName}`,
        details: `Depuis ${AI_PROVIDERS[previousProvider]?.displayName || 'provider précédent'}`,
        autoHide: true
      });
    }

    console.info(`Provider changé: ${previousProvider} → ${providerId} (${reason})`);
  }, [selectedProvider, providerPreferences, setProviderPreferences, enableNotifications]);

  /**
   * Toggle du fallback automatique
   */
  const toggleFallback = useCallback(() => {
    const newValue = !fallbackEnabled;
    setFallbackEnabled(newValue);
    
    addNotification({
      type: 'info',
      message: `Fallback automatique ${newValue ? 'activé' : 'désactivé'}`,
      autoHide: true
    });
  }, [fallbackEnabled, setFallbackEnabled]);

  /**
   * Obtient le provider par défaut
   */
  const getDefaultProvider = useCallback(() => {
    const manager = providersManagerRef.current;
    return manager?.getOrderedProviders()?.[0]?.id || 'openai';
  }, []);

  /**
   * Obtient le premier provider disponible
   */
  const getFirstAvailableProvider = useCallback(() => {
    const manager = providersManagerRef.current;
    return manager?.getNextAvailableProvider();
  }, []);

  /**
   * Obtient le prochain provider disponible
   */
  const getNextAvailableProvider = useCallback((currentProvider = selectedProvider) => {
    const manager = providersManagerRef.current;
    return manager?.getNextAvailableProvider(currentProvider);
  }, [selectedProvider]);

  /**
   * Vérifie si un provider est disponible
   */
  const isProviderAvailable = useCallback((providerId) => {
    const manager = providersManagerRef.current;
    return manager?.isProviderAvailable(providerId) || false;
  }, []);

  /**
   * Obtient les providers ordonnés par préférence
   */
  const getOrderedProviders = useCallback(() => {
    const manager = providersManagerRef.current;
    return manager?.getOrderedProviders() || [];
  }, []);

  /**
   * Ajout d'une notification
   */
  const addNotification = useCallback((notification) => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = {
      id,
      timestamp: Date.now(),
      autoHide: false,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-hide si spécifié
    if (newNotification.autoHide) {
      const timeout = setTimeout(() => {
        removeNotification(id);
      }, 5000);
      
      notificationTimeoutRef.current.set(id, timeout);
    }

    return id;
  }, []);

  /**
   * Suppression d'une notification
   */
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    // Nettoyage du timeout
    const timeout = notificationTimeoutRef.current.get(notificationId);
    if (timeout) {
      clearTimeout(timeout);
      notificationTimeoutRef.current.delete(notificationId);
    }
  }, []);

  /**
   * Nettoyage de tous les timeouts de notifications
   */
  const clearAllNotificationTimeouts = useCallback(() => {
    notificationTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    notificationTimeoutRef.current.clear();
  }, []);

  /**
   * Effacement de toutes les notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    clearAllNotificationTimeouts();
  }, [clearAllNotificationTimeouts]);

  /**
   * Test de connectivité d'un provider
   */
  const testProvider = useCallback(async (providerId) => {
    // Cette fonctionnalité nécessiterait un endpoint dédié sur le backend
    // Pour l'instant on simule avec un check de statut
    const providerData = providersData[providerId];
    return providerData?.state?.isAvailable || false;
  }, [providersData]);

  /**
   * Statistiques globales
   */
  const getGlobalStats = useCallback(() => {
    const providers = Object.values(providersData);
    
    return {
      totalProviders: providers.length,
      availableProviders: providers.filter(p => p.state?.isAvailable).length,
      totalRequests: providers.reduce((sum, p) => sum + (p.metrics?.requestsToday || 0), 0),
      averageLatency: Math.round(
        providers.reduce((sum, p) => sum + (p.metrics?.averageLatency || 0), 0) / providers.length
      ),
      overallSuccessRate: Math.round(
        providers.reduce((sum, p) => sum + (p.metrics?.successRate || 0), 0) / providers.length
      )
    };
  }, [providersData]);

  return {
    // État
    selectedProvider,
    fallbackEnabled,
    providersData,
    isLoading,
    lastUpdate,
    notifications,
    
    // Actions
    selectProvider,
    toggleFallback,
    refreshMetrics,
    testProvider,
    
    // Helpers
    getOrderedProviders,
    getNextAvailableProvider,
    isProviderAvailable,
    getGlobalStats,
    
    // Notifications
    addNotification,
    removeNotification,
    clearNotifications,
    
    // État dérivé
    currentProviderData: providersData[selectedProvider],
    availableProviders: Object.values(providersData).filter(p => p.state?.isAvailable),
    hasAvailableProviders: Object.values(providersData).some(p => p.state?.isAvailable),
    isCurrentProviderAvailable: isProviderAvailable(selectedProvider)
  };
};

export default useProviderSelection;