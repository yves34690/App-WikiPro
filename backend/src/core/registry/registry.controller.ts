import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RegistryService } from './registry.service';

@ApiTags('Registry')
@Controller('registry')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class RegistryController {
  constructor(private registryService: RegistryService) {}

  @Get('providers')
  @ApiOperation({ summary: 'Lister tous les providers enregistrés' })
  @ApiResponse({ status: 200, description: 'Liste des providers avec leurs informations' })
  getAllProviders() {
    return {
      providers: this.registryService.getProvidersInfo(),
      types: this.registryService.getProviderTypes(),
    };
  }

  @Get('providers/by-type')
  @ApiOperation({ summary: 'Lister les providers par type' })
  @ApiQuery({ name: 'type', required: true, type: String, description: 'Type de provider (ex: ai-text-generation)' })
  @ApiResponse({ status: 200, description: 'Liste des providers du type spécifié' })
  getProvidersByType(@Query('type') type: string) {
    const providers = this.registryService.getByType(type);
    return {
      type,
      providers: providers.map(provider => ({
        name: provider.name,
        version: provider.version,
        capabilities: provider.capabilities,
        metrics: provider.getMetrics(),
      })),
    };
  }

  @Get('providers/best')
  @ApiOperation({ summary: 'Obtenir le meilleur provider pour un type donné' })
  @ApiQuery({ name: 'type', required: true, type: String, description: 'Type de provider' })
  @ApiResponse({ status: 200, description: 'Meilleur provider disponible' })
  getBestProvider(@Query('type') type: string) {
    const provider = this.registryService.getBest(type);
    
    if (!provider) {
      return { provider: null, message: `Aucun provider disponible pour le type: ${type}` };
    }

    return {
      provider: {
        name: provider.name,
        version: provider.version,
        capabilities: provider.capabilities,
        metrics: provider.getMetrics(),
      },
    };
  }

  @Post('health-check')
  @ApiOperation({ summary: 'Déclencher un health check des providers' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Type de provider spécifique' })
  @ApiQuery({ name: 'name', required: false, type: String, description: 'Nom du provider spécifique' })
  @ApiResponse({ status: 200, description: 'Résultats du health check' })
  async healthCheck(
    @Query('type') type?: string,
    @Query('name') name?: string,
  ) {
    const results = await this.registryService.healthCheck(type, name);
    
    return {
      timestamp: new Date().toISOString(),
      results: Object.fromEntries(results),
      summary: {
        total: results.size,
        healthy: Array.from(results.values()).filter(Boolean).length,
        unhealthy: Array.from(results.values()).filter(r => !r).length,
      },
    };
  }

  @Get('types')
  @ApiOperation({ summary: 'Lister tous les types de providers disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des types de providers' })
  getProviderTypes() {
    return {
      types: this.registryService.getProviderTypes(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check du service de registre' })
  @ApiResponse({ status: 200, description: 'Service opérationnel' })
  getRegistryHealth() {
    const providers = this.registryService.getAllProviders();
    return {
      status: 'healthy',
      service: 'registry',
      providersCount: providers.size,
      types: this.registryService.getProviderTypes().length,
    };
  }
}