import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

// Core modules
import { CoreConfigModule } from '@core/config/config.module';
import { AuthModule } from '@core/auth/auth.module';
import { TelemetryModule } from '@core/telemetry/telemetry.module';
import { RegistryModule } from '@core/registry/registry.module';

// Feature modules
import { AiProvidersModule } from '@modules/ai-providers/ai-providers.module';
import { ChatModule } from '@modules/chat/chat.module';
import { AIGatewayModule } from './ai-gateway/ai-gateway.module';
import { AIMonitoringModule } from './ai-gateway/monitoring/ai-monitoring.module';

// Controllers
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration globale de l'environnement
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuration TypeORM pour PostgreSQL
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT) || 5432,
        username: process.env.DATABASE_USERNAME || 'wikipro_user',
        password: process.env.DATABASE_PASSWORD || 'wikipro_password',
        database: process.env.DATABASE_NAME || 'wikipro_dev',
        
        // Configuration de développement
        synchronize: process.env.DATABASE_SYNCHRONIZE === 'true' || process.env.NODE_ENV === 'development',
        logging: process.env.DATABASE_LOGGING === 'true' || process.env.NODE_ENV === 'development',
        
        // Auto-load des entités
        autoLoadEntities: true,
        
        // Migration settings
        migrationsRun: process.env.DATABASE_MIGRATIONS_RUN === 'true',
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        
        // Résilience et performance
        retryAttempts: 3,
        retryDelay: 3000,
        maxQueryExecutionTime: 5000,
        
        // Configuration multi-tenant (Row Level Security support)
        extra: {
          max: 20, // Pool de connexions maximum
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
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
    ChatModule,
    AIGatewayModule.forRoot(),
    AIMonitoringModule, // TICKET-BACKEND-005
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}