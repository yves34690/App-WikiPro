import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entités
import { Session } from './entities/session.entity';
import { Conversation } from './entities/conversation.entity';

// Services et contrôleurs
import { SessionService } from './session.service';
import { SessionController } from './session.controller';

// Modules dépendants
import { AuthModule } from '@core/auth/auth.module';

@Module({
  imports: [
    // Configuration TypeORM pour les entités sessions
    TypeOrmModule.forFeature([
      Session,
      Conversation,
    ]),
    
    // Modules requis pour l'authentification et l'autorisation
    AuthModule,
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [
    SessionService,
    TypeOrmModule, // Permet à d'autres modules d'utiliser les repositories
  ],
})
export class SessionModule {}