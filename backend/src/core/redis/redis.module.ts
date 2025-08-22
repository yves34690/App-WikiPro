import { Module, Global } from '@nestjs/common';
import { CoreConfigModule } from '@core/config/config.module';
import { RedisService } from './redis.service';

/**
 * Module Redis global pour WikiPro
 * Fournit les connexions Redis pour cache, sessions et Socket.io
 */
@Global()
@Module({
  imports: [CoreConfigModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}