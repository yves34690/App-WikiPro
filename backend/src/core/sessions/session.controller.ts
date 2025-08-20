import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  UseGuards,
  ValidationPipe,
  UsePipes,
  HttpCode,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

// Guards et middlewares
import { JwtAuthGuard } from '@core/auth/guards/jwt-auth.guard';
import { TenantGuard } from '@core/auth/guards/tenant.guard';

// Services et DTOs
import { SessionService } from './session.service';
import {
  CreateSessionDto,
  UpdateSessionDto,
  CreateConversationDto,
  UpdateConversationDto,
  ConversationQueryDto,
} from './dto';

// Entités pour les types de retour
import { Session, AIProvider } from './entities/session.entity';
import { Conversation } from './entities/conversation.entity';

@ApiTags('Sessions IA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('api/v1/:tenant_slug/sessions')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SessionController {
  private readonly logger = new Logger(SessionController.name);

  constructor(private readonly sessionService: SessionService) {}

  // =====================================
  // ENDPOINT 1: GET /sessions
  // =====================================
  @Get()
  @ApiOperation({
    summary: 'Récupérer les sessions IA de l\'utilisateur',
    description: 'Liste paginée des sessions IA avec possibilité de filtrage par titre et provider.',
  })
  @ApiParam({
    name: 'tenant_slug',
    description: 'Slug du tenant',
    example: 'entreprise-demo',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Numéro de page (défaut: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Nombre d\'éléments par page (défaut: 20, max: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'title',
    required: false,
    type: String,
    description: 'Filtrer par titre (recherche partielle)',
    example: 'analyse',
  })
  @ApiQuery({
    name: 'provider',
    required: false,
    enum: AIProvider,
    description: 'Filtrer par provider IA',
    example: 'openai',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sessions récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              session: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'uuid' },
                  title: { type: 'string', example: 'Analyse Q1 2025' },
                  provider: { type: 'string', example: 'openai' },
                  metadata: { type: 'object' },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' },
                },
              },
              stats: {
                type: 'object',
                properties: {
                  conversationCount: { type: 'number', example: 5 },
                  totalTokens: { type: 'number', example: 1500 },
                  avgProcessingTime: { type: 'number', example: 2300 },
                  lastActivity: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 50 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            totalPages: { type: 'number', example: 3 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Paramètres de requête invalides',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès refusé au tenant',
  })
  @Throttle({ default: { limit: 60, ttl: 60000 } }) // 60 req/min
  async getUserSessions(
    @Param('tenant_slug') tenantSlug: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('title') titleFilter?: string,
    @Query('provider') providerFilter?: AIProvider,
  ) {
    const startTime = Date.now();

    try {
      const result = await this.sessionService.findUserSessions(
        page,
        limit,
        titleFilter,
        providerFilter,
      );

      const processingTime = Date.now() - startTime;
      
      this.logger.log(
        `Sessions récupérées pour tenant ${tenantSlug} en ${processingTime}ms - ` +
        `${result.data.length}/${result.meta.total} éléments`
      );

      return {
        success: true,
        data: result.data,
        meta: {
          ...result.meta,
          processingTimeMs: processingTime,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `Erreur récupération sessions tenant ${tenantSlug}: ${error.message} (${processingTime}ms)`,
        error.stack,
      );
      throw error;
    }
  }

  // =====================================
  // ENDPOINT 2: POST /sessions
  // =====================================
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Créer une nouvelle session IA',
    description: 'Crée une nouvelle session IA avec titre et provider obligatoires.',
  })
  @ApiParam({
    name: 'tenant_slug',
    description: 'Slug du tenant',
    example: 'entreprise-demo',
  })
  @ApiBody({
    type: CreateSessionDto,
    description: 'Données de la nouvelle session',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Session créée avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            title: { type: 'string', example: 'Nouvelle analyse' },
            provider: { type: 'string', example: 'openai' },
            metadata: { type: 'object' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Non authentifié',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Accès refusé au tenant',
  })
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 créations/min max
  async createSession(
    @Param('tenant_slug') tenantSlug: string,
    @Body() createSessionDto: CreateSessionDto,
  ) {
    const startTime = Date.now();

    try {
      const session = await this.sessionService.createSession(createSessionDto);

      const processingTime = Date.now() - startTime;
      
      this.logger.log(
        `Session créée pour tenant ${tenantSlug} en ${processingTime}ms: ${session.id}`
      );

      return {
        success: true,
        data: session.toPublic(),
        meta: {
          processingTimeMs: processingTime,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `Erreur création session tenant ${tenantSlug}: ${error.message} (${processingTime}ms)`,
        error.stack,
      );
      throw error;
    }
  }

  // =====================================
  // ENDPOINT 3: GET /sessions/:session_id/conversations
  // =====================================
  @Get(':session_id/conversations')
  @ApiOperation({
    summary: 'Récupérer l\'historique des conversations d\'une session',
    description: 'Liste paginée des conversations d\'une session, triées chronologiquement.',
  })
  @ApiParam({
    name: 'tenant_slug',
    description: 'Slug du tenant',
    example: 'entreprise-demo',
  })
  @ApiParam({
    name: 'session_id',
    description: 'ID de la session',
    example: 'uuid-session',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Numéro de page (défaut: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Nombre d\'éléments par page (défaut: 20, max: 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'provider',
    required: false,
    enum: AIProvider,
    description: 'Filtrer par provider utilisé',
    example: 'openai',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conversations récupérées avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'uuid' },
              message: { type: 'string', example: 'Question utilisateur' },
              response: { type: 'string', example: 'Réponse IA' },
              provider_used: { type: 'string', example: 'openai' },
              tokens_used: { type: 'number', example: 150 },
              processing_time_ms: { type: 'number', example: 2300 },
              created_at: { type: 'string', format: 'date-time' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 25 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            totalPages: { type: 'number', example: 2 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session non trouvée',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Paramètres invalides',
  })
  @Throttle({ default: { limit: 100, ttl: 60000 } }) // 100 req/min
  async getSessionConversations(
    @Param('tenant_slug') tenantSlug: string,
    @Param('session_id') sessionId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('provider') provider?: AIProvider,
  ) {
    const startTime = Date.now();

    try {
      const queryDto = new ConversationQueryDto({
        session_id: sessionId,
        page,
        limit,
        provider,
      });

      const result = await this.sessionService.findSessionConversations(queryDto);

      const processingTime = Date.now() - startTime;
      
      this.logger.log(
        `Conversations récupérées pour session ${sessionId} en ${processingTime}ms - ` +
        `${result.data.length}/${result.meta.total} éléments`
      );

      return {
        success: true,
        data: result.data.map(conv => conv.toPublic()),
        meta: {
          ...result.meta,
          processingTimeMs: processingTime,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `Erreur récupération conversations session ${sessionId}: ${error.message} (${processingTime}ms)`,
        error.stack,
      );
      throw error;
    }
  }

  // =====================================
  // ENDPOINT 4: POST /sessions/:session_id/conversations
  // =====================================
  @Post(':session_id/conversations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Ajouter une conversation à une session',
    description: 'Ajoute un message utilisateur et potentiellement la réponse IA à une session.',
  })
  @ApiParam({
    name: 'tenant_slug',
    description: 'Slug du tenant',
    example: 'entreprise-demo',
  })
  @ApiParam({
    name: 'session_id',
    description: 'ID de la session',
    example: 'uuid-session',
  })
  @ApiBody({
    type: CreateConversationDto,
    description: 'Données de la nouvelle conversation',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Conversation créée avec succès',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'uuid' },
            message: { type: 'string', example: 'Question utilisateur' },
            response: { type: 'string', nullable: true },
            provider_used: { type: 'string', nullable: true },
            tokens_used: { type: 'number', example: 0 },
            processing_time_ms: { type: 'number', example: 0 },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session non trouvée',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  @Throttle({ default: { limit: 50, ttl: 60000 } }) // 50 messages/min max
  async createConversation(
    @Param('tenant_slug') tenantSlug: string,
    @Param('session_id') sessionId: string,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const startTime = Date.now();

    try {
      const conversation = await this.sessionService.createConversation(
        sessionId,
        createConversationDto,
      );

      const processingTime = Date.now() - startTime;
      
      this.logger.log(
        `Conversation créée pour session ${sessionId} en ${processingTime}ms: ${conversation.id}`
      );

      return {
        success: true,
        data: conversation.toPublic(),
        meta: {
          processingTimeMs: processingTime,
          sessionId: sessionId,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `Erreur création conversation session ${sessionId}: ${error.message} (${processingTime}ms)`,
        error.stack,
      );
      throw error;
    }
  }

  // =====================================
  // ENDPOINTS BONUS POUR GESTION COMPLÈTE
  // =====================================

  @Put(':session_id')
  @ApiOperation({
    summary: 'Mettre à jour une session',
    description: 'Met à jour le titre et/ou les métadonnées d\'une session.',
  })
  @ApiParam({ name: 'tenant_slug', description: 'Slug du tenant' })
  @ApiParam({ name: 'session_id', description: 'ID de la session' })
  @ApiBody({ type: UpdateSessionDto })
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async updateSession(
    @Param('tenant_slug') tenantSlug: string,
    @Param('session_id') sessionId: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    const startTime = Date.now();

    try {
      const session = await this.sessionService.updateSession(sessionId, updateSessionDto);

      const processingTime = Date.now() - startTime;
      
      this.logger.log(`Session mise à jour ${sessionId} en ${processingTime}ms`);

      return {
        success: true,
        data: session.toPublic(),
        meta: { processingTimeMs: processingTime },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `Erreur mise à jour session ${sessionId}: ${error.message} (${processingTime}ms)`,
        error.stack,
      );
      throw error;
    }
  }

  @Delete(':session_id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer une session',
    description: 'Supprime une session et toutes ses conversations.',
  })
  @ApiParam({ name: 'tenant_slug', description: 'Slug du tenant' })
  @ApiParam({ name: 'session_id', description: 'ID de la session' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async deleteSession(
    @Param('tenant_slug') tenantSlug: string,
    @Param('session_id') sessionId: string,
  ) {
    const startTime = Date.now();

    try {
      await this.sessionService.deleteSession(sessionId);

      const processingTime = Date.now() - startTime;
      
      this.logger.log(`Session supprimée ${sessionId} en ${processingTime}ms`);

      // Pas de retour pour DELETE (204 No Content)
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `Erreur suppression session ${sessionId}: ${error.message} (${processingTime}ms)`,
        error.stack,
      );
      throw error;
    }
  }

  @Put('conversations/:conversation_id')
  @ApiOperation({
    summary: 'Mettre à jour une conversation',
    description: 'Met à jour la réponse et les métriques d\'une conversation.',
  })
  @ApiParam({ name: 'tenant_slug', description: 'Slug du tenant' })
  @ApiParam({ name: 'conversation_id', description: 'ID de la conversation' })
  @ApiBody({ type: UpdateConversationDto })
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async updateConversation(
    @Param('tenant_slug') tenantSlug: string,
    @Param('conversation_id') conversationId: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    const startTime = Date.now();

    try {
      const conversation = await this.sessionService.updateConversation(
        conversationId,
        updateConversationDto,
      );

      const processingTime = Date.now() - startTime;
      
      this.logger.log(`Conversation mise à jour ${conversationId} en ${processingTime}ms`);

      return {
        success: true,
        data: conversation.toPublic(),
        meta: { processingTimeMs: processingTime },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `Erreur mise à jour conversation ${conversationId}: ${error.message} (${processingTime}ms)`,
        error.stack,
      );
      throw error;
    }
  }
}