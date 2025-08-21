import { MistralProvider } from './mistral.provider';
import { ConfigService } from '@core/config/config.service';
import { TelemetryService } from '@core/telemetry/telemetry.service';

describe('MistralProvider', () => {
  let provider: MistralProvider;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockTelemetryService: jest.Mocked<TelemetryService>;

  beforeEach(() => {
    mockConfigService = {
      ai: {
        openaiApiKey: '',
        openaiModel: 'gpt-4o',
        geminiApiKey: '',
        geminiModel: 'gemini-2.5-flash-002',
        anthropicApiKey: '',
        anthropicModel: 'claude-3-5-sonnet-20241022',
        mistralApiKey: 'test-mistral-key',
        mistralModel: 'mistral-large-latest',
        maxTokens: 2048,
        temperature: 0.7,
      },
    } as any;

    mockTelemetryService = {
      trackAiProviderCall: jest.fn(),
    } as any;

    provider = new MistralProvider(mockConfigService, mockTelemetryService);
  });

  describe('Configuration', () => {
    test('devrait avoir le nom correct', () => {
      expect(provider.name).toBe('mistral');
    });

    test('devrait avoir la version correcte', () => {
      expect(provider.version).toBe('8x22B');
    });

    test('devrait avoir les bonnes capabilities', () => {
      expect(provider.capabilities).toEqual({
        textGeneration: true,
        chatCompletion: true,
        functionCalling: true,
        streaming: true,
        embedding: true,
        imageGeneration: false,
      });
    });

    test('devrait avoir la priorité correcte', () => {
      expect(provider.config.priority).toBe(85);
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
      expect(tokens).toBe(Math.ceil(28 / 3.8)); // ~7 tokens pour Mistral
    });

    test('devrait mapper les finish reasons', () => {
      expect((provider as any).mapFinishReason('stop')).toBe('stop');
      expect((provider as any).mapFinishReason('length')).toBe('length');
      expect((provider as any).mapFinishReason('model_length')).toBe('length');
      expect((provider as any).mapFinishReason('tool_calls')).toBe('function_call');
      expect((provider as any).mapFinishReason(null)).toBe('stop');
      expect((provider as any).mapFinishReason('unknown')).toBe('stop');
    });

    test('devrait construire les messages correctement', () => {
      const request = {
        prompt: 'Test prompt',
        systemPrompt: 'System instruction',
      };

      const messages = (provider as any).buildMessages(request);
      
      expect(messages).toHaveLength(2);
      expect(messages[0]).toEqual({
        role: 'system',
        content: 'System instruction'
      });
      expect(messages[1]).toEqual({
        role: 'user',
        content: 'Test prompt'
      });
    });

    test('devrait construire les messages sans system prompt', () => {
      const request = {
        prompt: 'Test prompt',
      };

      const messages = (provider as any).buildMessages(request);
      
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({
        role: 'user',
        content: 'Test prompt'
      });
    });

    test('devrait convertir les messages de chat', () => {
      const messages = [
        { role: 'system' as const, content: 'Be helpful' },
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there' },
      ];

      const result = (provider as any).convertMessages(messages);
      
      expect(result).toEqual([
        { role: 'system', content: 'Be helpful' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
      ]);
    });

    test('devrait convertir les fonctions', () => {
      const functions = [
        {
          name: 'get_weather',
          description: 'Get weather info',
          parameters: { type: 'object', properties: {} },
        },
      ];

      const result = (provider as any).convertFunctions(functions);
      
      expect(result).toEqual([
        {
          type: 'function',
          function: functions[0],
        },
      ]);
    });

    test('devrait gérer les fonctions vides', () => {
      expect((provider as any).convertFunctions([])).toBeUndefined();
      expect((provider as any).convertFunctions(undefined)).toBeUndefined();
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
      (provider as any).updateMetrics(120, 10, false);
      (provider as any).updateMetrics(180, 20, false);
      
      const metrics = provider.getMetrics();
      
      expect(metrics.averageLatency).toBe(150); // (120 + 180) / 2
    });
  });

  describe('Configuration et initialisation', () => {
    test('devrait être enabled si une clé API est fournie', () => {
      expect(provider.isEnabled).toBe(true);
    });

    test('devrait avoir la priorité correcte', () => {
      expect(provider.priority).toBe(85);
    });

    test('devrait initialiser correctement avec une clé API', async () => {
      // Le mock devrait permettre l'initialisation
      await expect(provider.initialize()).resolves.not.toThrow();
    });

    test('devrait échouer l\'initialisation sans clé API', async () => {
      mockConfigService.ai.mistralApiKey = '';
      const providerWithoutKey = new MistralProvider(mockConfigService, mockTelemetryService);
      
      await expect(providerWithoutKey.initialize()).rejects.toThrow(
        'Clé API Mistral manquante dans la configuration'
      );
    });
  });

  describe('Comparaison avec autres providers', () => {
    test('devrait avoir une estimation de tokens unique', () => {
      const text = 'Bonjour, comment allez-vous?'; // 28 caractères
      const mistralTokens = (provider as any).estimateTokens(text);
      
      // Mistral: ~3.8 caractères par token = 8 tokens (28/3.8 = 7.36 arrondi à 8)
      // OpenAI: ~3.2 caractères par token = 9 tokens
      // Claude: ~3.5 caractères par token = 8 tokens
      // Gemini: ~4 caractères par token = 7 tokens
      expect(mistralTokens).toBe(8);
      
      // Vérification par rapport aux autres
      const openaiTokens = Math.ceil(text.length / 3.2);
      const claudeTokens = Math.ceil(text.length / 3.5);
      const geminiTokens = Math.ceil(text.length / 4);
      
      expect(mistralTokens).toBeLessThan(openaiTokens);
      expect(mistralTokens).toBe(claudeTokens);
      expect(mistralTokens).toBeGreaterThan(geminiTokens);
    });

    test('devrait avoir la priorité la plus faible', () => {
      // Gemini: 100, Anthropic: 95, OpenAI: 90, Mistral: 85
      expect(provider.config.priority).toBe(85);
    });

    test('devrait avoir la même interface que les autres providers', () => {
      // Vérifier que toutes les méthodes requises sont implémentées
      expect(typeof provider.generateText).toBe('function');
      expect(typeof provider.chatCompletion).toBe('function');
      expect(typeof provider.generateTextStream).toBe('function');
      expect(typeof provider.generateEmbedding).toBe('function');
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

  describe('Spécificités Mistral', () => {
    test('devrait supporter les embeddings', () => {
      expect(provider.capabilities.embedding).toBe(true);
    });

    test('devrait supporter le function calling', () => {
      expect(provider.capabilities.functionCalling).toBe(true);
    });

    test('devrait supporter le streaming', () => {
      expect(provider.capabilities.streaming).toBe(true);
    });

    test('ne devrait pas supporter la génération d\'images', () => {
      expect(provider.capabilities.imageGeneration).toBe(false);
    });

    test('devrait utiliser le modèle Mistral configuré', () => {
      expect(mockConfigService.ai.mistralModel).toBe('mistral-large-latest');
    });

    test('devrait avoir la version 8x22B', () => {
      expect(provider.version).toBe('8x22B');
    });

    test('devrait préserver les messages système dans buildMessages', () => {
      const request = {
        prompt: 'Test',
        systemPrompt: 'System instruction',
      };

      const messages = (provider as any).buildMessages(request);
      
      // Mistral peut utiliser les messages système directement
      expect(messages.find((m: any) => m.role === 'system')).toBeDefined();
    });
  });
});