import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { Tenant } from '@core/entities';

describe('TenantService', () => {
  let service: TenantService;
  let repository: Repository<Tenant>;

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

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    repository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createTenantDto = {
      name: 'New Company',
      slug: 'new-company',
      description: 'A new test company',
    };

    it('devrait créer un nouveau tenant avec succès', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null); // Pas de tenant existant
      mockRepository.create.mockReturnValue({ ...createTenantDto, is_active: true });
      mockRepository.save.mockResolvedValue({
        ...mockTenant,
        ...createTenantDto,
      });

      // Act
      const result = await service.create(createTenantDto);

      // Assert
      expect(result).toEqual({
        ...mockTenant,
        ...createTenantDto,
      });

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { slug: createTenantDto.slug },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createTenantDto,
        is_active: true,
        plan_type: 'trial',
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('devrait lever ConflictException si le slug existe déjà', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockTenant);

      // Act & Assert
      await expect(service.create(createTenantDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { slug: createTenantDto.slug },
      });
    });
  });

  describe('findBySlug', () => {
    it('devrait retourner un tenant par son slug', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockTenant);

      // Act
      const result = await service.findBySlug('test-company');

      // Assert
      expect(result).toEqual(mockTenant);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-company' },
        relations: ['users'],
      });
    });

    it('devrait lever NotFoundException si le tenant n\'existe pas', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findBySlug('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById', () => {
    it('devrait retourner un tenant par son ID', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockTenant);

      // Act
      const result = await service.findById(mockTenant.id);

      // Assert
      expect(result).toEqual(mockTenant);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTenant.id },
        relations: ['users'],
      });
    });

    it('devrait lever NotFoundException si le tenant n\'existe pas', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Company Name',
      description: 'Updated description',
    };

    it('devrait mettre à jour un tenant existant', async () => {
      // Arrange
      const updatedTenant = { ...mockTenant, ...updateDto };
      mockRepository.findOne.mockResolvedValue(mockTenant);
      mockRepository.save.mockResolvedValue(updatedTenant);

      // Act
      const result = await service.update(mockTenant.id, updateDto);

      // Assert
      expect(result).toEqual(updatedTenant);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...mockTenant,
        ...updateDto,
      });
    });

    it('devrait lever NotFoundException si le tenant n\'existe pas', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update('non-existent-id', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('validateTenantAccess', () => {
    it('devrait retourner true pour un tenant accessible', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(mockTenant);

      // Act
      const result = await service.validateTenantAccess(mockTenant.id);

      // Assert
      expect(result).toBe(true);
    });

    it('devrait retourner false pour un tenant inaccessible', async () => {
      // Arrange
      const inaccessibleTenant = { ...mockTenant, canAccess: () => false };
      mockRepository.findOne.mockResolvedValue(inaccessibleTenant);

      // Act
      const result = await service.validateTenantAccess(mockTenant.id);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getTenantStats', () => {
    it('devrait retourner les statistiques du tenant', async () => {
      // Arrange
      const mockStats = {
        userCount: '5',
        tenant_is_active: true,
        tenant_plan_type: 'trial',
        tenant_created_at: mockTenant.created_at,
      };

      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(mockStats),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act
      const result = await service.getTenantStats(mockTenant.id);

      // Assert
      expect(result).toEqual({
        userCount: 5,
        isActive: true,
        planType: 'trial',
        createdAt: mockTenant.created_at,
      });
    });

    it('devrait lever NotFoundException si le tenant n\'existe pas', async () => {
      // Arrange
      const mockQueryBuilder = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Act & Assert
      await expect(service.getTenantStats('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});