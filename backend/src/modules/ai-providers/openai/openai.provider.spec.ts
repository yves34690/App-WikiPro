import { OpenAIProvider } from './openai.provider';
import { ConfigService } from '@core/config/config.service';
import { TelemetryService } from '@core/telemetry/telemetry.service';

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockTelemetryService: jest.Mocked<TelemetryService>;

  beforeEach(() => {
    mockConfigService = {
      ai: {
        openaiApiKey: 'test-api-key',
        openaiModel: 'gpt-4o',
        geminiApiKey: '',
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

    provider = new OpenAIProvider(mockConfigService, mockTelemetryService);
  });

  describe('Configuration', () => {
    test('devrait avoir le nom correct', () => {
      expect(provider.name).toBe('openai');
    });

    test('devrait avoir la version correcte', () => {
      expect(provider.version).toBe('4o');
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
      expect(provider.config.priority).toBe(90);
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
      expect(tokens).toBe(Math.ceil(28 / 3.2)); // ~9 tokens
    });

    test('devrait mapper les finish reasons', () => {
      expect((provider as any).mapFinishReason('stop')).toBe('stop');
      expect((provider as any).mapFinishReason('length')).toBe('length');
      expect((provider as any).mapFinishReason('content_filter')).toBe('content_filter');
      expect((provider as any).mapFinishReason('function_call')).toBe('function_call');
      expect((provider as any).mapFinishReason(null)).toBe('stop');
      expect((provider as any).mapFinishReason('')).toBe('stop');
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
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there' },
        { role: 'system' as const, content: 'Be helpful' },
      ];

      const converted = (provider as any).convertMessages(messages);
      
      expect(converted).toEqual([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
        { role: 'system', content: 'Be helpful' },
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
      (provider as any).updateMetrics(100, 50, false);
      
      const metrics = provider.getMetrics();
      
      expect(metrics.totalCalls).toBe(1);
      expect(metrics.totalTokens).toBe(50);
      expect(metrics.averageLatency).toBe(100);
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
      (provider as any).updateMetrics(200, 20, false);
      
      const metrics = provider.getMetrics();
      
      expect(metrics.averageLatency).toBe(150); // (100 + 200) / 2
    });
  });

  describe('Configuration et initialisation', () => {
    test('devrait être enabled si une clé API est fournie', () => {
      expect(provider.isEnabled).toBe(true);
    });

    test('devrait avoir la priorité correcte', () => {
      expect(provider.priority).toBe(90);
    });

    test('devrait initialiser correctement avec une clé API', async () => {
      // Le mock devrait permettre l'initialisation
      await expect(provider.initialize()).resolves.not.toThrow();
    });

    test('devrait échouer l\'initialisation sans clé API', async () => {
      mockConfigService.ai.openaiApiKey = '';
      const providerWithoutKey = new OpenAIProvider(mockConfigService, mockTelemetryService);
      
      await expect(providerWithoutKey.initialize()).rejects.toThrow(
        'Clé API OpenAI manquante dans la configuration'
      );
    });
  });
});