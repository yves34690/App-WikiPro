import { 
  Controller, 
  Get, 
  Post, 
  Query, 
  Param, 
  Body, 
  UseGuards, 
  HttpStatus, 
  HttpException,
  Res,
  Headers,
  ParseUUIDPipe
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '@core/auth/guards/jwt-auth.guard';
import { TenantGuard } from '@core/auth/guards/tenant.guard';
import { AIAnalyticsService } from './ai-analytics.service';
import {
  TenantAIStatsDto,
  TenantStatsQueryDto,
  ExportTenantStatsDto,
  GlobalUsageDto,
  GlobalUsageQueryDto,
  ExportGlobalUsageDto,
  CostAnalyticsDto,
  CostFiltersDto,
  ExportCostAnalyticsDto,
  PerformanceMetricsDto,
  PerformanceFiltersDto,
  ExportPerformanceMetricsDto,
  RealTimePerformanceDto,
  QuotaStatusDto,
  QuotaStatusQueryDto,
  QuotaConfigDto,
  TestQuotaConfigDto,
  TestQuotaResultDto,
  ExportMetricsDto,
  ExportResponseDto,
  ExportStatusDto
} from './dto';

/**
 * Controller pour les APIs de monitoring et métriques IA - TICKET-BACKEND-005
 * Endpoints optimisés pour dashboard avec cache intelligent <1s
 */
@Controller('ai')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AIMonitoringController {
  constructor(
    private readonly analyticsService: AIAnalyticsService
  ) {}

  // =================== ANALYTICS TENANT DÉTAILLÉES ===================

  /**
   * GET /api/ai/stats/:tenantId - Analytics tenant détaillées
   * Dashboard principal avec métriques business complètes
   */
  @Get('stats/:tenantId')
  async getTenantStats(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Query() query: TenantStatsQueryDto
  ): Promise<TenantAIStatsDto> {
    try {
      query.tenantId = tenantId;
      return await this.analyticsService.getTenantStats(query);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération des statistiques tenant: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * POST /api/ai/stats/:tenantId/export - Export des stats tenant
   */
  @Post('stats/:tenantId/export')
  async exportTenantStats(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() exportDto: ExportTenantStatsDto,
    @Res() res: Response
  ): Promise<void> {
    try {
      exportDto.tenantId = tenantId;
      const exportResult = await this.analyticsService.exportTenantStats(exportDto);
      
      // Headers pour téléchargement
      res.setHeader('Content-Type', this.getContentType(exportDto.format));
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.fileName}"`);
      
      if (exportDto.format === 'json') {
        res.json(exportResult.data);
      } else {
        res.send(exportResult.data);
      }
    } catch (error) {
      throw new HttpException(
        `Erreur lors de l'export des statistiques: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // =================== USAGE GLOBAL ADMIN ===================

  /**
   * GET /api/ai/usage - Consommation globale admin
   * Métriques cross-tenant pour dashboard admin
   */
  @Get('usage')
  async getGlobalUsage(
    @Query() query: GlobalUsageQueryDto,
    @Headers('X-Admin-Access') adminAccess?: string
  ): Promise<GlobalUsageDto> {
    // Vérification accès admin (simplifiée pour le MVP)
    if (!adminAccess || adminAccess !== 'true') {
      throw new HttpException('Accès administrateur requis', HttpStatus.FORBIDDEN);
    }

    try {
      return await this.analyticsService.getGlobalUsage(query);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération de l'usage global: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * POST /api/ai/usage/export - Export usage global
   */
  @Post('usage/export')
  async exportGlobalUsage(
    @Body() exportDto: ExportGlobalUsageDto,
    @Res() res: Response,
    @Headers('X-Admin-Access') adminAccess?: string
  ): Promise<void> {
    if (!adminAccess || adminAccess !== 'true') {
      throw new HttpException('Accès administrateur requis', HttpStatus.FORBIDDEN);
    }

    try {
      const exportResult = await this.analyticsService.exportGlobalUsage(exportDto);
      
      res.setHeader('Content-Type', this.getContentType(exportDto.format));
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.fileName}"`);
      
      if (exportDto.format === 'json') {
        res.json(exportResult.data);
      } else {
        res.send(exportResult.data);
      }
    } catch (error) {
      throw new HttpException(
        `Erreur lors de l'export de l'usage global: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // =================== ANALYSE COÛTS ===================

  /**
   * GET /api/ai/costs - Analyse coûts par provider/période
   * Breakdown détaillé des coûts avec optimisations
   */
  @Get('costs')
  async getCostAnalytics(
    @Query() filters: CostFiltersDto
  ): Promise<CostAnalyticsDto> {
    try {
      return await this.analyticsService.getCostAnalytics(filters);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de l'analyse des coûts: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /api/ai/costs/:conversationId - Analyse coût conversation spécifique
   */
  @Get('costs/:conversationId')
  async getConversationCostAnalysis(
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Query('tenantId', ParseUUIDPipe) tenantId: string
  ) {
    try {
      return await this.analyticsService.getConversationCostAnalysis(conversationId, tenantId);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de l'analyse des coûts de conversation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * POST /api/ai/costs/export - Export analyse coûts
   */
  @Post('costs/export')
  async exportCostAnalytics(
    @Body() exportDto: ExportCostAnalyticsDto,
    @Res() res: Response
  ): Promise<void> {
    try {
      const exportResult = await this.analyticsService.exportCostAnalytics(exportDto);
      
      res.setHeader('Content-Type', this.getContentType(exportDto.format));
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.fileName}"`);
      
      if (exportDto.format === 'json') {
        res.json(exportResult.data);
      } else {
        res.send(exportResult.data);
      }
    } catch (error) {
      throw new HttpException(
        `Erreur lors de l'export de l'analyse des coûts: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // =================== MÉTRIQUES PERFORMANCE ===================

  /**
   * GET /api/ai/performance - Métriques latence/confiance
   * Performance détaillée par provider et modèle
   */
  @Get('performance')
  async getPerformanceMetrics(
    @Query() filters: PerformanceFiltersDto
  ): Promise<PerformanceMetricsDto> {
    try {
      return await this.analyticsService.getPerformanceMetrics(filters);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération des métriques de performance: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /api/ai/performance/realtime - Métriques temps réel
   */
  @Get('performance/realtime')
  async getRealTimePerformance(
    @Query('tenantId', ParseUUIDPipe) tenantId?: string
  ): Promise<RealTimePerformanceDto> {
    try {
      return await this.analyticsService.getRealTimePerformance(tenantId);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération des métriques temps réel: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * POST /api/ai/performance/export - Export métriques performance
   */
  @Post('performance/export')
  async exportPerformanceMetrics(
    @Body() exportDto: ExportPerformanceMetricsDto,
    @Res() res: Response
  ): Promise<void> {
    try {
      const exportResult = await this.analyticsService.exportPerformanceMetrics(exportDto);
      
      res.setHeader('Content-Type', this.getContentType(exportDto.format));
      res.setHeader('Content-Disposition', `attachment; filename="${exportResult.fileName}"`);
      
      if (exportDto.format === 'json') {
        res.json(exportResult.data);
      } else {
        res.send(exportResult.data);
      }
    } catch (error) {
      throw new HttpException(
        `Erreur lors de l'export des métriques de performance: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // =================== QUOTAS ET LIMITES ===================

  /**
   * GET /api/ai/quotas - Status quotas en temps réel
   * Surveillance des limites et alertes
   */
  @Get('quotas')
  async getQuotaStatus(
    @Query() query: QuotaStatusQueryDto
  ): Promise<QuotaStatusDto> {
    try {
      return await this.analyticsService.getQuotaStatus(query);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération du status des quotas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * POST /api/ai/quotas/config - Configuration des quotas
   */
  @Post('quotas/config')
  async updateQuotaConfig(
    @Body() config: QuotaConfigDto
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.analyticsService.updateQuotaConfig(config);
      return {
        success: true,
        message: 'Configuration des quotas mise à jour avec succès'
      };
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la configuration des quotas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * POST /api/ai/quotas/test - Test configuration quotas
   */
  @Post('quotas/test')
  async testQuotaConfig(
    @Body() testDto: TestQuotaConfigDto
  ): Promise<TestQuotaResultDto> {
    try {
      return await this.analyticsService.testQuotaConfig(testDto);
    } catch (error) {
      throw new HttpException(
        `Erreur lors du test de configuration des quotas: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // =================== CONFIGURATION ET TESTS ===================

  /**
   * POST /api/ai/test - Test configuration providers
   * Validation de la connectivité et configuration
   */
  @Post('test')
  async testProviderConfiguration(
    @Body() testConfig: { provider: string; tenantId: string; model?: string }
  ): Promise<{
    provider: string;
    status: 'success' | 'error';
    responseTime?: number;
    message: string;
    details?: any;
  }> {
    try {
      return await this.analyticsService.testProviderConfiguration(
        testConfig.provider,
        testConfig.tenantId,
        testConfig.model
      );
    } catch (error) {
      throw new HttpException(
        `Erreur lors du test du provider: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // =================== EXPORTS GÉNÉRIQUES ===================

  /**
   * POST /api/ai/export - Export général de métriques
   * Export flexible multi-formats
   */
  @Post('export')
  async exportMetrics(
    @Body() exportDto: ExportMetricsDto
  ): Promise<ExportResponseDto> {
    try {
      return await this.analyticsService.exportMetrics(exportDto);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de l'export des métriques: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /api/ai/export/:exportId/status - Status d'export
   */
  @Get('export/:exportId/status')
  async getExportStatus(
    @Param('exportId') exportId: string
  ): Promise<ExportStatusDto> {
    try {
      return await this.analyticsService.getExportStatus(exportId);
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération du statut d'export: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * GET /api/ai/export/:exportId/download - Téléchargement export
   */
  @Get('export/:exportId/download')
  async downloadExport(
    @Param('exportId') exportId: string,
    @Res() res: Response
  ): Promise<void> {
    try {
      const downloadData = await this.analyticsService.downloadExport(exportId);
      
      res.setHeader('Content-Type', downloadData.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${downloadData.fileName}"`);
      res.send(downloadData.data);
    } catch (error) {
      throw new HttpException(
        `Erreur lors du téléchargement: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // =================== DASHBOARD SUMMARY ===================

  /**
   * GET /api/ai/dashboard/:tenantId - Dashboard summary optimisé
   * Résumé complet pour dashboard principal <1s
   */
  @Get('dashboard/:tenantId')
  async getDashboardSummary(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Query('period') period?: string
  ): Promise<{
    summary: {
      totalCost: number;
      totalMessages: number;
      avgResponseTime: number;
      successRate: number;
    };
    trends: any[];
    alerts: any[];
    topProviders: any[];
    topModels: any[];
    lastUpdated: Date;
  }> {
    try {
      return await this.analyticsService.getDashboardSummary(tenantId, period || 'last_7d');
    } catch (error) {
      throw new HttpException(
        `Erreur lors de la récupération du dashboard: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // =================== MÉTHODES UTILITAIRES ===================

  /**
   * Déterminer le content-type selon le format d'export
   */
  private getContentType(format: string): string {
    switch (format) {
      case 'csv':
        return 'text/csv; charset=utf-8';
      case 'json':
        return 'application/json; charset=utf-8';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }
}