import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@core/redis/redis.module';

// Entities
import { Message } from '@database/entities/message.entity';
import { Conversation } from '@database/entities/conversation.entity';
import { User } from '@database/entities/user.entity';

// Import des modules qui fournissent les services nécessaires
import { ChatModule } from '@modules/chat/chat.module';
import { AIGatewayModule } from '../ai-gateway.module';

// Services monitoring
import { AIAnalyticsService } from './ai-analytics.service';

// Controller
import { AIMonitoringController } from './ai-monitoring.controller';

/**
 * Module de monitoring et analytics IA - TICKET-BACKEND-005
 * Module séparé pour éviter les dépendances circulaires
 */
@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forFeature([Message, Conversation, User]),
    ChatModule, // Pour MessageService et ConversationService
    AIGatewayModule.forRoot(), // Pour AIGatewayService
  ],
  controllers: [
    AIMonitoringController,
  ],
  providers: [
    AIAnalyticsService,
  ],
  exports: [
    AIAnalyticsService,
  ],
})
export class AIMonitoringModule {}