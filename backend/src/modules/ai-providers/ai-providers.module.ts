import { Module, OnModuleInit } from '@nestjs/common';
import { AiProvidersService } from './ai-providers.service';
import { AiProvidersController } from './ai-providers.controller';
import { GeminiProvider } from './gemini/gemini.provider';
import { OpenAIProvider } from './openai/openai.provider';
import { AnthropicProvider } from './anthropic/anthropic.provider';
import { MistralProvider } from './mistral/mistral.provider';
import { RegistryService } from '@core/registry/registry.service';
import { ConfigService } from '@core/config/config.service';
import { TelemetryService } from '@core/telemetry/telemetry.service';
import { CoreConfigModule } from '@core/config/config.module';
import { TelemetryModule } from '@core/telemetry/telemetry.module';
import { RegistryModule } from '@core/registry/registry.module';

@Module({
  imports: [CoreConfigModule, TelemetryModule, RegistryModule],
  providers: [
    AiProvidersService,
    GeminiProvider,
    OpenAIProvider,
    AnthropicProvider,
    MistralProvider,
  ],
  controllers: [AiProvidersController],
  exports: [AiProvidersService],
})
export class AiProvidersModule implements OnModuleInit {
  constructor(
    private registryService: RegistryService,
    private configService: ConfigService,
    private telemetryService: TelemetryService,
  ) {}

  async onModuleInit() {
    await this.registerProviders();
  }

  private async registerProviders() {
    // Enregistrer le provider OpenAI
    await this.registerOpenAIProvider();
    
    // Enregistrer le provider Gemini
    await this.registerGeminiProvider();
    
    // Enregistrer le provider Anthropic
    await this.registerAnthropicProvider();
    
    // Enregistrer le provider Mistral
    await this.registerMistralProvider();
  }

  private async registerOpenAIProvider() {
    const openaiProvider = new OpenAIProvider(
      this.configService,
      this.telemetryService,
    );

    // Mise à jour de la config selon les paramètres
    openaiProvider.config.enabled = !!this.configService.ai.openaiApiKey;
    openaiProvider.config.metadata = {
      model: this.configService.ai.openaiModel,
      description: 'OpenAI GPT-4o - Advanced Language Model',
    };

    try {
      await openaiProvider.initialize();
      
      this.registryService.register(
        'ai-text-generation',
        'openai',
        openaiProvider,
        openaiProvider.config
      );

      this.registryService.register(
        'ai-chat-completion',
        'openai',
        openaiProvider,
        openaiProvider.config
      );

      this.registryService.register(
        'ai-embedding',
        'openai',
        openaiProvider,
        openaiProvider.config
      );

      console.log('✅ Provider OpenAI enregistré avec succès');
    } catch (error) {
      console.warn(`⚠️ Échec de l'enregistrement du provider OpenAI: ${error.message}`);
    }
  }

  private async registerGeminiProvider() {
    const geminiProvider = new GeminiProvider(
      this.configService,
      this.telemetryService,
    );

    // Mise à jour de la config selon les paramètres
    geminiProvider.config.enabled = !!this.configService.ai.geminiApiKey;
    geminiProvider.config.metadata = {
      model: this.configService.ai.geminiModel,
      description: 'Google Gemini 2.5 - Large Language Model',
    };

    try {
      await geminiProvider.initialize();
      
      this.registryService.register(
        'ai-text-generation',
        'gemini',
        geminiProvider,
        geminiProvider.config
      );

      this.registryService.register(
        'ai-chat-completion',
        'gemini',
        geminiProvider,
        geminiProvider.config
      );

      console.log('✅ Provider Gemini enregistré avec succès');
    } catch (error) {
      console.warn(`⚠️ Échec de l'enregistrement du provider Gemini: ${error.message}`);
    }
  }

  private async registerAnthropicProvider() {
    const anthropicProvider = new AnthropicProvider(
      this.configService,
      this.telemetryService,
    );

    // Mise à jour de la config selon les paramètres
    anthropicProvider.config.enabled = !!this.configService.ai.anthropicApiKey;
    anthropicProvider.config.metadata = {
      model: this.configService.ai.anthropicModel,
      description: 'Anthropic Claude-3.5 - Advanced Constitutional AI',
    };

    try {
      await anthropicProvider.initialize();
      
      this.registryService.register(
        'ai-text-generation',
        'anthropic',
        anthropicProvider,
        anthropicProvider.config
      );

      this.registryService.register(
        'ai-chat-completion',
        'anthropic',
        anthropicProvider,
        anthropicProvider.config
      );

      console.log('✅ Provider Anthropic enregistré avec succès');
    } catch (error) {
      console.warn(`⚠️ Échec de l'enregistrement du provider Anthropic: ${error.message}`);
    }
  }

  private async registerMistralProvider() {
    const mistralProvider = new MistralProvider(
      this.configService,
      this.telemetryService,
    );

    // Mise à jour de la config selon les paramètres
    mistralProvider.config.enabled = !!this.configService.ai.mistralApiKey;
    mistralProvider.config.metadata = {
      model: this.configService.ai.mistralModel,
      description: 'Mistral Large - High-Performance Open Source Model',
    };

    try {
      await mistralProvider.initialize();
      
      this.registryService.register(
        'ai-text-generation',
        'mistral',
        mistralProvider,
        mistralProvider.config
      );

      this.registryService.register(
        'ai-chat-completion',
        'mistral',
        mistralProvider,
        mistralProvider.config
      );

      this.registryService.register(
        'ai-embedding',
        'mistral',
        mistralProvider,
        mistralProvider.config
      );

      console.log('✅ Provider Mistral enregistré avec succès');
    } catch (error) {
      console.warn(`⚠️ Échec de l'enregistrement du provider Mistral: ${error.message}`);
    }
  }
}