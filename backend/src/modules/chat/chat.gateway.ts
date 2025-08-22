import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { AuthService, JwtPayload } from '@core/auth/auth.service';
import { ConfigService } from '@core/config/config.service';
import { ConversationService } from './services/conversation.service';
import { MessageService } from './services/message.service';
import { Conversation } from '@database/entities/conversation.entity';
import { RedisService } from '@core/redis/redis.service';
import { AIGatewayService } from '../../ai-gateway/ai-gateway.service';
import { createAdapter } from '@socket.io/redis-adapter';

interface ConnectedUser {
  socket: Socket;
  user: JwtPayload;
  currentConversation?: string;
  lastActivity: Date;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
  },
  namespace: '/chat',
})

export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');
  private connectedUsers = new Map<string, ConnectedUser>();

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private configService: ConfigService,
    private conversationService: ConversationService,
    private messageService: MessageService,
    private redisService: RedisService,
    private aiGatewayService: AIGatewayService, // NOUVEAU: Service IA
  ) {}

  // Nettoyage automatique des sessions expirées (toutes les 5 minutes)
  async onModuleInit() {
    setInterval(async () => {
      await this.cleanupExpiredSessions();
      await this.messageService.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  async afterInit(server: Server) {
    // Configurer Redis adapter pour Socket.io
    await this.setupRedisAdapter(server);
    
    this.logger.log('🚀 WebSocket Chat Gateway initialisé avec Redis');
  }

  /**
   * Configurer l'adapter Redis pour Socket.io
   */
  private async setupRedisAdapter(server: Server): Promise<void> {
    try {
      const pubClient = this.redisService.getSocketClient();
      const subClient = this.redisService.getSocketClient()?.duplicate();

      if (pubClient && subClient) {
        // Configurer l'adapter Redis
        server.adapter(createAdapter(pubClient, subClient));
        
        this.logger.log('✅ Redis adapter configuré pour Socket.io');
        
        // Abonnement aux événements tenant pour notifications cross-server
        await this.subscribeToTenantEvents();
      } else {
        this.logger.warn('⚠️ Redis non disponible, utilisation de l\'adapter mémoire');
      }
    } catch (error) {
      this.logger.error(`❌ Erreur configuration Redis adapter: ${error.message}`);
    }
  }

  /**
   * S'abonner aux événements tenant Redis pour notifications cross-server
   */
  private async subscribeToTenantEvents(): Promise<void> {
    await this.redisService.subscribeToChannel(
      'tenant-notifications',
      (message) => {
        this.handleCrossServerTenantEvent(message);
      }
    );

    await this.redisService.subscribeToChannel(
      'conversation-updates',
      (message) => {
        this.handleConversationUpdateEvent(message);
      }
    );
  }

  async handleConnection(client: Socket) {
    try {
      // Authentification via token dans les headers ou handshake
      const token = 
        client.handshake.auth?.token || 
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Connexion refusée: token manquant pour ${client.id}`);
        client.disconnect();
        return;
      }

      // Vérification du token JWT
      const payload = this.jwtService.verify(token, {
        secret: this.configService.security.jwtSecret
      }) as JwtPayload;

      const user = await this.authService.validateJwtPayload(payload);
      
      if (!user) {
        this.logger.warn(`Connexion refusée: utilisateur invalide pour ${client.id}`);
        client.disconnect();
        return;
      }

      // Stockage de la connexion authentifiée (mémoire locale)
      const connection: ConnectedUser = {
        socket: client, 
        user: payload,
        lastActivity: new Date()
      };
      
      this.connectedUsers.set(client.id, connection);
      
      // Rejoindre le room du tenant pour l'isolation
      client.join(`tenant-${user.tenantId}`);
      
      // Stocker la session utilisateur dans Redis pour scalabilité
      await this.redisService.setUserSession(user.userId, user.tenantId, {
        socketId: client.id,
        connectedAt: new Date().toISOString(),
        username: user.username,
        lastActivity: new Date().toISOString(),
        isOnline: true
      }, 3600); // 1 heure
      
      this.logger.log(`✅ Client connecté: ${client.id} (tenant: ${user.tenantId}, user: ${user.username})`);
      
      // Obtenir les statistiques utilisateur pour l'accueil
      const userStats = await this.conversationService.getUserChatStats(user.userId, user.tenantId);
      
      // Publier l'événement de connexion pour les autres serveurs
      await this.redisService.publishEvent('user-connected', {
        userId: user.userId,
        tenantId: user.tenantId,
        username: user.username,
        socketId: client.id
      });
      
      // Confirmation de connexion avec statistiques
      client.emit('connection-established', {
        userId: user.userId,
        tenantId: user.tenantId,
        username: user.username,
        timestamp: new Date().toISOString(),
        stats: userStats,
        redisEnabled: true
      });

    } catch (error) {
      this.logger.error(`Erreur d'authentification WebSocket: ${error.message}`);
      client.emit('auth-error', { message: 'Token invalide' });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const connection = this.connectedUsers.get(client.id);
    if (connection) {
      this.logger.log(`❌ Client déconnecté: ${client.id} (user: ${connection.user.username})`);
      
      // Nettoyer la session Redis
      await this.redisService.deleteUserSession(connection.user.sub, connection.user.tenantId);
      
      // Publier l'événement de déconnexion pour les autres serveurs
      await this.redisService.publishEvent('user-disconnected', {
        userId: connection.user.sub,
        tenantId: connection.user.tenantId,
        username: connection.user.username,
        socketId: client.id,
        disconnectedAt: new Date().toISOString()
      });
      
      // Nettoyer la mémoire locale
      this.connectedUsers.delete(client.id);
    }
  }

  @SubscribeMessage('start-streaming')
  async handleStartStreaming(
    @MessageBody() data: { 
      provider: string; 
      message: string; 
      conversationId?: string;
      aiModel?: string;
      conversationTitle?: string;
      contextType?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const connection = this.connectedUsers.get(client.id);
    if (!connection) {
      client.emit('error', { message: 'Non authentifié' });
      return;
    }

    // Mise à jour de l'activité
    connection.lastActivity = new Date();

    this.logger.log(`🚀 Streaming démarré: ${data.provider} pour ${connection.user.username}`);

    try {
      let conversation: Conversation;
      let conversationId = data.conversationId;

      // Créer une nouvelle conversation si nécessaire
      if (!conversationId) {
        conversation = await this.conversationService.createConversation({
          title: data.conversationTitle,
          userId: connection.user.sub,
          tenantId: connection.user.tenantId,
          contextType: data.contextType || 'general',
          aiSettings: {
            provider: data.provider,
            model: data.aiModel || 'gpt-4',
            temperature: 0.7,
            max_tokens: 2000
          }
        });
        conversationId = conversation.id;
        
        this.logger.log(`💬 Nouvelle conversation créée: ${conversationId}`);
        
        // Notifier la création de conversation
        client.emit('conversation-created', {
          conversation: {
            id: conversation.id,
            title: conversation.title,
            contextType: conversation.context_type,
            createdAt: conversation.created_at
          }
        });
      }

      // Mettre à jour la conversation courante de l'utilisateur
      connection.currentConversation = conversationId;

      // Créer le message utilisateur
      const userMessage = await this.messageService.createUserMessage({
        conversationId,
        userId: connection.user.sub,
        tenantId: connection.user.tenantId,
        role: 'user' as any,
        content: data.message
      });

      this.logger.log(`📝 Message utilisateur créé: ${userMessage.id}`);

      // Démarrer la session de streaming pour la réponse IA
      const streamingSession = await this.messageService.startStreamingResponse(
        conversationId,
        connection.user.sub,
        connection.user.tenantId,
        data.provider,
        data.aiModel || 'gpt-4',
        userMessage.id
      );

      // Notifier le début du streaming
      client.emit('stream-start', {
        conversationId,
        messageId: streamingSession.messageId,
        userMessageId: userMessage.id,
        provider: data.provider,
        model: data.aiModel || 'gpt-4',
        timestamp: new Date().toISOString(),
      });

      // Intégration IA avec AIGateway - TICKET-BACKEND-004
      client.emit('aiResponseStart', {
        conversationId,
        messageId: streamingSession.messageId,
        provider: data.provider,
        model: data.aiModel || 'gpt-4',
        timestamp: new Date().toISOString(),
      });

      let aiResponse;
      let words: string[] = [];
      
      try {
        aiResponse = await this.generateAIResponseWithMetrics(
          data.message, 
          data.provider, 
          data.aiModel || 'gpt-4',
          conversationId,
          connection.user.tenantId
        );
        words = aiResponse.content.split(' ');
      } catch (error) {
        this.logger.error(`Erreur génération IA: ${error.message}`);
        
        // Fallback content en cas d'erreur
        const fallbackContent = `Désolé, je rencontre des difficultés techniques. Pouvez-vous reformuler votre question ?`;
        aiResponse = {
          content: fallbackContent,
          tokensUsed: Math.ceil(fallbackContent.length / 4),
          responseTime: 1000,
          costUsd: 0,
          confidence: 0.1,
          promptTokens: Math.ceil(data.message.length / 4)
        };
        words = aiResponse.content.split(' ');
      }

      // Diffuser les chunks de streaming
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulation délai réseau

        const chunk = words[i] + ' ';
        const isLast = i === words.length - 1;

        // Ajouter le chunk à la session
        await this.messageService.addStreamingChunk(
          streamingSession.messageId,
          chunk,
          isLast
        );

        // Diffuser le chunk au client
        client.emit('stream-chunk', {
          messageId: streamingSession.messageId,
          chunk,
          index: i,
          isLast,
          timestamp: new Date().toISOString(),
        });
      }

      // La finalisation est gérée automatiquement par addStreamingChunk
      const finalMessage = await this.messageService.getStreamingSession(streamingSession.messageId);
      
      // Mettre à jour les métadonnées IA du message - TICKET-BACKEND-004
      await this.messageService.updateMessageAIMetrics(
        streamingSession.messageId,
        connection.user.tenantId,
        {
          costUsd: aiResponse.costUsd,
          confidenceScore: aiResponse.confidence,
          responseTimeMs: aiResponse.responseTime,
          promptTokens: aiResponse.promptTokens,
          completionTokens: aiResponse.tokensUsed
        }
      );

      // Mettre à jour les analytics de conversation
      await this.conversationService.updateConversationAIStatistics(
        conversationId,
        connection.user.tenantId,
        {
          totalCost: aiResponse.costUsd,
          totalTokens: aiResponse.tokensUsed,
          avgResponseTime: aiResponse.responseTime,
          lastProvider: data.provider,
          lastModel: data.aiModel || 'gpt-4'
        }
      );
      
      client.emit('stream-complete', {
        messageId: streamingSession.messageId,
        conversationId,
        fullResponse: aiResponse.content,
        tokensUsed: aiResponse.tokensUsed,
        responseTime: aiResponse.responseTime,
        provider: data.provider,
        model: data.aiModel || 'gpt-4',
        cost: aiResponse.costUsd,
        confidence: aiResponse.confidence,
        timestamp: new Date().toISOString(),
      });

      // Nouvel événement métriques IA - TICKET-BACKEND-004
      client.emit('aiMetrics', {
        conversationId,
        messageId: streamingSession.messageId,
        metrics: {
          tokensUsed: aiResponse.tokensUsed,
          costUsd: aiResponse.costUsd,
          responseTime: aiResponse.responseTime,
          confidence: aiResponse.confidence,
          provider: data.provider,
          model: data.aiModel || 'gpt-4'
        },
        timestamp: new Date().toISOString(),
      });

      // Cache la conversation active dans Redis
      await this.redisService.cacheActiveConversation(conversationId, {
        id: conversationId,
        userId: connection.user.sub,
        tenantId: connection.user.tenantId,
        lastActivity: new Date().toISOString(),
        provider: data.provider,
        messageCount: await this.getConversationMessageCount(conversationId)
      });

      // Publier l'événement conversation-update pour les autres serveurs
      await this.redisService.publishEvent('conversation-updates', {
        conversationId,
        userId: connection.user.sub,
        tenantId: connection.user.tenantId,
        eventType: 'message-sent',
        timestamp: new Date().toISOString()
      });

      // Notifier les autres clients du tenant (local et cross-server)
      this.notifyTenantActivity(connection.user.tenantId, 'message-sent', {
        userId: connection.user.sub,
        username: connection.user.username,
        conversationId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error(`Erreur streaming: ${error.message}`);
      
      // Marquer le message comme en erreur si la session existe
      if (connection.currentConversation) {
        const session = this.messageService.getStreamingSession(
          this.messageService.getActiveStreamingSessions()
            .find(s => s.conversationId === connection.currentConversation)?.messageId || ''
        );
        
        if (session) {
          await this.messageService.markMessageAsError(
            session.messageId,
            session.tenantId,
            `Erreur IA: ${error.message}`,
            { provider: data.provider, model: data.aiModel }
          );
        }
      }
      
      client.emit('stream-error', {
        message: 'Erreur lors du streaming',
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      // Nouvel événement erreur IA - TICKET-BACKEND-004
      client.emit('aiError', {
        conversationId: connection.currentConversation,
        provider: data.provider,
        error: error.message,
        fallbackAvailable: true,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Générer une réponse IA avec métriques complètes - TICKET-BACKEND-004
   */
  private async generateAIResponseWithMetrics(
    message: string, 
    provider: string, 
    model: string,
    conversationId: string,
    tenantId: string
  ): Promise<{
    content: string;
    tokensUsed: number;
    responseTime: number;
    costUsd: number;
    confidence: number;
    promptTokens: number;
  }> {
    this.logger.log(`Génération IA: ${provider}/${model} pour tenant ${tenantId}`);
    
    const startTime = Date.now();
    
    try {
      // Appel à l'AIGateway avec contexte de conversation
      const context = await this.buildConversationContext(conversationId, tenantId);
      
      const aiResponse = await this.aiGatewayService.mockChatCompletion(
        message, 
        context
      );
      
      if (!aiResponse.success) {
        throw new Error(`Erreur IA: ${aiResponse.metadata?.error || 'Réponse non valide'}`);
      }
      
      const responseTime = Date.now() - startTime;
      const estimatedPromptTokens = Math.ceil(message.length / 4);
      const completionTokens = aiResponse.tokensUsed || Math.ceil(aiResponse.content.length / 4);
      
      // Calculer le coût approximatif (valeurs mock)
      const costUsd = this.calculateMockCost(provider, model, estimatedPromptTokens, completionTokens);
      
      return {
        content: aiResponse.content,
        tokensUsed: completionTokens,
        responseTime,
        costUsd,
        confidence: aiResponse.confidence || 0.85,
        promptTokens: estimatedPromptTokens
      };
      
    } catch (error) {
      this.logger.error(`Erreur génération IA: ${error.message}`);
      
      // Fallback avec réponse d'échec
      const fallbackContent = `Désolé, je rencontre des difficultés techniques. Voici une réponse de base pour "${message}". Pourriez-vous reformuler votre question ?`;
      
      return {
        content: fallbackContent,
        tokensUsed: Math.ceil(fallbackContent.length / 4),
        responseTime: Date.now() - startTime,
        costUsd: 0,
        confidence: 0.1,
        promptTokens: Math.ceil(message.length / 4)
      };
    }
  }

  /**
   * Construire le contexte de conversation pour l'IA
   */
  private async buildConversationContext(conversationId: string, tenantId: string): Promise<string> {
    try {
      // Récupérer les derniers messages de la conversation
      const conversations = await this.conversationService.getUserConversations(
        '', // userId sera filtré par conversationId
        tenantId,
        1,
        0
      );
      
      const conversation = conversations.find(c => c.conversation.id === conversationId);
      if (!conversation || !conversation.lastMessage) {
        return 'Nouvelle conversation WikiPro';
      }
      
      // Construire le contexte à partir du dernier message (simple pour MVP)
      const lastMessage = conversation.lastMessage;
      const contextMessages = `Dernier message: ${lastMessage.role}: ${lastMessage.content}`;
      
      return `Contexte conversation WikiPro:\n${contextMessages}`;
      
    } catch (error) {
      this.logger.warn(`Erreur construction contexte: ${error.message}`);
      return 'Conversation WikiPro';
    }
  }

  /**
   * Calculer le coût approximatif mocké
   */
  private calculateMockCost(provider: string, model: string, promptTokens: number, completionTokens: number): number {
    // Coûts approximatifs par 1000 tokens (valeurs mock pour développement)
    const costPer1000Tokens = {
      'openai': { 'gpt-4': 0.03, 'gpt-3.5-turbo': 0.002 },
      'claude': { 'claude-3': 0.025, 'claude-instant': 0.008 },
      'gemini': { 'gemini-pro': 0.0005, 'gemini-ultra': 0.02 }
    };
    
    const providerCosts = costPer1000Tokens[provider] || costPer1000Tokens['openai'];
    const modelCost = providerCosts[model] || providerCosts['gpt-4'];
    
    const totalTokens = promptTokens + completionTokens;
    return Math.round((totalTokens / 1000) * modelCost * 10000) / 10000; // Arrondir à 4 décimales
  }

  @SubscribeMessage('stop-streaming')
  async handleStopStreaming(
    @MessageBody() data: { messageId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const connection = this.connectedUsers.get(client.id);
    if (!connection) {
      return;
    }

    this.logger.log(`⏹️ Streaming arrêté pour ${connection.user.username}`);
    
    // Annuler la session de streaming si un messageId est fourni
    if (data.messageId) {
      const cancelled = await this.messageService.cancelStreamingSession(
        data.messageId,
        'Arrêté par l\'utilisateur'
      );
      
      if (cancelled) {
        client.emit('stream-cancelled', {
          messageId: data.messageId,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    client.emit('stream-stopped', { 
      timestamp: new Date().toISOString(),
      messageId: data.messageId 
    });
  }

  @SubscribeMessage('typing-indicator')
  handleTyping(
    @MessageBody() data: { isTyping: boolean; conversationId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const connection = this.connectedUsers.get(client.id);
    if (connection) {
      connection.lastActivity = new Date();
      
      // Diffuser l'indicateur de saisie aux autres utilisateurs du même tenant
      client.to(`tenant-${connection.user.tenantId}`).emit('user-typing', {
        userId: connection.user.sub,
        username: connection.user.username,
        conversationId: data.conversationId,
        isTyping: data.isTyping,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage('join-conversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const connection = this.connectedUsers.get(client.id);
    if (!connection) {
      client.emit('error', { message: 'Non authentifié' });
      return;
    }

    try {
      // Vérifier que la conversation existe et appartient à l'utilisateur
      const conversations = await this.conversationService.getUserConversations(
        connection.user.sub,
        connection.user.tenantId,
        1,
        0
      );

      const targetConversation = conversations.find(c => c.conversation.id === data.conversationId);
      if (!targetConversation) {
        client.emit('error', { message: 'Conversation non trouvée' });
        return;
      }

      // Mettre à jour la conversation courante
      connection.currentConversation = data.conversationId;
      
      // Rejoindre le room spécifique à la conversation
      client.join(`conversation-${data.conversationId}`);
      
      client.emit('conversation-joined', {
        conversationId: data.conversationId,
        timestamp: new Date().toISOString()
      });

      this.logger.log(`👥 ${connection.user.username} a rejoint la conversation ${data.conversationId}`);
      
    } catch (error) {
      this.logger.error(`Erreur join conversation: ${error.message}`);
      client.emit('error', { message: 'Erreur lors de la jonction à la conversation' });
    }
  }

  @SubscribeMessage('leave-conversation')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const connection = this.connectedUsers.get(client.id);
    if (connection) {
      connection.currentConversation = undefined;
      client.leave(`conversation-${data.conversationId}`);
      
      client.emit('conversation-left', {
        conversationId: data.conversationId,
        timestamp: new Date().toISOString()
      });

      this.logger.log(`👋 ${connection.user.username} a quitté la conversation ${data.conversationId}`);
    }
  }

  @SubscribeMessage('rate-message')
  async handleRateMessage(
    @MessageBody() data: { messageId: string; rating: number; feedback?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const connection = this.connectedUsers.get(client.id);
    if (!connection) {
      client.emit('error', { message: 'Non authentifié' });
      return;
    }

    try {
      const updatedMessage = await this.messageService.rateMessage(
        data.messageId,
        connection.user.tenantId,
        data.rating,
        data.feedback
      );

      client.emit('message-rated', {
        messageId: data.messageId,
        rating: data.rating,
        feedback: data.feedback,
        timestamp: new Date().toISOString()
      });

      this.logger.log(`⭐ Message ${data.messageId} noté ${data.rating}/5 par ${connection.user.username}`);

    } catch (error) {
      this.logger.error(`Erreur notation message: ${error.message}`);
      client.emit('error', { message: 'Erreur lors de la notation' });
    }
  }

  // Méthode utilitaire pour envoyer des messages à un tenant spécifique
  sendToTenant(tenantId: string, event: string, data: any) {
    this.server.to(`tenant-${tenantId}`).emit(event, data);
  }

  // Méthode utilitaire pour notifier l'activité dans un tenant
  private notifyTenantActivity(tenantId: string, eventType: string, data: any) {
    this.server.to(`tenant-${tenantId}`).emit('tenant-activity', {
      eventType,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Méthode utilitaire pour obtenir les statistiques de connexions
  getConnectionStats() {
    const connections = Array.from(this.connectedUsers.values());
    
    return {
      totalConnections: this.connectedUsers.size,
      connectionsByTenant: connections.reduce((acc, conn) => {
        const tenant = conn.user.tenantId;
        acc[tenant] = (acc[tenant] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      activeConversations: connections.filter(c => c.currentConversation).length,
      streamingSessions: this.messageService.getActiveStreamingSessions().length,
      lastActivity: connections.reduce((latest, conn) => {
        return conn.lastActivity > latest ? conn.lastActivity : latest;
      }, new Date(0))
    };
  }

  // Nettoyer les connexions expirées (plus de 30 minutes d'inactivité)
  private async cleanupExpiredSessions(): Promise<number> {
    const expiredTime = Date.now() - (30 * 60 * 1000); // 30 minutes
    let cleanedCount = 0;

    for (const [socketId, connection] of this.connectedUsers.entries()) {
      if (connection.lastActivity.getTime() < expiredTime) {
        this.logger.warn(`Connexion expirée nettoyée: ${socketId} (user: ${connection.user.username})`);
        
        // Déconnecter le socket
        connection.socket.disconnect(true);
        this.connectedUsers.delete(socketId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`${cleanedCount} connexions expirées nettoyées`);
    }

    return cleanedCount;
  }

  // Obtenir les conversations actives pour debug/monitoring
  getActiveConversations() {
    const conversations = new Map<string, {
      conversationId: string;
      userCount: number;
      users: string[];
      tenantId: string;
    }>();

    for (const connection of this.connectedUsers.values()) {
      if (connection.currentConversation) {
        const convId = connection.currentConversation;
        const existing = conversations.get(convId);
        
        if (existing) {
          existing.userCount++;
          existing.users.push(connection.user.username);
        } else {
          conversations.set(convId, {
            conversationId: convId,
            userCount: 1,
            users: [connection.user.username],
            tenantId: connection.user.tenantId
          });
        }
      }
    }

    return Array.from(conversations.values());
  }

  // Obtenir les statistiques détaillées pour monitoring
  getDetailedStats() {
    const connections = Array.from(this.connectedUsers.values());
    const streamingSessions = this.messageService.getActiveStreamingSessions();
    const streamingStats = this.messageService.getStreamingStats();

    return {
      connections: this.getConnectionStats(),
      conversations: this.getActiveConversations(),
      streaming: {
        ...streamingStats,
        sessions: streamingSessions.map(s => ({
          messageId: s.messageId,
          conversationId: s.conversationId,
          provider: s.aiProvider,
          duration: Date.now() - s.startTime.getTime(),
          chunksCount: s.chunks.length,
          contentLength: s.currentContent.length
        }))
      },
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }

  /**
   * Obtenir le nombre de messages d'une conversation (cache Redis)
   */
  private async getConversationMessageCount(conversationId: string): Promise<number> {
    try {
      // Essayer de récupérer depuis le cache Redis d'abord
      const client = this.redisService.getMainClient();
      if (client) {
        const cached = await client.get(`conversation:${conversationId}:message_count`);
        if (cached) {
          return parseInt(cached);
        }
      }

      // Sinon, calculer depuis la base de données
      const conversations = await this.conversationService.getUserConversations(
        '', // userId sera filtré par la conversation ID
        '', // tenantId sera filtré par la conversation ID
        1,
        0
      );
      
      const targetConversation = conversations.find(c => c.conversation.id === conversationId);
      const messageCount = targetConversation?.messageCount || 0;

      // Mettre en cache pour 5 minutes
      if (client) {
        await client.setex(`conversation:${conversationId}:message_count`, 300, messageCount.toString());
      }

      return messageCount;
    } catch (error) {
      this.logger.error(`Erreur récupération nombre messages: ${error.message}`);
      return 0;
    }
  }

  /**
   * Gestionnaire événements tenant cross-server
   */
  private handleCrossServerTenantEvent(message: any) {
    try {
      const { eventType, userId, tenantId, username, socketId, timestamp } = message;
      
      this.logger.log(`🌐 Événement tenant cross-server: ${eventType} pour ${username} (tenant: ${tenantId})`);

      // Relayer l'événement aux clients locaux du même tenant
      switch (eventType) {
        case 'user-connected':
          this.sendToTenant(tenantId, 'user-joined-tenant', {
            userId,
            username,
            timestamp,
            source: 'cross-server'
          });
          break;

        case 'user-disconnected':
          this.sendToTenant(tenantId, 'user-left-tenant', {
            userId,
            username,
            timestamp,
            source: 'cross-server'
          });
          break;

        default:
          this.logger.warn(`Événement tenant non géré: ${eventType}`);
      }
    } catch (error) {
      this.logger.error(`Erreur traitement événement tenant: ${error.message}`);
    }
  }

  /**
   * Gestionnaire événements conversation cross-server
   */
  private handleConversationUpdateEvent(message: any) {
    try {
      const { eventType, conversationId, userId, tenantId, username, timestamp } = message;
      
      this.logger.log(`💬 Événement conversation cross-server: ${eventType} pour conversation ${conversationId}`);

      // Relayer aux clients connectés à cette conversation
      this.server.to(`conversation-${conversationId}`).emit('conversation-update', {
        eventType,
        conversationId,
        userId,
        username,
        timestamp,
        source: 'cross-server'
      });

      // Notifier aussi le tenant général
      this.sendToTenant(tenantId, 'tenant-conversation-update', {
        eventType,
        conversationId,
        userId,
        username,
        timestamp,
        source: 'cross-server'
      });

    } catch (error) {
      this.logger.error(`Erreur traitement événement conversation: ${error.message}`);
    }
  }
}