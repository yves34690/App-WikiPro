import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@core/config/config.service';
import Redis from 'ioredis';

export interface RedisConnection {
  client: Redis;
  isConnected: boolean;
  connectionTime?: Date;
}

/**
 * Service de gestion Redis pour WikiPro
 * Gère les connexions, cache et sessions WebSocket
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(RedisService.name);
  private connections = new Map<string, RedisConnection>();

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeConnections();
  }

  async onModuleDestroy() {
    await this.closeAllConnections();
  }

  /**
   * Initialiser les connexions Redis
   */
  private async initializeConnections(): Promise<void> {
    try {
      // Connexion principale pour cache et sessions
      const mainClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: 0, // Base 0 pour cache principal
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keyPrefix: 'wikipro:main:',
      });

      // Connexion pour Socket.io adapter
      const socketClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: 1, // Base 1 pour Socket.io
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keyPrefix: 'wikipro:sockets:',
      });

      // Connexion pour pub/sub temps réel
      const pubsubClient = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: 2, // Base 2 pour pub/sub
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keyPrefix: 'wikipro:pubsub:',
      });

      // Configurer les handlers d'événements
      this.setupEventHandlers(mainClient, 'main');
      this.setupEventHandlers(socketClient, 'socket');
      this.setupEventHandlers(pubsubClient, 'pubsub');

      // Connecter les clients
      await Promise.all([
        mainClient.connect(),
        socketClient.connect(),
        pubsubClient.connect(),
      ]);

      // Enregistrer les connexions
      this.connections.set('main', {
        client: mainClient,
        isConnected: true,
        connectionTime: new Date(),
      });

      this.connections.set('socket', {
        client: socketClient,
        isConnected: true,
        connectionTime: new Date(),
      });

      this.connections.set('pubsub', {
        client: pubsubClient,
        isConnected: true,
        connectionTime: new Date(),
      });

      this.logger.log('✅ Toutes les connexions Redis initialisées avec succès');

    } catch (error) {
      this.logger.error(`❌ Erreur initialisation Redis: ${error.message}`);
      throw error;
    }
  }

  /**
   * Configurer les handlers d'événements Redis
   */
  private setupEventHandlers(client: Redis, connectionName: string): void {
    client.on('connect', () => {
      this.logger.log(`🔗 Redis ${connectionName} connecté`);
    });

    client.on('ready', () => {
      this.logger.log(`✅ Redis ${connectionName} prêt`);
    });

    client.on('error', (error) => {
      this.logger.error(`❌ Erreur Redis ${connectionName}: ${error.message}`);
    });

    client.on('close', () => {
      this.logger.warn(`🔌 Redis ${connectionName} déconnecté`);
      const connection = this.connections.get(connectionName);
      if (connection) {
        connection.isConnected = false;
      }
    });

    client.on('reconnecting', () => {
      this.logger.log(`🔄 Redis ${connectionName} reconnexion...`);
    });
  }

  /**
   * Obtenir un client Redis par nom
   */
  getClient(connectionName: string = 'main'): Redis | null {
    const connection = this.connections.get(connectionName);
    return connection?.isConnected ? connection.client : null;
  }

  /**
   * Obtenir le client principal (cache)
   */
  getMainClient(): Redis | null {
    return this.getClient('main');
  }

  /**
   * Obtenir le client Socket.io
   */
  getSocketClient(): Redis | null {
    return this.getClient('socket');
  }

  /**
   * Obtenir le client Pub/Sub
   */
  getPubSubClient(): Redis | null {
    return this.getClient('pubsub');
  }

  /**
   * Vérifier la santé des connexions Redis
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    connections: Record<string, {
      connected: boolean;
      latency?: number;
      uptime?: number;
    }>;
  }> {
    const results: Record<string, any> = {};
    let healthyCount = 0;

    for (const [name, connection] of this.connections.entries()) {
      if (connection.isConnected && connection.client) {
        try {
          const start = Date.now();
          await connection.client.ping();
          const latency = Date.now() - start;
          
          results[name] = {
            connected: true,
            latency,
            uptime: connection.connectionTime 
              ? Date.now() - connection.connectionTime.getTime()
              : 0,
          };
          healthyCount++;
        } catch (error) {
          results[name] = {
            connected: false,
            error: error.message,
          };
        }
      } else {
        results[name] = {
          connected: false,
          error: 'Connexion non établie',
        };
      }
    }

    const totalConnections = this.connections.size;
    let status: 'healthy' | 'degraded' | 'unhealthy';

    if (healthyCount === totalConnections) {
      status = 'healthy';
    } else if (healthyCount > 0) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      connections: results,
    };
  }

  /**
   * Cache des sessions utilisateur (multi-tenant)
   */
  async setUserSession(
    userId: string,
    tenantId: string,
    sessionData: any,
    ttlSeconds: number = 3600
  ): Promise<boolean> {
    const client = this.getMainClient();
    if (!client) return false;

    try {
      const key = `session:${tenantId}:${userId}`;
      await client.setex(key, ttlSeconds, JSON.stringify({
        ...sessionData,
        lastAccess: new Date().toISOString(),
      }));
      return true;
    } catch (error) {
      this.logger.error(`Erreur sauvegarde session: ${error.message}`);
      return false;
    }
  }

  /**
   * Récupérer une session utilisateur
   */
  async getUserSession(userId: string, tenantId: string): Promise<any | null> {
    const client = this.getMainClient();
    if (!client) return null;

    try {
      const key = `session:${tenantId}:${userId}`;
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Erreur récupération session: ${error.message}`);
      return null;
    }
  }

  /**
   * Supprimer une session utilisateur
   */
  async deleteUserSession(userId: string, tenantId: string): Promise<boolean> {
    const client = this.getMainClient();
    if (!client) return false;

    try {
      const key = `session:${tenantId}:${userId}`;
      await client.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Erreur suppression session: ${error.message}`);
      return false;
    }
  }

  /**
   * Cache temporaire pour conversations actives
   */
  async cacheActiveConversation(
    conversationId: string,
    data: any,
    ttlSeconds: number = 1800 // 30 minutes
  ): Promise<boolean> {
    const client = this.getMainClient();
    if (!client) return false;

    try {
      const key = `conversation:${conversationId}`;
      await client.setex(key, ttlSeconds, JSON.stringify(data));
      return true;
    } catch (error) {
      this.logger.error(`Erreur cache conversation: ${error.message}`);
      return false;
    }
  }

  /**
   * Publier un événement temps réel
   */
  async publishEvent(channel: string, data: any): Promise<boolean> {
    const client = this.getPubSubClient();
    if (!client) return false;

    try {
      await client.publish(channel, JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
      }));
      return true;
    } catch (error) {
      this.logger.error(`Erreur publication événement: ${error.message}`);
      return false;
    }
  }

  /**
   * S'abonner à un channel
   */
  async subscribeToChannel(
    channel: string,
    callback: (message: any) => void
  ): Promise<boolean> {
    const client = this.getPubSubClient();
    if (!client) return false;

    try {
      await client.subscribe(channel);
      client.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          try {
            const parsedMessage = JSON.parse(message);
            callback(parsedMessage);
          } catch (error) {
            this.logger.error(`Erreur parsing message: ${error.message}`);
          }
        }
      });
      return true;
    } catch (error) {
      this.logger.error(`Erreur abonnement channel: ${error.message}`);
      return false;
    }
  }

  /**
   * Obtenir les statistiques Redis
   */
  async getStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const [name, connection] of this.connections.entries()) {
      if (connection.isConnected && connection.client) {
        try {
          const info = await connection.client.info('memory');
          const keyspace = await connection.client.info('keyspace');
          
          stats[name] = {
            connected: true,
            memory: this.parseRedisInfo(info),
            keyspace: this.parseRedisInfo(keyspace),
            uptime: connection.connectionTime
              ? Date.now() - connection.connectionTime.getTime()
              : 0,
          };
        } catch (error) {
          stats[name] = {
            connected: false,
            error: error.message,
          };
        }
      } else {
        stats[name] = {
          connected: false,
        };
      }
    }

    return stats;
  }

  /**
   * Parser les infos Redis
   */
  private parseRedisInfo(info: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = info.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key] = isNaN(Number(value)) ? value : Number(value);
      }
    }
    
    return result;
  }

  /**
   * Méthodes de cache direct (pour compatibilité avec AIAnalyticsService)
   */
  async get(key: string): Promise<string | null> {
    const client = this.getMainClient();
    if (!client) return null;

    try {
      return await client.get(key);
    } catch (error) {
      this.logger.error(`Erreur get Redis: ${error.message}`);
      return null;
    }
  }

  async setex(key: string, ttl: number, value: string): Promise<boolean> {
    const client = this.getMainClient();
    if (!client) return false;

    try {
      await client.setex(key, ttl, value);
      return true;
    } catch (error) {
      this.logger.error(`Erreur setex Redis: ${error.message}`);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    const client = this.getMainClient();
    if (!client) return false;

    try {
      await client.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Erreur del Redis: ${error.message}`);
      return false;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    const client = this.getMainClient();
    if (!client) return false;

    try {
      if (ttl) {
        await client.setex(key, ttl, value);
      } else {
        await client.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.error(`Erreur set Redis: ${error.message}`);
      return false;
    }
  }

  /**
   * Fermer toutes les connexions
   */
  private async closeAllConnections(): Promise<void> {
    this.logger.log('🔌 Fermeture des connexions Redis...');

    const closePromises = Array.from(this.connections.values()).map(async (connection) => {
      if (connection.client) {
        try {
          await connection.client.quit();
        } catch (error) {
          this.logger.error(`Erreur fermeture connexion: ${error.message}`);
        }
      }
    });

    await Promise.all(closePromises);
    this.connections.clear();
    
    this.logger.log('✅ Toutes les connexions Redis fermées');
  }
}