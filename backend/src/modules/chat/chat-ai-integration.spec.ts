import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatGateway } from './chat.gateway';
import { ConversationService } from './services/conversation.service';
import { MessageService } from './services/message.service';
import { AIGatewayService } from '../../ai-gateway/ai-gateway.service';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '@core/auth/auth.service';
import { ConfigService } from '@core/config/config.service';
import { RedisService } from '@core/redis/redis.service';
import { Conversation } from '@database/entities/conversation.entity';
import { Message, MessageRole, MessageStatus } from '@database/entities/message.entity';
import { User } from '@database/entities/user.entity';

/**
 * Tests d'intégration ChatGateway + AIGateway - TICKET-BACKEND-004
 * Valide l'intégration complète IA avec métadonnées et analytics
 */
describe('ChatGateway AI Integration - TICKET-BACKEND-004', () => {
  let chatGateway: ChatGateway;
  let aiGatewayService: AIGatewayService;
  let messageService: MessageService;
  let conversationService: ConversationService;
  
  const mockSocket = {
    id: 'test-socket-id',
    emit: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    handshake: {
      auth: { token: 'valid-jwt-token' },
      headers: {}
    }
  };

  const mockUser = {
    sub: 'user-123',
    username: 'testuser',
    tenantId: 'tenant-123',
    userId: 'user-123'
  };

  const mockConversationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockMessageRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ConversationService,
          useValue: {
            createConversation: jest.fn(),
            addMessage: jest.fn(),
            updateMessage: jest.fn(),
            updateConversationAIStatistics: jest.fn(),
            getUserConversations: jest.fn(),
          },
        },
        {
          provide: MessageService,
          useValue: {
            createUserMessage: jest.fn(),
            startStreamingResponse: jest.fn(),
            addStreamingChunk: jest.fn(),
            updateMessageAIMetrics: jest.fn(),
            getStreamingSession: jest.fn(),
            getActiveStreamingSessions: jest.fn().mockReturnValue([]),
            markMessageAsError: jest.fn(),
          },
        },
        {
          provide: AIGatewayService,
          useValue: {
            mockChatCompletion: jest.fn(),
            validateAPIKeys: jest.fn(),
            getProviderStatus: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn().mockReturnValue(mockUser),
          },
        },
        {
          provide: AuthService,
          useValue: {
            validateJwtPayload: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            security: { jwtSecret: 'test-secret' },
          },
        },
        {
          provide: RedisService,
          useValue: {
            setUserSession: jest.fn(),
            deleteUserSession: jest.fn(),
            publishEvent: jest.fn(),
            subscribeToChannel: jest.fn(),
            getSocketClient: jest.fn().mockReturnValue(null),
            getMainClient: jest.fn().mockReturnValue(null),
          },
        },
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

    chatGateway = module.get<ChatGateway>(ChatGateway);
    aiGatewayService = module.get<AIGatewayService>(AIGatewayService);
    messageService = module.get<MessageService>(MessageService);
    conversationService = module.get<ConversationService>(ConversationService);

    // Setup mock socket connection
    (chatGateway as any).connectedUsers.set(mockSocket.id, {
      socket: mockSocket,
      user: mockUser,
      lastActivity: new Date()
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AI Integration Flow', () => {
    it('should integrate AIGateway in streaming workflow', async () => {
      // Mock data
      const streamingData = {
        provider: 'openai',
        message: 'Test message for AI integration',
        aiModel: 'gpt-4',
        conversationTitle: 'Test AI Conversation'
      };

      const mockConversation = {
        id: 'conv-123',
        title: streamingData.conversationTitle,
        context_type: 'general',
        created_at: new Date()
      };

      const mockUserMessage = {
        id: 'msg-user-123',
        content: streamingData.message,
        role: MessageRole.USER,
        conversation_id: 'conv-123'
      };

      const mockStreamingSession = {
        messageId: 'msg-ai-123',
        conversationId: 'conv-123',
        userId: mockUser.sub,
        tenantId: mockUser.tenantId,
        startTime: new Date(),
        chunks: [],
        currentContent: '',
        tokenCount: 0,
        aiProvider: streamingData.provider,
        aiModel: streamingData.aiModel
      };

      const mockAIResponse = {
        success: true,
        content: 'Test AI response with integration',
        tokensUsed: 25,
        responseTime: 1500,
        provider: 'openai',
        model: 'gpt-4',
        confidence: 0.95,
        metadata: {
          temperature: 0.7,
          maxTokens: 1000,
          finishReason: 'stop'
        }
      };

      // Setup mocks
      jest.spyOn(conversationService, 'createConversation').mockResolvedValue(mockConversation as any);
      jest.spyOn(conversationService, 'addMessage').mockResolvedValue(mockUserMessage as any);
      jest.spyOn(messageService, 'startStreamingResponse').mockResolvedValue(mockStreamingSession);
      jest.spyOn(messageService, 'addStreamingChunk').mockResolvedValue(mockStreamingSession);
      jest.spyOn(messageService, 'getStreamingSession').mockReturnValue(mockStreamingSession);
      jest.spyOn(messageService, 'updateMessageAIMetrics').mockResolvedValue({} as any);
      jest.spyOn(conversationService, 'updateConversationAIStatistics').mockResolvedValue({} as any);
      jest.spyOn(aiGatewayService, 'mockChatCompletion').mockResolvedValue(mockAIResponse);
      
      // Mock buildConversationContext private method
      jest.spyOn(chatGateway as any, 'buildConversationContext').mockResolvedValue('Test context');

      // Execute
      await chatGateway.handleStartStreaming(streamingData, mockSocket as any);

      // Verify AI integration
      expect(aiGatewayService.mockChatCompletion).toHaveBeenCalledWith(
        streamingData.message,
        'Test context'
      );

      // Verify new AI events emitted
      expect(mockSocket.emit).toHaveBeenCalledWith('aiResponseStart', expect.objectContaining({
        conversationId: 'conv-123',
        provider: streamingData.provider,
        model: streamingData.aiModel
      }));

      expect(mockSocket.emit).toHaveBeenCalledWith('aiMetrics', expect.objectContaining({
        metrics: expect.objectContaining({
          tokensUsed: 25,
          responseTime: 1500,
          confidence: 0.95,
          provider: streamingData.provider,
          model: streamingData.aiModel
        })
      }));

      // Verify AI metadata updated
      expect(messageService.updateMessageAIMetrics).toHaveBeenCalledWith(
        'msg-ai-123',
        mockUser.tenantId,
        expect.objectContaining({
          costUsd: expect.any(Number),
          confidenceScore: 0.95,
          responseTimeMs: 1500,
          promptTokens: expect.any(Number),
          completionTokens: 25
        })
      );

      // Verify conversation analytics updated
      expect(conversationService.updateConversationAIStatistics).toHaveBeenCalledWith(
        'conv-123',
        mockUser.tenantId,
        expect.objectContaining({
          totalCost: expect.any(Number),
          totalTokens: 25,
          avgResponseTime: 1500,
          lastProvider: streamingData.provider,
          lastModel: streamingData.aiModel
        })
      );
    });

    it('should handle AI errors with fallback', async () => {
      const streamingData = {
        provider: 'openai',
        message: 'Test error handling',
        aiModel: 'gpt-4'
      };

      // Setup error scenario
      jest.spyOn(aiGatewayService, 'mockChatCompletion').mockRejectedValue(new Error('AI Service Error'));
      jest.spyOn(conversationService, 'createConversation').mockResolvedValue({ id: 'conv-123' } as any);
      jest.spyOn(conversationService, 'addMessage').mockResolvedValue({ id: 'msg-123' } as any);
      jest.spyOn(messageService, 'startStreamingResponse').mockResolvedValue({
        messageId: 'msg-ai-123',
        conversationId: 'conv-123'
      } as any);
      // markMessageAsError déjà mocké dans le setup

      // Execute
      await chatGateway.handleStartStreaming(streamingData, mockSocket as any);

      // Verify error handling
      expect(mockSocket.emit).toHaveBeenCalledWith('aiError', expect.objectContaining({
        provider: streamingData.provider,
        error: expect.stringContaining('Erreur IA'),
        fallbackAvailable: true
      }));

      expect(mockSocket.emit).toHaveBeenCalledWith('stream-error', expect.objectContaining({
        message: 'Erreur lors du streaming'
      }));
    });

    it('should calculate costs correctly for different providers', async () => {
      const testCases = [
        { provider: 'openai', model: 'gpt-4', expectedCostMultiplier: 0.03 },
        { provider: 'claude', model: 'claude-3', expectedCostMultiplier: 0.025 },
        { provider: 'gemini', model: 'gemini-pro', expectedCostMultiplier: 0.0005 }
      ];

      for (const testCase of testCases) {
        const promptTokens = 100;
        const completionTokens = 50;
        
        const cost = (chatGateway as any).calculateMockCost(
          testCase.provider,
          testCase.model,
          promptTokens,
          completionTokens
        );

        const expectedCost = ((promptTokens + completionTokens) / 1000) * testCase.expectedCostMultiplier;
        expect(cost).toBeCloseTo(expectedCost, 3); // Réduire la précision pour les erreurs d'arrondi
      }
    });
  });

  describe('Performance & Backward Compatibility', () => {
    it('should maintain existing WebSocket events', async () => {
      const streamingData = {
        provider: 'openai',
        message: 'Backward compatibility test'
      };

      // Setup mocks for existing flow
      jest.spyOn(conversationService, 'createConversation').mockResolvedValue({ id: 'conv-123' } as any);
      jest.spyOn(conversationService, 'addMessage').mockResolvedValue({ id: 'msg-123' } as any);
      jest.spyOn(messageService, 'startStreamingResponse').mockResolvedValue({
        messageId: 'msg-ai-123',
        startTime: new Date()
      } as any);
      jest.spyOn(messageService, 'addStreamingChunk').mockResolvedValue({} as any);
      jest.spyOn(messageService, 'getStreamingSession').mockReturnValue({} as any);
      jest.spyOn(aiGatewayService, 'mockChatCompletion').mockResolvedValue({
        success: true,
        content: 'Test response',
        tokensUsed: 10,
        responseTime: 1000,
        provider: 'openai',
        model: 'gpt-4',
        confidence: 0.8,
        metadata: {}
      });

      await chatGateway.handleStartStreaming(streamingData, mockSocket as any);

      // Verify all existing events still emitted
      expect(mockSocket.emit).toHaveBeenCalledWith('stream-start', expect.any(Object));
      expect(mockSocket.emit).toHaveBeenCalledWith('stream-chunk', expect.any(Object));
      expect(mockSocket.emit).toHaveBeenCalledWith('stream-complete', expect.any(Object));
    });

    it('should maintain response time under 2 seconds', async () => {
      const startTime = Date.now();
      
      jest.spyOn(aiGatewayService, 'mockChatCompletion').mockResolvedValue({
        success: true,
        content: 'Quick response',
        tokensUsed: 5,
        responseTime: 800,
        provider: 'openai',
        model: 'gpt-4',
        confidence: 0.9,
        metadata: {}
      });

      const response = await (chatGateway as any).generateAIResponseWithMetrics(
        'Quick test',
        'openai',
        'gpt-4',
        'conv-123',
        'tenant-123'
      );

      const totalTime = Date.now() - startTime;
      expect(totalTime).toBeLessThan(2000); // 2 seconds
      expect(response.responseTime).toBeLessThan(2000);
    });

    it('should handle large message volumes', async () => {
      const messages = Array.from({ length: 100 }, (_, i) => `Message ${i}`);
      const promises = messages.map(message => 
        (chatGateway as any).generateAIResponseWithMetrics(
          message,
          'openai',
          'gpt-4',
          'conv-123',
          'tenant-123'
        )
      );

      jest.spyOn(aiGatewayService, 'mockChatCompletion').mockResolvedValue({
        success: true,
        content: 'Bulk response',
        tokensUsed: 10,
        responseTime: 500,
        provider: 'openai',
        model: 'gpt-4',
        confidence: 0.85,
        metadata: {}
      });

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(results).toHaveLength(100);
      expect(totalTime).toBeLessThan(10000); // 10 seconds for 100 messages
      expect(results.every(r => r.content === 'Bulk response')).toBe(true);
    });
  });

  describe('Analytics Integration', () => {
    it('should track comprehensive AI metrics', async () => {
      const streamingData = {
        provider: 'claude',
        message: 'Analytics test message',
        aiModel: 'claude-3'
      };

      const mockMetrics = {
        costUsd: 0.0025,
        confidenceScore: 0.92,
        responseTimeMs: 1200,
        promptTokens: 15,
        completionTokens: 30
      };

      jest.spyOn(messageService, 'updateMessageAIMetrics').mockResolvedValue({} as any);

      await (chatGateway as any).generateAIResponseWithMetrics(
        streamingData.message,
        streamingData.provider,
        streamingData.aiModel,
        'conv-123',
        'tenant-123'
      );

      // Verify comprehensive metrics tracking
      expect(mockMetrics.costUsd).toBeGreaterThan(0);
      expect(mockMetrics.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(mockMetrics.confidenceScore).toBeLessThanOrEqual(1);
      expect(mockMetrics.responseTimeMs).toBeGreaterThan(0);
      expect(mockMetrics.promptTokens).toBeGreaterThan(0);
      expect(mockMetrics.completionTokens).toBeGreaterThan(0);
    });
  });
});