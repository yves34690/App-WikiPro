import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { User, Tenant, UserRole, UserStatus } from '@core/entities';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let tenantRepository: Repository<Tenant>;

  const mockTenant: Tenant = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Company',
    slug: 'test-company',
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
    email: 'test@test-company.com',
    name: 'Test User',
    first_name: 'Test',
    last_name: 'User',
    password_hash: 'hashed_password',
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

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    update: jest.fn(),
  };

  const mockTenantRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockTenantRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    tenantRepository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));

    // Setup bcrypt mocks
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto = {
      tenant_id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'newuser@test-company.com',
      password: 'password123',
      name: 'New User',
    };

    it('devrait créer un nouvel utilisateur avec succès', async () => {
      // Arrange
      mockTenantRepository.findOne.mockResolvedValue(mockTenant);
      mockUserRepository.findOne.mockResolvedValue(null); // Pas d'utilisateur existant
      mockUserRepository.create.mockReturnValue({
        ...createUserDto,
        password_hash: 'hashed_password',
      });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        ...createUserDto,
      });

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toEqual({
        ...mockUser,
        ...createUserDto,
      });

      expect(mockTenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: createUserDto.tenant_id },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          tenant_id: createUserDto.tenant_id,
          email: createUserDto.email,
        },
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('devrait lever NotFoundException si le tenant n\'existe pas', async () => {
      // Arrange
      mockTenantRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('devrait lever ConflictException si l\'utilisateur existe déjà', async () => {
      // Arrange
      mockTenantRepository.findOne.mockResolvedValue(mockTenant);
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('devrait lever UnauthorizedException si le tenant n\'est pas accessible', async () => {
      // Arrange
      const inaccessibleTenant = { ...mockTenant, canAccess: () => false };
      mockTenantRepository.findOne.mockResolvedValue(inaccessibleTenant);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('findByEmailAndTenant', () => {
    it('devrait trouver un utilisateur par email et tenant', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByEmailAndTenant(
        'test@test-company.com',
        '550e8400-e29b-41d4-a716-446655440000',
      );

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: 'test@test-company.com',
          tenant_id: '550e8400-e29b-41d4-a716-446655440000',
        },
        relations: ['tenant'],
        select: expect.any(Array),
      });
    });

    it('devrait retourner null si l\'utilisateur n\'existe pas', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByEmailAndTenant(
        'nonexistent@test-company.com',
        '550e8400-e29b-41d4-a716-446655440000',
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('devrait valider un mot de passe correct', async () => {
      // Arrange
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await service.validatePassword(mockUser, 'correct_password');

      // Assert
      expect(result).toBe(true);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'correct_password',
        mockUser.password_hash,
      );
    });

    it('devrait rejeter un mot de passe incorrect', async () => {
      // Arrange
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act
      const result = await service.validatePassword(mockUser, 'wrong_password');

      // Assert
      expect(result).toBe(false);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'wrong_password',
        mockUser.password_hash,
      );
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      currentPassword: 'old_password',
      newPassword: 'new_password',
    };

    it('devrait changer le mot de passe avec succès', async () => {
      // Arrange
      const userWithPassword = { ...mockUser, password_hash: 'old_hashed' };
      mockUserRepository.findOne.mockResolvedValue(userWithPassword);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');

      // Act
      await service.changePassword(mockUser.id, mockUser.tenant_id, changePasswordDto);

      // Assert
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'old_password',
        'old_hashed',
      );
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('new_password', 12);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          password_hash: 'new_hashed_password',
          password_changed_at: expect.any(Date),
        }),
      );
    });

    it('devrait lever UnauthorizedException pour un mauvais mot de passe actuel', async () => {
      // Arrange
      const userWithPassword = { ...mockUser, password_hash: 'old_hashed' };
      mockUserRepository.findOne.mockResolvedValue(userWithPassword);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(
        service.changePassword(mockUser.id, mockUser.tenant_id, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updateLastLogin', () => {
    it('devrait mettre à jour la dernière connexion', async () => {
      // Act
      await service.updateLastLogin(mockUser.id, mockUser.tenant_id, '192.168.1.1');

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: mockUser.id, tenant_id: mockUser.tenant_id },
        {
          last_login_at: expect.any(Date),
          last_login_ip: '192.168.1.1',
        },
      );
    });

    it('devrait mettre à jour la dernière connexion sans IP', async () => {
      // Act
      await service.updateLastLogin(mockUser.id, mockUser.tenant_id);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: mockUser.id, tenant_id: mockUser.tenant_id },
        {
          last_login_at: expect.any(Date),
        },
      );
    });
  });
});