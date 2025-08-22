import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '../../core/config/config.service';
import {
  AIGatewayConfig,
  AIProviderConfig,
  ConfigValidationResult,
  ProviderValidationResult,
  AIGatewayStatus,
  ProviderStatus
} from './ai-config.interface';

@Injectable()
export class AIConfigService implements OnModuleInit {
  private readonly logger = new Logger(AIConfigService.name);
  private config: AIGatewayConfig;
  private status: AIGatewayStatus;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.logger.log('🚀 Initialisation AIConfigService...');
    
    try {
      // Chargement et validation de la configuration
      this.config = this.loadConfiguration();
      const validation = this.validateConfiguration();
      
      if (!validation.isValid) {
        this.logger.error('❌ Configuration IA invalide:', validation.errors);
        throw new Error(`Configuration IA invalide: ${validation.errors.join(', ')}`);
      }

      // Affichage des warnings
      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning => {
          this.logger.warn(`⚠️ ${warning}`);
        });
      }

      // Initialisation du statut
      this.initializeStatus();
      
      this.logger.log('✅ AIConfigService initialisé avec succès');
      this.logConfigurationSummary();
      
    } catch (error) {
      this.logger.error('💥 Erreur lors de l\'initialisation AIConfigService:', error.message);
      throw error;
    }
  }

  /**
   * Charge la configuration depuis les variables d'environnement
   */
  private loadConfiguration(): AIGatewayConfig {
    const aiConfig = this.configService.ai;
    
    const providers: Record<string, AIProviderConfig> = {};
    
    // Configuration OpenAI
    if (aiConfig.openai.apiKey) {
      providers.openai = {
        name: 'openai',
        apiKey: aiConfig.openai.apiKey,
        model: aiConfig.openai.model,
        maxTokens: aiConfig.openai.maxTokens,
        temperature: aiConfig.openai.temperature,
        enabled: true,
        priority: aiConfig.gateway.defaultProvider === 'openai' ? 1 : 2,
      };
    }

    // Configuration Anthropic
    if (aiConfig.anthropic.apiKey) {
      providers.anthropic = {
        name: 'anthropic',
        apiKey: aiConfig.anthropic.apiKey,
        model: aiConfig.anthropic.model,
        maxTokens: aiConfig.anthropic.maxTokens,
        temperature: aiConfig.anthropic.temperature,
        enabled: true,
        priority: aiConfig.gateway.defaultProvider === 'anthropic' ? 1 : 2,
      };
    }

    // Configuration Gemini
    if (aiConfig.gemini.apiKey) {
      providers.gemini = {
        name: 'gemini',
        apiKey: aiConfig.gemini.apiKey,
        model: aiConfig.gemini.model,
        maxTokens: aiConfig.gemini.maxTokens,
        temperature: aiConfig.gemini.temperature,
        enabled: true,
        priority: aiConfig.gateway.defaultProvider === 'gemini' ? 1 : 2,
      };
    }

    return {
      providers,
      gateway: aiConfig.gateway,
      quotas: aiConfig.quotas,
      health: aiConfig.health,
      logging: aiConfig.logging,
    };
  }

  /**
   * Valide la configuration IA
   */
  private validateConfiguration(): ConfigValidationResult {
    const result: ConfigValidationResult = {
      isValid: true,
      providers: [],
      errors: [],
      warnings: [],
    };

    // Validation globale
    if (Object.keys(this.config.providers).length === 0) {
      result.errors.push('Aucun provider IA configuré. Au moins un provider est requis.');
      result.isValid = false;
    }

    // Validation du provider par défaut
    const defaultProvider = this.config.gateway.defaultProvider;
    if (!this.config.providers[defaultProvider]) {
      result.errors.push(`Provider par défaut '${defaultProvider}' non configuré.`);
      result.isValid = false;
    }

    // Validation de chaque provider
    Object.values(this.config.providers).forEach(provider => {
      const providerValidation = this.validateProvider(provider);
      result.providers.push(providerValidation);
      
      if (!providerValidation.isValid) {
        result.isValid = false;
        result.errors.push(...providerValidation.errors);
      }
      
      result.warnings.push(...providerValidation.warnings);
    });

    // Validation des quotas
    if (this.config.quotas.tenantMonthlyLimit <= 0) {
      result.warnings.push('Limite mensuelle tenant définie à 0 - quota illimité');
    }

    if (this.config.quotas.globalDailyLimit <= 0) {
      result.warnings.push('Limite quotidienne globale définie à 0 - quota illimité');
    }

    return result;
  }

  /**
   * Valide un provider spécifique
   */
  private validateProvider(provider: AIProviderConfig): ProviderValidationResult {
    const result: ProviderValidationResult = {
      isValid: true,
      provider: provider.name,
      errors: [],
      warnings: [],
    };

    // Validation clé API
    if (!provider.apiKey || provider.apiKey.length < 10) {
      result.errors.push(`${provider.name}: Clé API manquante ou invalide`);
      result.isValid = false;
    }

    // Validation modèle
    if (!provider.model) {
      result.errors.push(`${provider.name}: Modèle non spécifié`);
      result.isValid = false;
    }

    // Validation des paramètres
    if (provider.maxTokens <= 0 || provider.maxTokens > 100000) {
      result.warnings.push(`${provider.name}: maxTokens hors limites recommandées (1-100000)`);
    }

    if (provider.temperature < 0 || provider.temperature > 2) {
      result.warnings.push(`${provider.name}: temperature hors limites (0-2)`);
    }

    // Validation pattern clé API par provider
    this.validateApiKeyPattern(provider, result);

    return result;
  }

  /**
   * Valide le pattern de la clé API selon le provider
   */
  private validateApiKeyPattern(provider: AIProviderConfig, result: ProviderValidationResult): void {
    const patterns = {
      openai: /^sk-[a-zA-Z0-9]{48,}$/,
      anthropic: /^sk-ant-[a-zA-Z0-9_-]{95,}$/,
      gemini: /^AI[a-zA-Z0-9_-]{35,}$/,
    };

    const pattern = patterns[provider.name];
    if (pattern && !pattern.test(provider.apiKey)) {
      result.warnings.push(`${provider.name}: Format de clé API non reconnu`);
    }
  }

  /**
   * Initialise le statut du gateway
   */
  private initializeStatus(): void {
    this.status = {
      isHealthy: false,
      activeProvider: this.config.gateway.defaultProvider,
      providers: Object.values(this.config.providers).map(provider => ({
        name: provider.name,
        enabled: provider.enabled,
        healthy: false,
        lastCheck: new Date(),
        latency: 0,
        errorCount: 0,
        quotaUsed: 0,
      })),
      lastHealthCheck: new Date(),
      totalRequests: 0,
      totalErrors: 0,
    };
  }

  /**
   * Affiche un résumé de la configuration
   */
  private logConfigurationSummary(): void {
    const providerCount = Object.keys(this.config.providers).length;
    const enabledProviders = Object.values(this.config.providers)
      .filter(p => p.enabled)
      .map(p => p.name)
      .join(', ');

    this.logger.log(`📊 Configuration IA Summary:`);
    this.logger.log(`   • Providers configurés: ${providerCount}`);
    this.logger.log(`   • Providers actifs: ${enabledProviders}`);
    this.logger.log(`   • Provider par défaut: ${this.config.gateway.defaultProvider}`);
    this.logger.log(`   • Fallback activé: ${this.config.gateway.fallbackEnabled}`);
    this.logger.log(`   • Mode: ${this.config.gateway.mode}`);
    this.logger.log(`   • Health checks: ${this.config.health.enabled ? 'activés' : 'désactivés'}`);
  }

  // === PUBLIC API ===

  /**
   * Retourne la configuration complète
   */
  getConfiguration(): AIGatewayConfig {
    return { ...this.config };
  }

  /**
   * Retourne la configuration d'un provider spécifique
   */
  getProviderConfig(name: string): AIProviderConfig | null {
    return this.config.providers[name] || null;
  }

  /**
   * Retourne la liste des providers disponibles
   */
  getAvailableProviders(): string[] {
    return Object.keys(this.config.providers);
  }

  /**
   * Retourne la liste des providers actifs
   */
  getEnabledProviders(): AIProviderConfig[] {
    return Object.values(this.config.providers).filter(p => p.enabled);
  }

  /**
   * Retourne le provider par défaut
   */
  getDefaultProvider(): AIProviderConfig | null {
    return this.config.providers[this.config.gateway.defaultProvider] || null;
  }

  /**
   * Retourne le statut actuel du gateway
   */
  getStatus(): AIGatewayStatus {
    return { ...this.status };
  }

  /**
   * Met à jour le statut d'un provider
   */
  updateProviderStatus(name: string, update: Partial<ProviderStatus>): void {
    const providerStatus = this.status.providers.find(p => p.name === name);
    if (providerStatus) {
      Object.assign(providerStatus, update);
      providerStatus.lastCheck = new Date();
    }
  }

  /**
   * Met à jour le statut global
   */
  updateGlobalStatus(update: Partial<AIGatewayStatus>): void {
    Object.assign(this.status, update);
    this.status.lastHealthCheck = new Date();
  }

  /**
   * Active/désactive un provider
   */
  setProviderEnabled(name: string, enabled: boolean): boolean {
    const provider = this.config.providers[name];
    if (provider) {
      provider.enabled = enabled;
      this.updateProviderStatus(name, { enabled });
      this.logger.log(`Provider ${name} ${enabled ? 'activé' : 'désactivé'}`);
      return true;
    }
    return false;
  }

  /**
   * Change le provider actif
   */
  setActiveProvider(name: string): boolean {
    if (this.config.providers[name] && this.config.providers[name].enabled) {
      this.status.activeProvider = name;
      this.logger.log(`Provider actif changé vers: ${name}`);
      return true;
    }
    return false;
  }

  /**
   * Vérifie si le mode debug est activé
   */
  isDebugMode(): boolean {
    return this.config.logging.debugMode;
  }

  /**
   * Vérifie si les métriques sont activées
   */
  areMetricsEnabled(): boolean {
    return this.config.logging.metricsEnabled;
  }

  /**
   * Vérifie si les health checks sont activés
   */
  areHealthChecksEnabled(): boolean {
    return this.config.health.enabled;
  }
}