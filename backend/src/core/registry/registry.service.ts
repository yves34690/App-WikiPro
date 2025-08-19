import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BaseProvider, ProviderConfig, ProviderMetrics } from '@shared/interfaces/provider.interface';

export interface RegistryEntry<T = BaseProvider> {
  instance: T;
  config: ProviderConfig;
  registeredAt: Date;
  lastHealthCheck?: Date;
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
}

@Injectable()
export class RegistryService implements OnModuleInit {
  private readonly logger = new Logger(RegistryService.name);
  private readonly providers = new Map<string, RegistryEntry>();
  private readonly typeRegistries = new Map<string, Map<string, RegistryEntry>>();

  async onModuleInit() {
    this.logger.log('Service de registre initialisé');
    // Démarrer le health check périodique
    this.startHealthCheckLoop();
  }

  register<T extends BaseProvider>(
    type: string,
    name: string,
    provider: T,
    config: ProviderConfig
  ): void {
    const key = this.getProviderKey(type, name);
    
    if (this.providers.has(key)) {
      this.logger.warn(`Provider ${key} est déjà enregistré, remplacement...`);
    }

    const entry: RegistryEntry<T> = {
      instance: provider,
      config,
      registeredAt: new Date(),
      healthStatus: 'unknown',
    };

    this.providers.set(key, entry);

    // Enregistrer dans le registre par type
    if (!this.typeRegistries.has(type)) {
      this.typeRegistries.set(type, new Map());
    }
    this.typeRegistries.get(type)!.set(name, entry);

    this.logger.log(`Provider enregistré: ${key} (priority: ${config.priority})`);
  }

  unregister(type: string, name: string): boolean {
    const key = this.getProviderKey(type, name);
    
    const removed = this.providers.delete(key);
    
    const typeRegistry = this.typeRegistries.get(type);
    if (typeRegistry) {
      typeRegistry.delete(name);
      if (typeRegistry.size === 0) {
        this.typeRegistries.delete(type);
      }
    }

    if (removed) {
      this.logger.log(`Provider désenregistré: ${key}`);
    }

    return removed;
  }

  get<T extends BaseProvider>(type: string, name: string): T | null {
    const key = this.getProviderKey(type, name);
    const entry = this.providers.get(key);
    return entry ? (entry.instance as T) : null;
  }

  getByType<T extends BaseProvider>(type: string): T[] {
    const typeRegistry = this.typeRegistries.get(type);
    if (!typeRegistry) return [];

    return Array.from(typeRegistry.values())
      .filter(entry => entry.config.enabled)
      .sort((a, b) => b.config.priority - a.config.priority) // Tri par priorité décroissante
      .map(entry => entry.instance as T);
  }

  getBest<T extends BaseProvider>(type: string): T | null {
    const providers = this.getByType<T>(type);
    
    // Filtrer les providers sains
    const healthyProviders = providers.filter(provider => {
      const key = this.getProviderKey(type, provider.name);
      const entry = this.providers.get(key);
      return entry?.healthStatus === 'healthy';
    });

    return healthyProviders.length > 0 ? healthyProviders[0] : null;
  }

  getAllProviders(): Map<string, RegistryEntry> {
    return new Map(this.providers);
  }

  getProviderTypes(): string[] {
    return Array.from(this.typeRegistries.keys());
  }

  getProvidersInfo(): Array<{
    key: string;
    type: string;
    name: string;
    config: ProviderConfig;
    healthStatus: string;
    metrics: ProviderMetrics;
    registeredAt: Date;
    lastHealthCheck?: Date;
  }> {
    return Array.from(this.providers.entries()).map(([key, entry]) => {
      const [type, name] = key.split(':');
      return {
        key,
        type,
        name,
        config: entry.config,
        healthStatus: entry.healthStatus,
        metrics: entry.instance.getMetrics(),
        registeredAt: entry.registeredAt,
        lastHealthCheck: entry.lastHealthCheck,
      };
    });
  }

  async healthCheck(type?: string, name?: string): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    
    if (type && name) {
      // Health check pour un provider spécifique
      const provider = this.get(type, name);
      if (provider) {
        const key = this.getProviderKey(type, name);
        const isHealthy = await this.performHealthCheck(key, provider);
        results.set(key, isHealthy);
      }
    } else {
      // Health check pour tous les providers
      const promises = Array.from(this.providers.entries()).map(async ([key, entry]) => {
        const isHealthy = await this.performHealthCheck(key, entry.instance);
        results.set(key, isHealthy);
      });
      
      await Promise.all(promises);
    }

    return results;
  }

  private async performHealthCheck(key: string, provider: BaseProvider): Promise<boolean> {
    try {
      const isHealthy = await provider.healthCheck();
      const entry = this.providers.get(key);
      
      if (entry) {
        entry.healthStatus = isHealthy ? 'healthy' : 'unhealthy';
        entry.lastHealthCheck = new Date();
      }

      return isHealthy;
    } catch (error) {
      this.logger.warn(`Health check échoué pour ${key}: ${error.message}`);
      const entry = this.providers.get(key);
      if (entry) {
        entry.healthStatus = 'unhealthy';
        entry.lastHealthCheck = new Date();
      }
      return false;
    }
  }

  private getProviderKey(type: string, name: string): string {
    return `${type}:${name}`;
  }

  private startHealthCheckLoop(): void {
    const interval = 5 * 60 * 1000; // 5 minutes
    
    setInterval(async () => {
      try {
        this.logger.debug('Démarrage du health check périodique');
        await this.healthCheck();
        this.logger.debug('Health check périodique terminé');
      } catch (error) {
        this.logger.error(`Erreur lors du health check périodique: ${error.message}`);
      }
    }, interval);

    this.logger.log(`Health check périodique configuré (intervalle: ${interval/1000}s)`);
  }
}