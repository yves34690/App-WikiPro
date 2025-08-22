import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, MoreThan } from 'typeorm';
import { Message, MessageRole, MessageStatus } from '@database/entities/message.entity';
import { ConversationService, AddMessageDto } from './conversation.service';
import { MessageAIMetricsDto, RateMessageDto } from '../dto/message.dto';
import { CostMetricsDto, PerformanceMetricsDto, UsageMetricsDto } from '../dto/ai-analytics.dto';

export interface StreamingMessageSession {
  messageId: string;
  conversationId: string;
  userId: string;
  tenantId: string;
  startTime: Date;
  chunks: string[];
  currentContent: string;
  tokenCount: number;
  aiProvider?: string;
  aiModel?: string;
}

/**
 * Service de gestion des messages en temps réel avec streaming
 * Gère la création, mise à jour et streaming des messages IA
 */
@Injectable()
export class MessageService {
  private logger = new Logger(MessageService.name);
  private streamingSessions = new Map<string, StreamingMessageSession>();

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private conversationService: ConversationService,
  ) {}

  /**
   * Créer un message utilisateur
   */
  async createUserMessage(dto: AddMessageDto): Promise<Message> {
    this.logger.log(`Création message utilisateur - Conversation: ${dto.conversationId}`);
    
    const message = await this.conversationService.addMessage({
      ...dto,
      role: MessageRole.USER
    });

    this.logger.log(`Message utilisateur créé: ${message.id}`);
    return message;
  }

  /**
   * Démarrer une session de streaming pour une réponse IA
   */
  async startStreamingResponse(
    conversationId: string,
    userId: string,
    tenantId: string,
    aiProvider: string,
    aiModel: string,
    parentMessageId?: string
  ): Promise<StreamingMessageSession> {
    this.logger.log(`Démarrage streaming - Conversation: ${conversationId}, Provider: ${aiProvider}`);

    // Créer un message IA en attente
    const message = await this.conversationService.addMessage({
      conversationId,
      tenantId,
      role: MessageRole.ASSISTANT,
      content: '', // Sera rempli au fur et à mesure du streaming
      aiProvider,
      aiModel,
      parentMessageId,
      aiParameters: {
        streaming: true,
        session_start: new Date().toISOString()
      }
    });

    // Créer la session de streaming
    const session: StreamingMessageSession = {
      messageId: message.id,
      conversationId,
      userId,
      tenantId,
      startTime: new Date(),
      chunks: [],
      currentContent: '',
      tokenCount: 0,
      aiProvider,
      aiModel
    };

    this.streamingSessions.set(message.id, session);
    
    this.logger.log(`Session streaming créée: ${message.id}`);
    return session;
  }

  /**
   * Ajouter un chunk de streaming à une session
   */
  async addStreamingChunk(
    messageId: string,
    chunk: string,
    isLast: boolean = false
  ): Promise<StreamingMessageSession | null> {
    const session = this.streamingSessions.get(messageId);
    if (!session) {
      this.logger.warn(`Session streaming non trouvée: ${messageId}`);
      return null;
    }

    // Ajouter le chunk
    session.chunks.push(chunk);
    session.currentContent += chunk;
    session.tokenCount = this.estimateTokenCount(session.currentContent);

    // Si c'est le dernier chunk, finaliser le message
    if (isLast) {
      await this.finalizeStreamingMessage(session);
    }

    return session;
  }

  /**
   * Finaliser un message de streaming
   */
  async finalizeStreamingMessage(session: StreamingMessageSession): Promise<Message> {
    const responseTimeMs = Date.now() - session.startTime.getTime();
    
    this.logger.log(`Finalisation streaming - Message: ${session.messageId}, Temps: ${responseTimeMs}ms`);

    // Mettre à jour le message avec le contenu final
    const updatedMessage = await this.conversationService.updateMessage(
      session.messageId,
      session.tenantId,
      {
        content: session.currentContent,
        status: MessageStatus.COMPLETED,
        token_count: session.tokenCount,
        completion_tokens: session.tokenCount,
        response_time_ms: responseTimeMs,
        completed_at: new Date(),
        metadata: {
          ...session,
          chunks_count: session.chunks.length,
          streaming_completed: true
        }
      }
    );

    // Nettoyer la session
    this.streamingSessions.delete(session.messageId);
    
    this.logger.log(`Message streaming finalisé: ${session.messageId}`);
    return updatedMessage;
  }

  /**
   * Annuler une session de streaming
   */
  async cancelStreamingSession(messageId: string, reason: string = 'User cancelled'): Promise<boolean> {
    const session = this.streamingSessions.get(messageId);
    if (!session) {
      return false;
    }

    this.logger.log(`Annulation streaming - Message: ${messageId}, Raison: ${reason}`);

    // Marquer le message comme annulé
    await this.conversationService.updateMessage(
      session.messageId,
      session.tenantId,
      {
        status: MessageStatus.CANCELLED,
        error_message: reason,
        content: session.currentContent, // Garder le contenu partiel
        error_details: {
          cancelled_at: new Date().toISOString(),
          chunks_received: session.chunks.length,
          partial_content_length: session.currentContent.length
        }
      }
    );

    // Nettoyer la session
    this.streamingSessions.delete(messageId);
    return true;
  }

  /**
   * Marquer un message comme ayant échoué
   */
  async markMessageAsError(
    messageId: string,
    tenantId: string,
    errorMessage: string,
    errorDetails?: any
  ): Promise<Message> {
    this.logger.error(`Erreur message: ${messageId} - ${errorMessage}`);

    const updatedMessage = await this.conversationService.updateMessage(
      messageId,
      tenantId,
      {
        status: MessageStatus.ERROR,
        error_message: errorMessage,
        error_details: {
          ...errorDetails,
          error_at: new Date().toISOString()
        }
      }
    );

    // Nettoyer la session de streaming si elle existe
    this.streamingSessions.delete(messageId);
    
    return updatedMessage;
  }

  /**
   * Obtenir les sessions de streaming actives
   */
  getActiveStreamingSessions(): StreamingMessageSession[] {
    return Array.from(this.streamingSessions.values());
  }

  /**
   * Obtenir une session de streaming spécifique
   */
  getStreamingSession(messageId: string): StreamingMessageSession | undefined {
    return this.streamingSessions.get(messageId);
  }

  /**
   * Nettoyer les sessions de streaming expirées (plus de 10 minutes)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const expiredTime = Date.now() - (10 * 60 * 1000); // 10 minutes
    let cleanedCount = 0;

    for (const [messageId, session] of this.streamingSessions.entries()) {
      if (session.startTime.getTime() < expiredTime) {
        this.logger.warn(`Session streaming expirée: ${messageId}`);
        
        await this.markMessageAsError(
          messageId,
          session.tenantId,
          'Session expirée',
          { expired_after: '10 minutes' }
        );
        
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`${cleanedCount} sessions streaming expirées nettoyées`);
    }

    return cleanedCount;
  }

  /**
   * Ajouter des citations/références à un message
   */
  async addMessageCitations(
    messageId: string,
    tenantId: string,
    citations: Array<{
      source: string;
      content: string;
      score?: number;
      url?: string;
    }>
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, tenant_id: tenantId }
    });

    if (!message) {
      throw new Error('Message non trouvé');
    }

    // Ajouter les citations
    const existingCitations = message.citations || [];
    const newCitations = citations.map(citation => ({
      ...citation,
      added_at: new Date().toISOString()
    }));

    return this.conversationService.updateMessage(messageId, tenantId, {
      citations: [...existingCitations, ...newCitations]
    });
  }

  /**
   * Évaluer un message (note utilisateur)
   */
  async rateMessage(
    messageId: string,
    tenantId: string,
    rating: number,
    feedback?: string
  ): Promise<Message> {
    if (rating < 1 || rating > 5) {
      throw new Error('La note doit être entre 1 et 5');
    }

    this.logger.log(`Évaluation message: ${messageId} - Note: ${rating}`);

    return this.conversationService.updateMessage(messageId, tenantId, {
      rating,
      feedback,
      metadata: {
        rated_at: new Date().toISOString(),
        rating_source: 'user_feedback'
      }
    });
  }

  /**
   * Estimation approximative du nombre de tokens
   * TODO: Remplacer par tiktoken ou équivalent dans Sprint 3
   */
  private estimateTokenCount(text: string): number {
    // Estimation approximative : 4 caractères = 1 token
    return Math.ceil(text.length / 4);
  }

  /**
   * Obtenir les statistiques des messages en streaming
   */
  getStreamingStats() {
    const sessions = Array.from(this.streamingSessions.values());
    
    return {
      active_sessions: sessions.length,
      providers: sessions.reduce((acc, session) => {
        const provider = session.aiProvider || 'unknown';
        acc[provider] = (acc[provider] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      avg_session_duration: sessions.length > 0 
        ? sessions.reduce((sum, session) => sum + (Date.now() - session.startTime.getTime()), 0) / sessions.length 
        : 0,
      total_chunks_processed: sessions.reduce((sum, session) => sum + session.chunks.length, 0)
    };
  }

  // =================== NOUVELLES MÉTHODES ANALYTICS IA - TICKET-BACKEND-002 ===================

  /**
   * Mettre à jour les métriques IA d'un message - TICKET-BACKEND-002
   */
  async updateMessageAIMetrics(
    messageId: string,
    tenantId: string,
    metrics: MessageAIMetricsDto
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, tenant_id: tenantId }
    });

    if (!message) {
      throw new Error('Message non trouvé');
    }

    // Utiliser la nouvelle méthode d'entité pour mettre à jour les métriques IA
    message.updateAIMetadata({
      costUsd: metrics.costUsd,
      confidenceScore: metrics.confidenceScore,
      responseTimeMs: metrics.responseTimeMs,
      promptTokens: metrics.promptTokens,
      completionTokens: metrics.completionTokens
    });

    // Calculer le coût automatiquement si pas fourni
    if (!metrics.costUsd && message.prompt_tokens && message.completion_tokens) {
      message.cost_usd = message.calculateCost();
    }

    const updatedMessage = await this.messageRepository.save(message);
    
    this.logger.log(`Métriques IA mises à jour pour message: ${messageId}`);
    return updatedMessage;
  }

  /**
   * Obtenir les métriques de coût pour un tenant - TICKET-BACKEND-002
   */
  async getCostMetrics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<CostMetricsDto> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.tenant_id = :tenantId', { tenantId })
      .andWhere('message.created_at >= :startDate', { startDate })
      .andWhere('message.created_at <= :endDate', { endDate })
      .andWhere('message.cost_usd IS NOT NULL')
      .andWhere('message.cost_usd > 0');

    if (userId) {
      query.andWhere('message.user_id = :userId', { userId });
    }

    // Métriques totales
    const totalStats = await query
      .select([
        'SUM(message.cost_usd) as totalCost',
        'COUNT(*) as messageCount',
        'SUM(message.token_count) as totalTokens'
      ])
      .getRawOne();

    // Coût par provider
    const costByProvider = await query
      .select([
        'message.ai_provider as provider',
        'SUM(message.cost_usd) as totalCost',
        'COUNT(*) as messageCount'
      ])
      .groupBy('message.ai_provider')
      .orderBy('totalCost', 'DESC')
      .getRawMany();

    // Coût par modèle
    const costByModel = await query
      .select([
        'message.ai_model as model',
        'SUM(message.cost_usd) as totalCost',
        'COUNT(*) as messageCount',
        'AVG(message.cost_usd) as avgCostPerMessage'
      ])
      .groupBy('message.ai_model')
      .orderBy('totalCost', 'DESC')
      .getRawMany();

    // Tendance de coût (par jour)
    const costTrend = await query
      .select([
        'DATE(message.created_at) as date',
        'SUM(message.cost_usd) as totalCost',
        'COUNT(*) as messageCount'
      ])
      .groupBy('DATE(message.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    const totalCostNum = parseFloat(totalStats.totalcost) || 0;
    const messageCountNum = parseInt(totalStats.messagecount) || 0;
    const totalTokensNum = parseInt(totalStats.totaltokens) || 0;

    return {
      totalCostUsd: totalCostNum,
      avgCostPerMessage: messageCountNum > 0 ? totalCostNum / messageCountNum : 0,
      avgCostPerToken: totalTokensNum > 0 ? totalCostNum / totalTokensNum : 0,
      costByProvider: costByProvider.map(row => ({
        provider: row.provider || 'unknown',
        totalCost: parseFloat(row.totalcost) || 0,
        messageCount: parseInt(row.messagecount) || 0,
        percentage: totalCostNum > 0 ? (parseFloat(row.totalcost) / totalCostNum) * 100 : 0
      })),
      costByModel: costByModel.map(row => ({
        model: row.model || 'unknown',
        totalCost: parseFloat(row.totalcost) || 0,
        messageCount: parseInt(row.messagecount) || 0,
        avgCostPerMessage: parseFloat(row.avgcostpermessage) || 0
      })),
      costTrend: costTrend.map(row => ({
        date: row.date,
        totalCost: parseFloat(row.totalcost) || 0,
        messageCount: parseInt(row.messagecount) || 0
      }))
    };
  }

  /**
   * Obtenir les métriques de performance IA - TICKET-BACKEND-002
   */
  async getPerformanceMetrics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<PerformanceMetricsDto> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.tenant_id = :tenantId', { tenantId })
      .andWhere('message.created_at >= :startDate', { startDate })
      .andWhere('message.created_at <= :endDate', { endDate })
      .andWhere('message.role = :role', { role: MessageRole.ASSISTANT })
      .andWhere('message.response_time_ms IS NOT NULL');

    if (userId) {
      query.andWhere('message.user_id = :userId', { userId });
    }

    // Métriques globales
    const globalStats = await query
      .select([
        'AVG(message.response_time_ms) as avgResponseTime',
        'AVG(message.confidence_score) as avgConfidenceScore',
        'PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY message.response_time_ms) as medianResponseTime',
        'PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY message.response_time_ms) as p95ResponseTime'
      ])
      .getRawOne();

    // Performance par provider
    const performanceByProvider = await query
      .select([
        'message.ai_provider as provider',
        'AVG(message.response_time_ms) as avgResponseTime',
        'AVG(message.confidence_score) as avgConfidenceScore',
        'COUNT(*) as messageCount'
      ])
      .groupBy('message.ai_provider')
      .orderBy('avgResponseTime', 'ASC')
      .getRawMany();

    // Performance par modèle
    const performanceByModel = await query
      .select([
        'message.ai_model as model',
        'AVG(message.response_time_ms) as avgResponseTime',
        'AVG(message.confidence_score) as avgConfidenceScore',
        'COUNT(*) as messageCount'
      ])
      .groupBy('message.ai_model')
      .orderBy('avgResponseTime', 'ASC')
      .getRawMany();

    // Tendance de performance
    const performanceTrend = await query
      .select([
        'DATE(message.created_at) as date',
        'AVG(message.response_time_ms) as avgResponseTime',
        'AVG(message.confidence_score) as avgConfidenceScore'
      ])
      .groupBy('DATE(message.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      avgResponseTimeMs: Math.round(parseFloat(globalStats.avgresponsetime) || 0),
      medianResponseTimeMs: Math.round(parseFloat(globalStats.medianresponsetime) || 0),
      p95ResponseTimeMs: Math.round(parseFloat(globalStats.p95responsetime) || 0),
      avgConfidenceScore: parseFloat(globalStats.avgconfidencescore) || 0,
      performanceByProvider: performanceByProvider.map(row => ({
        provider: row.provider || 'unknown',
        avgResponseTime: Math.round(parseFloat(row.avgresponsetime) || 0),
        avgConfidenceScore: parseFloat(row.avgconfidencescore) || 0,
        messageCount: parseInt(row.messagecount) || 0
      })),
      performanceByModel: performanceByModel.map(row => ({
        model: row.model || 'unknown',
        avgResponseTime: Math.round(parseFloat(row.avgresponsetime) || 0),
        avgConfidenceScore: parseFloat(row.avgconfidencescore) || 0,
        messageCount: parseInt(row.messagecount) || 0
      })),
      performanceTrend: performanceTrend.map(row => ({
        date: row.date,
        avgResponseTime: Math.round(parseFloat(row.avgresponsetime) || 0),
        avgConfidenceScore: parseFloat(row.avgconfidencescore) || 0
      }))
    };
  }

  /**
   * Obtenir les métriques d'usage IA - TICKET-BACKEND-002
   */
  async getUsageMetrics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<UsageMetricsDto> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .where('message.tenant_id = :tenantId', { tenantId })
      .andWhere('message.created_at >= :startDate', { startDate })
      .andWhere('message.created_at <= :endDate', { endDate });

    if (userId) {
      query.andWhere('message.user_id = :userId', { userId });
    }

    // Métriques globales
    const globalStats = await query
      .select([
        'COUNT(*) as totalMessages',
        'SUM(message.token_count) as totalTokens',
        'COUNT(DISTINCT message.conversation_id) as totalConversations',
        'AVG(message.token_count) as avgTokensPerMessage'
      ])
      .getRawOne();

    // Usage par provider
    const usageByProvider = await query
      .select([
        'message.ai_provider as provider',
        'COUNT(*) as messageCount',
        'SUM(message.token_count) as tokenCount',
        'COUNT(DISTINCT message.conversation_id) as conversationCount'
      ])
      .groupBy('message.ai_provider')
      .orderBy('messageCount', 'DESC')
      .getRawMany();

    const totalMessages = parseInt(globalStats.totalmessages) || 0;

    return {
      totalMessages,
      totalTokens: parseInt(globalStats.totaltokens) || 0,
      totalConversations: parseInt(globalStats.totalconversations) || 0,
      avgTokensPerMessage: parseFloat(globalStats.avgtokenspermessage) || 0,
      usageByProvider: usageByProvider.map(row => ({
        provider: row.provider || 'unknown',
        messageCount: parseInt(row.messagecount) || 0,
        tokenCount: parseInt(row.tokencount) || 0,
        conversationCount: parseInt(row.conversationcount) || 0,
        marketShare: totalMessages > 0 ? (parseInt(row.messagecount) / totalMessages) * 100 : 0
      })),
      usageByModel: [], // À implémenter si nécessaire
      usageTrend: [] // À implémenter si nécessaire
    };
  }

  /**
   * Evaluer un message avec note et feedback - TICKET-BACKEND-002
   */
  async rateMessageNew(
    messageId: string,
    tenantId: string,
    rateDto: RateMessageDto
  ): Promise<Message> {
    return this.rateMessage(messageId, tenantId, rateDto.rating, rateDto.feedback);
  }

  /**
   * Obtenir les messages avec métriques IA complètes - TICKET-BACKEND-002
   */
  async getMessagesWithCompleteAIMetrics(
    tenantId: string,
    limit: number = 100
  ): Promise<Message[]> {
    return this.messageRepository.find({
      where: {
        tenant_id: tenantId,
        ai_provider: Not(null),
        ai_model: Not(null),
        cost_usd: MoreThan(0)
      },
      order: {
        created_at: 'DESC'
      },
      take: limit
    });
  }

  /**
   * Calculer et mettre à jour automatiquement les coûts manquants - TICKET-BACKEND-002
   */
  async recalculateMissingCosts(tenantId: string): Promise<number> {
    const messagesWithoutCost = await this.messageRepository.find({
      where: {
        tenant_id: tenantId,
        ai_provider: Not(null),
        ai_model: Not(null),
        prompt_tokens: MoreThan(0),
        completion_tokens: MoreThan(0),
        cost_usd: 0
      }
    });

    let updatedCount = 0;

    for (const message of messagesWithoutCost) {
      const calculatedCost = message.calculateCost();
      if (calculatedCost > 0) {
        message.cost_usd = calculatedCost;
        await this.messageRepository.save(message);
        updatedCount++;
      }
    }

    this.logger.log(`Recalculé les coûts pour ${updatedCount} messages du tenant ${tenantId}`);
    return updatedCount;
  }
}