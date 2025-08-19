import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { configValidation } from './config.validation';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: configValidation,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class CoreConfigModule {}