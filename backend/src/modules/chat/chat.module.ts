import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { CoreConfigModule } from '@core/config/config.module';
import { ChatGateway } from './chat.gateway';
import { MessageService, ConversationService } from './services';

@Module({
  imports: [
    AuthModule, // Pour l'authentification JWT
    CoreConfigModule, // Pour la configuration
  ],
  providers: [
    ChatGateway,
    MessageService,
    ConversationService,
  ],
  exports: [
    ChatGateway,
    MessageService,
    ConversationService,
  ],
})
export class ChatModule {}