/**
 * Client WebSocket pour streaming IA en temps réel - WikiPro
 * Gère la connexion sécurisée, la reconnexion automatique et les événements
 */

import { getAccessToken, getStoredTenant } from '../../../services/storage/authStorage';
import { API_CONFIG } from '../../../services/api/config';

// Types d'événements WebSocket
export const WS_EVENTS = {
  // Événements sortants (client → serveur)
  CHAT_START: 'chat.start',
  CHAT_STOP: 'chat.stop',
  PING: 'ping',
  
  // Événements entrants (serveur → client)
  CHAT_CHUNK: 'chat.chunk',
  CHAT_COMPLETE: 'chat.complete',
  CHAT_ERROR: 'chat.error',
  PROVIDER_SWITCH: 'provider.switch',
  METRICS_UPDATE: 'metrics.update',
  PONG: 'pong',
  
  // Événements de connexion
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error'
};

// Configuration WebSocket
const WS_CONFIG = {
  maxReconnectAttempts: 5,
  reconnectInterval: 1000, // 1s base
  maxReconnectInterval: 30000, // 30s max
  heartbeatInterval: 30000, // 30s
  connectionTimeout: 10000, // 10s
};

/**
 * Client WebSocket pour streaming IA
 */
export class StreamingClient {
  constructor() {
    this.ws = null;
    this.url = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectTimeout = null;
    this.heartbeatInterval = null;
    this.messageQueue = [];
    this.eventListeners = new Map();
    
    // Bind methods
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.send = this.send.bind(this);
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.emit = this.emit.bind(this);
  }

  /**
   * Construit l'URL WebSocket avec authentification
   */
  buildWebSocketUrl() {
    const tenant = getStoredTenant();
    const accessToken = getAccessToken();
    
    if (!tenant?.slug || !accessToken) {
      throw new Error('Token d\'authentification ou tenant manquant');
    }

    // Conversion HTTP(S) vers WS(S)
    const baseUrl = API_CONFIG.BASE_URL.replace(/^http/, 'ws');
    const wsUrl = `${baseUrl}/api/${API_CONFIG.API_VERSION}/${tenant.slug}/ai/stream`;
    
    // Ajout du token en query param pour WebSocket
    const url = new URL(wsUrl);
    url.searchParams.set('token', accessToken);
    
    return url.toString();
  }

  /**
   * Se connecte au WebSocket
   */
  async connect() {
    if (this.isConnected || this.isConnecting) {
      console.warn('WebSocket déjà connecté ou en cours de connexion');
      return Promise.resolve();
    }

    this.isConnecting = true;
    this.emit(WS_EVENTS.RECONNECTING);

    try {
      this.url = this.buildWebSocketUrl();
      console.debug('Connexion WebSocket:', this.url);

      return new Promise((resolve, reject) => {
        const connectionTimer = setTimeout(() => {
          reject(new Error('Timeout de connexion WebSocket'));
        }, WS_CONFIG.connectionTimeout);

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          clearTimeout(connectionTimer);
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          console.info('WebSocket connecté');
          this.emit(WS_EVENTS.CONNECTED);
          this.startHeartbeat();
          this.processMessageQueue();
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimer);
          this.handleClose(event);
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimer);
          console.error('Erreur WebSocket:', error);
          this.emit(WS_EVENTS.ERROR, { error, code: 'websocket_error' });
          reject(error);
        };
      });

    } catch (error) {
      this.isConnecting = false;
      console.error('Erreur connexion WebSocket:', error);
      this.emit(WS_EVENTS.ERROR, { error, code: 'connection_failed' });
      throw error;
    }
  }

  /**
   * Déconnecte le WebSocket
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Déconnexion volontaire');
      this.ws = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.messageQueue = [];
    
    console.info('WebSocket déconnecté');
    this.emit(WS_EVENTS.DISCONNECTED);
  }

  /**
   * Envoie un message via WebSocket
   */
  send(type, data = {}) {
    const message = {
      type,
      data,
      timestamp: Date.now(),
      id: this.generateMessageId()
    };

    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        console.debug('Message envoyé:', { type, id: message.id });
        return true;
      } catch (error) {
        console.error('Erreur envoi message:', error);
        this.addToQueue(message);
        return false;
      }
    } else {
      console.warn('WebSocket non connecté, ajout à la queue:', type);
      this.addToQueue(message);
      return false;
    }
  }

  /**
   * Ajoute un message à la queue
   */
  addToQueue(message) {
    this.messageQueue.push(message);
    
    // Limite la taille de la queue
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift();
    }
  }

  /**
   * Traite la queue des messages en attente
   */
  processMessageQueue() {
    if (this.messageQueue.length === 0) return;

    console.debug(`Traitement queue: ${this.messageQueue.length} messages`);
    
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    queue.forEach(message => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error('Erreur traitement queue:', error);
          this.addToQueue(message);
        }
      }
    });
  }

  /**
   * Gère les messages reçus
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      const { type, data } = message;

      console.debug('Message reçu:', { type, dataKeys: Object.keys(data || {}) });

      // Gestion du pong pour heartbeat
      if (type === WS_EVENTS.PONG) {
        return;
      }

      // Émission de l'événement aux listeners
      this.emit(type, data);

    } catch (error) {
      console.error('Erreur parsing message WebSocket:', error);
      this.emit(WS_EVENTS.ERROR, { 
        error, 
        code: 'message_parse_error',
        rawData: event.data 
      });
    }
  }

  /**
   * Gère la fermeture de connexion
   */
  handleClose(event) {
    this.isConnected = false;
    this.isConnecting = false;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    console.warn('WebSocket fermé:', { code: event.code, reason: event.reason });

    // Reconnexion automatique si pas fermé volontairement
    if (event.code !== 1000 && this.shouldReconnect()) {
      this.scheduleReconnect();
    } else {
      this.emit(WS_EVENTS.DISCONNECTED, { code: event.code, reason: event.reason });
    }
  }

  /**
   * Détermine si une reconnexion doit être tentée
   */
  shouldReconnect() {
    return this.reconnectAttempts < WS_CONFIG.maxReconnectAttempts;
  }

  /**
   * Programme une reconnexion
   */
  scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(
      WS_CONFIG.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      WS_CONFIG.maxReconnectInterval
    );

    console.info(`Reconnexion dans ${delay}ms (tentative ${this.reconnectAttempts + 1}/${WS_CONFIG.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectAttempts++;
      
      try {
        await this.connect();
      } catch (error) {
        console.error('Échec reconnexion:', error);
        
        if (this.shouldReconnect()) {
          this.scheduleReconnect();
        } else {
          this.emit(WS_EVENTS.ERROR, { 
            error, 
            code: 'max_reconnect_attempts',
            attempts: this.reconnectAttempts 
          });
        }
      }
    }, delay);
  }

  /**
   * Démarre le heartbeat
   */
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send(WS_EVENTS.PING);
      }
    }, WS_CONFIG.heartbeatInterval);
  }

  /**
   * Génère un ID unique pour les messages
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Ajoute un listener d'événement
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Supprime un listener d'événement
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const callbacks = this.eventListeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Émet un événement
   */
  emit(event, data = null) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Erreur listener ${event}:`, error);
        }
      });
    }
  }

  /**
   * Méthodes spécifiques pour le chat IA
   */
  
  /**
   * Démarre une session de chat streaming
   */
  startChat(options = {}) {
    const {
      message,
      provider = 'auto',
      sessionId,
      model,
      temperature = 0.7,
      maxTokens = 2000,
      context = {}
    } = options;

    return this.send(WS_EVENTS.CHAT_START, {
      message,
      provider,
      sessionId,
      model,
      parameters: {
        temperature,
        max_tokens: maxTokens
      },
      context
    });
  }

  /**
   * Arrête le chat en cours
   */
  stopChat() {
    return this.send(WS_EVENTS.CHAT_STOP);
  }

  /**
   * Retourne l'état de connexion
   */
  getConnectionState() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      queueSize: this.messageQueue.length,
      url: this.url
    };
  }
}

// Instance singleton
let streamingClientInstance = null;

/**
 * Retourne l'instance singleton du client streaming
 */
export const getStreamingClient = () => {
  if (!streamingClientInstance) {
    streamingClientInstance = new StreamingClient();
  }
  return streamingClientInstance;
};

/**
 * Nettoie l'instance singleton (pour les tests)
 */
export const cleanupStreamingClient = () => {
  if (streamingClientInstance) {
    streamingClientInstance.disconnect();
    streamingClientInstance = null;
  }
};

export default StreamingClient;