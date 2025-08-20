import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '@core/users/user.service';
import { TenantService } from '@core/tenants/tenant.service';
import { User, UserRole, UserStatus, Tenant } from '@core/entities';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let userService: UserService;
  let tenantService: TenantService;

  const mockTenant: Tenant = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Demo Company',
    slug: 'demo-company',
    description: 'Test tenant',
    logo_url: null,
    is_active: true,
    settings: null,
    plan_type: 'trial',
    plan_expires_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    users: [],
    isActive: () => true,
    isPlanExpired: () => false,
    canAccess: () => true,
  };

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'test@demo-company.com',
    name: 'Test User',
    first_name: 'Test',
    last_name: 'User',
    password_hash: '$2b$12$hashedpassword',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    avatar_url: null,
    preferences: null,
    last_login_at: null,
    last_login_ip: null,
    email_verified_at: null,
    password_changed_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
    tenant: mockTenant,
    isActive: () => true,
    isAdmin: () => false,
    isSuperAdmin: () => false,
    canAccess: () => true,
    hasRole: (role: UserRole) => role === UserRole.USER,
    getFullName: () => 'Test User',
    updateLastLogin: () => {},
    toPublic: () => ({ ...mockUser, password_hash: undefined } as any),
  };

  const mockAuthService = {
    generateTokens: jest.fn(),
  };

  const mockUserService = {
    findByEmailAndTenant: jest.fn(),
    validatePassword: jest.fn(),
    updateLastLogin: jest.fn(),
    findById: jest.fn(),
  };

  const mockTenantService = {
    findById: jest.fn(),
    findBySlug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: TenantService,
          useValue: mockTenantService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    tenantService = module.get<TenantService>(TenantService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@demo-company.com',
      password: 'password123',
      tenant_id: '550e8400-e29b-41d4-a716-446655440000',
    };

    it('devrait authentifier un utilisateur avec des identifiants valides', async () => {
      // Arrange
      mockTenantService.findById.mockResolvedValue(mockTenant);
      mockUserService.findByEmailAndTenant.mockResolvedValue(mockUser);
      mockUserService.validatePassword.mockResolvedValue(true);
      mockAuthService.generateTokens.mockResolvedValue({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          tenantId: mockUser.tenant_id,
          roles: [mockUser.role],
        },
        accessToken: 'jwt-token',
      });
      mockUserService.updateLastLogin.mockResolvedValue(undefined);

      // Act
      const result = await controller.login(loginDto, '127.0.0.1');

      // Assert
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: 'Test User',
          role: mockUser.role,
          tenant_id: mockUser.tenant_id,
        },
        access_token: 'jwt-token',
        tenant: {
          id: mockTenant.id,
          name: mockTenant.name,
          slug: mockTenant.slug,
        },
      });

      expect(mockTenantService.findById).toHaveBeenCalledWith(loginDto.tenant_id);
      expect(mockUserService.findByEmailAndTenant).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.tenant_id,
      );
      expect(mockUserService.validatePassword).toHaveBeenCalledWith(
        mockUser,
        loginDto.password,
      );
      expect(mockUserService.updateLastLogin).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.tenant_id,
        '127.0.0.1',
      );
    });

    it('devrait lever UnauthorizedException si le tenant n\'existe pas', async () => {
      // Arrange
      mockTenantService.findById.mockRejectedValue(
        new Error('Tenant introuvable'),
      );

      // Act & Assert
      await expect(controller.login(loginDto, '127.0.0.1')).rejects.toThrow();
      expect(mockTenantService.findById).toHaveBeenCalledWith(loginDto.tenant_id);
    });

    it('devrait lever UnauthorizedException si l\'utilisateur n\'existe pas', async () => {
      // Arrange
      mockTenantService.findById.mockResolvedValue(mockTenant);
      mockUserService.findByEmailAndTenant.mockResolvedValue(null);

      // Act & Assert
      await expect(controller.login(loginDto, '127.0.0.1')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUserService.findByEmailAndTenant).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.tenant_id,
      );
    });

    it('devrait lever UnauthorizedException si le mot de passe est incorrect', async () => {
      // Arrange
      mockTenantService.findById.mockResolvedValue(mockTenant);
      mockUserService.findByEmailAndTenant.mockResolvedValue(mockUser);
      mockUserService.validatePassword.mockResolvedValue(false);

      // Act & Assert
      await expect(controller.login(loginDto, '127.0.0.1')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockUserService.validatePassword).toHaveBeenCalledWith(
        mockUser,
        loginDto.password,
      );
    });

    it('devrait lever UnauthorizedException si l\'utilisateur ne peut pas accéder', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, canAccess: () => false };
      mockTenantService.findById.mockResolvedValue(mockTenant);
      mockUserService.findByEmailAndTenant.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(controller.login(loginDto, '127.0.0.1')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('verifyToken', () => {
    const mockRequest = {
      user: {
        sub: mockUser.id,
        email: mockUser.email,
        tenantId: mockUser.tenant_id,
        roles: [mockUser.role],
      },
    };

    it('devrait vérifier un token valide avec succès', async () => {
      // Arrange
      mockTenantService.findById.mockResolvedValue(mockTenant);
      mockUserService.findById.mockResolvedValue(mockUser);

      // Act
      const result = await controller.verifyToken(mockRequest);

      // Assert
      expect(result).toEqual({
        valid: true,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          tenant_id: mockUser.tenant_id,
          roles: [mockUser.role],
        },
        tenant: {
          id: mockTenant.id,
          name: mockTenant.name,
          slug: mockTenant.slug,
        },
      });

      expect(mockTenantService.findById).toHaveBeenCalledWith(mockUser.tenant_id);
      expect(mockUserService.findById).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.tenant_id,
      );
    });

    it('devrait lever UnauthorizedException si le tenant n\'est plus accessible', async () => {
      // Arrange
      const inaccessibleTenant = { ...mockTenant, canAccess: () => false };
      mockTenantService.findById.mockResolvedValue(inaccessibleTenant);

      // Act & Assert
      await expect(controller.verifyToken(mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('devrait lever UnauthorizedException si l\'utilisateur n\'est plus actif', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, canAccess: () => false };
      mockTenantService.findById.mockResolvedValue(mockTenant);
      mockUserService.findById.mockResolvedValue(inactiveUser);

      // Act & Assert
      await expect(controller.verifyToken(mockRequest)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});