import { Injectable, Logger } from '@nestjs/common';

/**
 * Service Message avec fallback mock - TICKET-BACKEND-007
 * Version simplifiée pour stabilisation backend
 */
@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor() {
    this.logger.log('💬 MessageService initialisé en mode mock');
  }

  /**
   * Créer un nouveau message
   */
  async create(data: {
    conversationId: string;
    content: string;
    role: 'user' | 'assistant';
    tenantId: string;
    userId?: string;
    metadata?: any;
  }) {
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId: data.conversationId,
      content: data.content,
      role: data.role,
      tenantId: data.tenantId,
      userId: data.userId,
      metadata: data.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.logger.debug(`Message créé: ${message.id}`);
    return message;
  }

  /**
   * Récupérer les messages d'une conversation
   */
  async findByConversationId(conversationId: string, tenantId: string) {
    // Mock de messages pour les tests
    const mockMessages = [
      {
        id: `msg_${conversationId}_1`,
        conversationId,
        content: 'Message utilisateur de test',
        role: 'user',
        tenantId,
        createdAt: new Date(Date.now() - 60000),
        updatedAt: new Date(Date.now() - 60000),
      },
      {
        id: `msg_${conversationId}_2`,
        conversationId,
        content: 'Réponse IA de test',
        role: 'assistant',
        tenantId,
        createdAt: new Date(Date.now() - 30000),
        updatedAt: new Date(Date.now() - 30000),
      },
    ];

    this.logger.debug(`Messages trouvés pour conversation ${conversationId}: ${mockMessages.length}`);
    return mockMessages;
  }

  /**
   * Récupérer un message par ID
   */
  async findById(messageId: string, tenantId: string) {
    const mockMessage = {
      id: messageId,
      conversationId: `conv_${Date.now()}`,
      content: 'Message de test',
      role: 'user',
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.logger.debug(`Message trouvé: ${messageId}`);
    return mockMessage;
  }

  /**
   * Mettre à jour un message
   */
  async update(messageId: string, tenantId: string, data: Partial<{
    content: string;
    metadata: any;
  }>) {
    const updatedMessage = {
      id: messageId,
      conversationId: `conv_${Date.now()}`,
      content: data.content || 'Message mis à jour',
      role: 'user',
      tenantId,
      metadata: data.metadata || {},
      createdAt: new Date(Date.now() - 60000),
      updatedAt: new Date(),
    };

    this.logger.debug(`Message mis à jour: ${messageId}`);
    return updatedMessage;
  }

  /**
   * Supprimer un message
   */
  async delete(messageId: string, tenantId: string) {
    this.logger.debug(`Message supprimé: ${messageId}`);
    return { deleted: true, id: messageId };
  }

  /**
   * Compter les messages d'une conversation
   */
  async countByConversationId(conversationId: string, tenantId: string): Promise<number> {
    // Mock count pour les tests
    return Math.floor(Math.random() * 50) + 1;
  }

  /**
   * Récupérer les messages récents d'un tenant
   */
  async findRecentByTenant(tenantId: string, limit: number = 10) {
    const mockMessages = Array.from({ length: Math.min(limit, 5) }, (_, index) => ({
      id: `msg_recent_${index}`,
      conversationId: `conv_recent_${index}`,
      content: `Message récent ${index + 1}`,
      role: index % 2 === 0 ? 'user' : 'assistant',
      tenantId,
      createdAt: new Date(Date.now() - (index * 300000)), // Espacés de 5 minutes
      updatedAt: new Date(Date.now() - (index * 300000)),
    }));

    this.logger.debug(`Messages récents trouvés pour tenant ${tenantId}: ${mockMessages.length}`);
    return mockMessages;
  }

  /**
   * Statistiques des messages pour un tenant
   */
  async getStatsForTenant(tenantId: string, startDate?: Date, endDate?: Date) {
    // Mock de statistiques
    const stats = {
      totalMessages: Math.floor(Math.random() * 1000) + 100,
      userMessages: Math.floor(Math.random() * 500) + 50,
      assistantMessages: Math.floor(Math.random() * 500) + 50,
      averageLength: Math.floor(Math.random() * 200) + 50,
      dailyAverage: Math.floor(Math.random() * 50) + 10,
      mostActiveHour: Math.floor(Math.random() * 24),
    };

    this.logger.debug(`Stats calculées pour tenant ${tenantId}`);
    return stats;
  }

  /**
   * Métriques de coût pour analytics - TICKET-BACKEND-007
   */
  async getCostMetrics(tenantId: string, startDate?: Date, endDate?: Date) {
    // Mock de métriques de coût
    return {
      totalCostUsd: Math.random() * 500 + 50,
      avgCostPerMessage: Math.random() * 0.05 + 0.01,
      costByProvider: [
        { provider: 'openai', cost: Math.random() * 200 + 20 },
        { provider: 'anthropic', cost: Math.random() * 200 + 20 },
      ],
      costByModel: [
        { model: 'gpt-4', cost: Math.random() * 300 + 30 },
        { model: 'claude-3', cost: Math.random() * 200 + 20 },
      ],
      period: { startDate: startDate || new Date(), endDate: endDate || new Date() },
    };
  }

  /**
   * Métriques de performance pour analytics - TICKET-BACKEND-007
   */
  async getPerformanceMetrics(tenantId: string, startDate?: Date, endDate?: Date) {
    // Mock de métriques de performance
    return {
      avgResponseTimeMs: Math.random() * 2000 + 500,
      totalRequests: Math.floor(Math.random() * 1000) + 100,
      successRate: 0.95 + Math.random() * 0.04,
      errorRate: Math.random() * 0.05,
      throughputPerHour: Math.floor(Math.random() * 100) + 20,
      performanceByProvider: [
        { provider: 'openai', avgResponseTime: Math.random() * 1500 + 400, successRate: 0.96 },
        { provider: 'anthropic', avgResponseTime: Math.random() * 1500 + 400, successRate: 0.95 },
      ],
      performanceByModel: [
        { model: 'gpt-4', avgResponseTime: Math.random() * 2000 + 600, successRate: 0.97 },
        { model: 'claude-3', avgResponseTime: Math.random() * 1800 + 500, successRate: 0.96 },
      ],
      period: { startDate: startDate || new Date(), endDate: endDate || new Date() },
    };
  }

  /**
   * Métriques d'usage pour analytics - TICKET-BACKEND-007
   */
  async getUsageMetrics(tenantId: string, startDate?: Date, endDate?: Date) {
    // Mock de métriques d'usage
    return {
      totalMessages: Math.floor(Math.random() * 5000) + 500,
      totalTokens: Math.floor(Math.random() * 100000) + 10000,
      uniqueUsers: Math.floor(Math.random() * 50) + 10,
      averageMessageLength: Math.floor(Math.random() * 200) + 50,
      avgTokensPerMessage: Math.floor(Math.random() * 100) + 20,
      peakHour: Math.floor(Math.random() * 24),
      usageByProvider: [
        { provider: 'openai', messageCount: Math.floor(Math.random() * 2000) + 200, tokenCount: Math.floor(Math.random() * 50000) + 5000 },
        { provider: 'anthropic', messageCount: Math.floor(Math.random() * 2000) + 200, tokenCount: Math.floor(Math.random() * 50000) + 5000 },
      ],
      period: { startDate: startDate || new Date(), endDate: endDate || new Date() },
    };
  }

  /**
   * Health check du service
   */
  async healthCheck() {
    return {
      status: 'ok',
      mode: 'mock',
      timestamp: new Date(),
    };
  }
}