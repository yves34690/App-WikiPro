/**
 * Configuration API pour WikiPro
 * Centralise toutes les constantes et configurations API
 */

// Configuration de base de l'API
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  API_VERSION: 'v1',
  TIMEOUT: 10000, // 10 secondes
};

// Configuration React Query
export const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  retry: 3,
  refetchOnWindowFocus: false,
  refetchOnMount: true,
  refetchOnReconnect: true,
};

// Configuration de retry pour les requêtes
export const RETRY_CONFIG = {
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  retryCondition: (error) => {
    // Ne pas retry sur les erreurs d'authentification
    if (error.response?.status === 401 || error.response?.status === 403) {
      return false;
    }
    // Retry sur les erreurs serveur et réseau
    return error.response?.status >= 500 || !error.response;
  },
};

// Routes API
export const API_ENDPOINTS = {
  // Authentification
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
  },
  // Tenants
  tenants: {
    current: '/:tenant',
    dashboard: '/:tenant/dashboard',
    data: '/:tenant/data',
  },
  // Sessions IA
  sessions: {
    list: '/:tenant/sessions',
    create: '/:tenant/sessions',
    detail: '/:tenant/sessions/:sessionId',
    conversations: '/:tenant/sessions/:sessionId/conversations',
  },
  // IA
  ai: {
    chat: '/:tenant/ai/chat',
    stream: '/:tenant/ai/stream',
  },
};

// Données de test (à utiliser pendant le développement)
export const TEST_DATA = {
  tenant: 'demo-company',
  credentials: {
    email: 'admin@demo-company.com',
    password: 'AdminDemo123!',
  },
};

// Configuration des headers par défaut
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Query keys pour React Query
export const QUERY_KEYS = {
  // Authentification
  auth: ['auth'],
  profile: ['auth', 'profile'],
  
  // Tenants
  tenant: (slug) => ['tenant', slug],
  tenantDashboard: (slug) => ['tenant', slug, 'dashboard'],
  tenantData: (slug) => ['tenant', slug, 'data'],
  
  // Sessions
  sessions: (tenant) => ['sessions', tenant],
  session: (tenant, sessionId) => ['session', tenant, sessionId],
  conversations: (tenant, sessionId) => ['conversations', tenant, sessionId],
  
  // Data modules
  dashboard: (tenant) => ['dashboard', tenant],
  references: (tenant) => ['references', tenant],
  tendances: (tenant) => ['tendances', tenant],
  poles: (tenant) => ['poles', tenant],
  competences: (tenant) => ['competences', tenant],
  cvtheque: (tenant) => ['cvtheque', tenant],
  methods: (tenant) => ['methods', tenant],
  tools: (tenant) => ['tools', tenant],
  keywords: (tenant) => ['keywords', tenant],
  illustrations: (tenant) => ['illustrations', tenant],
  dataModule: (tenant) => ['data-module', tenant],
};