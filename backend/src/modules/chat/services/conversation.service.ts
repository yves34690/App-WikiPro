import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '@database/entities/conversation.entity';
import { Message, MessageRole, MessageStatus } from '@database/entities/message.entity';
import { User } from '@database/entities/user.entity';
import { ConversationAnalyticsDto, ConversationStatsDto } from '../dto/conversation.dto';

export interface CreateConversationDto {
  title?: string;
  description?: string;
  userId: string;
  tenantId: string;
  contextType?: string;
  aiSettings?: Record<string, any>;
}

export interface AddMessageDto {
  conversationId: string;
  userId?: string;
  tenantId: string;
  role: MessageRole;
  content: string;
  aiProvider?: string;
  aiModel?: string;
  aiParameters?: Record<string, any>;
  tokenCount?: number;
  promptTokens?: number;
  completionTokens?: number;
  responseTimeMs?: number;
  parentMessageId?: string;
}

export interface UpdateConversationDto {
  title?: string;
  contextType?: string;
  aiSettings?: Record<string, any>;
}

export interface ConversationWithStats {
  conversation: Conversation;
  messageCount: number;
  lastMessageAt: Date;
  totalTokens: number;
  unreadCount: number;
  lastMessage?: Message;
}

/**
 * Service de gestion des conversations avec persistence complète
 * Gère la création automatique, l'historique et les métadonnées IA
 */
@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Créer automatiquement une nouvelle conversation lors d'une session chat
   */
  async createConversation(dto: CreateConversationDto): Promise<Conversation> {
    // Vérifier que l'utilisateur existe et appartient au tenant
    const user = await this.userRepository.findOne({
      where: { 
        id: dto.userId, 
        tenant_id: dto.tenantId,
        is_active: true 
      }
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé ou inactif');
    }

    const conversation = this.conversationRepository.create({
      title: dto.title || 'Nouvelle conversation',
      description: dto.description,
      tenant_id: dto.tenantId,
      user_id: dto.userId,
      context_type: dto.contextType || 'general',
      ai_settings: dto.aiSettings || {
        temperature: 0.7,
        max_tokens: 2000,
        model: 'gpt-4'
      },
      metadata: {
        created_via: 'chat_session',
        auto_generated: !dto.title, // Indique si le titre a été généré automatiquement
        session_start: new Date().toISOString()
      }
    });

    const savedConversation = await this.conversationRepository.save(conversation);
    
    // Générer un titre automatique si nécessaire
    if (!dto.title) {
      savedConversation.title = `Chat ${savedConversation.id.substring(0, 8)}`;
      await this.conversationRepository.save(savedConversation);
    }

    return savedConversation;
  }

  /**
   * Ajouter un message à une conversation avec métadonnées complètes
   */
  async addMessage(dto: AddMessageDto): Promise<Message> {
    // Vérifier que la conversation existe et appartient au tenant
    const conversation = await this.conversationRepository.findOne({
      where: { 
        id: dto.conversationId, 
        tenant_id: dto.tenantId,
        is_active: true 
      }
    });

    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Vérifier les permissions utilisateur (sauf pour les messages assistant)
    if (dto.userId && dto.role === MessageRole.USER) {
      if (conversation.user_id !== dto.userId) {
        throw new ForbiddenException('Accès non autorisé à cette conversation');
      }
    }

    // Calculer le numéro de séquence
    const lastMessage = await this.messageRepository.findOne({
      where: { conversation_id: dto.conversationId },
      order: { sequence_number: 'DESC' }
    });

    const sequenceNumber = (lastMessage?.sequence_number || 0) + 1;

    const message = this.messageRepository.create({
      tenant_id: dto.tenantId,
      conversation_id: dto.conversationId,
      user_id: dto.userId || null,
      role: dto.role,
      content: dto.content,
      ai_provider: dto.aiProvider,
      ai_model: dto.aiModel,
      ai_parameters: dto.aiParameters || {},
      token_count: dto.tokenCount,
      prompt_tokens: dto.promptTokens,
      completion_tokens: dto.completionTokens,
      response_time_ms: dto.responseTimeMs,
      parent_message_id: dto.parentMessageId,
      sequence_number: sequenceNumber,
      status: dto.role === MessageRole.USER ? MessageStatus.COMPLETED : MessageStatus.PROCESSING,
      metadata: {
        session_id: conversation.metadata?.session_id,
        created_via: 'chat_gateway',
        processing_start: dto.role === MessageRole.ASSISTANT ? new Date().toISOString() : undefined
      }
    });

    const savedMessage = await this.messageRepository.save(message);

    // Mettre à jour les métadonnées de la conversation
    await this.updateConversationMetadata(conversation, savedMessage);

    // Générer un titre automatique si c'est le premier message utilisateur
    if (dto.role === MessageRole.USER && sequenceNumber === 1 && conversation.metadata?.auto_generated) {
      const autoTitle = conversation.generateAutoTitle(dto.content);
      conversation.title = autoTitle;
      conversation.metadata = { ...conversation.metadata, auto_generated: false };
      await this.conversationRepository.save(conversation);
    }

    return savedMessage;
  }

  /**
   * Mettre à jour un message (statut, contenu, métadonnées)
   */
  async updateMessage(
    messageId: string, 
    tenantId: string, 
    updates: Partial<Message>
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, tenant_id: tenantId }
    });

    if (!message) {
      throw new NotFoundException('Message non trouvé');
    }

    // Mise à jour des champs autorisés
    const allowedFields = [
      'content', 'status', 'ai_provider', 'ai_model', 'ai_parameters',
      'token_count', 'prompt_tokens', 'completion_tokens', 'response_time_ms',
      'error_message', 'error_details', 'completed_at', 'confidence', 'citations'
    ];

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        message[field] = updates[field];
      }
    });

    // Marquer comme complété si nécessaire
    if (updates.status === MessageStatus.COMPLETED && !message.completed_at) {
      message.completed_at = new Date();
    }

    return this.messageRepository.save(message);
  }

  /**
   * Récupérer les conversations d'un utilisateur avec statistiques
   */
  async getUserConversations(
    userId: string, 
    tenantId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<ConversationWithStats[]> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where('conversation.user_id = :userId', { userId })
      .andWhere('conversation.tenant_id = :tenantId', { tenantId })
      .andWhere('conversation.is_active = :isActive', { isActive: true })
      .orderBy('conversation.last_message_at', 'DESC', 'NULLS LAST')
      .addOrderBy('conversation.created_at', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();

    // Calculer les statistiques pour chaque conversation
    const conversationsWithStats: ConversationWithStats[] = await Promise.all(
      conversations.map(async (conversation) => {
        const stats = await this.messageRepository
          .createQueryBuilder('message')
          .select([
            'COUNT(*) as messageCount',
            'COALESCE(SUM(message.token_count), 0) as totalTokens',
            'MAX(message.created_at) as lastMessageAt'
          ])
          .where('message.conversation_id = :conversationId', { conversationId: conversation.id })
          .getRawOne();

        return {
          conversation,
          messageCount: parseInt(stats.messagecount) || 0,
          lastMessageAt: stats.lastmessageat || conversation.created_at,
          totalTokens: parseInt(stats.totaltokens) || 0,
          unreadCount: 0 // TODO: Implémenter la logique de messages non lus
        };
      })
    );

    return conversationsWithStats;
  }


  /**
   * Supprimer une conversation et tous ses messages
   */
  async deleteConversation(conversationId: string, tenantId: string, userId?: string): Promise<boolean> {
    const whereClause: any = { 
      id: conversationId, 
      tenant_id: tenantId
    };
    
    // Ajouter userId si fourni (pour sécurité supplémentaire)
    if (userId) {
      whereClause.user_id = userId;
    }

    const conversation = await this.conversationRepository.findOne({
      where: whereClause
    });

    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Soft delete - marquer comme inactif
    conversation.is_active = false;
    conversation.is_archived = true;
    conversation.updated_at = new Date();
    
    await this.conversationRepository.save(conversation);
    
    return true;
  }

  /**
   * Rechercher dans l'historique des conversations
   */
  async searchConversations(
    userId: string,
    tenantId: string,
    query: string,
    limit: number = 20
  ): Promise<Array<{ conversation: Conversation; messageCount: number }>> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoin('conversation.messages', 'message')
      .where('conversation.user_id = :userId', { userId })
      .andWhere('conversation.tenant_id = :tenantId', { tenantId })
      .andWhere('conversation.is_active = :isActive', { isActive: true })
      .andWhere(
        '(conversation.title ILIKE :query OR conversation.description ILIKE :query)',
        { query: `%${query}%` }
      )
      .orderBy('conversation.last_message_at', 'DESC')
      .take(limit)
      .getMany();

    return conversations.map(conversation => ({
      conversation,
      messageCount: conversation.message_count || 0
    }));
  }

  /**
   * Mettre à jour les métadonnées de conversation après ajout de message
   */
  private async updateConversationMetadata(conversation: Conversation, message: Message): Promise<void> {
    conversation.incrementMessageCount();
    
    if (message.token_count) {
      conversation.token_count += message.token_count;
      // Mise à jour du nouveau champ total_tokens - TICKET-BACKEND-002
      conversation.total_tokens += message.token_count;
    }

    // Mise à jour du coût total - TICKET-BACKEND-002
    if (message.cost_usd) {
      conversation.total_cost_usd += message.cost_usd;
    }

    conversation.updateLastMessageTime();

    // Utiliser la nouvelle méthode pour mettre à jour les analytics IA - TICKET-BACKEND-002
    await this.updateConversationAIMetrics(conversation, message);
  }

  /**
   * Obtenir les statistiques d'usage d'un utilisateur
   */
  async getUserChatStats(userId: string, tenantId: string): Promise<{
    totalConversations: number;
    totalMessages: number;
    totalTokens: number;
    avgMessagesPerConversation: number;
    lastChatDate: Date;
  }> {
    const stats = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoin('conversation.messages', 'message')
      .select([
        'COUNT(DISTINCT conversation.id) as totalConversations',
        'COUNT(message.id) as totalMessages',
        'COALESCE(SUM(message.token_count), 0) as totalTokens',
        'MAX(conversation.last_message_at) as lastChatDate'
      ])
      .where('conversation.user_id = :userId', { userId })
      .andWhere('conversation.tenant_id = :tenantId', { tenantId })
      .andWhere('conversation.is_active = :isActive', { isActive: true })
      .getRawOne();

    const totalConversations = parseInt(stats.totalconversations) || 0;
    const totalMessages = parseInt(stats.totalmessages) || 0;

    return {
      totalConversations,
      totalMessages,
      totalTokens: parseInt(stats.totaltokens) || 0,
      avgMessagesPerConversation: totalConversations > 0 ? totalMessages / totalConversations : 0,
      lastChatDate: stats.lastchatdate
    };
  }

  /**
   * Obtenir une conversation par ID avec vérification tenant
   */
  async getConversationById(conversationId: string, tenantId: string): Promise<Conversation | null> {
    return this.conversationRepository.findOne({
      where: { 
        id: conversationId, 
        tenant_id: tenantId,
        is_active: true 
      },
      relations: ['user']
    });
  }

  /**
   * Obtenir les messages d'une conversation
   */
  async getConversationMessages(
    conversationId: string,
    tenantId: string,
    limit: number = 50
  ): Promise<Message[]> {
    return this.messageRepository.find({
      where: { 
        conversation_id: conversationId,
        tenant_id: tenantId
      },
      order: {
        created_at: 'ASC' // Ordre chronologique pour l'affichage
      },
      take: limit
    });
  }

  /**
   * Mettre à jour une conversation
   */
  async updateConversation(
    conversationId: string,
    tenantId: string,
    updateData: Partial<UpdateConversationDto>
  ): Promise<Conversation> {
    const conversation = await this.getConversationById(conversationId, tenantId);
    
    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Appliquer les mises à jour
    if (updateData.title) {
      conversation.title = updateData.title;
    }
    
    if (updateData.contextType) {
      conversation.context_type = updateData.contextType;
    }

    if (updateData.aiSettings) {
      conversation.ai_settings = { ...conversation.ai_settings, ...updateData.aiSettings };
    }

    conversation.updated_at = new Date();
    
    return this.conversationRepository.save(conversation);
  }

  // =================== NOUVELLES MÉTHODES ANALYTICS IA - TICKET-BACKEND-002 ===================

  /**
   * Mettre à jour les analytics de conversation après un nouveau message IA - TICKET-BACKEND-002
   */
  private async updateConversationAIMetrics(conversation: Conversation, message: Message): Promise<void> {
    // Utiliser la nouvelle méthode d'entité
    conversation.updateAIAnalytics(message);
    
    // Recalculer le temps de réponse moyen si c'est un message assistant avec temps de réponse
    if (message.role === MessageRole.ASSISTANT && message.response_time_ms) {
      await conversation.recalculateAvgResponseTime(this.messageRepository);
    }
    
    await this.conversationRepository.save(conversation);
  }

  /**
   * Obtenir les statistiques détaillées d'une conversation - TICKET-BACKEND-002
   */
  async getConversationStats(conversationId: string, tenantId: string): Promise<ConversationStatsDto> {
    const conversation = await this.getConversationById(conversationId, tenantId);
    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Statistiques générales
    const generalStats = await this.messageRepository
      .createQueryBuilder('message')
      .select([
        'COUNT(*) as messageCount',
        'COALESCE(SUM(message.token_count), 0) as totalTokens',
        'COALESCE(SUM(message.cost_usd), 0) as totalCost',
        'AVG(message.response_time_ms) as avgResponseTime',
        'MAX(message.created_at) as lastMessageAt'
      ])
      .where('message.conversation_id = :conversationId', { conversationId })
      .getRawOne();

    // Statistiques par provider
    const providerStats = await this.messageRepository
      .createQueryBuilder('message')
      .select([
        'message.ai_provider as provider',
        'COUNT(*) as messageCount',
        'COALESCE(SUM(message.cost_usd), 0) as totalCost',
        'AVG(message.response_time_ms) as avgResponseTime'
      ])
      .where('message.conversation_id = :conversationId', { conversationId })
      .andWhere('message.ai_provider IS NOT NULL')
      .groupBy('message.ai_provider')
      .getRawMany();

    // Statistiques par modèle
    const modelStats = await this.messageRepository
      .createQueryBuilder('message')
      .select([
        'message.ai_model as model',
        'COUNT(*) as messageCount',
        'COALESCE(SUM(message.cost_usd), 0) as totalCost',
        'AVG(message.confidence_score) as avgConfidenceScore'
      ])
      .where('message.conversation_id = :conversationId', { conversationId })
      .andWhere('message.ai_model IS NOT NULL')
      .groupBy('message.ai_model')
      .getRawMany();

    return {
      conversationId,
      messageCount: parseInt(generalStats.messagecount) || 0,
      totalTokens: parseInt(generalStats.totaltokens) || 0,
      totalCostUsd: parseFloat(generalStats.totalcost) || 0,
      avgResponseTimeMs: generalStats.avgresponsetime ? Math.round(parseFloat(generalStats.avgresponsetime)) : undefined,
      lastMessageAt: generalStats.lastmessageat,
      unreadCount: 0, // TODO: Implémenter la logique des messages non lus
      providerStats: providerStats.map(row => ({
        provider: row.provider,
        messageCount: parseInt(row.messagecount) || 0,
        totalCost: parseFloat(row.totalcost) || 0,
        avgResponseTime: row.avgresponsetime ? Math.round(parseFloat(row.avgresponsetime)) : 0
      })),
      modelStats: modelStats.map(row => ({
        model: row.model,
        messageCount: parseInt(row.messagecount) || 0,
        totalCost: parseFloat(row.totalcost) || 0,
        avgConfidenceScore: parseFloat(row.avgconfidencescore) || 0
      }))
    };
  }

  /**
   * Obtenir les analytics agrégées pour un tenant - TICKET-BACKEND-002
   */
  async getTenantAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<ConversationAnalyticsDto> {
    const conversationQuery = this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoin('conversation.messages', 'message')
      .where('conversation.tenant_id = :tenantId', { tenantId })
      .andWhere('conversation.created_at >= :startDate', { startDate })
      .andWhere('conversation.created_at <= :endDate', { endDate });

    if (userId) {
      conversationQuery.andWhere('conversation.user_id = :userId', { userId });
    }

    // Statistiques globales
    const globalStats = await conversationQuery
      .select([
        'COUNT(DISTINCT conversation.id) as totalConversations',
        'COUNT(message.id) as totalMessages',
        'COALESCE(SUM(message.token_count), 0) as totalTokens',
        'COALESCE(SUM(message.cost_usd), 0) as totalCost',
        'AVG(message.response_time_ms) as avgResponseTime',
        'AVG(message.confidence_score) as avgConfidenceScore'
      ])
      .getRawOne();

    // Répartition par provider
    const providerBreakdown = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.conversation', 'conversation')
      .select([
        'message.ai_provider as provider',
        'COUNT(DISTINCT message.conversation_id) as conversationCount',
        'COUNT(message.id) as messageCount',
        'COALESCE(SUM(message.cost_usd), 0) as totalCost',
        'AVG(message.response_time_ms) as avgResponseTime'
      ])
      .where('conversation.tenant_id = :tenantId', { tenantId })
      .andWhere('message.created_at >= :startDate', { startDate })
      .andWhere('message.created_at <= :endDate', { endDate })
      .andWhere('message.ai_provider IS NOT NULL')
      .groupBy('message.ai_provider')
      .getRawMany();

    // Répartition par modèle
    const modelBreakdown = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.conversation', 'conversation')
      .select([
        'message.ai_model as model',
        'COUNT(message.id) as messageCount',
        'COALESCE(SUM(message.cost_usd), 0) as totalCost',
        'AVG(message.confidence_score) as avgConfidenceScore'
      ])
      .where('conversation.tenant_id = :tenantId', { tenantId })
      .andWhere('message.created_at >= :startDate', { startDate })
      .andWhere('message.created_at <= :endDate', { endDate })
      .andWhere('message.ai_model IS NOT NULL')
      .groupBy('message.ai_model')
      .getRawMany();

    // Statistiques quotidiennes
    const dailyStats = await conversationQuery
      .select([
        'DATE(conversation.created_at) as date',
        'COUNT(DISTINCT conversation.id) as conversationCount',
        'COUNT(message.id) as messageCount',
        'COALESCE(SUM(message.cost_usd), 0) as totalCost',
        'AVG(message.response_time_ms) as avgResponseTime'
      ])
      .groupBy('DATE(conversation.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    const totalConversations = parseInt(globalStats.totalconversations) || 0;
    const totalMessages = parseInt(globalStats.totalmessages) || 0;
    const totalCost = parseFloat(globalStats.totalcost) || 0;

    return {
      tenantId,
      userId,
      startDate,
      endDate,
      totalConversations,
      totalMessages,
      totalTokens: parseInt(globalStats.totaltokens) || 0,
      totalCostUsd: totalCost,
      avgMessagesPerConversation: totalConversations > 0 ? totalMessages / totalConversations : 0,
      avgCostPerConversation: totalConversations > 0 ? totalCost / totalConversations : 0,
      avgResponseTime: globalStats.avgresponsetime ? Math.round(parseFloat(globalStats.avgresponsetime)) : 0,
      avgConfidenceScore: parseFloat(globalStats.avgconfidencescore) || 0,
      providerBreakdown: providerBreakdown.map(row => ({
        provider: row.provider,
        conversationCount: parseInt(row.conversationcount) || 0,
        messageCount: parseInt(row.messagecount) || 0,
        totalCost: parseFloat(row.totalcost) || 0,
        avgResponseTime: row.avgresponsetime ? Math.round(parseFloat(row.avgresponsetime)) : 0,
        marketShare: totalMessages > 0 ? (parseInt(row.messagecount) / totalMessages) * 100 : 0
      })),
      modelBreakdown: modelBreakdown.map(row => ({
        model: row.model,
        messageCount: parseInt(row.messagecount) || 0,
        totalCost: parseFloat(row.totalcost) || 0,
        avgConfidenceScore: parseFloat(row.avgconfidencescore) || 0,
        usage: totalMessages > 0 ? (parseInt(row.messagecount) / totalMessages) * 100 : 0
      })),
      dailyStats: dailyStats.map(row => ({
        date: row.date,
        conversationCount: parseInt(row.conversationcount) || 0,
        messageCount: parseInt(row.messagecount) || 0,
        totalCost: parseFloat(row.totalcost) || 0,
        avgResponseTime: row.avgresponsetime ? Math.round(parseFloat(row.avgresponsetime)) : 0
      }))
    };
  }

  /**
   * Recalculer toutes les métriques IA pour une conversation - TICKET-BACKEND-002
   */
  async recalculateConversationMetrics(conversationId: string, tenantId: string): Promise<Conversation> {
    const conversation = await this.getConversationById(conversationId, tenantId);
    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Recalculer toutes les métriques basées sur les messages
    const metrics = await this.messageRepository
      .createQueryBuilder('message')
      .select([
        'COUNT(*) as messageCount',
        'COALESCE(SUM(message.token_count), 0) as totalTokens',
        'COALESCE(SUM(message.cost_usd), 0) as totalCost',
        'AVG(message.response_time_ms) as avgResponseTime'
      ])
      .where('message.conversation_id = :conversationId', { conversationId })
      .getRawOne();

    // Mettre à jour la conversation
    conversation.message_count = parseInt(metrics.messagecount) || 0;
    conversation.total_tokens = parseInt(metrics.totaltokens) || 0;
    conversation.token_count = conversation.total_tokens; // Maintenir la cohérence
    conversation.total_cost_usd = parseFloat(metrics.totalcost) || 0;
    conversation.avg_response_time_ms = metrics.avgresponsetime ? Math.round(parseFloat(metrics.avgresponsetime)) : null;

    return this.conversationRepository.save(conversation);
  }

  /**
   * Obtenir les conversations avec les coûts les plus élevés - TICKET-BACKEND-002
   */
  async getTopCostConversations(
    tenantId: string,
    limit: number = 10,
    userId?: string
  ): Promise<Array<{ conversation: Conversation; totalCost: number; messageCount: number }>> {
    const query = this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.tenant_id = :tenantId', { tenantId })
      .andWhere('conversation.is_active = :isActive', { isActive: true })
      .andWhere('conversation.total_cost_usd > 0')
      .orderBy('conversation.total_cost_usd', 'DESC')
      .take(limit);

    if (userId) {
      query.andWhere('conversation.user_id = :userId', { userId });
    }

    const conversations = await query.getMany();

    return conversations.map(conversation => ({
      conversation,
      totalCost: conversation.total_cost_usd,
      messageCount: conversation.message_count
    }));
  }

  /**
   * Obtenir un résumé des coûts par période - TICKET-BACKEND-002
   */
  async getCostSummaryByPeriod(
    tenantId: string,
    period: 'day' | 'week' | 'month',
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ period: string; totalCost: number; conversationCount: number; messageCount: number }>> {
    const periodFormat = period === 'day' ? 'YYYY-MM-DD' : 
                        period === 'week' ? 'YYYY-WW' : 'YYYY-MM';

    const result = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoin('conversation.messages', 'message')
      .select([
        `TO_CHAR(conversation.created_at, '${periodFormat}') as period`,
        'COUNT(DISTINCT conversation.id) as conversationCount',
        'COUNT(message.id) as messageCount',
        'COALESCE(SUM(message.cost_usd), 0) as totalCost'
      ])
      .where('conversation.tenant_id = :tenantId', { tenantId })
      .andWhere('conversation.created_at >= :startDate', { startDate })
      .andWhere('conversation.created_at <= :endDate', { endDate })
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    return result.map(row => ({
      period: row.period,
      totalCost: parseFloat(row.totalcost) || 0,
      conversationCount: parseInt(row.conversationcount) || 0,
      messageCount: parseInt(row.messagecount) || 0
    }));
  }

  /**
   * Mettre à jour les statistiques IA d'une conversation - TICKET-BACKEND-004
   */
  async updateConversationAIStatistics(
    conversationId: string,
    tenantId: string,
    stats: {
      totalCost?: number;
      totalTokens?: number;
      avgResponseTime?: number;
      lastProvider?: string;
      lastModel?: string;
    }
  ): Promise<Conversation> {
    const conversation = await this.getConversationById(conversationId, tenantId);
    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée');
    }

    // Mettre à jour les statistiques cumulées
    if (stats.totalCost !== undefined) {
      conversation.total_cost_usd = (conversation.total_cost_usd || 0) + stats.totalCost;
    }
    
    if (stats.totalTokens !== undefined) {
      conversation.total_tokens = (conversation.total_tokens || 0) + stats.totalTokens;
      conversation.token_count = conversation.total_tokens; // Maintenir la cohérence
    }
    
    if (stats.avgResponseTime !== undefined) {
      // Calculer une moyenne mobile simple
      const currentAvg = conversation.avg_response_time_ms || 0;
      const messageCount = conversation.message_count || 1;
      conversation.avg_response_time_ms = Math.round(
        ((currentAvg * (messageCount - 1)) + stats.avgResponseTime) / messageCount
      );
    }
    
    // Mettre à jour les métadonnées du dernier provider/modèle
    const currentMetadata = conversation.metadata || {};
    if (stats.lastProvider) {
      currentMetadata.lastAIProvider = stats.lastProvider;
    }
    if (stats.lastModel) {
      currentMetadata.lastAIModel = stats.lastModel;
    }
    currentMetadata.lastAIUpdate = new Date().toISOString();
    
    conversation.metadata = currentMetadata;
    conversation.updated_at = new Date();

    return this.conversationRepository.save(conversation);
  }
}