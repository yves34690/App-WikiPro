import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantGuard, TenantContext } from '@core/auth/guards/tenant.guard';
import { TenantService, CreateTenantDto, UpdateTenantDto } from './tenant.service';
import { JwtPayload } from '@core/auth/auth.service';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Controller('api/tenants')
@UseGuards(AuthGuard('jwt'))
export class TenantController {
  private readonly logger = new Logger(TenantController.name);

  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async create(@Body() createTenantDto: CreateTenantDto) {
    this.logger.log(`Création d'un nouveau tenant: ${createTenantDto.slug}`);
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  async findAll() {
    return this.tenantService.findAll();
  }

  @Get(':slug/profile')
  @UseGuards(TenantGuard)
  @TenantContext() // Le slug sera extrait automatiquement de l'URL
  async getProfile(
    @Param('slug') slug: string,
    @Request() req: AuthenticatedRequest,
  ) {
    // Vérification que l'utilisateur appartient au tenant demandé
    const tenant = await this.tenantService.findBySlug(slug);
    
    if (req.user.tenantId !== tenant.id) {
      this.logger.warn(
        `Tentative d'accès cross-tenant: utilisateur ${req.user.email} ` +
        `(tenant: ${req.user.tenantId}) tentant d'accéder au profil du tenant ${tenant.id}`
      );
      throw new Error('Accès interdit - Violation de l\'isolation tenant');
    }

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      description: tenant.description,
      logo_url: tenant.logo_url,
      plan_type: tenant.plan_type,
      is_active: tenant.is_active,
      created_at: tenant.created_at,
      stats: await this.tenantService.getTenantStats(tenant.id),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tenantService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.tenantService.remove(id);
    return { message: 'Tenant supprimé avec succès' };
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    return this.tenantService.getTenantStats(id);
  }
}