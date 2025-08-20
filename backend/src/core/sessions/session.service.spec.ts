import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { REQUEST } from '@nestjs/core';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { SessionService } from './session.service';
import { Session, AIProvider } from './entities/session.entity';
import { Conversation } from './entities/conversation.entity';
import { User, UserRole, UserStatus } from '@core/entities/user.entity';
import {
  CreateSessionDto,
  UpdateSessionDto,
  CreateConversationDto,
  ConversationQueryDto,
} from './dto';

describe('SessionService', () => {
  let service: SessionService;
  let sessionRepository: jest.Mocked<Repository<Session>>;
  let conversationRepository: jest.Mocked<Repository<Conversation>>;
  let mockRequest: any;

  const mockUser: User = {
    id: 'user-123',
    tenant_id: 'tenant-123',
    email: 'test@example.com',
    name: 'Test User',
    status: UserStatus.ACTIVE,
    role: UserRole.USER,
  } as User;

  const mockTenant = {
    id: 'tenant-123',
    slug: 'test-tenant',
  };

  beforeEach(async () => {
    // Mock request avec user et tenant
    mockRequest = {
      user: mockUser,
      tenant: mockTenant,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: getRepositoryToken(Session),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Conversation),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
    sessionRepository = module.get(getRepositoryToken(Session));
    conversationRepository = module.get(getRepositoryToken(Conversation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSession', () => {
    const validCreateSessionDto = new CreateSessionDto({
      title: 'Test Session',
      provider: AIProvider.OPENAI,
      metadata: { context: 'test' },
    });

    it('should create a session successfully', async () => {
      const mockSession = {
        id: 'session-123',
        user_id: mockUser.id,
        title: 'Test Session',
        provider: AIProvider.OPENAI,
        metadata: expect.any(Object),
        created_at: new Date(),
        updated_at: new Date(),
      };

      sessionRepository.create.mockReturnValue(mockSession as Session);
      sessionRepository.save.mockResolvedValue(mockSession as Session);

      const result = await service.createSession(validCreateSessionDto);

      expect(sessionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUser.id,
          title: 'Test Session',
          provider: AIProvider.OPENAI,
          metadata: expect.objectContaining({
            context: 'test',
            created_by: mockUser.id,
            tenant_id: mockTenant.id,
          }),
        })
      );

      expect(sessionRepository.save).toHaveBeenCalledWith(mockSession);
      expect(result).toEqual(mockSession);
    });

    it('should throw BadRequestException for invalid data', async () => {
      const invalidDto = new CreateSessionDto({
        title: '', // Titre vide invalide
        provider: AIProvider.OPENAI,
      });

      await expect(service.createSession(invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw ForbiddenException if user not authenticated', async () => {
      mockRequest.user = null;

      await expect(service.createSession(validCreateSessionDto)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should handle repository errors', async () => {
      sessionRepository.create.mockReturnValue({} as Session);
      sessionRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createSession(validCreateSessionDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('findUserSessions', () => {
    it('should return paginated sessions with stats', async () => {
      const mockSessions = [
        {
          id: 'session-1',
          title: 'Session 1',
          provider: AIProvider.OPENAI,
          created_at: new Date(),
        },
        {
          id: 'session-2',
          title: 'Session 2',
          provider: AIProvider.ANTHROPIC,
          created_at: new Date(),
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockSessions, 2]),
      };

      sessionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Mock pour getSessionStatistics
      jest.spyOn(service as any, 'getSessionStatistics').mockResolvedValue({
        conversationCount: 5,
        totalTokens: 1000,
        avgProcessingTime: 2500,
        lastActivity: new Date(),
      });

      const result = await service.findUserSessions(1, 20);

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.data[0]).toHaveProperty('session');
      expect(result.data[0]).toHaveProperty('stats');

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'session.user_id = :userId',
        { userId: mockUser.id }
      );
    });

    it('should apply filters correctly', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      sessionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findUserSessions(1, 20, 'test title', AIProvider.OPENAI);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'session.title ILIKE :titleFilter',
        { titleFilter: '%test title%' }
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'session.provider = :provider',
        { provider: AIProvider.OPENAI }
      );
    });

    it('should validate and correct pagination parameters', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      sessionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Test avec paramètres invalides
      await service.findUserSessions(-1, 150); // page négative, limit trop élevé

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0); // page corrigée à 1
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20); // limit corrigé à défaut
    });
  });

  describe('findSessionById', () => {
    it('should return session if found and belongs to user', async () => {
      const mockSession = {
        id: 'session-123',
        user_id: mockUser.id,
        title: 'Test Session',
        conversations: [],
      };

      sessionRepository.findOne.mockResolvedValue(mockSession as Session);

      const result = await service.findSessionById('session-123');

      expect(sessionRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'session-123',
          user_id: mockUser.id,
        },
        relations: ['conversations'],
      });

      expect(result).toEqual(mockSession);
    });

    it('should throw NotFoundException if session not found', async () => {
      sessionRepository.findOne.mockResolvedValue(null);

      await expect(service.findSessionById('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException for invalid UUID', async () => {
      await expect(service.findSessionById('invalid-uuid')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('updateSession', () => {
    const validUpdateDto = new UpdateSessionDto({
      title: 'Updated Title',
      metadata: { status: 'updated' },
    });

    it('should update session successfully', async () => {
      const existingSession = {
        id: 'session-123',
        user_id: mockUser.id,
        title: 'Old Title',
        metadata: { old: 'value' },
      };

      const updatedSession = {
        ...existingSession,
        title: 'Updated Title',
        metadata: { old: 'value', status: 'updated', updated_at: expect.any(String) },
      };

      // Mock findSessionById
      jest.spyOn(service, 'findSessionById')
        .mockResolvedValueOnce(existingSession as Session)
        .mockResolvedValueOnce(updatedSession as Session);

      sessionRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateSession('session-123', validUpdateDto);

      expect(sessionRepository.update).toHaveBeenCalledWith('session-123', {
        title: 'Updated Title',
        metadata: expect.objectContaining({
          old: 'value',
          status: 'updated',
          updated_at: expect.any(String),
        }),
      });

      expect(result).toEqual(updatedSession);
    });

    it('should throw BadRequestException for invalid update data', async () => {
      const invalidDto = new UpdateSessionDto({
        title: '', // Titre vide invalide
      });

      await expect(
        service.updateSession('session-123', invalidDto)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteSession', () => {
    it('should delete session successfully', async () => {
      const mockSession = {
        id: 'session-123',
        user_id: mockUser.id,
      };

      jest.spyOn(service, 'findSessionById').mockResolvedValue(mockSession as Session);
      sessionRepository.remove.mockResolvedValue(mockSession as Session);

      await service.deleteSession('session-123');

      expect(service.findSessionById).toHaveBeenCalledWith('session-123');
      expect(sessionRepository.remove).toHaveBeenCalledWith(mockSession);
    });

    it('should handle repository errors during deletion', async () => {
      const mockSession = { id: 'session-123', user_id: mockUser.id };

      jest.spyOn(service, 'findSessionById').mockResolvedValue(mockSession as Session);
      sessionRepository.remove.mockRejectedValue(new Error('Database error'));

      await expect(service.deleteSession('session-123')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('createConversation', () => {
    const validCreateConversationDto = new CreateConversationDto({
      message: 'Test message for conversation',
      metadata: { context: 'test' },
    });

    it('should create conversation successfully', async () => {
      const mockSession = {
        id: 'session-123',
        user_id: mockUser.id,
        provider: AIProvider.OPENAI,
      };

      const mockConversation = {
        id: 'conversation-123',
        session_id: 'session-123',
        message: 'Test message for conversation',
        metadata: expect.any(Object),
        created_at: new Date(),
      };

      jest.spyOn(service, 'findSessionById').mockResolvedValue(mockSession as Session);
      conversationRepository.create.mockReturnValue(mockConversation as Conversation);
      conversationRepository.save.mockResolvedValue(mockConversation as Conversation);

      const result = await service.createConversation(
        'session-123',
        validCreateConversationDto
      );

      expect(conversationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'session-123',
          message: 'Test message for conversation',
          metadata: expect.objectContaining({
            context: 'test',
            session_provider: AIProvider.OPENAI,
          }),
        })
      );

      expect(result).toEqual(mockConversation);
    });

    it('should throw BadRequestException for invalid conversation data', async () => {
      const invalidDto = new CreateConversationDto({
        message: '', // Message vide invalide
      });

      await expect(
        service.createConversation('session-123', invalidDto)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findSessionConversations', () => {
    const validQueryDto = new ConversationQueryDto({
      session_id: 'session-123',
      page: 1,
      limit: 20,
    });

    it('should return paginated conversations', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          session_id: 'session-123',
          message: 'Message 1',
          response: 'Response 1',
          created_at: new Date(),
        },
      ];

      jest.spyOn(service, 'findSessionById').mockResolvedValue({
        id: 'session-123',
        user_id: mockUser.id,
      } as Session);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockConversations, 1]),
      };

      conversationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findSessionConversations(validQueryDto);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'conversation.session_id = :sessionId',
        { sessionId: 'session-123' }
      );
    });

    it('should apply provider filter if specified', async () => {
      const queryWithFilter = new ConversationQueryDto({
        session_id: 'session-123',
        provider: AIProvider.OPENAI,
      });

      jest.spyOn(service, 'findSessionById').mockResolvedValue({
        id: 'session-123',
        user_id: mockUser.id,
      } as Session);

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      conversationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.findSessionConversations(queryWithFilter);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'conversation.provider_used = :provider',
        { provider: AIProvider.OPENAI }
      );
    });
  });

  describe('getSessionStatistics', () => {
    it('should calculate session statistics correctly', async () => {
      const mockStats = {
        conversation_count: '5',
        total_tokens: '1500',
        avg_processing_time: '2300.5',
        last_activity: new Date('2025-01-15T10:00:00Z'),
      };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockStats),
      };

      conversationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getSessionStatistics('session-123');

      expect(result).toEqual({
        conversationCount: 5,
        totalTokens: 1500,
        avgProcessingTime: 2301, // Arrondi
        lastActivity: mockStats.last_activity,
      });
    });

    it('should return default values on error', async () => {
      conversationRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await service.getSessionStatistics('session-123');

      expect(result.conversationCount).toBe(0);
      expect(result.totalTokens).toBe(0);
      expect(result.avgProcessingTime).toBe(0);
      expect(result.lastActivity).toBeInstanceOf(Date);
    });
  });

  describe('updateConversation', () => {
    it('should update conversation successfully', async () => {
      const mockConversation = {
        id: 'conv-123',
        session: {
          id: 'session-123',
          user_id: mockUser.id,
        },
        metadata: { existing: 'data' },
      };

      const updateDto = {
        response: 'Updated response',
        tokens_used: 150,
        processing_time_ms: 2500,
        provider_used: AIProvider.OPENAI,
        metadata: { new: 'data' },
      } as any;

      conversationRepository.findOne.mockResolvedValue(mockConversation as any);
      conversationRepository.update.mockResolvedValue({ affected: 1 } as any);
      conversationRepository.findOne.mockResolvedValueOnce({
        ...mockConversation,
        ...updateDto,
      } as any);

      const result = await service.updateConversation('conv-123', updateDto);

      expect(conversationRepository.update).toHaveBeenCalledWith('conv-123', {
        response: 'Updated response',
        provider_used: AIProvider.OPENAI,
        tokens_used: 150,
        processing_time_ms: 2500,
        metadata: expect.objectContaining({
          existing: 'data',
          new: 'data',
          updated_at_iso: expect.any(String),
        }),
      });
    });

    it('should throw NotFoundException if conversation not found', async () => {
      conversationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateConversation('nonexistent', {} as any)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the session', async () => {
      const mockConversation = {
        id: 'conv-123',
        session: {
          id: 'session-123',
          user_id: 'other-user-id', // Différent user
        },
      };

      conversationRepository.findOne.mockResolvedValue(mockConversation as any);

      await expect(
        service.updateConversation('conv-123', {} as any)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // Tests pour les méthodes privées
  describe('private methods', () => {
    it('should validate UUID format correctly', () => {
      // Accès aux méthodes privées pour tests
      const isValidUUID = (service as any).isValidUUID;

      expect(isValidUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(isValidUUID('invalid-uuid')).toBe(false);
      expect(isValidUUID('')).toBe(false);
      expect(isValidUUID(null)).toBe(false);
    });

    it('should throw ForbiddenException if tenant not identified', () => {
      mockRequest.tenant = null;

      const getCurrentTenantId = () => (service as any).getCurrentTenantId();
      expect(getCurrentTenantId).toThrow(ForbiddenException);
    });
  });
});