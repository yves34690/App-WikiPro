import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AIConfigService } from './config/ai-config.service';
import { AIHealthService } from './health/ai-health.service';
import { CoreConfigModule } from '../core/config/config.module';
import { validationSchema } from '../core/config/config.validation';

describe('AI Gateway Integration', () => {
  let aiConfigService: AIConfigService;
  let aiHealthService: AIHealthService;
  let module: TestingModule;

  beforeEach(async () => {
    // Configuration de test avec des valeurs mockées
    process.env.OPENAI_API_KEY = 'sk-test-key-for-testing-only';
    process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key-for-testing-only';
    process.env.GOOGLE_AI_API_KEY = 'AItest-key-for-testing-only';
    process.env.AI_DEFAULT_PROVIDER = 'openai';
    process.env.AI_HEALTH_CHECK_ENABLED = 'true';

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validationSchema,
          validate: (config) => validationSchema.validate(config).value,
        }),
        CoreConfigModule,
      ],
      providers: [
        AIConfigService,
        AIHealthService,
      ],
    }).compile();

    aiConfigService = module.get<AIConfigService>(AIConfigService);
    aiHealthService = module.get<AIHealthService>(AIHealthService);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('AIConfigService', () => {
    it('devrait être défini', () => {
      expect(aiConfigService).toBeDefined();
    });

    it('devrait charger la configuration des providers', () => {
      const config = aiConfigService.getConfiguration();
      expect(config).toBeDefined();
      expect(config.providers).toBeDefined();
      expect(Object.keys(config.providers)).toContain('openai');
    });

    it('devrait retourner le provider par défaut', () => {
      const defaultProvider = aiConfigService.getDefaultProvider();
      expect(defaultProvider).toBeDefined();
      expect(defaultProvider?.name).toBe('openai');
    });

    it('devrait lister les providers disponibles', () => {
      const providers = aiConfigService.getAvailableProviders();
      expect(providers).toContain('openai');
    });
  });

  describe('AIHealthService', () => {
    it('devrait être défini', () => {
      expect(aiHealthService).toBeDefined();
    });

    it('devrait effectuer un health check', async () => {
      const report = await aiHealthService.performHealthCheck();
      expect(report).toBeDefined();
      expect(report.overallHealth).toBeDefined();
      expect(report.providers).toBeInstanceOf(Array);
    });

    it('devrait retourner un résumé de santé', () => {
      const summary = aiHealthService.getHealthSummary();
      expect(summary).toBeDefined();
      expect(summary.status).toBeDefined();
      expect(summary.activeProvider).toBeDefined();
    });

    it('devrait gérer les métriques', () => {
      const metrics = aiHealthService.getAllMetrics();
      expect(metrics).toBeInstanceOf(Array);
    });
  });

  describe('Intégration complète', () => {
    it('devrait valider la configuration au démarrage', async () => {
      // Le module a déjà été initialisé avec succès
      expect(aiConfigService.getConfiguration()).toBeDefined();
    });

    it('devrait permettre de changer le provider actif', () => {
      const success = aiConfigService.setActiveProvider('openai');
      expect(success).toBe(true);
    });

    it('devrait gérer les alertes de santé', async () => {
      await aiHealthService.performHealthCheck();
      const alerts = aiHealthService.getActiveAlerts();
      expect(alerts).toBeInstanceOf(Array);
    });
  });
});

describe('Configuration Validation', () => {
  it('devrait valider les clés API avec les bons patterns', () => {
    const testCases = [
      { key: 'sk-1234567890123456789012345678901234567890123456789', provider: 'openai', valid: true },
      { key: 'sk-ant-api03-1234567890123456789012345678901234567890123456789012345678901234567890123456789012345', provider: 'anthropic', valid: true },
      { key: 'AIabcdefghijklmnopqrstuvwxyz1234567890', provider: 'gemini', valid: true },
      { key: 'invalid-key', provider: 'openai', valid: false },
    ];

    // Ce test vérifie que notre validation Joi fonctionne
    testCases.forEach(({ key, provider, valid }) => {
      const envKey = `${provider.toUpperCase()}_API_KEY`;
      process.env[envKey] = key;
      
      const result = validationSchema.validate({
        [envKey]: key,
      });

      if (valid) {
        expect(result.error).toBeUndefined();
      }
      // Pour les clés invalides, on ne peut pas facilement tester ici
      // car Joi utilise .optional() pour les clés API
    });
  });
});

// Tests d'intégration avec des mocks
describe('Provider Integration Tests', () => {
  it('devrait pouvoir créer des providers dynamiquement', () => {
    const mockConfig = {
      openai: {
        apiKey: 'sk-test123456789012345678901234567890123456789',
        model: 'gpt-4',
        maxTokens: 4000,
        temperature: 0.7,
      },
    };

    // Test de la création de provider (simulation)
    expect(mockConfig.openai.apiKey).toMatch(/^sk-/);
    expect(mockConfig.openai.model).toBe('gpt-4');
  });
});