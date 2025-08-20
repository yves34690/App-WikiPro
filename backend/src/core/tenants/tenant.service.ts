import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '@core/entities';

export interface CreateTenantDto {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  plan_type?: string;
}

export interface UpdateTenantDto {
  name?: string;
  description?: string;
  logo_url?: string;
  settings?: Record<string, any>;
  is_active?: boolean;
}

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Vérifier que le slug n'existe pas déjà
    const existingTenant = await this.tenantRepository.findOne({
      where: { slug: createTenantDto.slug },
    });

    if (existingTenant) {
      throw new ConflictException(`Un tenant avec le slug '${createTenantDto.slug}' existe déjà`);
    }

    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      is_active: true,
      plan_type: createTenantDto.plan_type || 'trial',
    });

    const savedTenant = await this.tenantRepository.save(tenant);
    
    this.logger.log(`Nouveau tenant créé: ${savedTenant.name} (${savedTenant.slug})`);
    
    return savedTenant;
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { slug },
      relations: ['users'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant avec le slug '${slug}' introuvable`);
    }

    return tenant;
  }

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant avec l'ID '${id}' introuvable`);
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findById(id);
    
    Object.assign(tenant, updateTenantDto);
    
    const updatedTenant = await this.tenantRepository.save(tenant);
    
    this.logger.log(`Tenant mis à jour: ${updatedTenant.name} (${updatedTenant.slug})`);
    
    return updatedTenant;
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findById(id);
    
    await this.tenantRepository.remove(tenant);
    
    this.logger.log(`Tenant supprimé: ${tenant.name} (${tenant.slug})`);
  }

  async validateTenantAccess(tenantId: string): Promise<boolean> {
    const tenant = await this.findById(tenantId);
    return tenant.canAccess();
  }

  async getTenantStats(tenantId: string): Promise<{
    userCount: number;
    isActive: boolean;
    planType: string;
    createdAt: Date;
  }> {
    const tenant = await this.tenantRepository
      .createQueryBuilder('tenant')
      .leftJoin('tenant.users', 'user')
      .select([
        'tenant.id',
        'tenant.is_active',
        'tenant.plan_type', 
        'tenant.created_at',
        'COUNT(user.id) as userCount'
      ])
      .where('tenant.id = :tenantId', { tenantId })
      .groupBy('tenant.id')
      .getRawOne();

    if (!tenant) {
      throw new NotFoundException(`Tenant avec l'ID '${tenantId}' introuvable`);
    }

    return {
      userCount: parseInt(tenant.userCount) || 0,
      isActive: tenant.tenant_is_active,
      planType: tenant.tenant_plan_type,
      createdAt: tenant.tenant_created_at,
    };
  }
}