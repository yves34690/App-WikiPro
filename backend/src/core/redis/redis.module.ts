import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * Module Redis global avec fallback mémoire - TICKET-BACKEND-007
 * Disponible dans toute l'application
 */
@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {
  static forRoot() {
    return {
      module: RedisModule,
      providers: [RedisService],
      exports: [RedisService],
    };
  }
}