import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { 
  BaseAiProvider, 
  TextGenerationRequest, 
  TextGenerationResponse,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
  StreamingTextGenerationRequest
} from '@shared/interfaces/ai-provider.interface';
import { ProviderCapabilities } from '@shared/interfaces/provider.interface';
import { ConfigService } from '@core/config/config.service';
import { TelemetryService } from '@core/telemetry/telemetry.service';

@Injectable()
export class AnthropicProvider extends BaseAiProvider {
  readonly name = 'anthropic';
  readonly version = '3.5';
  readonly capabilities: ProviderCapabilities = {
    textGeneration: true,
    chatCompletion: true,
    functionCalling: true,
    streaming: true,
    embedding: false, // Anthropic ne propose pas d'embeddings
    imageGeneration: false,
  };

  private client: Anthropic;
  private readonly logger = new Logger(AnthropicProvider.name);

  constructor(
    private configService: ConfigService,
    private telemetryService?: TelemetryService,
  ) {
    super({
      name: 'anthropic',
      version: '3.5',
      enabled: true,
      priority: 95, // Entre Gemini (100) et OpenAI (90)
    });
  }

  async initialize(): Promise<void> {
    try {
      const apiKey = this.configService.ai.anthropicApiKey;
      if (!apiKey) {
        throw new Error('Clé API Anthropic manquante dans la configuration');
      }

      this.client = new Anthropic({
        apiKey: apiKey,
      });

      this.logger.log(`Provider Anthropic initialisé avec le modèle: ${this.configService.ai.anthropicModel}`);
    } catch (error) {
      this.logger.error(`Erreur d'initialisation Anthropic: ${error.message}`);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Test simple avec Claude-3 Haiku (modèle le plus économique)
      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Test de santé' }],
      });

      return !!(response.content?.[0] && response.content[0].type === 'text');
    } catch (error) {
      this.logger.warn(`Health check Anthropic échoué: ${error.message}`);
      return false;
    }
  }

  async generateText(
    tenantId: string,
    request: TextGenerationRequest
  ): Promise<TextGenerationResponse> {
    const startTime = Date.now();
    
    try {
      this.validateTenant(tenantId);
      this.validateRequest(request);

      const messages = this.buildMessages(request);
      const model = this.configService.ai.anthropicModel || 'claude-3-5-sonnet-20241022';

      const response = await this.client.messages.create({
        model,
        max_tokens: request.maxTokens || this.configService.ai.maxTokens,
        temperature: request.temperature ?? this.configService.ai.temperature,
        messages,
        stop_sequences: request.stopSequences || undefined,
        system: request.systemPrompt || undefined,
      });

      const responseText = this.extractTextFromContent(response.content);
      const tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens || 
                        this.estimateTokens(request.prompt + responseText);
      const responseTime = Date.now() - startTime;

      // Mise à jour des métriques
      this.updateMetrics(responseTime, tokensUsed);

      // Télémétrie
      if (this.telemetryService) {
        this.telemetryService.trackAiProviderCall(
          tenantId,
          this.name,
          model,
          tokensUsed,
          responseTime
        );
      }

      this.logger.debug(`Génération de texte réussie pour le tenant ${tenantId} (${responseTime}ms, ${tokensUsed} tokens)`);

      return {
        text: responseText,
        tokensUsed,
        finishReason: this.mapStopReason(response.stop_reason),
        metadata: {
          model,
          responseTime,
          usage: response.usage,
          stopReason: response.stop_reason,
        },
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, 0, true);
      
      this.logger.error(`Erreur génération Anthropic pour tenant ${tenantId}: ${error.message}`);
      this.handleError(error, 'Anthropic text generation');
    }
  }

  async chatCompletion(
    tenantId: string,
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    const startTime = Date.now();

    try {
      this.validateTenant(tenantId);
      this.validateRequest(request);

      const { messages, systemMessage } = this.convertMessages(request.messages);
      const model = this.configService.ai.anthropicModel || 'claude-3-5-sonnet-20241022';

      const response = await this.client.messages.create({
        model,
        max_tokens: request.maxTokens || this.configService.ai.maxTokens,
        temperature: request.temperature ?? this.configService.ai.temperature,
        messages,
        stop_sequences: request.stopSequences || undefined,
        system: systemMessage || undefined,
      });

      const responseText = this.extractTextFromContent(response.content);
      const tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens || 0;
      const responseTime = Date.now() - startTime;

      // Mise à jour des métriques
      this.updateMetrics(responseTime, tokensUsed);

      // Télémétrie
      if (this.telemetryService) {
        this.telemetryService.trackAiProviderCall(
          tenantId,
          this.name,
          model,
          tokensUsed,
          responseTime
        );
      }

      this.logger.debug(`Chat completion réussi pour le tenant ${tenantId} (${responseTime}ms, ${tokensUsed} tokens)`);

      return {
        message: {
          role: 'assistant',
          content: responseText,
        },
        tokensUsed,
        finishReason: this.mapStopReason(response.stop_reason),
        metadata: {
          model,
          responseTime,
          usage: response.usage,
          stopReason: response.stop_reason,
        },
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, 0, true);
      
      this.logger.error(`Erreur chat completion Anthropic pour tenant ${tenantId}: ${error.message}`);
      this.handleError(error, 'Anthropic chat completion');
    }
  }

  async generateTextStream(
    tenantId: string,
    request: StreamingTextGenerationRequest
  ): Promise<void> {
    const startTime = Date.now();
    let tokensUsed = 0;
    let fullText = '';

    try {
      this.validateTenant(tenantId);
      this.validateRequest(request);

      const messages = this.buildMessages(request);
      const model = this.configService.ai.anthropicModel || 'claude-3-5-sonnet-20241022';

      const stream = await this.client.messages.create({
        model,
        max_tokens: request.maxTokens || this.configService.ai.maxTokens,
        temperature: request.temperature ?? this.configService.ai.temperature,
        messages,
        stop_sequences: request.stopSequences || undefined,
        system: request.systemPrompt || undefined,
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          const content = chunk.delta.text;
          fullText += content;
          request.onChunk?.(content);
        } else if (chunk.type === 'message_delta' && chunk.usage) {
          tokensUsed = chunk.usage.output_tokens || 0;
        }
      }

      const responseTime = Date.now() - startTime;
      if (!tokensUsed) {
        tokensUsed = this.estimateTokens(request.prompt + fullText);
      }

      // Mise à jour des métriques
      this.updateMetrics(responseTime, tokensUsed);

      // Télémétrie
      if (this.telemetryService) {
        this.telemetryService.trackAiProviderCall(
          tenantId,
          this.name,
          model,
          tokensUsed,
          responseTime
        );
      }

      // Callback de completion
      request.onComplete?.({
        text: fullText,
        tokensUsed,
        finishReason: 'stop',
        metadata: {
          model,
          responseTime,
        },
      });

      this.logger.debug(`Streaming Anthropic généré pour le tenant ${tenantId} (${responseTime}ms, ${tokensUsed} tokens)`);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, 0, true);
      
      this.logger.error(`Erreur streaming Anthropic pour tenant ${tenantId}: ${error.message}`);
      request.onError?.(error);
    }
  }

  private buildMessages(request: TextGenerationRequest) {
    // Pour Anthropic, le system prompt est séparé des messages
    return [{ role: 'user' as const, content: this.sanitizePrompt(request.prompt) }];
  }

  private convertMessages(messages: ChatMessage[]) {
    // Extraire le message système s'il existe
    const systemMessage = messages.find(m => m.role === 'system')?.content;
    
    // Convertir les autres messages (exclure system)
    const convertedMessages = messages
      .filter(m => m.role !== 'system')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    return { messages: convertedMessages, systemMessage };
  }

  private extractTextFromContent(content: any[]): string {
    return content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');
  }

  private mapStopReason(reason: string | null): 'stop' | 'length' | 'content_filter' | 'function_call' {
    switch (reason) {
      case 'end_turn':
        return 'stop';
      case 'max_tokens':
        return 'length';
      case 'stop_sequence':
        return 'stop';
      default:
        return 'stop';
    }
  }

  private estimateTokens(text: string): number {
    // Estimation approximative pour Claude
    // Claude-3: ~1 token ≈ 3.5 caractères pour le français
    return Math.ceil(text.length / 3.5);
  }

  getMetrics() {
    return this.metrics;
  }
}