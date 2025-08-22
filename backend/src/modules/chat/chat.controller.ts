import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  ParseUUIDPipe,
  HttpException,
  HttpStatus,
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
import { JwtAuthGuard } from '@core/auth/guards/jwt-auth.guard';
import { ConversationService, CreateConversationDto, UpdateConversationDto } from './services/conversation.service';
import { MessageService } from './services/message.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    tenantId: string;
    username: string;
    sub: string;
  };
}

/**
 * Contrôleur REST pour la gestion des conversations et messages
 * APIs complètes pour l'historique et la gestion du chat
 */
@ApiTags('Chat Management')
@Controller('api/chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  private logger = new Logger(ChatController.name);

  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
  ) {}

  /**
   * Obtenir la liste des conversations de l'utilisateur
   */
  @Get('conversations')
  @ApiOperation({ 
    summary: 'Obtenir les conversations utilisateur',
    description: 'Récupère la liste paginée des conversations avec résumé des messages'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Numéro de page (défaut: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre par page (défaut: 20)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Recherche dans les titres' })
  @ApiQuery({ name: 'contextType', required: false, type: String, description: 'Filtrer par type de contexte' })
  @ApiResponse({ status: 200, description: 'Liste des conversations récupérée avec succès' })
  async getUserConversations(
    @Req() req: AuthenticatedRequest,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
    @Query('search') search?: string,
    @Query('contextType') contextType?: string,
  ) {
    this.logger.log(`Récupération conversations - User: ${req.user.username}, Page: ${page}`);

    try {
      // Limiter la pagination pour éviter les abus
      const safeLimit = Math.min(limit, 100);
      const conversations = await this.conversationService.getUserConversations(
        req.user.sub,
        req.user.tenantId,
        safeLimit,
        (page - 1) * safeLimit
      );

      // Filtrage côté application si nécessaire
      let filteredConversations = conversations;
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredConversations = conversations.filter(c => 
          c.conversation.title?.toLowerCase().includes(searchLower) ||
          c.conversation.context_type?.toLowerCase().includes(searchLower)
        );
      }

      if (contextType) {
        filteredConversations = filteredConversations.filter(c => 
          c.conversation.context_type === contextType
        );
      }

      return {
        conversations: filteredConversations.map(c => ({
          id: c.conversation.id,
          title: c.conversation.title,
          contextType: c.conversation.context_type,
          createdAt: c.conversation.created_at,
          updatedAt: c.conversation.updated_at,
          messageCount: c.messageCount,
          lastMessage: c.lastMessage ? {
            id: c.lastMessage.id,
            role: c.lastMessage.role,
            content: c.lastMessage.content?.substring(0, 100) + (c.lastMessage.content?.length > 100 ? '...' : ''),
            createdAt: c.lastMessage.created_at,
            aiProvider: c.lastMessage.ai_provider
          } : null,
          aiSettings: c.conversation.ai_settings
        })),
        pagination: {
          currentPage: page,
          itemsPerPage: safeLimit,
          totalItems: conversations.length,
          hasNextPage: conversations.length === safeLimit,
        },
        filters: {
          search,
          contextType
        }
      };
    } catch (error) {
      this.logger.error(`Erreur récupération conversations: ${error.message}`);
      throw new HttpException('Erreur lors de la récupération des conversations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Obtenir les détails d'une conversation spécifique
   */
  @Get('conversations/:id')
  @ApiOperation({ 
    summary: 'Obtenir une conversation spécifique',
    description: 'Récupère les détails complets d\'une conversation avec ses messages'
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID UUID de la conversation' })
  @ApiQuery({ name: 'includeMessages', required: false, type: Boolean, description: 'Inclure les messages (défaut: true)' })
  @ApiQuery({ name: 'messageLimit', required: false, type: Number, description: 'Limite messages (défaut: 50)' })
  @ApiResponse({ status: 200, description: 'Conversation trouvée' })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  async getConversation(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Query('includeMessages') includeMessages: boolean = true,
    @Query('messageLimit', ParseIntPipe) messageLimit: number = 50,
  ) {
    this.logger.log(`Récupération conversation: ${conversationId} pour ${req.user.username}`);

    try {
      const conversation = await this.conversationService.getConversationById(
        conversationId, 
        req.user.tenantId
      );

      if (!conversation) {
        throw new HttpException('Conversation non trouvée', HttpStatus.NOT_FOUND);
      }

      const result: any = {
        id: conversation.id,
        title: conversation.title,
        contextType: conversation.context_type,
        aiSettings: conversation.ai_settings,
        createdAt: conversation.created_at,
        updatedAt: conversation.updated_at,
        userId: conversation.user_id,
      };

      if (includeMessages) {
        const messages = await this.conversationService.getConversationMessages(
          conversationId,
          req.user.tenantId,
          Math.min(messageLimit, 200) // Limiter pour éviter surcharge
        );

        result.messages = messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.created_at,
          aiProvider: msg.ai_provider,
          aiModel: msg.ai_model,
          tokenCount: msg.token_count,
          responseTimeMs: msg.response_time_ms,
          status: msg.status,
          rating: msg.rating,
          feedback: msg.feedback,
          citations: msg.citations,
          parentMessageId: msg.parent_message_id,
          metadata: msg.metadata
        }));

        result.messageCount = messages.length;
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Erreur récupération conversation: ${error.message}`);
      throw new HttpException('Erreur lors de la récupération de la conversation', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Créer une nouvelle conversation
   */
  @Post('conversations')
  @ApiOperation({ 
    summary: 'Créer une nouvelle conversation',
    description: 'Crée une conversation avec paramètres IA optionnels'
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', description: 'Titre de la conversation' },
        contextType: { type: 'string', description: 'Type de contexte (défaut: general)' },
        aiSettings: {
          type: 'object',
          properties: {
            provider: { type: 'string', description: 'Fournisseur IA' },
            model: { type: 'string', description: 'Modèle IA' },
            temperature: { type: 'number', description: 'Température (0-1)' },
            max_tokens: { type: 'number', description: 'Tokens maximum' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Conversation créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async createConversation(
    @Req() req: AuthenticatedRequest,
    @Body() createDto: CreateConversationDto,
  ) {
    this.logger.log(`Création conversation: "${createDto.title}" pour ${req.user.username}`);

    try {
      const conversation = await this.conversationService.createConversation({
        ...createDto,
        userId: req.user.sub,
        tenantId: req.user.tenantId,
      });

      return {
        id: conversation.id,
        title: conversation.title,
        contextType: conversation.context_type,
        aiSettings: conversation.ai_settings,
        createdAt: conversation.created_at,
        message: 'Conversation créée avec succès'
      };
    } catch (error) {
      this.logger.error(`Erreur création conversation: ${error.message}`);
      throw new HttpException('Erreur lors de la création de la conversation', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Mettre à jour une conversation
   */
  @Put('conversations/:id')
  @ApiOperation({ 
    summary: 'Mettre à jour une conversation',
    description: 'Met à jour le titre, contexte ou paramètres IA d\'une conversation'
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID UUID de la conversation' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Nouveau titre' },
        contextType: { type: 'string', description: 'Nouveau type de contexte' },
        aiSettings: {
          type: 'object',
          properties: {
            provider: { type: 'string' },
            model: { type: 'string' },
            temperature: { type: 'number' },
            max_tokens: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Conversation mise à jour' })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  async updateConversation(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() updateDto: UpdateConversationDto,
  ) {
    this.logger.log(`Mise à jour conversation: ${conversationId} pour ${req.user.username}`);

    try {
      const updatedConversation = await this.conversationService.updateConversation(
        conversationId,
        req.user.tenantId,
        updateDto
      );

      return {
        id: updatedConversation.id,
        title: updatedConversation.title,
        contextType: updatedConversation.context_type,
        aiSettings: updatedConversation.ai_settings,
        updatedAt: updatedConversation.updated_at,
        message: 'Conversation mise à jour avec succès'
      };
    } catch (error) {
      this.logger.error(`Erreur mise à jour conversation: ${error.message}`);
      throw new HttpException('Conversation non trouvée ou erreur de mise à jour', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Supprimer une conversation
   */
  @Delete('conversations/:id')
  @ApiOperation({ 
    summary: 'Supprimer une conversation',
    description: 'Supprime définitivement une conversation et tous ses messages'
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID UUID de la conversation' })
  @ApiResponse({ status: 200, description: 'Conversation supprimée' })
  @ApiResponse({ status: 404, description: 'Conversation non trouvée' })
  async deleteConversation(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) conversationId: string,
  ) {
    this.logger.log(`Suppression conversation: ${conversationId} pour ${req.user.username}`);

    try {
      await this.conversationService.deleteConversation(conversationId, req.user.tenantId);

      return {
        message: 'Conversation supprimée avec succès',
        conversationId,
        deletedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Erreur suppression conversation: ${error.message}`);
      throw new HttpException('Conversation non trouvée', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Évaluer un message
   */
  @Put('messages/:id/rating')
  @ApiOperation({ 
    summary: 'Évaluer un message',
    description: 'Ajouter une note et feedback à un message IA'
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID UUID du message' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['rating'],
      properties: {
        rating: { type: 'number', minimum: 1, maximum: 5, description: 'Note de 1 à 5' },
        feedback: { type: 'string', description: 'Commentaire optionnel' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Message évalué avec succès' })
  @ApiResponse({ status: 400, description: 'Note invalide' })
  async rateMessage(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) messageId: string,
    @Body() ratingDto: { rating: number; feedback?: string },
  ) {
    this.logger.log(`Évaluation message: ${messageId} avec note ${ratingDto.rating}`);

    try {
      const updatedMessage = await this.messageService.rateMessage(
        messageId,
        req.user.tenantId,
        ratingDto.rating,
        ratingDto.feedback
      );

      return {
        messageId: updatedMessage.id,
        rating: updatedMessage.rating,
        feedback: updatedMessage.feedback,
        ratedAt: new Date().toISOString(),
        message: 'Message évalué avec succès'
      };
    } catch (error) {
      this.logger.error(`Erreur évaluation message: ${error.message}`);
      throw new HttpException('Erreur lors de l\'évaluation du message', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Rechercher dans les conversations et messages
   */
  @Get('search')
  @ApiOperation({ 
    summary: 'Rechercher dans les conversations',
    description: 'Recherche textuelle dans les conversations et messages'
  })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Terme de recherche' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite résultats (défaut: 20)' })
  @ApiQuery({ name: 'contextType', required: false, type: String, description: 'Filtrer par contexte' })
  @ApiResponse({ status: 200, description: 'Résultats de recherche' })
  @ApiResponse({ status: 400, description: 'Terme de recherche requis' })
  async searchConversations(
    @Req() req: AuthenticatedRequest,
    @Query('q') searchTerm: string,
    @Query('limit', ParseIntPipe) limit: number = 20,
    @Query('contextType') contextType?: string,
  ) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new HttpException('Terme de recherche requis (minimum 2 caractères)', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`Recherche: "${searchTerm}" pour ${req.user.username}`);

    try {
      const results = await this.conversationService.searchConversations(
        req.user.sub,
        req.user.tenantId,
        searchTerm.trim(),
        Math.min(limit, 100)
      );

      return {
        searchTerm,
        results: results.map(result => ({
          conversationId: result.conversation.id,
          conversationTitle: result.conversation.title,
          contextType: result.conversation.context_type,
          messageCount: result.messageCount,
          matchType: 'conversation', // Pour futures extensions
          createdAt: result.conversation.created_at,
        })),
        totalResults: results.length,
        filters: { contextType }
      };
    } catch (error) {
      this.logger.error(`Erreur recherche: ${error.message}`);
      throw new HttpException('Erreur lors de la recherche', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Obtenir les statistiques de chat de l'utilisateur
   */
  @Get('stats')
  @ApiOperation({ 
    summary: 'Statistiques de chat utilisateur',
    description: 'Récupère les statistiques détaillées d\'utilisation du chat'
  })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées' })
  async getChatStats(@Req() req: AuthenticatedRequest) {
    this.logger.log(`Récupération stats chat pour ${req.user.username}`);

    try {
      const stats = await this.conversationService.getUserChatStats(req.user.sub, req.user.tenantId);
      const streamingStats = this.messageService.getStreamingStats();

      return {
        ...stats,
        streaming: streamingStats,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Erreur récupération stats: ${error.message}`);
      throw new HttpException('Erreur lors de la récupération des statistiques', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Exporter les conversations (pour backup utilisateur)
   */
  @Get('export')
  @ApiOperation({ 
    summary: 'Exporter les conversations',
    description: 'Exporte toutes les conversations utilisateur en JSON'
  })
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'text'], description: 'Format d\'export' })
  @ApiResponse({ status: 200, description: 'Export généré' })
  async exportConversations(
    @Req() req: AuthenticatedRequest,
    @Query('format') format: 'json' | 'text' = 'json',
  ) {
    this.logger.log(`Export conversations format ${format} pour ${req.user.username}`);

    try {
      const conversations = await this.conversationService.getUserConversations(
        req.user.sub,
        req.user.tenantId,
        1000, // Limite élevée pour export
        0
      );

      const exportData = {
        exportedAt: new Date().toISOString(),
        userId: req.user.sub,
        username: req.user.username,
        tenantId: req.user.tenantId,
        totalConversations: conversations.length,
        conversations: conversations.map(c => ({
          id: c.conversation.id,
          title: c.conversation.title,
          contextType: c.conversation.context_type,
          createdAt: c.conversation.created_at,
          messageCount: c.messageCount,
          aiSettings: c.conversation.ai_settings,
          lastMessage: c.lastMessage
        }))
      };

      return exportData;
    } catch (error) {
      this.logger.error(`Erreur export: ${error.message}`);
      throw new HttpException('Erreur lors de l\'export', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}