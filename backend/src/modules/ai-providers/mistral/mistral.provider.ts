import { Injectable, Logger } from '@nestjs/common';
import { Mistral } from '@mistralai/mistralai';
import { 
  BaseAiProvider, 
  TextGenerationRequest, 
  TextGenerationResponse,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
  EmbeddingRequest,
  EmbeddingResponse,
  StreamingTextGenerationRequest
} from '@shared/interfaces/ai-provider.interface';
import { ProviderCapabilities } from '@shared/interfaces/provider.interface';
import { ConfigService } from '@core/config/config.service';
import { TelemetryService } from '@core/telemetry/telemetry.service';

@Injectable()
export class MistralProvider extends BaseAiProvider {
  readonly name = 'mistral';
  readonly version = '8x22B';
  readonly capabilities: ProviderCapabilities = {
    textGeneration: true,
    chatCompletion: true,
    functionCalling: true,
    streaming: true,
    embedding: true, // Mistral propose des embeddings
    imageGeneration: false,
  };

  private client: Mistral;
  private readonly logger = new Logger(MistralProvider.name);

  constructor(
    private configService: ConfigService,
    private telemetryService?: TelemetryService,
  ) {
    super({
      name: 'mistral',
      version: '8x22B',
      enabled: true,
      priority: 85, // Priorité la plus faible pour commencer
    });
  }

  async initialize(): Promise<void> {
    try {
      const apiKey = this.configService.ai.mistralApiKey;
      if (!apiKey) {
        throw new Error('Clé API Mistral manquante dans la configuration');
      }

      this.client = new Mistral({
        apiKey: apiKey,
      });

      this.logger.log(`Provider Mistral initialisé avec le modèle: ${this.configService.ai.mistralModel}`);
    } catch (error) {
      this.logger.error(`Erreur d'initialisation Mistral: ${error.message}`);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Test simple avec Mistral 7B (modèle le plus économique)
      const response = await this.client.chat.complete({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: 'Test de santé' }],
        maxTokens: 5,
        temperature: 0,
      });

      return !!(response.choices?.[0]?.message?.content);
    } catch (error) {
      this.logger.warn(`Health check Mistral échoué: ${error.message}`);
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
      const model = this.configService.ai.mistralModel || 'mistral-large-latest';

      const response = await this.client.chat.complete({
        model,
        messages,
        maxTokens: request.maxTokens || this.configService.ai.maxTokens,
        temperature: request.temperature ?? this.configService.ai.temperature,
        stop: request.stopSequences || undefined,
      });

      const responseText = typeof response.choices?.[0]?.message?.content === 'string' 
        ? response.choices[0].message.content 
        : '';
      const tokensUsed = response.usage?.totalTokens || this.estimateTokens(request.prompt + responseText);
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
        finishReason: this.mapFinishReason(response.choices?.[0]?.finishReason),
        metadata: {
          model,
          responseTime,
          usage: response.usage,
        },
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, 0, true);
      
      this.logger.error(`Erreur génération Mistral pour tenant ${tenantId}: ${error.message}`);
      this.handleError(error, 'Mistral text generation');
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

      const messages = this.convertMessages(request.messages);
      const model = this.configService.ai.mistralModel || 'mistral-large-latest';

      const response = await this.client.chat.complete({
        model,
        messages,
        maxTokens: request.maxTokens || this.configService.ai.maxTokens,
        temperature: request.temperature ?? this.configService.ai.temperature,
        stop: request.stopSequences || undefined,
        tools: this.convertFunctions(request.functions),
      });

      const responseMessage = response.choices?.[0]?.message;
      const tokensUsed = response.usage?.totalTokens || 0;
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

      const messageContent = typeof responseMessage?.content === 'string' 
        ? responseMessage.content 
        : '';

      return {
        message: {
          role: 'assistant',
          content: messageContent,
        },
        tokensUsed,
        finishReason: this.mapFinishReason(response.choices?.[0]?.finishReason),
        functionCall: responseMessage?.toolCalls?.[0] ? {
          name: responseMessage.toolCalls[0].function?.name || '',
          arguments: JSON.parse(typeof responseMessage.toolCalls[0].function?.arguments === 'string' 
            ? responseMessage.toolCalls[0].function.arguments 
            : '{}'),
        } : undefined,
        metadata: {
          model,
          responseTime,
          usage: response.usage,
        },
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, 0, true);
      
      this.logger.error(`Erreur chat completion Mistral pour tenant ${tenantId}: ${error.message}`);
      this.handleError(error, 'Mistral chat completion');
    }
  }

  async generateEmbedding(
    tenantId: string,
    request: EmbeddingRequest
  ): Promise<EmbeddingResponse> {
    const startTime = Date.now();

    try {
      this.validateTenant(tenantId);
      this.validateRequest(request);

      const model = request.model || 'mistral-embed';

      const response = await this.client.embeddings.create({
        model,
        inputs: [request.text],
      });

      const embedding = response.data?.[0]?.embedding || [];
      const tokensUsed = response.usage?.totalTokens || this.estimateTokens(request.text);
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

      this.logger.debug(`Embedding généré pour le tenant ${tenantId} (${responseTime}ms, ${tokensUsed} tokens)`);

      return {
        embedding,
        tokensUsed,
        metadata: {
          model,
          responseTime,
          dimensions: embedding.length,
        },
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, 0, true);
      
      this.logger.error(`Erreur embedding Mistral pour tenant ${tenantId}: ${error.message}`);
      this.handleError(error, 'Mistral embedding');
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
      const model = this.configService.ai.mistralModel || 'mistral-large-latest';

      const stream = await this.client.chat.stream({
        model,
        messages,
        maxTokens: request.maxTokens || this.configService.ai.maxTokens,
        temperature: request.temperature ?? this.configService.ai.temperature,
        stop: request.stopSequences || undefined,
      });

      for await (const chunk of stream) {
        const content = chunk.data.choices?.[0]?.delta?.content;
        if (content && typeof content === 'string') {
          fullText += content;
          request.onChunk?.(content);
        }

        // Vérification de fin de stream
        if (chunk.data.choices?.[0]?.finishReason) {
          break;
        }
      }

      const responseTime = Date.now() - startTime;
      tokensUsed = this.estimateTokens(request.prompt + fullText);

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

      this.logger.debug(`Streaming Mistral généré pour le tenant ${tenantId} (${responseTime}ms, ${tokensUsed} tokens)`);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, 0, true);
      
      this.logger.error(`Erreur streaming Mistral pour tenant ${tenantId}: ${error.message}`);
      request.onError?.(error);
    }
  }

  private buildMessages(request: TextGenerationRequest) {
    const messages: any[] = [];

    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }

    messages.push({ role: 'user', content: this.sanitizePrompt(request.prompt) });

    return messages;
  }

  private convertMessages(messages: ChatMessage[]) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  private convertFunctions(functions?: Function[]): any[] | undefined {
    if (!functions || functions.length === 0) return undefined;

    return functions.map(func => ({
      type: 'function',
      function: func,
    }));
  }

  private mapFinishReason(reason: string | null | undefined): 'stop' | 'length' | 'content_filter' | 'function_call' {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'model_length':
        return 'length';
      case 'tool_calls':
        return 'function_call';
      default:
        return 'stop';
    }
  }

  private estimateTokens(text: string): number {
    // Estimation approximative pour Mistral
    // Mistral: ~1 token ≈ 3.8 caractères pour le français
    return Math.ceil(text.length / 3.8);
  }

  getMetrics() {
    return this.metrics;
  }
}