import { Injectable, Logger } from '@nestjs/common';

/**
 * Service Conversation avec fallback mock - TICKET-BACKEND-007
 * Version simplifiée pour stabilisation backend
 */
@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor() {
    this.logger.log('💬 ConversationService initialisé en mode mock');
  }

  /**
   * Créer une nouvelle conversation
   */
  async create(data: {
    title?: string;
    tenantId: string;
    userId?: string;
    metadata?: any;
  }) {
    const conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: data.title || 'Nouvelle conversation',
      tenantId: data.tenantId,
      userId: data.userId,
      metadata: data.metadata || {},
      status: 'active',
      messageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.logger.debug(`Conversation créée: ${conversation.id}`);
    return conversation;
  }

  /**
   * Récupérer une conversation par ID
   */
  async findById(conversationId: string, tenantId: string) {
    const mockConversation = {
      id: conversationId,
      title: 'Conversation de test',
      tenantId,
      userId: `user_${Date.now()}`,
      metadata: {},
      status: 'active',
      messageCount: Math.floor(Math.random() * 20) + 1,
      createdAt: new Date(Date.now() - 3600000), // Il y a 1 heure
      updatedAt: new Date(Date.now() - 300000),  // Il y a 5 minutes
    };

    this.logger.debug(`Conversation trouvée: ${conversationId}`);
    return mockConversation;
  }

  /**
   * Récupérer les conversations d'un tenant
   */
  async findByTenant(tenantId: string, limit: number = 10, offset: number = 0) {
    const mockConversations = Array.from({ length: Math.min(limit, 5) }, (_, index) => ({
      id: `conv_${tenantId}_${index + offset}`,
      title: `Conversation ${index + offset + 1}`,
      tenantId,
      userId: `user_${index}`,
      metadata: {},
      status: 'active',
      messageCount: Math.floor(Math.random() * 15) + 1,
      createdAt: new Date(Date.now() - (index * 3600000)), // Espacées d'1 heure
      updatedAt: new Date(Date.now() - (index * 300000)),  // MAJ espacées de 5 minutes
    }));

    this.logger.debug(`Conversations trouvées pour tenant ${tenantId}: ${mockConversations.length}`);
    return {
      data: mockConversations,
      total: mockConversations.length,
      limit,
      offset,
    };
  }

  /**
   * Récupérer les conversations d'un utilisateur
   */
  async findByUser(userId: string, tenantId: string, limit: number = 10) {
    const mockConversations = Array.from({ length: Math.min(limit, 3) }, (_, index) => ({
      id: `conv_${userId}_${index}`,
      title: `Ma conversation ${index + 1}`,
      tenantId,
      userId,
      metadata: {},
      status: 'active',
      messageCount: Math.floor(Math.random() * 20) + 1,
      createdAt: new Date(Date.now() - (index * 86400000)), // Espacées d'1 jour
      updatedAt: new Date(Date.now() - (index * 3600000)),  // MAJ espacées d'1 heure
    }));

    this.logger.debug(`Conversations trouvées pour utilisateur ${userId}: ${mockConversations.length}`);
    return mockConversations;
  }

  /**
   * Mettre à jour une conversation
   */
  async update(conversationId: string, tenantId: string, data: Partial<{
    title: string;
    status: string;
    metadata: any;
  }>) {
    const updatedConversation = {
      id: conversationId,
      title: data.title || 'Conversation mise à jour',
      tenantId,
      userId: `user_${Date.now()}`,
      metadata: data.metadata || {},
      status: data.status || 'active',
      messageCount: Math.floor(Math.random() * 25) + 1,
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(),
    };

    this.logger.debug(`Conversation mise à jour: ${conversationId}`);
    return updatedConversation;
  }

  /**
   * Marquer une conversation comme archivée
   */
  async archive(conversationId: string, tenantId: string) {
    const archivedConversation = await this.update(conversationId, tenantId, {
      status: 'archived'
    });

    this.logger.debug(`Conversation archivée: ${conversationId}`);
    return archivedConversation;
  }

  /**
   * Supprimer une conversation
   */
  async delete(conversationId: string, tenantId: string) {
    this.logger.debug(`Conversation supprimée: ${conversationId}`);
    return { deleted: true, id: conversationId };
  }

  /**
   * Incrémenter le compteur de messages
   */
  async incrementMessageCount(conversationId: string, tenantId: string) {
    const conversation = await this.findById(conversationId, tenantId);
    const updatedConversation = {
      ...conversation,
      messageCount: conversation.messageCount + 1,
      updatedAt: new Date(),
    };

    this.logger.debug(`Compteur de messages incrémenté pour conversation ${conversationId}`);
    return updatedConversation;
  }

  /**
   * Statistiques des conversations pour un tenant
   */
  async getStatsForTenant(tenantId: string, startDate?: Date, endDate?: Date) {
    // Mock de statistiques
    const stats = {
      totalConversations: Math.floor(Math.random() * 200) + 50,
      activeConversations: Math.floor(Math.random() * 100) + 20,
      archivedConversations: Math.floor(Math.random() * 50) + 10,
      averageMessagesPerConversation: Math.floor(Math.random() * 15) + 5,
      averageDurationMinutes: Math.floor(Math.random() * 45) + 15,
      dailyNewConversations: Math.floor(Math.random() * 10) + 2,
      mostActiveUser: `user_${Math.floor(Math.random() * 100)}`,
    };

    this.logger.debug(`Stats calculées pour tenant ${tenantId}`);
    return stats;
  }

  /**
   * Récupérer les conversations récentes pour un tenant
   */
  async findRecentByTenant(tenantId: string, limit: number = 5) {
    const mockConversations = Array.from({ length: Math.min(limit, 5) }, (_, index) => ({
      id: `conv_recent_${index}`,
      title: `Conversation récente ${index + 1}`,
      tenantId,
      userId: `user_recent_${index}`,
      metadata: {},
      status: 'active',
      messageCount: Math.floor(Math.random() * 10) + 1,
      lastMessageAt: new Date(Date.now() - (index * 300000)), // Espacées de 5 minutes
      createdAt: new Date(Date.now() - (index * 3600000)),
      updatedAt: new Date(Date.now() - (index * 300000)),
    }));

    this.logger.debug(`Conversations récentes trouvées pour tenant ${tenantId}: ${mockConversations.length}`);
    return mockConversations;
  }

  /**
   * Analytics pour un tenant - TICKET-BACKEND-007
   */
  async getTenantAnalytics(tenantId: string, startDate?: Date, endDate?: Date) {
    // Mock d'analytics tenant
    return {
      totalConversations: Math.floor(Math.random() * 200) + 50,
      activeConversations: Math.floor(Math.random() * 100) + 20,
      averageDuration: Math.floor(Math.random() * 30) + 10,
      averageMessagesPerConversation: Math.floor(Math.random() * 15) + 5,
      avgCostPerConversation: Math.random() * 10 + 2,
      avgConfidenceScore: Math.random() * 0.3 + 0.7, // Score entre 0.7 et 1.0
      topUsers: [
        { userId: 'user1', conversationCount: 15 },
        { userId: 'user2', conversationCount: 12 },
        { userId: 'user3', conversationCount: 10 },
      ],
      period: { startDate: startDate || new Date(), endDate: endDate || new Date() },
    };
  }

  /**
   * Conversations avec coût le plus élevé - TICKET-BACKEND-007
   */
  async getTopCostConversations(tenantId: string, limit: number = 10) {
    // Mock de conversations coûteuses
    return Array.from({ length: Math.min(limit, 5) }, (_, index) => ({
      id: `conv_expensive_${index}`,
      title: `Conversation coûteuse ${index + 1}`,
      totalCost: Math.random() * 50 + 10,
      messageCount: Math.floor(Math.random() * 100) + 20,
      averageCostPerMessage: Math.random() * 0.5 + 0.1,
      primaryProvider: index % 2 === 0 ? 'openai' : 'anthropic',
      createdAt: new Date(Date.now() - (index * 86400000)),
    }));
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