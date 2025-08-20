import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Database
import { DatabaseModule } from './database/database.module';

// Core modules
import { CoreConfigModule } from '@core/config/config.module';
import { AuthModule } from '@core/auth/auth.module';
import { TelemetryModule } from '@core/telemetry/telemetry.module';
import { RegistryModule } from '@core/registry/registry.module';
import { TenantModule } from '@core/tenants/tenant.module';
import { UserModule } from '@core/users/user.module';
import { SessionModule } from '@core/sessions/session.module';
import { AIModule } from '@core/ai/ai.module';

// Feature modules (legacy)
import { AiProvidersModule } from '@modules/ai-providers/ai-providers.module';

// Controllers
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration globale
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requêtes par minute
    }]),

    // Database
    DatabaseModule,

    // Core modules
    CoreConfigModule,
    TenantModule,
    UserModule,
    AuthModule,
    SessionModule,
    TelemetryModule,
    RegistryModule,
    AIModule,

    // Feature modules (legacy - peut être supprimé après migration)
    AiProvidersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}