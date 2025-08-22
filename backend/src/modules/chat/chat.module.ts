import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@core/auth/auth.module';
import { CoreConfigModule } from '@core/config/config.module';
import { AIGatewayModule } from '../../ai-gateway/ai-gateway.module';
import { Conversation } from '@database/entities/conversation.entity';
import { Message } from '@database/entities/message.entity';
import { User } from '@database/entities/user.entity';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ConversationService } from './services/conversation.service';
import { MessageService } from './services/message.service';

@Module({
  imports: [
    AuthModule, // Pour l'authentification JWT
    CoreConfigModule, // Pour la configuration
    AIGatewayModule.forRoot(), // NOUVEAU: Pour l'intégration IA
    ...(process.env.DATABASE_ENABLED !== 'false' ? [
      TypeOrmModule.forFeature([Conversation, Message, User]), // Entités pour persistence
    ] : []),
  ],
  controllers: [
    ChatController, // API REST pour historique conversations
  ],
  providers: [
    ChatGateway,
    ConversationService,
    MessageService,
  ],
  exports: [
    ChatGateway,
    ConversationService,
    MessageService,
  ],
})
export class ChatModule {}