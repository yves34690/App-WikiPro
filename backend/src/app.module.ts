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

    // Core modules
    CoreConfigModule,
    AuthModule,
    TelemetryModule,
    RegistryModule,

    // Feature modules
    AiProvidersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}