import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as request from 'supertest';

import { AppModule } from '../../../app.module';
import { Session, AIProvider } from '../entities/session.entity';
import { Conversation } from '../entities/conversation.entity';
import { User, UserRole, UserStatus } from '@core/entities/user.entity';
import { Tenant } from '@core/entities/tenant.entity';

describe('Sessions Tenant Isolation (E2E)', () => {
  let app: INestApplication;
  let sessionRepository: Repository<Session>;
  let conversationRepository: Repository<Conversation>;
  let userRepository: Repository<User>;
  let tenantRepository: Repository<Tenant>;

  // Données de test multi-tenant
  const tenant1 = {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'tenant-1',
    name: 'Tenant 1',
    is_active: true,
  };

  const tenant2 = {
    id: '22222222-2222-2222-2222-222222222222',
    slug: 'tenant-2',
    name: 'Tenant 2',
    is_active: true,
  };

  const user1Tenant1 = {
    id: 'user1-t1-id',
    tenant_id: tenant1.id,
    email: 'user1@tenant1.com',
    name: 'User 1 Tenant 1',
    password_hash: 'hashed_password',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
  };

  const user2Tenant1 = {
    id: 'user2-t1-id',
    tenant_id: tenant1.id,
    email: 'user2@tenant1.com',
    name: 'User 2 Tenant 1',
    password_hash: 'hashed_password',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
  };

  const user1Tenant2 = {
    id: 'user1-t2-id',
    tenant_id: tenant2.id,
    email: 'user1@tenant2.com',
    name: 'User 1 Tenant 2',
    password_hash: 'hashed_password',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
  };

  let jwtTokenTenant1User1: string;
  let jwtTokenTenant1User2: string;
  let jwtTokenTenant2User1: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Obtenir les repositories
    sessionRepository = app.get('SessionRepository');
    conversationRepository = app.get('ConversationRepository');
    userRepository = app.get('UserRepository');
    tenantRepository = app.get('TenantRepository');
  });

  beforeEach(async () => {
    // Nettoyer les données existantes
    await conversationRepository.delete({});
    await sessionRepository.delete({});
    await userRepository.delete({});
    await tenantRepository.delete({});

    // Créer les tenants et users de test
    await tenantRepository.save([tenant1, tenant2]);
    await userRepository.save([user1Tenant1, user2Tenant1, user1Tenant2]);

    // Simuler l'obtention de tokens JWT (en réalité via /auth/login)
    // Pour ce test, nous utiliserons des tokens mockés
    jwtTokenTenant1User1 = 'mock-jwt-tenant1-user1';
    jwtTokenTenant1User2 = 'mock-jwt-tenant1-user2';
    jwtTokenTenant2User1 = 'mock-jwt-tenant2-user1';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Session Isolation Tests', () => {
    it('should isolate sessions by tenant - users cannot see other tenants sessions', async () => {
      // Créer une session pour Tenant 1 User 1
      const sessionT1U1 = await sessionRepository.save({
        user_id: user1Tenant1.id,
        title: 'Session Tenant 1 User 1',
        provider: AIProvider.OPENAI,
        metadata: { tenant: 'tenant-1' },
      });

      // Créer une session pour Tenant 2 User 1
      const sessionT2U1 = await sessionRepository.save({
        user_id: user1Tenant2.id,
        title: 'Session Tenant 2 User 1',
        provider: AIProvider.ANTHROPIC,
        metadata: { tenant: 'tenant-2' },
      });

      // Test 1: User Tenant 1 ne peut voir que ses sessions
      const mockTenant1Request = (req: any) => {
        req.user = user1Tenant1;
        req.tenant = tenant1;
        return true;
      };

      // Mock l'authentification pour Tenant 1
      jest.spyOn(app.get('JwtAuthGuard'), 'canActivate').mockImplementation(mockTenant1Request);
      jest.spyOn(app.get('TenantGuard'), 'canActivate').mockImplementation(mockTenant1Request);

      const responseTenant1 = await request(app.getHttpServer())
        .get(`/api/v1/${tenant1.slug}/sessions`)
        .set('Authorization', `Bearer ${jwtTokenTenant1User1}`)
        .expect(200);

      // Vérifier que seules les sessions du tenant 1 sont retournées
      expect(responseTenant1.body.data).toHaveLength(1);
      expect(responseTenant1.body.data[0].session.id).toBe(sessionT1U1.id);
      expect(responseTenant1.body.data[0].session.title).toBe('Session Tenant 1 User 1');

      // Test 2: User Tenant 2 ne peut voir que ses sessions
      const mockTenant2Request = (req: any) => {
        req.user = user1Tenant2;
        req.tenant = tenant2;
        return true;
      };

      jest.spyOn(app.get('JwtAuthGuard'), 'canActivate').mockImplementation(mockTenant2Request);
      jest.spyOn(app.get('TenantGuard'), 'canActivate').mockImplementation(mockTenant2Request);

      const responseTenant2 = await request(app.getHttpServer())
        .get(`/api/v1/${tenant2.slug}/sessions`)
        .set('Authorization', `Bearer ${jwtTokenTenant2User1}`)
        .expect(200);

      // Vérifier que seules les sessions du tenant 2 sont retournées
      expect(responseTenant2.body.data).toHaveLength(1);
      expect(responseTenant2.body.data[0].session.id).toBe(sessionT2U1.id);
      expect(responseTenant2.body.data[0].session.title).toBe('Session Tenant 2 User 1');

      // Test 3: Tentative d'accès cross-tenant doit échouer
      // Tenant 1 User tente d'accéder à une session du Tenant 2
      await request(app.getHttpServer())
        .get(`/api/v1/${tenant1.slug}/sessions/${sessionT2U1.id}`)
        .set('Authorization', `Bearer ${jwtTokenTenant1User1}`)
        .expect(404); // Session not found car pas dans le même tenant
    });

    it('should isolate conversations by session owner tenant', async () => {
      // Créer sessions pour chaque tenant
      const sessionT1 = await sessionRepository.save({
        user_id: user1Tenant1.id,
        title: 'Session Tenant 1',
        provider: AIProvider.OPENAI,
      });

      const sessionT2 = await sessionRepository.save({
        user_id: user1Tenant2.id,
        title: 'Session Tenant 2',
        provider: AIProvider.ANTHROPIC,
      });

      // Créer conversations pour chaque session
      const convT1 = await conversationRepository.save({
        session_id: sessionT1.id,
        message: 'Message tenant 1',
        response: 'Response tenant 1',
        provider_used: AIProvider.OPENAI,
      });

      const convT2 = await conversationRepository.save({
        session_id: sessionT2.id,
        message: 'Message tenant 2',
        response: 'Response tenant 2',
        provider_used: AIProvider.ANTHROPIC,
      });

      // Test isolation des conversations par tenant
      const mockTenant1Request = (req: any) => {
        req.user = user1Tenant1;
        req.tenant = tenant1;
        return true;
      };

      jest.spyOn(app.get('JwtAuthGuard'), 'canActivate').mockImplementation(mockTenant1Request);
      jest.spyOn(app.get('TenantGuard'), 'canActivate').mockImplementation(mockTenant1Request);

      // User Tenant 1 peut accéder aux conversations de sa session
      const responseT1 = await request(app.getHttpServer())
        .get(`/api/v1/${tenant1.slug}/sessions/${sessionT1.id}/conversations`)
        .set('Authorization', `Bearer ${jwtTokenTenant1User1}`)
        .expect(200);

      expect(responseT1.body.data).toHaveLength(1);
      expect(responseT1.body.data[0].id).toBe(convT1.id);

      // User Tenant 1 ne peut pas accéder aux conversations du Tenant 2
      await request(app.getHttpServer())
        .get(`/api/v1/${tenant1.slug}/sessions/${sessionT2.id}/conversations`)
        .set('Authorization', `Bearer ${jwtTokenTenant1User1}`)
        .expect(404); // Session not found car pas dans le même tenant
    });

    it('should prevent cross-tenant session creation', async () => {
      const mockTenant1Request = (req: any) => {
        req.user = user1Tenant1;
        req.tenant = tenant1;
        return true;
      };

      jest.spyOn(app.get('JwtAuthGuard'), 'canActivate').mockImplementation(mockTenant1Request);
      jest.spyOn(app.get('TenantGuard'), 'canActivate').mockImplementation(mockTenant1Request);

      // User du tenant 1 crée une session
      const newSessionData = {
        title: 'Session créée par Tenant 1',
        provider: 'openai',
        metadata: { test: true },
      };

      const response = await request(app.getHttpServer())
        .post(`/api/v1/${tenant1.slug}/sessions`)
        .set('Authorization', `Bearer ${jwtTokenTenant1User1}`)
        .send(newSessionData)
        .expect(201);

      const sessionId = response.body.data.id;

      // Vérifier que la session est créée avec le bon user_id (tenant isolation)
      const createdSession = await sessionRepository.findOne({
        where: { id: sessionId },
      });

      expect(createdSession.user_id).toBe(user1Tenant1.id);
      expect(createdSession.metadata.tenant_id).toBe(tenant1.id);

      // User du tenant 2 ne peut pas voir cette session
      const mockTenant2Request = (req: any) => {
        req.user = user1Tenant2;
        req.tenant = tenant2;
        return true;
      };

      jest.spyOn(app.get('JwtAuthGuard'), 'canActivate').mockImplementation(mockTenant2Request);
      jest.spyOn(app.get('TenantGuard'), 'canActivate').mockImplementation(mockTenant2Request);

      await request(app.getHttpServer())
        .get(`/api/v1/${tenant2.slug}/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${jwtTokenTenant2User1}`)
        .expect(404);
    });

    it('should prevent cross-tenant conversation creation and updates', async () => {
      // Créer session pour tenant 1
      const sessionT1 = await sessionRepository.save({
        user_id: user1Tenant1.id,
        title: 'Session Tenant 1',
        provider: AIProvider.OPENAI,
      });

      const mockTenant2Request = (req: any) => {
        req.user = user1Tenant2;
        req.tenant = tenant2;
        return true;
      };

      jest.spyOn(app.get('JwtAuthGuard'), 'canActivate').mockImplementation(mockTenant2Request);
      jest.spyOn(app.get('TenantGuard'), 'canActivate').mockImplementation(mockTenant2Request);

      // User du tenant 2 tente de créer une conversation dans la session du tenant 1
      const conversationData = {
        message: 'Tentative de message cross-tenant',
        metadata: { malicious: true },
      };

      await request(app.getHttpServer())
        .post(`/api/v1/${tenant2.slug}/sessions/${sessionT1.id}/conversations`)
        .set('Authorization', `Bearer ${jwtTokenTenant2User1}`)
        .send(conversationData)
        .expect(404); // Session not found car pas dans le même tenant
    });
  });

  describe('User Isolation within Same Tenant', () => {
    it('should isolate sessions between users of the same tenant', async () => {
      // Créer sessions pour deux users du même tenant
      const sessionUser1 = await sessionRepository.save({
        user_id: user1Tenant1.id,
        title: 'Session User 1 Tenant 1',
        provider: AIProvider.OPENAI,
      });

      const sessionUser2 = await sessionRepository.save({
        user_id: user2Tenant1.id,
        title: 'Session User 2 Tenant 1',
        provider: AIProvider.ANTHROPIC,
      });

      // Test: User 1 ne voit que ses sessions
      const mockUser1Request = (req: any) => {
        req.user = user1Tenant1;
        req.tenant = tenant1;
        return true;
      };

      jest.spyOn(app.get('JwtAuthGuard'), 'canActivate').mockImplementation(mockUser1Request);
      jest.spyOn(app.get('TenantGuard'), 'canActivate').mockImplementation(mockUser1Request);

      const responseUser1 = await request(app.getHttpServer())
        .get(`/api/v1/${tenant1.slug}/sessions`)
        .set('Authorization', `Bearer ${jwtTokenTenant1User1}`)
        .expect(200);

      expect(responseUser1.body.data).toHaveLength(1);
      expect(responseUser1.body.data[0].session.id).toBe(sessionUser1.id);

      // Test: User 2 ne voit que ses sessions
      const mockUser2Request = (req: any) => {
        req.user = user2Tenant1;
        req.tenant = tenant1;
        return true;
      };

      jest.spyOn(app.get('JwtAuthGuard'), 'canActivate').mockImplementation(mockUser2Request);
      jest.spyOn(app.get('TenantGuard'), 'canActivate').mockImplementation(mockUser2Request);

      const responseUser2 = await request(app.getHttpServer())
        .get(`/api/v1/${tenant1.slug}/sessions`)
        .set('Authorization', `Bearer ${jwtTokenTenant1User2}`)
        .expect(200);

      expect(responseUser2.body.data).toHaveLength(1);
      expect(responseUser2.body.data[0].session.id).toBe(sessionUser2.id);

      // Test: User 1 ne peut pas accéder à la session de User 2
      await request(app.getHttpServer())
        .get(`/api/v1/${tenant1.slug}/sessions/${sessionUser2.id}`)
        .set('Authorization', `Bearer ${jwtTokenTenant1User1}`)
        .expect(404);
    });
  });

  describe('Database RLS Policy Validation', () => {
    it('should enforce RLS policies at database level', async () => {
      // Ce test valide que les RLS policies fonctionnent même si on contourne l'application
      
      // Créer session pour tenant 1
      const sessionT1 = await sessionRepository.save({
        user_id: user1Tenant1.id,
        title: 'Session Tenant 1',
        provider: AIProvider.OPENAI,
      });

      // Créer session pour tenant 2
      const sessionT2 = await sessionRepository.save({
        user_id: user1Tenant2.id,
        title: 'Session Tenant 2',
        provider: AIProvider.ANTHROPIC,
      });

      // Simulation d'un contexte de requête avec tenant_id
      await sessionRepository.query(
        `SET app.current_tenant_id = '${tenant1.id}'`
      );

      // Query directe avec RLS - ne devrait retourner que sessions tenant 1
      const sessionsT1 = await sessionRepository.find();
      expect(sessionsT1).toHaveLength(1);
      expect(sessionsT1[0].id).toBe(sessionT1.id);

      // Changer contexte pour tenant 2
      await sessionRepository.query(
        `SET app.current_tenant_id = '${tenant2.id}'`
      );

      // Query directe avec RLS - ne devrait retourner que sessions tenant 2
      const sessionsT2 = await sessionRepository.find();
      expect(sessionsT2).toHaveLength(1);
      expect(sessionsT2[0].id).toBe(sessionT2.id);

      // Reset le contexte
      await sessionRepository.query('RESET app.current_tenant_id');
    });

    it('should validate conversation RLS policies', async () => {
      // Créer sessions et conversations pour validation RLS
      const sessionT1 = await sessionRepository.save({
        user_id: user1Tenant1.id,
        title: 'Session T1',
        provider: AIProvider.OPENAI,
      });

      const sessionT2 = await sessionRepository.save({
        user_id: user1Tenant2.id,
        title: 'Session T2',
        provider: AIProvider.ANTHROPIC,
      });

      const convT1 = await conversationRepository.save({
        session_id: sessionT1.id,
        message: 'Message T1',
        response: 'Response T1',
      });

      const convT2 = await conversationRepository.save({
        session_id: sessionT2.id,
        message: 'Message T2',
        response: 'Response T2',
      });

      // Test RLS sur conversations avec tenant context
      await conversationRepository.query(
        `SET app.current_tenant_id = '${tenant1.id}'`
      );

      const conversationsT1 = await conversationRepository.find();
      expect(conversationsT1).toHaveLength(1);
      expect(conversationsT1[0].id).toBe(convT1.id);

      await conversationRepository.query(
        `SET app.current_tenant_id = '${tenant2.id}'`
      );

      const conversationsT2 = await conversationRepository.find();
      expect(conversationsT2).toHaveLength(1);
      expect(conversationsT2[0].id).toBe(convT2.id);

      // Reset
      await conversationRepository.query('RESET app.current_tenant_id');
    });
  });

  describe('Performance with Multi-Tenant Data', () => {
    it('should maintain performance with large multi-tenant datasets', async () => {
      // Créer un large dataset multi-tenant pour tester performance
      const sessionsT1 = [];
      const sessionsT2 = [];

      // 50 sessions par tenant
      for (let i = 0; i < 50; i++) {
        sessionsT1.push({
          user_id: user1Tenant1.id,
          title: `Session T1 ${i}`,
          provider: AIProvider.OPENAI,
          metadata: { index: i, tenant: 'T1' },
        });

        sessionsT2.push({
          user_id: user1Tenant2.id,
          title: `Session T2 ${i}`,
          provider: AIProvider.ANTHROPIC,
          metadata: { index: i, tenant: 'T2' },
        });
      }

      await sessionRepository.save([...sessionsT1, ...sessionsT2]);

      // Test performance récupération avec isolation
      const mockTenant1Request = (req: any) => {
        req.user = user1Tenant1;
        req.tenant = tenant1;
        return true;
      };

      jest.spyOn(app.get('JwtAuthGuard'), 'canActivate').mockImplementation(mockTenant1Request);
      jest.spyOn(app.get('TenantGuard'), 'canActivate').mockImplementation(mockTenant1Request);

      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/${tenant1.slug}/sessions?limit=50`)
        .set('Authorization', `Bearer ${jwtTokenTenant1User1}`)
        .expect(200);

      const duration = Date.now() - startTime;

      // Vérifier performance < 200ms
      expect(duration).toBeLessThan(200);

      // Vérifier isolation: seulement les sessions T1
      expect(response.body.data).toHaveLength(50);
      expect(response.body.meta.total).toBe(50);

      // Vérifier que toutes sont du tenant 1
      response.body.data.forEach((item: any) => {
        expect(item.session.title).toContain('T1');
      });
    });
  });
});