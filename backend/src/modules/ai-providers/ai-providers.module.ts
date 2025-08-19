import { Module, OnModuleInit } from '@nestjs/common';
import { AiProvidersService } from './ai-providers.service';
import { AiProvidersController } from './ai-providers.controller';
import { GeminiProvider } from './gemini/gemini.provider';
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
    // Enregistrer le provider Gemini
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
}