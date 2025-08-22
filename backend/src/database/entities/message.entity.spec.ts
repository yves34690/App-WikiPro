import { Message, MessageRole, MessageStatus } from './message.entity';

describe('Message Entity - TICKET-BACKEND-002', () => {
  let message: Message;

  beforeEach(() => {
    message = new Message();
    message.id = 'test-message-id';
    message.tenant_id = 'test-tenant-id';
    message.conversation_id = 'test-conversation-id';
    message.role = MessageRole.ASSISTANT;
    message.content = 'Test response from AI';
    message.ai_provider = 'openai';
    message.ai_model = 'gpt-4';
    message.prompt_tokens = 100;
    message.completion_tokens = 200;
    message.token_count = 300;
  });

  describe('updateAIMetadata', () => {
    it('devrait mettre à jour les métadonnées IA complètes', () => {
      const metadata = {
        costUsd: 0.05,
        confidenceScore: 0.95,
        responseTimeMs: 1500,
        promptTokens: 150,
        completionTokens: 250
      };

      message.updateAIMetadata(metadata);

      expect(message.cost_usd).toBe(0.05);
      expect(message.confidence_score).toBe(0.95);
      expect(message.confidence).toBe(0.95); // Maintien de la cohérence
      expect(message.response_time_ms).toBe(1500);
      expect(message.prompt_tokens).toBe(150);
      expect(message.completion_tokens).toBe(250);
      expect(message.token_count).toBe(400);
      expect(message.updated_at).toBeInstanceOf(Date);
    });

    it('devrait mettre à jour seulement les champs fournis', () => {
      const originalCost = message.cost_usd;
      const originalConfidence = message.confidence_score;

      message.updateAIMetadata({
        responseTimeMs: 2000
      });

      expect(message.response_time_ms).toBe(2000);
      expect(message.cost_usd).toBe(originalCost);
      expect(message.confidence_score).toBe(originalConfidence);
    });
  });

  describe('calculateCost', () => {
    it('devrait calculer le coût pour un modèle OpenAI GPT-4', () => {
      message.ai_provider = 'openai';
      message.ai_model = 'gpt-4';
      message.prompt_tokens = 1000;
      message.completion_tokens = 2000;

      const cost = message.calculateCost();
      
      // GPT-4: $0.01 input, $0.03 output pour 1K tokens
      // 1000 tokens * $0.01 + 2000 tokens * $0.03 = $0.01 + $0.06 = $0.07
      expect(cost).toBeCloseTo(0.07, 4);
    });

    it('devrait calculer le coût pour un modèle Anthropic Claude-3-Opus', () => {
      message.ai_provider = 'anthropic';
      message.ai_model = 'claude-3-opus';
      message.prompt_tokens = 1000;
      message.completion_tokens = 1500;

      const cost = message.calculateCost();
      
      // Claude-3-Opus: $0.015 input, $0.075 output pour 1K tokens
      // 1000 tokens * $0.015 + 1500 tokens * $0.075 = $0.015 + $0.1125 = $0.1275
      expect(cost).toBeCloseTo(0.1275, 4);
    });

    it('devrait utiliser la tarification par défaut pour un modèle inconnu', () => {
      message.ai_provider = 'unknown';
      message.ai_model = 'unknown-model';
      message.prompt_tokens = 1000;
      message.completion_tokens = 1000;

      const cost = message.calculateCost();
      
      // Tarif par défaut: $0.001 input, $0.002 output pour 1K tokens
      // 1000 tokens * $0.001 + 1000 tokens * $0.002 = $0.001 + $0.002 = $0.003
      expect(cost).toBeCloseTo(0.003, 4);
    });

    it('devrait retourner 0 si les informations requises sont manquantes', () => {
      message.prompt_tokens = null;
      
      const cost = message.calculateCost();
      
      expect(cost).toBe(0);
    });
  });

  describe('hasCompleteAIMetrics', () => {
    it('devrait retourner true si toutes les métriques IA sont présentes', () => {
      message.ai_provider = 'openai';
      message.ai_model = 'gpt-4';
      message.prompt_tokens = 100;
      message.completion_tokens = 200;
      message.response_time_ms = 1500;
      message.cost_usd = 0.05;

      expect(message.hasCompleteAIMetrics()).toBe(true);
    });

    it('devrait retourner false si des métriques IA sont manquantes', () => {
      message.ai_provider = 'openai';
      message.ai_model = 'gpt-4';
      message.prompt_tokens = 100;
      message.completion_tokens = 200;
      // response_time_ms et cost_usd manquants
      message.response_time_ms = null;
      message.cost_usd = null;

      expect(message.hasCompleteAIMetrics()).toBe(false);
    });

    it('devrait retourner false si le provider IA est manquant', () => {
      message.ai_provider = null;
      message.ai_model = 'gpt-4';
      message.prompt_tokens = 100;
      message.completion_tokens = 200;
      message.response_time_ms = 1500;
      message.cost_usd = 0.05;

      expect(message.hasCompleteAIMetrics()).toBe(false);
    });
  });

  describe('getModelPricing (private method behavior)', () => {
    it('devrait calculer correctement pour différents modèles OpenAI', () => {
      // Test GPT-3.5-turbo
      message.ai_provider = 'openai';
      message.ai_model = 'gpt-3.5-turbo';
      message.prompt_tokens = 1000;
      message.completion_tokens = 1000;

      const costGpt35 = message.calculateCost();
      expect(costGpt35).toBeCloseTo(0.003, 4); // $0.001 + $0.002

      // Test GPT-4-turbo
      message.ai_model = 'gpt-4-turbo';
      const costGpt4Turbo = message.calculateCost();
      expect(costGpt4Turbo).toBeCloseTo(0.04, 4); // $0.01 + $0.03
    });

    it('devrait calculer correctement pour différents modèles Anthropic', () => {
      message.ai_provider = 'anthropic';
      message.prompt_tokens = 1000;
      message.completion_tokens = 1000;

      // Test Claude-3-Haiku
      message.ai_model = 'claude-3-haiku';
      const costHaiku = message.calculateCost();
      expect(costHaiku).toBeCloseTo(0.0015, 4); // $0.00025 + $0.00125

      // Test Claude-3-Sonnet
      message.ai_model = 'claude-3-sonnet';
      const costSonnet = message.calculateCost();
      expect(costSonnet).toBeCloseTo(0.018, 4); // $0.003 + $0.015
    });
  });

  describe('Legacy methods compatibility - TICKET-BACKEND-002', () => {
    it('updateTokenStats devrait toujours fonctionner', () => {
      const promptTokens = 150;
      const completionTokens = 250;

      message.updateTokenStats(promptTokens, completionTokens);

      expect(message.prompt_tokens).toBe(150);
      expect(message.completion_tokens).toBe(250);
      expect(message.token_count).toBe(400);
      expect(message.updated_at).toBeInstanceOf(Date);
    });

    it('estimateTokenCount devrait toujours fonctionner', () => {
      message.content = 'This is a test message with some content';
      message.token_count = null; // Réinitialiser pour forcer l'estimation
      
      const estimated = message.estimateTokenCount();
      
      // Estimation: 4 caractères = 1 token
      const expectedTokens = Math.ceil(message.content.length / 4);
      expect(estimated).toBe(expectedTokens);
    });

    it('devrait retourner token_count existant si disponible', () => {
      message.token_count = 500;
      message.content = 'Short text';
      
      const estimated = message.estimateTokenCount();
      
      expect(estimated).toBe(500);
    });
  });
});