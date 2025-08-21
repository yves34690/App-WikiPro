import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Core modules
import { CoreConfigModule } from '@core/config/config.module';
import { AuthModule } from '@core/auth/auth.module';
import { TelemetryModule } from '@core/telemetry/telemetry.module';
import { RegistryModule } from '@core/registry/registry.module';

// Feature modules
import { AiProvidersModule } from '@modules/ai-providers/ai-providers.module';
import { ChatModule } from '@modules/chat/chat.module';

// Controllers
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requêtes par minute
    }]),

    // Core modules
    CoreConfigModule,
    AuthModule,
    TelemetryModule,
    RegistryModule,

    // Feature modules
    AiProvidersModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}