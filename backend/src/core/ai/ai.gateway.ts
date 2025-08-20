import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '@core/auth/guards/jwt-auth.guard';
import { TenantGuard } from '@core/auth/guards/tenant.guard';
import { AIOrchestrator } from './services/ai-orchestrator.service';
import { QuotaManagerService } from './services/quota-manager.service';
import { StreamRequestDto, StreamChunkDto, StreamEventDto } from './dto';
import { ChatRequest, StreamEvents, AIProviderType } from './providers/base-provider';
import { v4 as uuidv4 } from 'uuid';

interface ClientConnection {
  socket: Socket;
  tenantId: string;
  userId: string;
  sessionId?: string;
  isActive: boolean;
  connectedAt: Date;
  lastActivity: Date;
}

interface StreamSession {
  connectionId: string;
  tenantId: string;
  userId: string;
  sessionId?: string;
  startedAt: Date;
  isActive: boolean;
  provider?: AIProviderType;
  totalTokens: number;
  chunks: number;
}

@Injectable()
@WebSocketGateway({
  namespace: '/ai/stream',
  cors: {
    origin: true,
    credentials: true,
  },
  transports: ['websocket'],
})
@UseGuards(JwtAuthGuard, TenantGuard)
export class AIStreamGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AIStreamGateway.name);
  private connections = new Map<string, ClientConnection>();
  private activeSessions = new Map<string, StreamSession>();
  
  // Metrics
  private stats = {
    totalConnections: 0,
    activeConnections: 0,
    totalSessions: 0,
    activeSessions: 0,
    totalChunks: 0,
    totalTokensStreamed: 0,
    averageLatency: 0,
  };

  constructor(
    private readonly aiOrchestrator: AIOrchestrator,
    private readonly quotaManager: QuotaManagerService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('🌐 WebSocket Gateway AI Stream initialisé');
    this.setupCleanupTimer();
  }

  async handleConnection(client: Socket) {
    try {
      // Extraire les données d'authentification depuis le handshake
      const tenantId = client.handshake.auth?.tenantId;
      const userId = client.handshake.auth?.userId;
      
      if (!tenantId || !userId) {
        this.logger.warn(`❌ Connexion rejetée: données d'auth manquantes`);
        client.disconnect();
        return;
      }

      const connectionId = uuidv4();
      const connection: ClientConnection = {
        socket: client,
        tenantId,
        userId,
        isActive: true,
        connectedAt: new Date(),
        lastActivity: new Date(),
      };

      this.connections.set(connectionId, connection);
      client.data = { connectionId, tenantId, userId };
      
      this.stats.totalConnections++;
      this.stats.activeConnections++;

      this.logger.log(`✅ Client connecté: ${connectionId} (tenant: ${tenantId}, user: ${userId})`);
      
      // Envoyer confirmation de connexion
      client.emit('connected', {
        connectionId,
        status: 'connected',
        timestamp: new Date(),
        supportedProviders: this.aiOrchestrator.getAvailableProviders(),
      });

    } catch (error) {
      this.logger.error(`❌ Erreur lors de la connexion: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const connectionId = client.data?.connectionId;
    if (connectionId) {
      // Nettoyer les sessions actives
      const activeSessions = Array.from(this.activeSessions.entries())
        .filter(([_, session]) => session.connectionId === connectionId);

      for (const [sessionId, session] of activeSessions) {
        session.isActive = false;
        this.activeSessions.delete(sessionId);
        this.stats.activeSessions--;
        this.logger.log(`🛑 Session stream fermée: ${sessionId}`);
      }

      // Supprimer la connexion
      this.connections.delete(connectionId);
      this.stats.activeConnections--;
      
      this.logger.log(`👋 Client déconnecté: ${connectionId}`);
    }
  }

  @SubscribeMessage('chat.stream.start')
  async handleChatStreamStart(
    @MessageBody() data: StreamRequestDto,
    @ConnectedSocket() client: Socket,
  ) {
    const connectionId = client.data?.connectionId;
    const tenantId = client.data?.tenantId;
    const userId = client.data?.userId;

    if (!connectionId || !tenantId || !userId) {
      client.emit('error', { message: 'Invalid connection state' });
      return;
    }

    try {
      // Créer une session de streaming
      const sessionId = uuidv4();
      const streamSession: StreamSession = {
        connectionId,
        tenantId,
        userId,
        sessionId: data.sessionId,
        startedAt: new Date(),
        isActive: true,
        totalTokens: 0,
        chunks: 0,
      };

      this.activeSessions.set(sessionId, streamSession);
      this.stats.totalSessions++;
      this.stats.activeSessions++;

      // Estimation des tokens pour vérification des quotas
      const estimatedTokens = this.estimateTokens(data.messages);
      
      // Vérifier les quotas
      const quotaCheck = await this.quotaManager.checkTenantQuotas(
        tenantId,
        estimatedTokens,
        data.preferredProvider || AIProviderType.OPENAI,
      );

      if (!quotaCheck.allowed) {
        client.emit('chat.error', {
          sessionId,
          error: quotaCheck.reason,
          timestamp: new Date(),
        });
        this.activeSessions.delete(sessionId);
        this.stats.activeSessions--;
        return;
      }

      // Mettre à jour l'activité de connexion
      const connection = this.connections.get(connectionId);
      if (connection) {
        connection.lastActivity = new Date();
      }

      // Préparer la requête de chat
      const chatRequest: ChatRequest = {
        messages: data.messages,
        maxTokens: data.maxTokens,
        temperature: data.temperature,
        stopSequences: data.stopSequences,
        stream: true,
        sessionId: data.sessionId,
        tenantId,
        preferredProvider: data.preferredProvider,
      };

      // Préparer les événements de streaming
      const events: StreamEvents = {
        onStart: (startData) => {
          streamSession.provider = startData.provider;
          client.emit('chat.start', {
            sessionId,
            provider: startData.provider,
            timestamp: new Date(),
          });
          this.logger.debug(`🎬 Stream démarré: ${sessionId} avec ${startData.provider}`);
        },

        onChunk: (chunk) => {
          streamSession.chunks++;
          streamSession.totalTokens = chunk.tokensUsed || streamSession.totalTokens;
          
          this.stats.totalChunks++;
          
          const chunkEvent: StreamChunkDto = {
            content: chunk.content,
            delta: chunk.delta,
            isComplete: chunk.isComplete,
            tokensUsed: chunk.tokensUsed,
            finishReason: chunk.finishReason,
          };

          client.emit('chat.chunk', {
            sessionId,
            chunk: chunkEvent,
            timestamp: new Date(),
          });

          // Si c'est terminé, nettoyer la session
          if (chunk.isComplete) {
            this.finalizeStreamSession(sessionId, streamSession);
          }
        },

        onComplete: async (response) => {
          const duration = Date.now() - streamSession.startedAt.getTime();
          
          // Consommer les quotas
          await this.quotaManager.consumeQuota(
            tenantId,
            response.tokensUsed,
            response.provider,
          );

          this.stats.totalTokensStreamed += response.tokensUsed;
          this.updateAverageLatency(duration);

          client.emit('chat.complete', {
            sessionId,
            response: {
              message: response.message,
              tokensUsed: response.tokensUsed,
              finishReason: response.finishReason,
              provider: response.provider,
              duration,
            },
            timestamp: new Date(),
          });

          this.finalizeStreamSession(sessionId, streamSession);
          this.logger.log(`✅ Stream terminé: ${sessionId} (${response.tokensUsed} tokens, ${duration}ms)`);
        },

        onError: (error, fallback) => {
          client.emit('chat.error', {
            sessionId,
            error: error.message,
            fallback,
            timestamp: new Date(),
          });

          this.finalizeStreamSession(sessionId, streamSession);
          this.logger.error(`❌ Stream error: ${sessionId} - ${error.message}`);
        },
      };

      // Démarrer le streaming
      await this.aiOrchestrator.chatCompletionStream(chatRequest, events);

    } catch (error) {
      this.logger.error(`💥 Erreur stream chat: ${error.message}`);
      client.emit('chat.error', {
        error: error.message,
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('chat.stream.stop')
  async handleChatStreamStop(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const connectionId = client.data?.connectionId;
    const session = Array.from(this.activeSessions.entries())
      .find(([_, s]) => s.connectionId === connectionId && s.sessionId === data.sessionId);

    if (session) {
      const [sessionId, streamSession] = session;
      this.finalizeStreamSession(sessionId, streamSession);
      
      client.emit('chat.stopped', {
        sessionId: data.sessionId,
        timestamp: new Date(),
      });

      this.logger.log(`🛑 Stream arrêté manuellement: ${data.sessionId}`);
    }
  }

  @SubscribeMessage('get.providers.status')
  async handleGetProvidersStatus(
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const providersStatus = this.aiOrchestrator.getProviderStatus();
      const statusData = Array.from(providersStatus.entries()).map(([type, data]) => ({
        type,
        name: data.provider.name,
        status: data.provider.getStatus(),
        available: data.provider.isAvailable(),
        config: data.provider.getConfig(),
        metrics: data.provider.getMetrics(),
        stats: data.stats,
      }));

      client.emit('providers.status', {
        providers: statusData,
        timestamp: new Date(),
      });

    } catch (error) {
      client.emit('error', {
        message: `Failed to get providers status: ${error.message}`,
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('get.quota.status') 
  async handleGetQuotaStatus(
    @ConnectedSocket() client: Socket,
  ) {
    const tenantId = client.data?.tenantId;
    if (!tenantId) {
      client.emit('error', { message: 'Tenant ID not found' });
      return;
    }

    try {
      const tenantQuotas = this.quotaManager.getTenantQuotas(tenantId);
      const globalStats = this.quotaManager.getGlobalStats();
      const recentAlerts = this.quotaManager.getRecentAlerts(10);

      client.emit('quota.status', {
        tenant: tenantQuotas,
        global: globalStats,
        alerts: recentAlerts,
        timestamp: new Date(),
      });

    } catch (error) {
      client.emit('error', {
        message: `Failed to get quota status: ${error.message}`,
        timestamp: new Date(),
      });
    }
  }

  // ===== MÉTHODES PRIVÉES =====

  private finalizeStreamSession(sessionId: string, session: StreamSession): void {
    session.isActive = false;
    this.activeSessions.delete(sessionId);
    this.stats.activeSessions--;
  }

  private estimateTokens(messages: any[]): number {
    const totalChars = messages.reduce((total, msg) => total + (msg.content?.length || 0), 0);
    return Math.ceil(totalChars / 4); // Estimation approximative
  }

  private updateAverageLatency(latency: number): void {
    const totalSessions = this.stats.totalSessions;
    this.stats.averageLatency = ((this.stats.averageLatency * (totalSessions - 1)) + latency) / totalSessions;
  }

  private setupCleanupTimer(): void {
    // Nettoyer les sessions inactives toutes les 5 minutes
    setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      for (const [sessionId, session] of this.activeSessions) {
        if (session.startedAt < fiveMinutesAgo && session.isActive) {
          this.logger.warn(`🧹 Nettoyage session inactive: ${sessionId}`);
          this.finalizeStreamSession(sessionId, session);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // ===== MÉTHODES PUBLIQUES POUR MONITORING =====

  getStats() {
    return {
      ...this.stats,
      connections: {
        active: this.stats.activeConnections,
        total: this.stats.totalConnections,
      },
      sessions: {
        active: this.stats.activeSessions,
        total: this.stats.totalSessions,
      },
    };
  }

  getActiveConnections(): ClientConnection[] {
    return Array.from(this.connections.values());
  }

  getActiveSessions(): StreamSession[] {
    return Array.from(this.activeSessions.values());
  }
}