import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationService } from './conversation.service';
import { Conversation } from '@database/entities/conversation.entity';
import { Message, MessageRole } from '@database/entities/message.entity';
import { User } from '@database/entities/user.entity';

describe('ConversationService - TICKET-BACKEND-002', () => {
  let service: ConversationService;
  let conversationRepository: Repository<Conversation>;
  let messageRepository: Repository<Message>;

  const mockConversationRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockMessageRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationService,
        {
          provide: getRepositoryToken(Conversation),
          useValue: mockConversationRepository,
        },
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ConversationService>(ConversationService);
    conversationRepository = module.get<Repository<Conversation>>(getRepositoryToken(Conversation));
    messageRepository = module.get<Repository<Message>>(getRepositoryToken(Message));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getConversationStats', () => {
    it('devrait retourner les statistiques détaillées d\'une conversation', async () => {
      const conversationId = 'test-conv-id';
      const tenantId = 'test-tenant-id';

      const mockConversation = {
        id: conversationId,
        tenant_id: tenantId,
        is_active: true
      };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
        getRawMany: jest.fn(),
      };

      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock des résultats de requête
      mockQueryBuilder.getRawOne.mockResolvedValue({
        messagecount: '15',
        totaltokens: '7500',
        totalcost: '2.50',
        avgresponsetime: '1800.5',
        lastmessageat: new Date('2024-01-15T10:30:00Z')
      });

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([ // providerStats
          { 
            provider: 'openai', 
            messagecount: '10', 
            totalcost: '1.80', 
            avgresponsetime: '1600.0' 
          },
          { 
            provider: 'anthropic', 
            messagecount: '5', 
            totalcost: '0.70', 
            avgresponsetime: '2200.0' 
          }
        ])
        .mockResolvedValueOnce([ // modelStats
          { 
            model: 'gpt-4', 
            messagecount: '8', 
            totalcost: '1.60', 
            avgconfidencescore: '0.94' 
          },
          { 
            model: 'claude-3', 
            messagecount: '7', 
            totalcost: '0.90', 
            avgconfidencescore: '0.96' 
          }
        ]);

      const result = await service.getConversationStats(conversationId, tenantId);

      expect(result).toMatchObject({
        conversationId,
        messageCount: 15,
        totalTokens: 7500,
        totalCostUsd: 2.50,
        avgResponseTimeMs: 1801,
        lastMessageAt: expect.any(Date),
        unreadCount: 0,
        providerStats: expect.arrayContaining([
          expect.objectContaining({ 
            provider: 'openai', 
            messageCount: 10, 
            totalCost: 1.80,
            avgResponseTime: 1600
          }),
          expect.objectContaining({ 
            provider: 'anthropic', 
            messageCount: 5, 
            totalCost: 0.70,
            avgResponseTime: 2200
          })
        ]),
        modelStats: expect.arrayContaining([
          expect.objectContaining({ 
            model: 'gpt-4', 
            messageCount: 8, 
            totalCost: 1.60,
            avgConfidenceScore: 0.94
          })
        ])
      });
    });

    it('devrait lever une erreur si la conversation n\'existe pas', async () => {
      mockConversationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getConversationStats('invalid-id', 'tenant-id')
      ).rejects.toThrow('Conversation non trouvée');
    });
  });

  describe('getTenantAnalytics', () => {
    it('devrait retourner les analytics agrégées pour un tenant', async () => {
      const tenantId = 'test-tenant-id';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
        getRawMany: jest.fn(),
      };

      mockConversationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock des statistiques globales
      mockQueryBuilder.getRawOne.mockResolvedValue({
        totalconversations: '25',
        totalmessages: '150',
        totaltokens: '75000',
        totalcost: '12.50',
        avgresponsetime: '1750.0',
        avgconfidencescore: '0.93'
      });

      // Mock des répartitions
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([ // providerBreakdown
          { 
            provider: 'openai', 
            conversationcount: '15', 
            messagecount: '90',
            totalcost: '8.00',
            avgresponsetime: '1600.0'
          },
          { 
            provider: 'anthropic', 
            conversationcount: '10', 
            messagecount: '60',
            totalcost: '4.50',
            avgresponsetime: '1900.0'
          }
        ])
        .mockResolvedValueOnce([ // modelBreakdown
          { 
            model: 'gpt-4', 
            messagecount: '70',
            totalcost: '6.50',
            avgconfidencescore: '0.94'
          },
          { 
            model: 'claude-3-sonnet', 
            messagecount: '50',
            totalcost: '3.80',
            avgconfidencescore: '0.96'
          }
        ])
        .mockResolvedValueOnce([ // dailyStats
          { 
            date: '2024-01-15', 
            conversationcount: '5',
            messagecount: '30',
            totalcost: '2.50',
            avgresponsetime: '1700.0'
          }
        ]);

      const result = await service.getTenantAnalytics(tenantId, startDate, endDate);

      expect(result).toMatchObject({
        tenantId,
        startDate,
        endDate,
        totalConversations: 25,
        totalMessages: 150,
        totalTokens: 75000,
        totalCostUsd: 12.50,
        avgMessagesPerConversation: 6,
        avgCostPerConversation: 0.5,
        avgResponseTime: 1750,
        avgConfidenceScore: 0.93,
        providerBreakdown: expect.arrayContaining([
          expect.objectContaining({
            provider: 'openai',
            conversationCount: 15,
            messageCount: 90,
            totalCost: 8.00,
            avgResponseTime: 1600,
            marketShare: 60 // 90/150 * 100
          })
        ]),
        modelBreakdown: expect.arrayContaining([
          expect.objectContaining({
            model: 'gpt-4',
            messageCount: 70,
            totalCost: 6.50,
            avgConfidenceScore: 0.94,
            usage: expect.closeTo(46.67, 1) // 70/150 * 100
          })
        ])
      });
    });
  });

  describe('recalculateConversationMetrics', () => {
    it('devrait recalculer toutes les métriques IA pour une conversation', async () => {
      const conversationId = 'test-conv-id';
      const tenantId = 'test-tenant-id';

      const mockConversation = {
        id: conversationId,
        tenant_id: tenantId,
        is_active: true,
        message_count: 0,
        total_tokens: 0,
        token_count: 0,
        total_cost_usd: 0,
        avg_response_time_ms: null
      };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      };

      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      mockMessageRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockConversationRepository.save.mockResolvedValue(mockConversation);

      mockQueryBuilder.getRawOne.mockResolvedValue({
        messagecount: '12',
        totaltokens: '6000',
        totalcost: '3.75',
        avgresponsetime: '1650.5'
      });

      const result = await service.recalculateConversationMetrics(conversationId, tenantId);

      expect(result.message_count).toBe(12);
      expect(result.total_tokens).toBe(6000);
      expect(result.token_count).toBe(6000);
      expect(result.total_cost_usd).toBe(3.75);
      expect(result.avg_response_time_ms).toBe(1651);
      expect(mockConversationRepository.save).toHaveBeenCalledWith(mockConversation);
    });
  });

  describe('getTopCostConversations', () => {
    it('devrait retourner les conversations avec les coûts les plus élevés', async () => {
      const tenantId = 'test-tenant-id';
      const limit = 5;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
      };

      const mockConversations = [
        { 
          id: 'conv1', 
          title: 'Conversation coûteuse 1', 
          total_cost_usd: 15.75, 
          message_count: 50 
        },
        { 
          id: 'conv2', 
          title: 'Conversation coûteuse 2', 
          total_cost_usd: 12.30, 
          message_count: 35 
        }
      ];

      mockConversationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getMany.mockResolvedValue(mockConversations);

      const result = await service.getTopCostConversations(tenantId, limit);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        conversation: mockConversations[0],
        totalCost: 15.75,
        messageCount: 50
      });
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(limit);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('conversation.total_cost_usd', 'DESC');
    });
  });

  describe('getCostSummaryByPeriod', () => {
    it('devrait retourner le résumé des coûts par jour', async () => {
      const tenantId = 'test-tenant-id';
      const period = 'day';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-07');

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      };

      const mockResults = [
        { 
          period: '2024-01-01', 
          totalcost: '2.50', 
          conversationcount: '3', 
          messagecount: '15' 
        },
        { 
          period: '2024-01-02', 
          totalcost: '3.75', 
          conversationcount: '5', 
          messagecount: '22' 
        }
      ];

      mockConversationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getRawMany.mockResolvedValue(mockResults);

      const result = await service.getCostSummaryByPeriod(tenantId, period, startDate, endDate);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        period: '2024-01-01',
        totalCost: 2.50,
        conversationCount: 3,
        messageCount: 15
      });
      expect(result[1]).toMatchObject({
        period: '2024-01-02',
        totalCost: 3.75,
        conversationCount: 5,
        messageCount: 22
      });
    });

    it('devrait utiliser le format de période correct pour les semaines', async () => {
      const tenantId = 'test-tenant-id';
      const period = 'week';
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockConversationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getCostSummaryByPeriod(tenantId, period, startDate, endDate);

      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        "TO_CHAR(conversation.created_at, 'YYYY-WW') as period",
        'COUNT(DISTINCT conversation.id) as conversationCount',
        'COUNT(message.id) as messageCount',
        'COALESCE(SUM(message.cost_usd), 0) as totalCost'
      ]);
    });
  });
});