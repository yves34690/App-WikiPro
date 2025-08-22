import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreConfigModule } from '../core/config/config.module';
import { RedisModule } from '../core/redis/redis.module';

// Entities pour analytics
import { Message } from '../database/entities/message.entity';
import { Conversation } from '../database/entities/conversation.entity';
import { User } from '../database/entities/user.entity';

// Services
import { AIConfigService } from './config/ai-config.service';
import { AIHealthService } from './health/ai-health.service';
import { AIGatewayService } from './ai-gateway.service';

// Controllers
import { AIHealthController } from './health/ai-health.controller';

// Providers
import { OpenAIProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GeminiProvider } from './providers/gemini.provider';

// Provider Factory
import { ConfigService } from '../core/config/config.service';

@Module({})
export class AIGatewayModule {
  static forRoot(): DynamicModule {
    return {
      module: AIGatewayModule,
      imports: [
        CoreConfigModule,
        ConfigModule,
        RedisModule,
        // Import des entités nécessaires pour les analytics
        TypeOrmModule.forFeature([Message, Conversation, User]),
      ],
      providers: [
        // Configuration
        AIConfigService,
        
        // Core Services
        AIGatewayService,
        
        // Health Services
        AIHealthService,
        
        // Provider Factory
        {
          provide: 'AI_PROVIDERS',
          useFactory: (configService: ConfigService) => {
            const aiConfig = configService.ai;
            const providers = new Map();

            // Création dynamique des providers selon la configuration
            if (aiConfig.openai.apiKey) {
              const openaiConfig = {
                name: 'openai',
                enabled: true,
                priority: aiConfig.gateway.defaultProvider === 'openai' ? 1 : 2,
                ...aiConfig.openai,
              };
              providers.set('openai', new OpenAIProvider(openaiConfig));
            }

            if (aiConfig.anthropic.apiKey) {
              const anthropicConfig = {
                name: 'anthropic',
                enabled: true,
                priority: aiConfig.gateway.defaultProvider === 'anthropic' ? 1 : 2,
                ...aiConfig.anthropic,
              };
              providers.set('anthropic', new AnthropicProvider(anthropicConfig));
            }

            if (aiConfig.gemini.apiKey) {
              const geminiConfig = {
                name: 'gemini',
                enabled: true,
                priority: aiConfig.gateway.defaultProvider === 'gemini' ? 1 : 2,
                ...aiConfig.gemini,
              };
              providers.set('gemini', new GeminiProvider(geminiConfig));
            }

            return providers;
          },
          inject: [ConfigService],
        },
      ],
      controllers: [
        AIHealthController,
      ],
      exports: [
        AIConfigService,
        AIGatewayService,
        AIHealthService,
        'AI_PROVIDERS',
      ],
    };
  }
}