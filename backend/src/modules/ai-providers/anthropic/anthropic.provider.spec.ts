import { AnthropicProvider } from './anthropic.provider';
import { ConfigService } from '@core/config/config.service';
import { TelemetryService } from '@core/telemetry/telemetry.service';

describe('AnthropicProvider', () => {
  let provider: AnthropicProvider;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockTelemetryService: jest.Mocked<TelemetryService>;

  beforeEach(() => {
    mockConfigService = {
      ai: {
        openaiApiKey: '',
        openaiModel: 'gpt-4o',
        geminiApiKey: '',
        geminiModel: 'gemini-2.5-flash-002',
        anthropicApiKey: 'test-anthropic-key',
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

    provider = new AnthropicProvider(mockConfigService, mockTelemetryService);
  });

  describe('Configuration', () => {
    test('devrait avoir le nom correct', () => {
      expect(provider.name).toBe('anthropic');
    });

    test('devrait avoir la version correcte', () => {
      expect(provider.version).toBe('3.5');
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
      expect(provider.config.priority).toBe(95);
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
      expect(tokens).toBe(Math.ceil(28 / 3.5)); // ~8 tokens pour Claude
    });

    test('devrait mapper les stop reasons', () => {
      expect((provider as any).mapStopReason('end_turn')).toBe('stop');
      expect((provider as any).mapStopReason('max_tokens')).toBe('length');
      expect((provider as any).mapStopReason('stop_sequence')).toBe('stop');
      expect((provider as any).mapStopReason(null)).toBe('stop');
      expect((provider as any).mapStopReason('unknown')).toBe('stop');
    });

    test('devrait construire les messages correctement', () => {
      const request = {
        prompt: 'Test prompt',
        systemPrompt: 'System instruction',
      };

      const messages = (provider as any).buildMessages(request);
      
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual({
        role: 'user',
        content: 'Test prompt'
      });
    });

    test('devrait convertir les messages de chat avec system', () => {
      const messages = [
        { role: 'system' as const, content: 'Be helpful' },
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there' },
      ];

      const result = (provider as any).convertMessages(messages);
      
      expect(result.systemMessage).toBe('Be helpful');
      expect(result.messages).toEqual([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
      ]);
    });

    test('devrait convertir les messages de chat sans system', () => {
      const messages = [
        { role: 'user' as const, content: 'Hello' },
        { role: 'assistant' as const, content: 'Hi there' },
      ];

      const result = (provider as any).convertMessages(messages);
      
      expect(result.systemMessage).toBeUndefined();
      expect(result.messages).toEqual([
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there' },
      ]);
    });

    test('devrait extraire le texte du contenu', () => {
      const content = [
        { type: 'text', text: 'Hello ' },
        { type: 'text', text: 'world!' },
        { type: 'image', data: 'base64...' },
      ];

      const text = (provider as any).extractTextFromContent(content);
      
      expect(text).toBe('Hello world!');
    });

    test('devrait gérer un contenu vide', () => {
      const content = [];
      const text = (provider as any).extractTextFromContent(content);
      
      expect(text).toBe('');
    });

    test('devrait gérer un contenu sans texte', () => {
      const content = [
        { type: 'image', data: 'base64...' },
      ];

      const text = (provider as any).extractTextFromContent(content);
      
      expect(text).toBe('');
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
      (provider as any).updateMetrics(120, 60, false);
      
      const metrics = provider.getMetrics();
      
      expect(metrics.totalCalls).toBe(1);
      expect(metrics.totalTokens).toBe(60);
      expect(metrics.averageLatency).toBe(120);
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
      (provider as any).updateMetrics(150, 10, false);
      (provider as any).updateMetrics(250, 20, false);
      
      const metrics = provider.getMetrics();
      
      expect(metrics.averageLatency).toBe(200); // (150 + 250) / 2
    });
  });

  describe('Configuration et initialisation', () => {
    test('devrait être enabled si une clé API est fournie', () => {
      expect(provider.isEnabled).toBe(true);
    });

    test('devrait avoir la priorité correcte', () => {
      expect(provider.priority).toBe(95);
    });

    test('devrait initialiser correctement avec une clé API', async () => {
      // Le mock devrait permettre l'initialisation
      await expect(provider.initialize()).resolves.not.toThrow();
    });

    test('devrait échouer l\'initialisation sans clé API', async () => {
      mockConfigService.ai.anthropicApiKey = '';
      const providerWithoutKey = new AnthropicProvider(mockConfigService, mockTelemetryService);
      
      await expect(providerWithoutKey.initialize()).rejects.toThrow(
        'Clé API Anthropic manquante dans la configuration'
      );
    });
  });

  describe('Comparaison avec autres providers', () => {
    test('devrait avoir une estimation de tokens différente', () => {
      const text = 'Bonjour, comment allez-vous?'; // 28 caractères
      const anthropicTokens = (provider as any).estimateTokens(text);
      
      // Claude: ~3.5 caractères par token = 8 tokens
      // OpenAI: ~3.2 caractères par token = 9 tokens  
      // Gemini: ~4 caractères par token = 7 tokens
      expect(anthropicTokens).toBe(8);
      
      // Vérification que c'est entre Gemini et OpenAI
      const openaiTokens = Math.ceil(text.length / 3.2);
      const geminiTokens = Math.ceil(text.length / 4);
      expect(anthropicTokens).toBeGreaterThan(geminiTokens);
      expect(anthropicTokens).toBeLessThan(openaiTokens);
    });

    test('devrait avoir une priorité entre Gemini et OpenAI', () => {
      // Gemini: 100, Anthropic: 95, OpenAI: 90
      expect(provider.config.priority).toBe(95);
      expect(provider.config.priority).toBeLessThan(100); // < Gemini
      expect(provider.config.priority).toBeGreaterThan(90); // > OpenAI
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

  describe('Spécificités Anthropic', () => {
    test('devrait séparer les messages système', () => {
      const messages = [
        { role: 'system' as const, content: 'Be helpful' },
        { role: 'user' as const, content: 'Hello' },
      ];

      const result = (provider as any).convertMessages(messages);
      
      // System prompt séparé
      expect(result.systemMessage).toBe('Be helpful');
      // Message système exclu des messages normaux
      expect(result.messages.find((m: any) => m.role === 'system')).toBeUndefined();
    });

    test('devrait utiliser le modèle Claude configuré', () => {
      expect(mockConfigService.ai.anthropicModel).toBe('claude-3-5-sonnet-20241022');
    });

    test('ne devrait pas supporter les embeddings', () => {
      expect(provider.capabilities.embedding).toBe(false);
    });

    test('ne devrait pas supporter la génération d\'images', () => {
      expect(provider.capabilities.imageGeneration).toBe(false);
    });

    test('devrait supporter le function calling', () => {
      expect(provider.capabilities.functionCalling).toBe(true);
    });

    test('devrait supporter le streaming', () => {
      expect(provider.capabilities.streaming).toBe(true);
    });
  });
});