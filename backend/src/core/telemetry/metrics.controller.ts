import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TelemetryService, TelemetryEvent, Metric } from './telemetry.service';

@ApiTags('Telemetry')
@Controller('telemetry')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class MetricsController {
  constructor(private telemetryService: TelemetryService) {}

  @Get('events')
  @ApiOperation({ summary: 'Obtenir les événements de télémétrie récents' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre d\'événements à retourner (défaut: 50)' })
  @ApiResponse({ status: 200, description: 'Liste des événements récents' })
  getRecentEvents(@Query('limit') limit?: string): TelemetryEvent[] {
    const limitNumber = limit ? parseInt(limit, 10) : 50;
    return this.telemetryService.getRecentEvents(limitNumber);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Obtenir les métriques par nom' })
  @ApiQuery({ name: 'name', required: true, type: String, description: 'Nom de la métrique' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre de valeurs à retourner (défaut: 50)' })
  @ApiResponse({ status: 200, description: 'Liste des valeurs de la métrique' })
  getMetrics(
    @Query('name') name: string,
    @Query('limit') limit?: string,
  ): Metric[] {
    const limitNumber = limit ? parseInt(limit, 10) : 50;
    return this.telemetryService.getMetrics(name, limitNumber);
  }

  @Get('metrics/names')
  @ApiOperation({ summary: 'Obtenir la liste des noms de métriques disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des noms de métriques' })
  getMetricNames(): { metrics: string[] } {
    return { metrics: this.telemetryService.getAllMetricNames() };
  }

  @Get('system')
  @ApiOperation({ summary: 'Obtenir les métriques système' })
  @ApiResponse({ status: 200, description: 'Métriques système' })
  getSystemMetrics(): { totalEvents: number; totalMetrics: number; uptime: number } {
    return this.telemetryService.getSystemMetrics();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check du service de télémétrie' })
  @ApiResponse({ status: 200, description: 'Service opérationnel' })
  getTelemetryHealth(): { status: string; service: string } {
    return {
      status: 'healthy',
      service: 'telemetry',
    };
  }
}