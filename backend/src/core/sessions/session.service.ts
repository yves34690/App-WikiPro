import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ForbiddenException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

import { Session, AIProvider } from './entities/session.entity';
import { Conversation } from './entities/conversation.entity';
import { User } from '@core/entities/user.entity';

import { 
  CreateSessionDto, 
  UpdateSessionDto, 
  CreateConversationDto, 
  UpdateConversationDto, 
  ConversationQueryDto 
} from './dto';

interface AuthenticatedRequest extends Request {
  user: User;
  tenant: { id: string; slug: string };
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface SessionWithStats {
  session: Session;
  stats: {
    conversationCount: number;
    totalTokens: number;
    avgProcessingTime: number;
    lastActivity: Date;
  };
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    
    @Inject(REQUEST) 
    private readonly request: AuthenticatedRequest,
  ) {}

  // =====================================
  // SESSIONS CRUD
  // =====================================

  async createSession(createSessionDto: CreateSessionDto): Promise<Session> {
    this.logger.log(`Création nouvelle session: ${createSessionDto.toLogSafe()}`);

    // Validation métier
    const validationErrors = createSessionDto.validate();
    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: 'Données de session invalides',
        errors: validationErrors,
      });
    }

    // Vérifier que l'utilisateur est authentifié
    const currentUser = this.getCurrentUser();
    
    // Créer la session avec isolation tenant automatique
    const session = this.sessionRepository.create({
      user_id: currentUser.id,
      title: createSessionDto.getCleanTitle(),
      provider: createSessionDto.provider,
      metadata: {
        ...createSessionDto.metadata,
        created_by: currentUser.id,
        tenant_id: this.getCurrentTenantId(),
        created_at_iso: new Date().toISOString(),
      },
    });

    try {
      const savedSession = await this.sessionRepository.save(session);
      
      this.logger.log(
        `Session créée avec succès: ${savedSession.id} pour utilisateur ${currentUser.id}`
      );
      
      return savedSession;
    } catch (error) {
      this.logger.error(`Erreur création session: ${error.message}`, error.stack);
      throw new BadRequestException('Erreur lors de la création de la session');
    }
  }

  async findUserSessions(
    page: number = 1, 
    limit: number = 20,
    titleFilter?: string,
    providerFilter?: AIProvider
  ): Promise<PaginatedResponse<SessionWithStats>> {
    this.logger.log(`Récupération sessions utilisateur - page: ${page}, limit: ${limit}`);

    const currentUser = this.getCurrentUser();
    
    // Validation des paramètres
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 20;

    const queryBuilder = this.sessionRepository
      .createQueryBuilder('session')
      .where('session.user_id = :userId', { userId: currentUser.id })
      .orderBy('session.created_at', 'DESC');

    // Filtrage par titre
    if (titleFilter && titleFilter.trim()) {
      queryBuilder.andWhere(
        'session.title ILIKE :titleFilter',
        { titleFilter: `%${titleFilter.trim()}%` }
      );
    }

    // Filtrage par provider
    if (providerFilter && Object.values(AIProvider).includes(providerFilter)) {
      queryBuilder.andWhere('session.provider = :provider', { provider: providerFilter });
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    try {
      const [sessions, total] = await queryBuilder.getManyAndCount();

      // Enrichir avec les statistiques
      const sessionsWithStats = await Promise.all(
        sessions.map(async (session) => {
          const stats = await this.getSessionStatistics(session.id);
          return { session, stats };
        })
      );

      const totalPages = Math.ceil(total / limit);
      
      this.logger.log(
        `Sessions récupérées: ${sessions.length}/${total} pour utilisateur ${currentUser.id}`
      );

      return {
        data: sessionsWithStats,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      this.logger.error(`Erreur récupération sessions: ${error.message}`, error.stack);
      throw new BadRequestException('Erreur lors de la récupération des sessions');
    }
  }

  async findSessionById(sessionId: string): Promise<Session> {
    this.logger.log(`Récupération session: ${sessionId}`);

    const currentUser = this.getCurrentUser();

    if (!this.isValidUUID(sessionId)) {
      throw new BadRequestException('ID de session invalide');
    }

    try {
      const session = await this.sessionRepository.findOne({
        where: {
          id: sessionId,
          user_id: currentUser.id, // Isolation tenant automatique
        },
        relations: ['conversations'],
      });

      if (!session) {
        throw new NotFoundException('Session non trouvée');
      }

      return session;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Erreur récupération session ${sessionId}: ${error.message}`, error.stack);
      throw new BadRequestException('Erreur lors de la récupération de la session');
    }
  }

  async updateSession(sessionId: string, updateSessionDto: UpdateSessionDto): Promise<Session> {
    this.logger.log(`Mise à jour session: ${sessionId} - ${updateSessionDto.toLogSafe()}`);

    // Validation métier
    const validationErrors = updateSessionDto.validate();
    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: 'Données de mise à jour invalides',
        errors: validationErrors,
      });
    }

    // Récupérer la session existante (avec vérification tenant)
    const existingSession = await this.findSessionById(sessionId);

    try {
      // Préparer les données de mise à jour
      const updateData: Partial<Session> = {};

      if (updateSessionDto.hasTitle()) {
        updateData.title = updateSessionDto.getCleanTitle()!;
      }

      if (updateSessionDto.hasMetadata()) {
        updateData.metadata = updateSessionDto.mergeWithExistingMetadata(existingSession.metadata);
      }

      // Effectuer la mise à jour
      await this.sessionRepository.update(sessionId, updateData);

      // Récupérer la session mise à jour
      const updatedSession = await this.findSessionById(sessionId);
      
      this.logger.log(`Session mise à jour avec succès: ${sessionId}`);
      
      return updatedSession;
    } catch (error) {
      this.logger.error(`Erreur mise à jour session ${sessionId}: ${error.message}`, error.stack);
      throw new BadRequestException('Erreur lors de la mise à jour de la session');
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.logger.log(`Suppression session: ${sessionId}`);

    // Vérifier que la session existe et appartient à l'utilisateur
    const session = await this.findSessionById(sessionId);

    try {
      // La suppression en cascade des conversations est gérée par la DB
      await this.sessionRepository.remove(session);
      
      this.logger.log(`Session supprimée avec succès: ${sessionId}`);
    } catch (error) {
      this.logger.error(`Erreur suppression session ${sessionId}: ${error.message}`, error.stack);
      throw new BadRequestException('Erreur lors de la suppression de la session');
    }
  }

  // =====================================
  // CONVERSATIONS CRUD
  // =====================================

  async createConversation(
    sessionId: string, 
    createConversationDto: CreateConversationDto
  ): Promise<Conversation> {
    this.logger.log(`Création conversation pour session: ${sessionId}`);

    // Validation métier
    const validationErrors = createConversationDto.validate();
    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: 'Données de conversation invalides',
        errors: validationErrors,
      });
    }

    // Vérifier que la session existe et appartient à l'utilisateur
    const session = await this.findSessionById(sessionId);

    const conversation = this.conversationRepository.create({
      session_id: sessionId,
      message: createConversationDto.getCleanMessage(),
      metadata: {
        ...createConversationDto.metadata,
        session_provider: session.provider,
        created_at_iso: new Date().toISOString(),
      },
    });

    try {
      const savedConversation = await this.conversationRepository.save(conversation);
      
      this.logger.log(
        `Conversation créée: ${savedConversation.id} dans session ${sessionId}`
      );
      
      return savedConversation;
    } catch (error) {
      this.logger.error(
        `Erreur création conversation pour session ${sessionId}: ${error.message}`, 
        error.stack
      );
      throw new BadRequestException('Erreur lors de la création de la conversation');
    }
  }

  async findSessionConversations(
    queryDto: ConversationQueryDto
  ): Promise<PaginatedResponse<Conversation>> {
    this.logger.log(`Récupération conversations: ${queryDto.toLogSafe()}`);

    // Vérifier que la session existe et appartient à l'utilisateur
    await this.findSessionById(queryDto.session_id);

    const queryBuilder = this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.session_id = :sessionId', { sessionId: queryDto.session_id })
      .orderBy('conversation.created_at', 'ASC'); // Ordre chronologique

    // Filtrage par provider si spécifié
    if (queryDto.provider) {
      queryBuilder.andWhere('conversation.provider_used = :provider', { 
        provider: queryDto.provider 
      });
    }

    // Pagination
    const offset = queryDto.getOffset();
    queryBuilder.skip(offset).take(queryDto.limit);

    try {
      const [conversations, total] = await queryBuilder.getManyAndCount();

      const totalPages = Math.ceil(total / (queryDto.limit || 20));
      
      this.logger.log(
        `Conversations récupérées: ${conversations.length}/${total} pour session ${queryDto.session_id}`
      );

      return {
        data: conversations,
        meta: {
          total,
          page: queryDto.page || 1,
          limit: queryDto.limit || 20,
          totalPages,
          hasNextPage: (queryDto.page || 1) < totalPages,
          hasPreviousPage: (queryDto.page || 1) > 1,
        },
      };
    } catch (error) {
      this.logger.error(
        `Erreur récupération conversations session ${queryDto.session_id}: ${error.message}`, 
        error.stack
      );
      throw new BadRequestException('Erreur lors de la récupération des conversations');
    }
  }

  async updateConversation(
    conversationId: string, 
    updateConversationDto: UpdateConversationDto
  ): Promise<Conversation> {
    this.logger.log(`Mise à jour conversation: ${conversationId}`);

    // Validation métier
    const validationErrors = updateConversationDto.validate();
    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: 'Données de mise à jour invalides',
        errors: validationErrors,
      });
    }

    if (!this.isValidUUID(conversationId)) {
      throw new BadRequestException('ID de conversation invalide');
    }

    // Récupérer la conversation et vérifier l'accès via la session
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['session'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Vérifier que la session appartient à l'utilisateur courant
    const currentUser = this.getCurrentUser();
    if (conversation.session.user_id !== currentUser.id) {
      throw new ForbiddenException('Accès non autorisé à cette conversation');
    }

    try {
      // Préparer les données de mise à jour
      const updateData: Partial<Conversation> = {};

      if (updateConversationDto.response !== undefined) {
        updateData.response = updateConversationDto.response?.trim() || null;
      }

      if (updateConversationDto.provider_used) {
        updateData.provider_used = updateConversationDto.provider_used;
      }

      if (updateConversationDto.tokens_used !== undefined) {
        updateData.tokens_used = updateConversationDto.tokens_used;
      }

      if (updateConversationDto.processing_time_ms !== undefined) {
        updateData.processing_time_ms = updateConversationDto.processing_time_ms;
      }

      if (updateConversationDto.metadata !== undefined) {
        updateData.metadata = {
          ...conversation.metadata,
          ...updateConversationDto.metadata,
          updated_at_iso: new Date().toISOString(),
        };
      }

      // Effectuer la mise à jour
      await this.conversationRepository.update(conversationId, updateData);

      // Récupérer la conversation mise à jour
      const updatedConversation = await this.conversationRepository.findOne({
        where: { id: conversationId },
      });

      this.logger.log(`Conversation mise à jour: ${conversationId}`);
      
      return updatedConversation!;
    } catch (error) {
      this.logger.error(
        `Erreur mise à jour conversation ${conversationId}: ${error.message}`, 
        error.stack
      );
      throw new BadRequestException('Erreur lors de la mise à jour de la conversation');
    }
  }

  // =====================================
  // STATISTIQUES ET UTILITAIRES
  // =====================================

  async getSessionStatistics(sessionId: string): Promise<{
    conversationCount: number;
    totalTokens: number;
    avgProcessingTime: number;
    lastActivity: Date;
  }> {
    try {
      const result = await this.conversationRepository
        .createQueryBuilder('conversation')
        .select([
          'COUNT(conversation.id) as conversation_count',
          'COALESCE(SUM(conversation.tokens_used), 0) as total_tokens',
          'COALESCE(AVG(conversation.processing_time_ms), 0) as avg_processing_time',
          'MAX(conversation.created_at) as last_activity',
        ])
        .where('conversation.session_id = :sessionId', { sessionId })
        .getRawOne();

      return {
        conversationCount: parseInt(result.conversation_count) || 0,
        totalTokens: parseInt(result.total_tokens) || 0,
        avgProcessingTime: Math.round(parseFloat(result.avg_processing_time) || 0),
        lastActivity: result.last_activity || new Date(),
      };
    } catch (error) {
      this.logger.warn(`Erreur calcul statistiques session ${sessionId}: ${error.message}`);
      return {
        conversationCount: 0,
        totalTokens: 0,
        avgProcessingTime: 0,
        lastActivity: new Date(),
      };
    }
  }

  // =====================================
  // MÉTHODES PRIVÉES
  // =====================================

  private getCurrentUser(): User {
    if (!this.request.user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }
    return this.request.user;
  }

  private getCurrentTenantId(): string {
    if (!this.request.tenant?.id) {
      throw new ForbiddenException('Tenant non identifié');
    }
    return this.request.tenant.id;
  }

  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}