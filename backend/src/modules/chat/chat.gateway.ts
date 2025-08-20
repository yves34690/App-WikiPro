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
  private connectedUsers = new Map<string, { socket: Socket; user: JwtPayload }>();

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Chat Gateway initialisé');
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

      // Stockage de la connexion authentifiée
      this.connectedUsers.set(client.id, { socket: client, user: payload });
      
      // Rejoindre le room du tenant pour l'isolation
      client.join(`tenant-${user.tenantId}`);
      
      this.logger.log(`✅ Client connecté: ${client.id} (tenant: ${user.tenantId}, user: ${user.username})`);
      
      // Confirmation de connexion
      client.emit('connection-established', {
        userId: user.userId,
        tenantId: user.tenantId,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Erreur d'authentification WebSocket: ${error.message}`);
      client.emit('auth-error', { message: 'Token invalide' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const connection = this.connectedUsers.get(client.id);
    if (connection) {
      this.logger.log(`❌ Client déconnecté: ${client.id} (user: ${connection.user.username})`);
      this.connectedUsers.delete(client.id);
    }
  }

  @SubscribeMessage('start-streaming')
  async handleStartStreaming(
    @MessageBody() data: { provider: string; message: string; conversationId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const connection = this.connectedUsers.get(client.id);
    if (!connection) {
      client.emit('error', { message: 'Non authentifié' });
      return;
    }

    this.logger.log(`🚀 Streaming démarré: ${data.provider} pour ${connection.user.username}`);

    try {
      // Simulation du streaming (sera remplacé par vrais providers)
      const response = `Réponse de ${data.provider} pour: ${data.message}`;
      
      // Simulation du streaming token par token
      const words = response.split(' ');
      
      client.emit('stream-start', {
        conversationId: data.conversationId || Date.now().toString(),
        provider: data.provider,
        timestamp: new Date().toISOString(),
      });

      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Délai pour simulation
        
        client.emit('stream-chunk', {
          chunk: words[i] + ' ',
          index: i,
          isLast: i === words.length - 1,
        });
      }

      client.emit('stream-complete', {
        fullResponse: response,
        tokensUsed: words.length,
        provider: data.provider,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Erreur streaming: ${error.message}`);
      client.emit('stream-error', {
        message: 'Erreur lors du streaming',
        error: error.message,
      });
    }
  }

  @SubscribeMessage('stop-streaming')
  handleStopStreaming(@ConnectedSocket() client: Socket) {
    const connection = this.connectedUsers.get(client.id);
    if (connection) {
      this.logger.log(`⏹️ Streaming arrêté pour ${connection.user.username}`);
      client.emit('stream-stopped', { timestamp: new Date().toISOString() });
    }
  }

  @SubscribeMessage('typing-indicator')
  handleTyping(
    @MessageBody() data: { isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const connection = this.connectedUsers.get(client.id);
    if (connection) {
      // Diffuser l'indicateur de saisie aux autres utilisateurs du même tenant
      client.to(`tenant-${connection.user.tenantId}`).emit('user-typing', {
        userId: connection.user.sub,
        username: connection.user.username,
        isTyping: data.isTyping,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Méthode utilitaire pour envoyer des messages à un tenant spécifique
  sendToTenant(tenantId: string, event: string, data: any) {
    this.server.to(`tenant-${tenantId}`).emit(event, data);
  }

  // Méthode utilitaire pour obtenir les statistiques de connexions
  getConnectionStats() {
    return {
      totalConnections: this.connectedUsers.size,
      connectionsByTenant: Array.from(this.connectedUsers.values()).reduce((acc, conn) => {
        const tenant = conn.user.tenantId;
        acc[tenant] = (acc[tenant] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}