import { Conversation } from './conversation.entity';
import { Message, MessageRole } from './message.entity';

describe('Conversation Entity - TICKET-BACKEND-002', () => {
  let conversation: Conversation;
  let mockMessageRepository: any;

  beforeEach(() => {
    conversation = new Conversation();
    conversation.id = 'test-conversation-id';
    conversation.tenant_id = 'test-tenant-id';
    conversation.user_id = 'test-user-id';
    conversation.title = 'Test Conversation';
    conversation.message_count = 0;
    conversation.token_count = 0;
    conversation.total_tokens = 0;
    conversation.total_cost_usd = 0;
    conversation.avg_response_time_ms = null;

    // Mock du message repository pour les tests
    mockMessageRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn()
      })
    };
  });

  describe('updateAIAnalytics', () => {
    it('devrait mettre à jour les analytics IA après ajout d\'un message', () => {
      const message = {
        cost_usd: 0.05,
        token_count: 300,
        role: MessageRole.ASSISTANT,
        response_time_ms: 1500
      };

      conversation.updateAIAnalytics(message);

      expect(conversation.total_cost_usd).toBe(0.05);
      expect(conversation.total_tokens).toBe(300);
      expect(conversation.token_count).toBe(300); // Maintien de la cohérence
      expect(conversation.last_message_at).toBeInstanceOf(Date);
      expect(conversation.updated_at).toBeInstanceOf(Date);
    });

    it('devrait accumuler les coûts et tokens lors de messages multiples', () => {
      const message1 = {
        cost_usd: 0.03,
        token_count: 200,
        role: MessageRole.ASSISTANT
      };

      const message2 = {
        cost_usd: 0.07,
        token_count: 400,
        role: MessageRole.ASSISTANT
      };

      conversation.updateAIAnalytics(message1);
      conversation.updateAIAnalytics(message2);

      expect(conversation.total_cost_usd).toBe(0.10);
      expect(conversation.total_tokens).toBe(600);
    });

    it('ne devrait pas planter si certaines métriques sont manquantes', () => {
      const message = {
        role: MessageRole.USER
        // cost_usd et token_count manquants
      };

      expect(() => {
        conversation.updateAIAnalytics(message);
      }).not.toThrow();

      expect(conversation.total_cost_usd).toBe(0);
      expect(conversation.total_tokens).toBe(0);
    });
  });

  describe('recalculateAvgResponseTime', () => {
    it('devrait recalculer le temps de réponse moyen des IA', async () => {
      const mockQueryBuilder = mockMessageRepository.createQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue({
        avg_time: 1750.5
      });

      await conversation.recalculateAvgResponseTime(mockMessageRepository);

      expect(conversation.avg_response_time_ms).toBe(1751); // Arrondi
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('AVG(message.response_time_ms)', 'avg_time');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('message.conversation_id = :conversationId', { 
        conversationId: conversation.id 
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('message.response_time_ms IS NOT NULL');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('message.role = :role', { role: 'assistant' });
    });

    it('devrait définir avg_response_time_ms à null si aucune donnée', async () => {
      const mockQueryBuilder = mockMessageRepository.createQueryBuilder();
      mockQueryBuilder.getRawOne.mockResolvedValue({
        avg_time: null
      });

      await conversation.recalculateAvgResponseTime(mockMessageRepository);

      expect(conversation.avg_response_time_ms).toBeNull();
    });
  });

  describe('getAIStats', () => {
    it('devrait retourner les statistiques IA complètes', () => {
      conversation.total_cost_usd = 5.75;
      conversation.total_tokens = 12000;
      conversation.avg_response_time_ms = 1800;
      conversation.message_count = 25;

      const stats = conversation.getAIStats();

      expect(stats).toMatchObject({
        totalCost: 5.75,
        totalTokens: 12000,
        avgResponseTime: 1800,
        messageCount: 25,
        costPerMessage: 0.23 // 5.75 / 25
      });
    });

    it('devrait gérer les valeurs nulles/undefined', () => {
      conversation.total_cost_usd = null;
      conversation.total_tokens = null;
      conversation.avg_response_time_ms = null;
      conversation.message_count = 0;

      const stats = conversation.getAIStats();

      expect(stats).toMatchObject({
        totalCost: 0,
        totalTokens: 0,
        avgResponseTime: null,
        messageCount: 0,
        costPerMessage: 0
      });
    });

    it('devrait éviter la division par zéro pour costPerMessage', () => {
      conversation.total_cost_usd = 10.50;
      conversation.message_count = 0;

      const stats = conversation.getAIStats();

      expect(stats.costPerMessage).toBe(0);
    });
  });

  describe('isOverCostThreshold', () => {
    it('devrait retourner true si le coût dépasse le seuil par défaut (1.0 USD)', () => {
      conversation.total_cost_usd = 1.50;

      expect(conversation.isOverCostThreshold()).toBe(true);
    });

    it('devrait retourner false si le coût est en dessous du seuil par défaut', () => {
      conversation.total_cost_usd = 0.75;

      expect(conversation.isOverCostThreshold()).toBe(false);
    });

    it('devrait utiliser un seuil personnalisé', () => {
      conversation.total_cost_usd = 2.50;

      expect(conversation.isOverCostThreshold(3.0)).toBe(false);
      expect(conversation.isOverCostThreshold(2.0)).toBe(true);
    });

    it('devrait gérer les valeurs nulles/undefined', () => {
      conversation.total_cost_usd = null;

      expect(conversation.isOverCostThreshold()).toBe(false);
    });
  });

  describe('estimateNextMessageCost', () => {
    it('devrait estimer le coût du prochain message basé sur l\'historique', () => {
      conversation.message_count = 20;
      conversation.total_cost_usd = 4.00;

      const estimatedCost = conversation.estimateNextMessageCost();

      expect(estimatedCost).toBe(0.20); // 4.00 / 20
    });

    it('devrait retourner le coût par défaut pour une nouvelle conversation', () => {
      conversation.message_count = 0;
      conversation.total_cost_usd = 0;

      const estimatedCost = conversation.estimateNextMessageCost();

      expect(estimatedCost).toBe(0.01);
    });

    it('devrait retourner le coût par défaut si aucun coût total', () => {
      conversation.message_count = 10;
      conversation.total_cost_usd = null;

      const estimatedCost = conversation.estimateNextMessageCost();

      expect(estimatedCost).toBe(0.01);
    });

    it('devrait éviter la division par zéro', () => {
      conversation.message_count = 0;
      conversation.total_cost_usd = 5.00;

      const estimatedCost = conversation.estimateNextMessageCost();

      expect(estimatedCost).toBe(0.01);
    });
  });

  describe('Legacy methods compatibility - TICKET-BACKEND-002', () => {
    it('incrementMessageCount devrait toujours fonctionner', () => {
      const initialCount = conversation.message_count;
      const initialTime = conversation.last_message_at;

      conversation.incrementMessageCount();

      expect(conversation.message_count).toBe(initialCount + 1);
      expect(conversation.last_message_at).toBeInstanceOf(Date);
      expect(conversation.updated_at).toBeInstanceOf(Date);
      expect(conversation.last_message_at.getTime()).toBeGreaterThan(
        initialTime?.getTime() || 0
      );
    });

    it('updateLastMessageTime devrait toujours fonctionner', () => {
      const initialTime = conversation.updated_at;

      conversation.updateLastMessageTime();

      expect(conversation.last_message_at).toBeInstanceOf(Date);
      expect(conversation.updated_at).toBeInstanceOf(Date);
      expect(conversation.updated_at.getTime()).toBeGreaterThanOrEqual(
        initialTime?.getTime() || 0
      );
    });

    it('generateAutoTitle devrait toujours fonctionner', () => {
      const longContent = 'This is a very long message that should be truncated to fit the title length limit of fifty characters maximum';
      
      const title = conversation.generateAutoTitle(longContent);
      
      expect(title.length).toBeLessThanOrEqual(50);
      expect(title).toContain('This is a very long message');
    });

    it('canAccess devrait toujours fonctionner avec les nouveaux champs', () => {
      conversation.user_id = 'user-123';
      conversation.tenant_id = 'tenant-456';
      conversation.is_active = true;

      expect(conversation.canAccess('user-123', 'tenant-456')).toBe(true);
      expect(conversation.canAccess('user-999', 'tenant-456')).toBe(false);
      expect(conversation.canAccess('user-123', 'tenant-999')).toBe(false);
    });
  });
});