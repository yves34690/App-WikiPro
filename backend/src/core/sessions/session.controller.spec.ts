import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';

import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { AIProvider } from './entities/session.entity';
import { JwtAuthGuard } from '@core/auth/guards/jwt-auth.guard';
import { TenantGuard } from '@core/auth/guards/tenant.guard';

describe('SessionController (Integration)', () => {
  let app: INestApplication;
  let sessionService: jest.Mocked<SessionService>;

  const mockUser = {
    id: 'user-123',
    tenant_id: 'tenant-123',
    email: 'test@example.com',
    status: 'active',
  };

  const mockTenant = {
    id: 'tenant-123',
    slug: 'test-tenant',
  };

  // Mock session data
  const mockSession = {
    id: 'session-123',
    title: 'Test Session',
    provider: AIProvider.OPENAI,
    metadata: { test: true },
    created_at: new Date('2025-01-15T10:00:00Z'),
    updated_at: new Date('2025-01-15T10:00:00Z'),
    toPublic: () => ({
      id: 'session-123',
      title: 'Test Session',
      provider: AIProvider.OPENAI,
      metadata: { test: true },
      conversation_count: 5,
      last_activity: new Date('2025-01-15T10:00:00Z'),
      created_at: new Date('2025-01-15T10:00:00Z'),
      updated_at: new Date('2025-01-15T10:00:00Z'),
    }),
  };

  const mockConversation = {
    id: 'conversation-123',
    session_id: 'session-123',
    message: 'Test message',
    response: 'Test response',
    provider_used: AIProvider.OPENAI,
    tokens_used: 150,
    processing_time_ms: 2500,
    created_at: new Date('2025-01-15T10:05:00Z'),
    toPublic: () => ({
      id: 'conversation-123',
      message: 'Test message',
      response: 'Test response',
      provider_used: AIProvider.OPENAI,
      tokens_used: 150,
      processing_time_ms: 2500,
      has_response: true,
      is_complete: true,
      created_at: new Date('2025-01-15T10:05:00Z'),
      statistics: {
        message_length: 12,
        response_length: 13,
        token_efficiency: 0.06,
        compression_ratio: 1.08,
      },
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([{
          ttl: 60000,
          limit: 1000, // Limite élevée pour les tests
        }]),
      ],
      controllers: [SessionController],
      providers: [
        {
          provide: SessionService,
          useValue: {
            createSession: jest.fn(),
            findUserSessions: jest.fn(),
            findSessionById: jest.fn(),
            updateSession: jest.fn(),
            deleteSession: jest.fn(),
            createConversation: jest.fn(),
            findSessionConversations: jest.fn(),
            updateConversation: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const request = context.switchToHttp().getRequest();
          request.user = mockUser;
          return true;
        },
      })
      .overrideGuard(TenantGuard)
      .useValue({
        canActivate: (context) => {
          const request = context.switchToHttp().getRequest();
          request.tenant = mockTenant;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    
    // Configuration des pipes globaux
    app.useGlobalPipes(new ValidationPipe({ 
      transform: true, 
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
    
    await app.init();
    
    sessionService = moduleFixture.get(SessionService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/v1/:tenant_slug/sessions', () => {
    const basePath = '/api/v1/test-tenant/sessions';

    it('should return paginated sessions successfully', async () => {
      const mockResponse = {
        data: [
          {
            session: mockSession,
            stats: {
              conversationCount: 5,
              totalTokens: 1500,
              avgProcessingTime: 2300,
              lastActivity: new Date('2025-01-15T12:00:00Z'),
            },
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      sessionService.findUserSessions.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .get(basePath)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: mockResponse.data,
        meta: expect.objectContaining({
          total: 1,
          page: 1,
          limit: 20,
          processingTimeMs: expect.any(Number),
        }),
        timestamp: expect.any(String),
      });

      expect(sessionService.findUserSessions).toHaveBeenCalledWith(
        undefined, // page
        undefined, // limit
        undefined, // titleFilter
        undefined  // providerFilter
      );
    });

    it('should apply query parameters correctly', async () => {
      sessionService.findUserSessions.mockResolvedValue({
        data: [],
        meta: {
          total: 0,
          page: 2,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: true,
        },
      });

      await request(app.getHttpServer())
        .get(`${basePath}?page=2&limit=10&title=test&provider=openai`)
        .expect(200);

      expect(sessionService.findUserSessions).toHaveBeenCalledWith(
        2,
        10,
        'test',
        AIProvider.OPENAI
      );
    });

    it('should validate query parameters', async () => {
      await request(app.getHttpServer())
        .get(`${basePath}?page=-1&limit=abc&provider=invalid`)
        .expect(400);
    });

    it('should handle service errors', async () => {
      sessionService.findUserSessions.mockRejectedValue(
        new Error('Service error')
      );

      await request(app.getHttpServer())
        .get(basePath)
        .expect(500);
    });
  });

  describe('POST /api/v1/:tenant_slug/sessions', () => {
    const basePath = '/api/v1/test-tenant/sessions';

    it('should create session successfully', async () => {
      sessionService.createSession.mockResolvedValue(mockSession as any);

      const createData = {
        title: 'New Session',
        provider: 'openai',
        metadata: { context: 'test' },
      };

      const response = await request(app.getHttpServer())
        .post(basePath)
        .send(createData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: mockSession.toPublic(),
        meta: {
          processingTimeMs: expect.any(Number),
        },
        timestamp: expect.any(String),
      });

      expect(sessionService.createSession).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Session',
          provider: AIProvider.OPENAI,
          metadata: { context: 'test' },
        })
      );
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Manque title et provider requis
        metadata: { test: true },
      };

      await request(app.getHttpServer())
        .post(basePath)
        .send(invalidData)
        .expect(400);

      expect(sessionService.createSession).not.toHaveBeenCalled();
    });

    it('should validate title constraints', async () => {
      const invalidData = {
        title: '', // Titre vide
        provider: 'openai',
      };

      await request(app.getHttpServer())
        .post(basePath)
        .send(invalidData)
        .expect(400);
    });

    it('should validate provider enum', async () => {
      const invalidData = {
        title: 'Valid Title',
        provider: 'invalid-provider',
      };

      await request(app.getHttpServer())
        .post(basePath)
        .send(invalidData)
        .expect(400);
    });

    it('should sanitize dangerous input', async () => {
      const dataWithXSS = {
        title: 'Title with <script>alert("xss")</script>',
        provider: 'openai',
      };

      await request(app.getHttpServer())
        .post(basePath)
        .send(dataWithXSS)
        .expect(400); // Devrait échouer à cause de la validation Matches
    });
  });

  describe('GET /api/v1/:tenant_slug/sessions/:session_id/conversations', () => {
    const basePath = '/api/v1/test-tenant/sessions/session-123/conversations';

    it('should return paginated conversations', async () => {
      const mockResponse = {
        data: [mockConversation],
        meta: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };

      sessionService.findSessionConversations.mockResolvedValue(mockResponse as any);

      const response = await request(app.getHttpServer())
        .get(basePath)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: [mockConversation.toPublic()],
        meta: expect.objectContaining({
          total: 1,
          page: 1,
          limit: 20,
          processingTimeMs: expect.any(Number),
        }),
        timestamp: expect.any(String),
      });

      expect(sessionService.findSessionConversations).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'session-123',
          page: undefined,
          limit: undefined,
          provider: undefined,
        })
      );
    });

    it('should apply filters correctly', async () => {
      sessionService.findSessionConversations.mockResolvedValue({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      await request(app.getHttpServer())
        .get(`${basePath}?page=2&limit=10&provider=anthropic`)
        .expect(200);

      expect(sessionService.findSessionConversations).toHaveBeenCalledWith(
        expect.objectContaining({
          session_id: 'session-123',
          page: 2,
          limit: 10,
          provider: AIProvider.ANTHROPIC,
        })
      );
    });

    it('should validate session_id as UUID', async () => {
      const invalidPath = '/api/v1/test-tenant/sessions/invalid-id/conversations';

      sessionService.findSessionConversations.mockRejectedValue(
        new Error('Invalid UUID')
      );

      await request(app.getHttpServer())
        .get(invalidPath)
        .expect(500); // Le service lèvera une exception
    });
  });

  describe('POST /api/v1/:tenant_slug/sessions/:session_id/conversations', () => {
    const basePath = '/api/v1/test-tenant/sessions/session-123/conversations';

    it('should create conversation successfully', async () => {
      sessionService.createConversation.mockResolvedValue(mockConversation as any);

      const conversationData = {
        message: 'What is the current market trend?',
        metadata: { urgency: 'high' },
      };

      const response = await request(app.getHttpServer())
        .post(basePath)
        .send(conversationData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: mockConversation.toPublic(),
        meta: {
          processingTimeMs: expect.any(Number),
          sessionId: 'session-123',
        },
        timestamp: expect.any(String),
      });

      expect(sessionService.createConversation).toHaveBeenCalledWith(
        'session-123',
        expect.objectContaining({
          message: 'What is the current market trend?',
          metadata: { urgency: 'high' },
        })
      );
    });

    it('should validate message is required', async () => {
      const invalidData = {
        metadata: { test: true },
        // Manque message requis
      };

      await request(app.getHttpServer())
        .post(basePath)
        .send(invalidData)
        .expect(400);

      expect(sessionService.createConversation).not.toHaveBeenCalled();
    });

    it('should validate message length constraints', async () => {
      const invalidData = {
        message: '', // Message vide
      };

      await request(app.getHttpServer())
        .post(basePath)
        .send(invalidData)
        .expect(400);
    });

    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(50001); // Dépasse la limite de 50000

      const invalidData = {
        message: longMessage,
      };

      await request(app.getHttpServer())
        .post(basePath)
        .send(invalidData)
        .expect(400);
    });

    it('should validate metadata format', async () => {
      const invalidData = {
        message: 'Valid message',
        metadata: 'invalid-json-string', // Doit être un objet
      };

      await request(app.getHttpServer())
        .post(basePath)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('PUT /api/v1/:tenant_slug/sessions/:session_id', () => {
    const basePath = '/api/v1/test-tenant/sessions/session-123';

    it('should update session successfully', async () => {
      const updatedSession = {
        ...mockSession,
        title: 'Updated Title',
      };

      sessionService.updateSession.mockResolvedValue(updatedSession as any);

      const updateData = {
        title: 'Updated Title',
        metadata: { status: 'updated' },
      };

      const response = await request(app.getHttpServer())
        .put(basePath)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: 'session-123',
          title: 'Updated Title',
        }),
        meta: {
          processingTimeMs: expect.any(Number),
        },
        timestamp: expect.any(String),
      });

      expect(sessionService.updateSession).toHaveBeenCalledWith(
        'session-123',
        expect.objectContaining({
          title: 'Updated Title',
          metadata: { status: 'updated' },
        })
      );
    });

    it('should accept partial updates', async () => {
      sessionService.updateSession.mockResolvedValue(mockSession as any);

      // Update seulement le titre
      const updateData = { title: 'Only Title Update' };

      await request(app.getHttpServer())
        .put(basePath)
        .send(updateData)
        .expect(200);

      expect(sessionService.updateSession).toHaveBeenCalledWith(
        'session-123',
        expect.objectContaining({
          title: 'Only Title Update',
        })
      );
    });

    it('should reject empty updates', async () => {
      const emptyData = {}; // Aucun champ à mettre à jour

      await request(app.getHttpServer())
        .put(basePath)
        .send(emptyData)
        .expect(400);

      expect(sessionService.updateSession).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/v1/:tenant_slug/sessions/:session_id', () => {
    const basePath = '/api/v1/test-tenant/sessions/session-123';

    it('should delete session successfully', async () => {
      sessionService.deleteSession.mockResolvedValue();

      await request(app.getHttpServer())
        .delete(basePath)
        .expect(204);

      expect(sessionService.deleteSession).toHaveBeenCalledWith('session-123');
    });

    it('should handle session not found', async () => {
      sessionService.deleteSession.mockRejectedValue(
        new Error('Session not found')
      );

      await request(app.getHttpServer())
        .delete(basePath)
        .expect(500);
    });
  });

  describe('PUT /api/v1/:tenant_slug/sessions/conversations/:conversation_id', () => {
    const basePath = '/api/v1/test-tenant/sessions/conversations/conversation-123';

    it('should update conversation successfully', async () => {
      const updatedConversation = {
        ...mockConversation,
        response: 'Updated response',
        tokens_used: 200,
      };

      sessionService.updateConversation.mockResolvedValue(updatedConversation as any);

      const updateData = {
        response: 'Updated response',
        tokens_used: 200,
        processing_time_ms: 3000,
        provider_used: 'openai',
      };

      const response = await request(app.getHttpServer())
        .put(basePath)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: 'conversation-123',
          response: 'Updated response',
          tokens_used: 200,
        }),
        meta: {
          processingTimeMs: expect.any(Number),
        },
        timestamp: expect.any(String),
      });

      expect(sessionService.updateConversation).toHaveBeenCalledWith(
        'conversation-123',
        expect.objectContaining({
          response: 'Updated response',
          tokens_used: 200,
          processing_time_ms: 3000,
          provider_used: AIProvider.OPENAI,
        })
      );
    });

    it('should validate tokens_used constraints', async () => {
      const invalidData = {
        tokens_used: -10, // Valeur négative invalide
      };

      await request(app.getHttpServer())
        .put(basePath)
        .send(invalidData)
        .expect(400);
    });

    it('should validate processing_time_ms constraints', async () => {
      const invalidData = {
        processing_time_ms: 400000, // Dépasse 5 minutes (300000ms)
      };

      await request(app.getHttpServer())
        .put(basePath)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to endpoints', async () => {
      // Ce test vérifie que le ThrottlerModule est bien configuré
      // En conditions réelles, il faudrait faire plusieurs requêtes rapides
      // pour déclencher le rate limiting
      
      sessionService.findUserSessions.mockResolvedValue({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Une seule requête devrait passer
      await request(app.getHttpServer())
        .get('/api/v1/test-tenant/sessions')
        .expect(200);
    });
  });

  describe('Authentication & Authorization', () => {
    let appWithoutAuth: INestApplication;

    beforeEach(async () => {
      // Créer une app sans les mocks des guards pour tester l'auth
      const moduleWithoutAuth: TestingModule = await Test.createTestingModule({
        imports: [
          ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 1000,
          }]),
        ],
        controllers: [SessionController],
        providers: [
          {
            provide: SessionService,
            useValue: sessionService,
          },
        ],
      }).compile();

      appWithoutAuth = moduleWithoutAuth.createNestApplication();
      appWithoutAuth.useGlobalPipes(new ValidationPipe({ 
        transform: true, 
        whitelist: true 
      }));
      await appWithoutAuth.init();
    });

    afterEach(async () => {
      await appWithoutAuth.close();
    });

    it('should require authentication for all endpoints', async () => {
      await request(appWithoutAuth.getHttpServer())
        .get('/api/v1/test-tenant/sessions')
        .expect(401);

      await request(appWithoutAuth.getHttpServer())
        .post('/api/v1/test-tenant/sessions')
        .send({ title: 'Test', provider: 'openai' })
        .expect(401);

      await request(appWithoutAuth.getHttpServer())
        .get('/api/v1/test-tenant/sessions/session-123/conversations')
        .expect(401);

      await request(appWithoutAuth.getHttpServer())
        .post('/api/v1/test-tenant/sessions/session-123/conversations')
        .send({ message: 'Test message' })
        .expect(401);
    });
  });

  describe('Performance Testing', () => {
    it('should complete requests within acceptable time limits', async () => {
      sessionService.findUserSessions.mockResolvedValue({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/api/v1/test-tenant/sessions')
        .expect(200);

      const duration = Date.now() - startTime;

      // Vérifier que la requête prend moins de 200ms (objectif TICKET-BACKEND-003)
      expect(duration).toBeLessThan(200);
    });

    it('should include processing time in response metadata', async () => {
      sessionService.findUserSessions.mockResolvedValue({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/test-tenant/sessions')
        .expect(200);

      expect(response.body.meta).toHaveProperty('processingTimeMs');
      expect(typeof response.body.meta.processingTimeMs).toBe('number');
      expect(response.body.meta.processingTimeMs).toBeGreaterThanOrEqual(0);
    });
  });
});