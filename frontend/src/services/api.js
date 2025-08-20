/**
 * Service API pour WikiPro
 * Gère les communications avec le backend NestJS
 */

const API_BASE_URL = 'http://localhost:3001';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('wikipro_token');
  }

  // Méthodes utilitaires
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('wikipro_token', token);
    } else {
      localStorage.removeItem('wikipro_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Méthodes Health Check
  async checkHealth() {
    return this.request('/');
  }

  async checkAuthHealth() {
    return this.request('/auth/health');
  }

  // Méthodes d'authentification
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.accessToken) {
      this.setToken(response.accessToken);
    }
    
    return response;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async refreshTokens(refreshToken) {
    const response = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    if (response.accessToken) {
      this.setToken(response.accessToken);
    }
    
    return response;
  }

  async logout() {
    this.setToken(null);
  }

  // === API IA PROVIDERS ===
  
  // Récupérer les providers IA disponibles
  async getAvailableProviders() {
    try {
      const response = await this.request('/ai/providers');
      return response.providers || [];
    } catch (error) {
      console.error('Erreur récupération providers:', error);
      throw error;
    }
  }

  // Tester un provider spécifique
  async testProvider(providerId, options = {}) {
    try {
      const response = await this.request('/ai/test-provider', {
        method: 'POST',
        body: JSON.stringify({
          provider: providerId,
          prompt: options.prompt || 'Test de connexion',
          ...options
        })
      });
      return response;
    } catch (error) {
      console.error(`Erreur test provider ${providerId}:`, error);
      throw error;
    }
  }

  // Génération de texte (non-streaming)
  async generateText(prompt, options = {}) {
    try {
      const response = await this.request('/ai/generate-text', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          provider: options.provider || 'gemini',
          tenantId: options.tenantId || 'default',
          maxTokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7,
          systemPrompt: options.systemPrompt
        })
      });
      return response;
    } catch (error) {
      console.error('Erreur génération texte:', error);
      throw error;
    }
  }

  // Chat completion (non-streaming)
  async chatCompletion(messages, options = {}) {
    try {
      const response = await this.request('/ai/chat-completion', {
        method: 'POST',
        body: JSON.stringify({
          messages,
          provider: options.provider || 'gemini',
          tenantId: options.tenantId || 'default',
          maxTokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7
        })
      });
      return response;
    } catch (error) {
      console.error('Erreur chat completion:', error);
      throw error;
    }
  }

  // Health check IA
  async getAIHealth() {
    try {
      const response = await this.request('/ai/health');
      return response;
    } catch (error) {
      console.error('Erreur health check IA:', error);
      throw error;
    }
  }

  // Méthodes pour les données utilisateur (simulation pour le Sprint 1)
  async getUserDashboardData() {
    // Pour le Sprint 1, on retourne des données simulées
    // mais avec un appel réel au backend pour vérifier la connectivité
    const healthCheck = await this.checkHealth();
    
    return {
      backendStatus: healthCheck,
      kpis: {
        totalEtudes: 156,
        motsCles: 892,
        poles: 8,
        typologies: 12
      },
      message: `Données récupérées avec succès - Backend OK (${healthCheck.status})`
    };
  }
}

// Instance singleton
const apiService = new ApiService();

export default apiService;