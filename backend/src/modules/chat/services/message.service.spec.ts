import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageService } from './message.service';
import { ConversationService } from './conversation.service';
import { Message, MessageRole, MessageStatus } from '@database/entities/message.entity';

describe('MessageService - TICKET-BACKEND-002', () => {
  let service: MessageService;
  let messageRepository: Repository<Message>;
  let conversationService: ConversationService;

  const mockMessageRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockConversationService = {
    addMessage: jest.fn(),
    updateMessage: jest.fn(),
    getConversationById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        {
          provide: ConversationService,
          useValue: mockConversationService,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    messageRepository = module.get<Repository<Message>>(getRepositoryToken(Message));
    conversationService = module.get<ConversationService>(ConversationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateMessageAIMetrics', () => {
    it('devrait mettre à jour les métriques IA d\'un message', async () => {
      const messageId = 'test-message-id';
      const tenantId = 'test-tenant-id';
      const metrics = {
        costUsd: 0.05,
        confidenceScore: 0.95,
        responseTimeMs: 1500,
        promptTokens: 100,
        completionTokens: 200
      };

      const mockMessage = {
        id: messageId,
        tenant_id: tenantId,
        ai_provider: 'openai',
        ai_model: 'gpt-4',
        prompt_tokens: 100,
        completion_tokens: 200,
        cost_usd: 0,
        updateAIMetadata: jest.fn(),
        calculateCost: jest.fn().mockReturnValue(0.04)
      };

      mockMessageRepository.findOne.mockResolvedValue(mockMessage);
      mockMessageRepository.save.mockResolvedValue(mockMessage);

      const result = await service.updateMessageAIMetrics(messageId, tenantId, metrics);

      expect(mockMessageRepository.findOne).toHaveBeenCalledWith({
        where: { id: messageId, tenant_id: tenantId }
      });
      expect(mockMessage.updateAIMetadata).toHaveBeenCalledWith(metrics);
      expect(result).toBe(mockMessage);
    });

    it('devrait lever une erreur si le message n\'existe pas', async () => {
      mockMessageRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateMessageAIMetrics('invalid-id', 'tenant-id', {})
      ).rejects.toThrow('Message non trouvé');
    });

    it('devrait calculer automatiquement le coût si pas fourni', async () => {
      const messageId = 'test-message-id';
      const tenantId = 'test-tenant-id';
      const metrics = {
        promptTokens: 100,
        completionTokens: 200
      };

      const mockMessage = {
        id: messageId,
        tenant_id: tenantId,
        ai_provider: 'openai',
        ai_model: 'gpt-4',
        prompt_tokens: 100,
        completion_tokens: 200,
        cost_usd: 0,
        updateAIMetadata: jest.fn(),
        calculateCost: jest.fn().mockReturnValue(0.03)
      };

      mockMessageRepository.findOne.mockResolvedValue(mockMessage);
      mockMessageRepository.save.mockResolvedValue(mockMessage);

      await service.updateMessageAIMetrics(messageId, tenantId, metrics);

      expect(mockMessage.calculateCost).toHaveBeenCalled();
      expect(mockMessage.cost_usd).toBe(0.03);
    });
  });

  describe('getCostMetrics', () => {
    it('devrait retourner les métriques de coût pour un tenant', async () => {
      const tenantId = 'test-tenant-id';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
        getRawMany: jest.fn(),
      };

      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock des résultats de requête
      mockQueryBuilder.getRawOne.mockResolvedValue({
        totalcost: '1.50',
        messagecount: '10',
        totaltokens: '5000'
      });

      mockQueryBuilder.getRawMany.mockResolvedValueOnce([
        { provider: 'openai', totalcost: '1.00', messagecount: '6' },
        { provider: 'anthropic', totalcost: '0.50', messagecount: '4' }
      ]).mockResolvedValueOnce([
        { model: 'gpt-4', totalcost: '0.80', messagecount: '4', avgcostpermessage: '0.20' },
        { model: 'claude-3', totalcost: '0.70', messagecount: '6', avgcostpermessage: '0.12' }
      ]).mockResolvedValueOnce([
        { date: '2024-01-15', totalcost: '0.75', messagecount: '5' },
        { date: '2024-01-16', totalcost: '0.75', messagecount: '5' }
      ]);

      const result = await service.getCostMetrics(tenantId, startDate, endDate);

      expect(result).toMatchObject({
        totalCostUsd: 1.50,
        avgCostPerMessage: 0.15,
        avgCostPerToken: 0.0003,
        costByProvider: expect.arrayContaining([
          expect.objectContaining({ provider: 'openai', totalCost: 1.00, percentage: expect.any(Number) }),
          expect.objectContaining({ provider: 'anthropic', totalCost: 0.50 })
        ])
      });
    });
  });

  describe('getPerformanceMetrics', () => {
    it('devrait retourner les métriques de performance pour un tenant', async () => {
      const tenantId = 'test-tenant-id';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
        getRawMany: jest.fn(),
      };

      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock des résultats de requête
      mockQueryBuilder.getRawOne.mockResolvedValue({
        avgresponsetime: '1500.5',
        avgconfidencescore: '0.95',
        medianresponsetime: '1400.0',
        p95responsetime: '2000.0'
      });

      mockQueryBuilder.getRawMany.mockResolvedValue([
        { 
          provider: 'openai', 
          avgresponsetime: '1200.0', 
          avgconfidencescore: '0.96',
          messagecount: '5'
        }
      ]);

      const result = await service.getPerformanceMetrics(tenantId, startDate, endDate);

      expect(result).toMatchObject({
        avgResponseTimeMs: 1501,
        medianResponseTimeMs: 1400,
        p95ResponseTimeMs: 2000,
        avgConfidenceScore: 0.95,
        performanceByProvider: expect.arrayContaining([
          expect.objectContaining({ 
            provider: 'openai', 
            avgResponseTime: 1200,
            avgConfidenceScore: 0.96,
            messageCount: 5
          })
        ])
      });
    });
  });

  describe('recalculateMissingCosts', () => {
    it('devrait recalculer les coûts manquants pour un tenant', async () => {
      const tenantId = 'test-tenant-id';

      const messagesWithoutCost = [
        {
          id: 'msg1',
          ai_provider: 'openai',
          ai_model: 'gpt-4',
          prompt_tokens: 100,
          completion_tokens: 200,
          cost_usd: 0,
          calculateCost: jest.fn().mockReturnValue(0.05)
        },
        {
          id: 'msg2',
          ai_provider: 'anthropic',
          ai_model: 'claude-3',
          prompt_tokens: 150,
          completion_tokens: 250,
          cost_usd: 0,
          calculateCost: jest.fn().mockReturnValue(0.08)
        }
      ];

      mockMessageRepository.find.mockResolvedValue(messagesWithoutCost);
      mockMessageRepository.save.mockResolvedValue({});

      const result = await service.recalculateMissingCosts(tenantId);

      expect(result).toBe(2);
      expect(messagesWithoutCost[0].cost_usd).toBe(0.05);
      expect(messagesWithoutCost[1].cost_usd).toBe(0.08);
      expect(mockMessageRepository.save).toHaveBeenCalledTimes(2);
    });

    it('ne devrait pas mettre à jour les messages avec coût calculé à zéro', async () => {
      const tenantId = 'test-tenant-id';

      const messagesWithoutCost = [
        {
          id: 'msg1',
          ai_provider: null,
          ai_model: null,
          prompt_tokens: 0,
          completion_tokens: 0,
          cost_usd: 0,
          calculateCost: jest.fn().mockReturnValue(0)
        }
      ];

      mockMessageRepository.find.mockResolvedValue(messagesWithoutCost);

      const result = await service.recalculateMissingCosts(tenantId);

      expect(result).toBe(0);
      expect(mockMessageRepository.save).not.toHaveBeenCalled();
    });
  });
});