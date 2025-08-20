import { Test, TestingModule } from '@nestjs/testing';
import { AIOrchestrator } from '../services/ai-orchestrator.service';
import { OpenAIProvider } from '../providers/openai.provider';
import { AnthropicProvider } from '../providers/anthropic.provider';
import { GeminiProvider } from '../providers/gemini.provider';
import { AIProviderType, ChatRequest, ProviderStatus } from '../providers/base-provider';

describe('AIOrchestrator', () => {
  let orchestrator: AIOrchestrator;
  let mockOpenAI: jest.Mocked<OpenAIProvider>;
  let mockAnthropic: jest.Mocked<AnthropicProvider>;
  let mockGemini: jest.Mocked<GeminiProvider>;

  beforeEach(async () => {
    // Créer des mocks pour les providers
    mockOpenAI = {
      type: AIProviderType.OPENAI,
      name: 'OpenAI GPT',
      initialize: jest.fn(),
      chatCompletion: jest.fn(),
      chatCompletionStream: jest.fn(),
      healthCheck: jest.fn(),
      isAvailable: jest.fn(),
      getStatus: jest.fn(),
      getMetrics: jest.fn(),
      getConfig: jest.fn(),
      canHandleRequest: jest.fn(),
    } as any;

    mockAnthropic = {
      type: AIProviderType.ANTHROPIC,
      name: 'Anthropic Claude',
      initialize: jest.fn(),
      chatCompletion: jest.fn(),
      chatCompletionStream: jest.fn(),
      healthCheck: jest.fn(),
      isAvailable: jest.fn(),
      getStatus: jest.fn(),
      getMetrics: jest.fn(),
      getConfig: jest.fn(),
      canHandleRequest: jest.fn(),
    } as any;

    mockGemini = {
      type: AIProviderType.GEMINI,
      name: 'Google Gemini',
      initialize: jest.fn(),
      chatCompletion: jest.fn(),
      chatCompletionStream: jest.fn(),
      healthCheck: jest.fn(),
      isAvailable: jest.fn(),
      getStatus: jest.fn(),
      getMetrics: jest.fn(),
      getConfig: jest.fn(),
      canHandleRequest: jest.fn(),
    } as any;

    orchestrator = new AIOrchestrator();
  });

  describe('initialization', () => {
    it('devrait initialiser avec succès les providers disponibles', async () => {
      mockOpenAI.initialize.mockResolvedValue(undefined);
      mockAnthropic.initialize.mockResolvedValue(undefined);
      mockGemini.initialize.mockResolvedValue(undefined);

      await orchestrator.initialize('openai-key', 'anthropic-key', 'gemini-key');

      expect(mockOpenAI.initialize).toHaveBeenCalled();
      expect(mockAnthropic.initialize).toHaveBeenCalled();
      expect(mockGemini.initialize).toHaveBeenCalled();
    });

    it('devrait gérer l\'échec d\'initialisation d\'un provider', async () => {
      mockOpenAI.initialize.mockResolvedValue(undefined);
      mockAnthropic.initialize.mockRejectedValue(new Error('Invalid API key'));
      mockGemini.initialize.mockResolvedValue(undefined);

      // Ne devrait pas lever d'erreur même si un provider échoue
      await expect(orchestrator.initialize('openai-key', 'invalid-key', 'gemini-key'))
        .resolves.not.toThrow();
    });

    it('ne devrait pas initialiser de provider sans clé API', async () => {
      await orchestrator.initialize('openai-key', undefined, undefined);

      // Seul OpenAI devrait être initialisé
      expect(mockOpenAI.initialize).toHaveBeenCalled();
    });
  });

  describe('chatCompletion', () => {
    const mockRequest: ChatRequest = {
      messages: [{ role: 'user', content: 'Hello' }],
      tenantId: 'test-tenant',
    };

    beforeEach(async () => {
      // Setup providers disponibles
      mockOpenAI.initialize.mockResolvedValue(undefined);
      mockOpenAI.isAvailable.mockReturnValue(true);
      mockOpenAI.canHandleRequest.mockReturnValue(true);

      mockAnthropic.initialize.mockResolvedValue(undefined);
      mockAnthropic.isAvailable.mockReturnValue(true);
      mockAnthropic.canHandleRequest.mockReturnValue(true);

      await orchestrator.initialize('openai-key', 'anthropic-key');
    });

    it('devrait utiliser le provider préféré quand spécifié', async () => {
      const mockResponse = {
        message: { role: 'assistant' as const, content: 'Hello there!' },
        tokensUsed: 10,
        finishReason: 'stop' as const,
        provider: AIProviderType.ANTHROPIC,
        duration: 500,
      };

      mockAnthropic.chatCompletion.mockResolvedValue(mockResponse);

      const request = { ...mockRequest, preferredProvider: AIProviderType.ANTHROPIC };
      const result = await orchestrator.chatCompletion(request);

      expect(mockAnthropic.chatCompletion).toHaveBeenCalledWith(request);
      expect(result).toEqual(mockResponse);
    });

    it('devrait faire du fallback au prochain provider en cas d\'erreur', async () => {
      mockOpenAI.chatCompletion.mockRejectedValue(new Error('API Error'));
      
      const mockResponse = {
        message: { role: 'assistant' as const, content: 'Hello from Anthropic!' },
        tokensUsed: 12,
        finishReason: 'stop' as const,
        provider: AIProviderType.ANTHROPIC,
        duration: 600,
      };
      mockAnthropic.chatCompletion.mockResolvedValue(mockResponse);

      const result = await orchestrator.chatCompletion(mockRequest);

      expect(mockOpenAI.chatCompletion).toHaveBeenCalled();
      expect(mockAnthropic.chatCompletion).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('devrait lever une erreur si tous les providers échouent', async () => {
      mockOpenAI.chatCompletion.mockRejectedValue(new Error('OpenAI Error'));
      mockAnthropic.chatCompletion.mockRejectedValue(new Error('Anthropic Error'));

      await expect(orchestrator.chatCompletion(mockRequest))
        .rejects.toThrow('Anthropic Error');
    });

    it('devrait respecter l\'ordre de priorité par défaut', async () => {
      mockOpenAI.chatCompletion.mockRejectedValue(new Error('OpenAI Error'));
      
      const mockResponse = {
        message: { role: 'assistant' as const, content: 'Hello!' },
        tokensUsed: 10,
        finishReason: 'stop' as const,
        provider: AIProviderType.ANTHROPIC,
        duration: 500,
      };
      mockAnthropic.chatCompletion.mockResolvedValue(mockResponse);

      await orchestrator.chatCompletion(mockRequest);

      // OpenAI devrait être essayé en premier (priorité plus élevée)
      expect(mockOpenAI.chatCompletion).toHaveBeenCalled();
      expect(mockAnthropic.chatCompletion).toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    beforeEach(async () => {
      mockOpenAI.initialize.mockResolvedValue(undefined);
      mockAnthropic.initialize.mockResolvedValue(undefined);
      
      await orchestrator.initialize('openai-key', 'anthropic-key');
    });

    it('devrait retourner le statut de santé de tous les providers', async () => {
      mockOpenAI.healthCheck.mockResolvedValue(true);
      mockAnthropic.healthCheck.mockResolvedValue(false);

      const results = await orchestrator.healthCheckAll();

      expect(results.get(AIProviderType.OPENAI)).toBe(true);
      expect(results.get(AIProviderType.ANTHROPIC)).toBe(false);
    });

    it('devrait gérer les erreurs de health check', async () => {
      mockOpenAI.healthCheck.mockRejectedValue(new Error('Network error'));
      mockAnthropic.healthCheck.mockResolvedValue(true);

      const results = await orchestrator.healthCheckAll();

      expect(results.get(AIProviderType.OPENAI)).toBe(false);
      expect(results.get(AIProviderType.ANTHROPIC)).toBe(true);
    });
  });

  describe('circuit breaker', () => {
    beforeEach(async () => {
      mockOpenAI.initialize.mockResolvedValue(undefined);
      await orchestrator.initialize('openai-key');
    });

    it('devrait activer le circuit breaker après plusieurs erreurs consécutives', async () => {
      mockOpenAI.isAvailable.mockReturnValue(true);
      mockOpenAI.canHandleRequest.mockReturnValue(true);
      mockOpenAI.chatCompletion.mockRejectedValue(new Error('Persistent Error'));

      // Faire échouer plusieurs fois pour déclencher le circuit breaker
      for (let i = 0; i < 6; i++) {
        try {
          await orchestrator.chatCompletion(mockRequest);
        } catch (e) {
          // Ignorer les erreurs pour ce test
        }
      }

      const stats = orchestrator.getProviderStatus();
      const openaiStats = stats.get(AIProviderType.OPENAI);
      
      // Le circuit breaker devrait être activé après 5 erreurs
      expect(openaiStats?.stats.circuitBreakerOpen).toBe(true);
    });
  });

  const mockRequest: ChatRequest = {
    messages: [{ role: 'user', content: 'Test message' }],
    tenantId: 'test-tenant',
  };
});