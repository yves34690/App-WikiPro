import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Tenant, User, Session, Conversation } from '@core/entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_NAME', 'wikipro'),
        entities: [Tenant, User, Session, Conversation],
        migrations: [__dirname + '/migrations/*.js'],
        migrationsRun: configService.get<boolean>('DB_RUN_MIGRATIONS', false),
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
        logging: configService.get<boolean>('DB_LOGGING', false),
        ssl: configService.get<boolean>('DB_SSL', false)
          ? {
              rejectUnauthorized: configService.get<boolean>('DB_SSL_REJECT_UNAUTHORIZED', false),
            }
          : false,
        extra: {
          // Configuration pour l'isolation multi-tenant
          application_name: 'wikipro-backend',
          // Pool de connexions optimisé
          max: configService.get<number>('DB_POOL_MAX', 20),
          idleTimeoutMillis: configService.get<number>('DB_POOL_IDLE_TIMEOUT', 30000),
          connectionTimeoutMillis: configService.get<number>('DB_POOL_CONNECTION_TIMEOUT', 2000),
        },
      }),
    }),
    // Enregistrement des entités pour l'injection de dépendances
    TypeOrmModule.forFeature([Tenant, User, Session, Conversation]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}