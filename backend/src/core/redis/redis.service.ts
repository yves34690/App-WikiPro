import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

/**
 * Service Redis avec fallback en mémoire - TICKET-BACKEND-007
 * Supporte Redis en production et cache mémoire en développement
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: any = null;
  private memoryCache = new Map<string, { value: any; expiry?: number }>();
  private isRedisEnabled = process.env.REDIS_ENABLED !== 'false';
  
  async onModuleInit() {
    if (this.isRedisEnabled) {
      try {
        // En production, utiliser Redis réel
        this.logger.log('🔄 Initialisation Redis...');
        // TODO: Implémenter la connexion Redis réelle dans une phase ultérieure
        this.logger.warn('⚠️ Redis réel non implémenté - fallback mémoire activé');
      } catch (error) {
        this.logger.error('❌ Erreur connexion Redis, fallback mémoire', error);
      }
    } else {
      this.logger.log('💾 Mode cache mémoire activé (développement)');
    }
  }

  async onModuleDestroy() {
    if (this.redisClient) {
      await this.redisClient.quit();
      this.logger.log('✅ Connexion Redis fermée');
    }
    this.memoryCache.clear();
  }

  /**
   * Définir une valeur dans le cache
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      const expiry = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : undefined;

      if (this.redisClient) {
        // Mode Redis
        if (ttlSeconds) {
          await this.redisClient.setex(key, ttlSeconds, serializedValue);
        } else {
          await this.redisClient.set(key, serializedValue);
        }
      } else {
        // Mode mémoire
        this.memoryCache.set(key, { value: serializedValue, expiry });
      }
    } catch (error) {
      this.logger.error(`Erreur set cache [${key}]:`, error);
    }
  }

  /**
   * Récupérer une valeur du cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      let serializedValue: string | null = null;

      if (this.redisClient) {
        // Mode Redis
        serializedValue = await this.redisClient.get(key);
      } else {
        // Mode mémoire
        const cached = this.memoryCache.get(key);
        if (cached) {
          if (cached.expiry && Date.now() > cached.expiry) {
            this.memoryCache.delete(key);
            return null;
          }
          serializedValue = cached.value;
        }
      }

      return serializedValue ? JSON.parse(serializedValue) : null;
    } catch (error) {
      this.logger.error(`Erreur get cache [${key}]:`, error);
      return null;
    }
  }

  /**
   * Supprimer une clé du cache
   */
  async del(key: string): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.del(key);
      } else {
        this.memoryCache.delete(key);
      }
    } catch (error) {
      this.logger.error(`Erreur del cache [${key}]:`, error);
    }
  }

  /**
   * Vérifier l'existence d'une clé
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (this.redisClient) {
        return (await this.redisClient.exists(key)) === 1;
      } else {
        const cached = this.memoryCache.get(key);
        if (!cached) return false;
        
        if (cached.expiry && Date.now() > cached.expiry) {
          this.memoryCache.delete(key);
          return false;
        }
        return true;
      }
    } catch (error) {
      this.logger.error(`Erreur exists cache [${key}]:`, error);
      return false;
    }
  }

  /**
   * Incrémenter une valeur numérique
   */
  async incr(key: string): Promise<number> {
    try {
      if (this.redisClient) {
        return await this.redisClient.incr(key);
      } else {
        const current = await this.get<number>(key) || 0;
        const newValue = current + 1;
        await this.set(key, newValue);
        return newValue;
      }
    } catch (error) {
      this.logger.error(`Erreur incr cache [${key}]:`, error);
      return 0;
    }
  }

  /**
   * Définir un TTL sur une clé existante
   */
  async expire(key: string, ttlSeconds: number): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.expire(key, ttlSeconds);
      } else {
        const cached = this.memoryCache.get(key);
        if (cached) {
          cached.expiry = Date.now() + (ttlSeconds * 1000);
        }
      }
    } catch (error) {
      this.logger.error(`Erreur expire cache [${key}]:`, error);
    }
  }

  /**
   * Nettoyer le cache (flush all)
   */
  async flushAll(): Promise<void> {
    try {
      if (this.redisClient) {
        await this.redisClient.flushall();
      } else {
        this.memoryCache.clear();
      }
      this.logger.log('🧹 Cache nettoyé');
    } catch (error) {
      this.logger.error('Erreur flush cache:', error);
    }
  }

  /**
   * Ping pour health check
   */
  async ping(): Promise<string> {
    try {
      if (this.redisClient) {
        return await this.redisClient.ping();
      } else {
        return 'MEMORY_OK';
      }
    } catch (error) {
      this.logger.error('Erreur ping cache:', error);
      return 'ERROR';
    }
  }

  /**
   * Obtenir des statistiques du cache
   */
  async getStats(): Promise<{
    mode: string;
    connected: boolean;
    keysCount: number;
    memoryUsage?: string;
  }> {
    try {
      if (this.redisClient) {
        const info = await this.redisClient.info('memory');
        const dbsize = await this.redisClient.dbsize();
        
        return {
          mode: 'redis',
          connected: true,
          keysCount: dbsize,
          memoryUsage: this.extractMemoryFromInfo(info)
        };
      } else {
        return {
          mode: 'memory',
          connected: true,
          keysCount: this.memoryCache.size,
          memoryUsage: `${Math.round(JSON.stringify([...this.memoryCache.entries()]).length / 1024)} KB`
        };
      }
    } catch (error) {
      return {
        mode: this.redisClient ? 'redis' : 'memory',
        connected: false,
        keysCount: 0
      };
    }
  }

  private extractMemoryFromInfo(info: string): string {
    const match = info.match(/used_memory_human:(.+)/);
    return match ? match[1].trim() : 'unknown';
  }
}