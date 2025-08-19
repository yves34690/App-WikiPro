import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RegistryService } from '@core/registry/registry.service';
import { TelemetryService } from '@core/telemetry/telemetry.service';
import { 
  BaseAiProvider,
  TextGenerationRequest,
  TextGenerationResponse,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from '@shared/interfaces/ai-provider.interface';

@Injectable()
export class AiProvidersService {
  private readonly logger = new Logger(AiProvidersService.name);

  constructor(
    private registryService: RegistryService,
    private telemetryService: TelemetryService,
  ) {}

  async generateText(
    tenantId: string,
    request: TextGenerationRequest,
    providerName?: string
  ): Promise<TextGenerationResponse> {
    const provider = this.getProvider('ai-text-generation', providerName);
    
    this.logger.log(`Génération de texte demandée pour tenant ${tenantId} avec ${provider.name}`);
    
    const response = await provider.generateText(tenantId, request);
    
    this.telemetryService.trackEvent({
      event: 'ai.text.generation.success',
      tenantId,
      metadata: {
        provider: provider.name,
        promptLength: request.prompt.length,
        tokensUsed: response.tokensUsed,
      },
    });

    return response;
  }

  async chatCompletion(
    tenantId: string,
    request: ChatCompletionRequest,
    providerName?: string
  ): Promise<ChatCompletionResponse> {
    const provider = this.getProvider('ai-chat-completion', providerName);
    
    if (!provider.chatCompletion) {
      throw new Error(`Provider ${provider.name} ne supporte pas le chat completion`);
    }

    this.logger.log(`Chat completion demandé pour tenant ${tenantId} avec ${provider.name}`);

    const response = await provider.chatCompletion(tenantId, request);

    this.telemetryService.trackEvent({
      event: 'ai.chat.completion.success',
      tenantId,
      metadata: {
        provider: provider.name,
        messagesCount: request.messages.length,
        tokensUsed: response.tokensUsed,
      },
    });

    return response;
  }

  getAvailableProviders(type?: string): Array<{
    name: string;
    version: string;
    capabilities: any;
    metrics: any;
    enabled: boolean;
  }> {
    if (type) {
      const providers = this.registryService.getByType<BaseAiProvider>(type);
      return providers.map(provider => ({
        name: provider.name,
        version: provider.version,
        capabilities: provider.capabilities,
        metrics: provider.getMetrics(),
        enabled: provider.isEnabled,
      }));
    }

    // Retourner tous les providers IA
    const allProviders = this.registryService.getProvidersInfo();
    return allProviders
      .filter(info => info.type.startsWith('ai-'))
      .map(info => ({
        name: info.name,
        version: info.config.version,
        capabilities: (info as any).instance?.capabilities || {},
        metrics: info.metrics,
        enabled: info.config.enabled,
      }));
  }

  async testProvider(
    tenantId: string,
    providerType: string,
    providerName: string
  ): Promise<{
    success: boolean;
    response?: TextGenerationResponse;
    error?: string;
    responseTime: number;
  }> {
    const startTime = Date.now();

    try {
      const provider = this.getProvider(providerType, providerName);
      
      const testRequest: TextGenerationRequest = {
        prompt: 'Dis simplement "Test réussi" en français.',
        maxTokens: 50,
        temperature: 0.1,
      };

      const response = await provider.generateText(tenantId, testRequest);
      const responseTime = Date.now() - startTime;

      this.logger.log(`Test du provider ${providerName} réussi pour tenant ${tenantId} (${responseTime}ms)`);

      return {
        success: true,
        response,
        responseTime,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.logger.error(`Test du provider ${providerName} échoué pour tenant ${tenantId}: ${error.message}`);

      return {
        success: false,
        error: error.message,
        responseTime,
      };
    }
  }

  private getProvider(type: string, name?: string): BaseAiProvider {
    if (name) {
      const provider = this.registryService.get<BaseAiProvider>(type, name);
      if (!provider) {
        throw new NotFoundException(`Provider ${name} non trouvé pour le type ${type}`);
      }
      return provider;
    }

    const provider = this.registryService.getBest<BaseAiProvider>(type);
    if (!provider) {
      throw new NotFoundException(`Aucun provider disponible pour le type ${type}`);
    }

    return provider;
  }
}