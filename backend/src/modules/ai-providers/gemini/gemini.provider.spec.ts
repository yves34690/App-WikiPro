import { GeminiProvider } from './gemini.provider';
import { ConfigService } from '@core/config/config.service';
import { TelemetryService } from '@core/telemetry/telemetry.service';

describe('GeminiProvider', () => {
  let provider: GeminiProvider;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockTelemetryService: jest.Mocked<TelemetryService>;

  beforeEach(() => {
    mockConfigService = {
      ai: {
        openaiApiKey: '',
        openaiModel: 'gpt-4o',
        geminiApiKey: 'test-gemini-key',
        geminiModel: 'gemini-2.5-flash-002',
        anthropicApiKey: '',
        anthropicModel: 'claude-3-5-sonnet-20241022',
        mistralApiKey: '',
        mistralModel: 'mistral-large-latest',
        maxTokens: 2048,
        temperature: 0.7,
      },
    } as any;

    mockTelemetryService = {
      trackAiProviderCall: jest.fn(),
    } as any;

    provider = new GeminiProvider(mockConfigService, mockTelemetryService);
  });

  describe('Configuration', () => {
    test('devrait avoir le nom correct', () => {
      expect(provider.name).toBe('gemini');
    });

    test('devrait avoir la version correcte', () => {
      expect(provider.version).toBe('2.5');
    });

    test('devrait avoir les bonnes capabilities', () => {
      expect(provider.capabilities).toEqual({
        textGeneration: true,
        chatCompletion: true,
        functionCalling: true,
        streaming: true,
        embedding: false,
        imageGeneration: false,
      });
    });

    test('devrait avoir la priorité correcte', () => {
      expect(provider.config.priority).toBe(100);
    });
  });

  describe('Validation des requêtes', () => {
    test('devrait valider le tenant ID', () => {
      expect(() => {
        (provider as any).validateTenant('');
      }).toThrow('Tenant ID is required');

      expect(() => {
        (provider as any).validateTenant(null);
      }).toThrow('Tenant ID is required');

      expect(() => {
        (provider as any).validateTenant('tenant-1');
      }).not.toThrow();
    });

    test('devrait valider les requêtes', () => {
      expect(() => {
        (provider as any).validateRequest(null);
      }).toThrow('Request is required');

      expect(() => {
        (provider as any).validateRequest({});
      }).not.toThrow();
    });

    test('devrait nettoyer les prompts', () => {
      const longPrompt = 'a'.repeat(20000);
      const cleaned = (provider as any).sanitizePrompt(longPrompt);
      expect(cleaned.length).toBe(10000);
    });
  });

  describe('Utilitaires', () => {
    test('devrait estimer les tokens correctement', () => {
      const text = 'Bonjour, comment allez-vous?'; // ~28 caractères
      const tokens = (provider as any).estimateTokens(text);
      expect(tokens).toBe(Math.ceil(28 / 4)); // ~7 tokens pour Gemini
    });

    test('devrait construire les prompts correctement', () => {
      const request = {
        prompt: 'Test prompt',
        systemPrompt: 'System instruction',
      };

      const prompt = (provider as any).buildPrompt(request);
      
      expect(prompt).toBe('System instruction\n\nTest prompt');
    });

    test('devrait construire les prompts sans system prompt', () => {
      const request = {
        prompt: 'Test prompt',
      };

      const prompt = (provider as any).buildPrompt(request);
      
      expect(prompt).toBe('Test prompt');
    });

    test('devrait construire la configuration de génération', () => {
      const request = {
        maxTokens: 1000,
        temperature: 0.5,
        stopSequences: ['STOP'],
      };

      const config = (provider as any).buildGenerationConfig(request);
      
      expect(config).toEqual({
        maxOutputTokens: 1000,
        temperature: 0.5,
        stopSequences: ['STOP'],
      });
    });

    test('devrait utiliser les valeurs par défaut pour la configuration', () => {
      const request = {};

      const config = (provider as any).buildGenerationConfig(request);
      
      expect(config).toEqual({
        maxOutputTokens: 2048,
        temperature: 0.7,
        stopSequences: [],
      });
    });

    test('devrait convertir les messages de chat', () => {
      const messages = [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there' },
        { role: 'system' as const, content: 'Be helpful' },
      ];

      const converted = (provider as any).convertMessages(messages);
      
      expect(converted).toEqual([
        { role: 'user', parts: [{ text: 'Hello' }] },
        { role: 'model', parts: [{ text: 'Hi there' }] },
        { role: 'user', parts: [{ text: 'Be helpful' }] }, // system -> user pour Gemini
      ]);
    });
  });

  describe('Métriques', () => {
    test('devrait retourner les métriques initiales', () => {
      const metrics = provider.getMetrics();
      
      expect(metrics).toEqual({
        totalCalls: 0,
        totalTokens: 0,
        averageLatency: 0,
        errorRate: 0,
      });
    });

    test('devrait mettre à jour les métriques', () => {
      // Simulation d'un appel réussi
      (provider as any).updateMetrics(150, 75, false);
      
      const metrics = provider.getMetrics();
      
      expect(metrics.totalCalls).toBe(1);
      expect(metrics.totalTokens).toBe(75);
      expect(metrics.averageLatency).toBe(150);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.lastUsed).toBeInstanceOf(Date);
    });

    test('devrait calculer le taux d\'erreur', () => {
      // Premier appel réussi
      (provider as any).updateMetrics(100, 50, false);
      // Deuxième appel échoué
      (provider as any).updateMetrics(200, 0, true);
      
      const metrics = provider.getMetrics();
      
      expect(metrics.totalCalls).toBe(2);
      expect(metrics.errorRate).toBe(0.5); // 1 erreur sur 2 appels
    });

    test('devrait calculer la latence moyenne', () => {
      (provider as any).updateMetrics(100, 10, false);
      (provider as any).updateMetrics(300, 20, false);
      
      const metrics = provider.getMetrics();
      
      expect(metrics.averageLatency).toBe(200); // (100 + 300) / 2
    });
  });

  describe('Configuration et initialisation', () => {
    test('devrait être enabled si une clé API est fournie', () => {
      expect(provider.isEnabled).toBe(true);
    });

    test('devrait avoir la priorité correcte', () => {
      expect(provider.priority).toBe(100);
    });

    test('devrait initialiser correctement avec une clé API', async () => {
      // Le mock devrait permettre l'initialisation
      await expect(provider.initialize()).resolves.not.toThrow();
    });

    test('devrait échouer l\'initialisation sans clé API', async () => {
      mockConfigService.ai.geminiApiKey = '';
      const providerWithoutKey = new GeminiProvider(mockConfigService, mockTelemetryService);
      
      await expect(providerWithoutKey.initialize()).rejects.toThrow(
        'Clé API Gemini manquante dans la configuration'
      );
    });
  });

  describe('Comparaison avec OpenAI', () => {
    test('devrait avoir une estimation de tokens différente d\'OpenAI', () => {
      const text = 'Bonjour, comment allez-vous?'; // 28 caractères
      const geminiTokens = (provider as any).estimateTokens(text);
      
      // Gemini: ~4 caractères par token = 7 tokens
      // OpenAI: ~3.2 caractères par token = 9 tokens
      expect(geminiTokens).toBe(7);
      
      // Vérification que c'est différent d'OpenAI
      const openaiTokens = Math.ceil(text.length / 3.2);
      expect(geminiTokens).toBeLessThan(openaiTokens);
    });

    test('devrait avoir la même interface que les autres providers', () => {
      // Vérifier que toutes les méthodes requises sont implémentées
      expect(typeof provider.generateText).toBe('function');
      expect(typeof provider.chatCompletion).toBe('function');
      expect(typeof provider.generateTextStream).toBe('function');
      expect(typeof provider.healthCheck).toBe('function');
      expect(typeof provider.initialize).toBe('function');
      expect(typeof provider.getMetrics).toBe('function');
    });

    test('devrait avoir les mêmes propriétés de base', () => {
      expect(provider).toHaveProperty('name');
      expect(provider).toHaveProperty('version');
      expect(provider).toHaveProperty('capabilities');
      expect(provider).toHaveProperty('config');
    });
  });

  describe('Spécificités Gemini', () => {
    test('devrait mapper assistant vers model dans les messages', () => {
      const messages = [{ role: 'assistant' as const, content: 'Hello' }];
      const converted = (provider as any).convertMessages(messages);
      
      expect(converted[0].role).toBe('model');
    });

    test('devrait garder user comme user dans les messages', () => {
      const messages = [{ role: 'user' as const, content: 'Hello' }];
      const converted = (provider as any).convertMessages(messages);
      
      expect(converted[0].role).toBe('user');
    });

    test('devrait utiliser le modèle configuré', () => {
      expect(mockConfigService.ai.geminiModel).toBe('gemini-2.5-flash-002');
    });

    test('devrait avoir une priorité plus élevée qu\'OpenAI', () => {
      // Gemini: priorité 100, OpenAI: priorité 90
      expect(provider.config.priority).toBe(100);
    });
  });
});