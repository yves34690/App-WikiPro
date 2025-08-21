import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
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
export class OpenAIProvider extends BaseAiProvider {
  readonly name = 'openai';
  readonly version = '4o';
  readonly capabilities: ProviderCapabilities = {
    textGeneration: true,
    chatCompletion: true,
    functionCalling: true,
    streaming: true,
    embedding: true,
    imageGeneration: false, // DALL-E pourrait être ajouté plus tard
  };

  private client: OpenAI;
  private readonly logger = new Logger(OpenAIProvider.name);

  constructor(
    private configService: ConfigService,
    private telemetryService?: TelemetryService,
  ) {
    super({
      name: 'openai',
      version: '4o',
      enabled: true,
      priority: 90, // Priorité légèrement inférieure à Gemini pour les tests
    });
  }

  async initialize(): Promise<void> {
    try {
      const apiKey = this.configService.ai.openaiApiKey;
      if (!apiKey) {
        throw new Error('Clé API OpenAI manquante dans la configuration');
      }

      this.client = new OpenAI({
        apiKey: apiKey,
      });

      this.logger.log(`Provider OpenAI initialisé avec le modèle: ${this.configService.ai.openaiModel}`);
    } catch (error) {
      this.logger.error(`Erreur d'initialisation OpenAI: ${error.message}`);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Test simple avec le modèle le plus économique
      const response = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test de santé' }],
        max_tokens: 5,
        temperature: 0,
      });

      return !!(response.choices?.[0]?.message?.content);
    } catch (error) {
      this.logger.warn(`Health check OpenAI échoué: ${error.message}`);
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
      const model = this.configService.ai.openaiModel || 'gpt-4o';

      const response = await this.client.chat.completions.create({
        model,
        messages,
        max_tokens: request.maxTokens || this.configService.ai.maxTokens,
        temperature: request.temperature ?? this.configService.ai.temperature,
        stop: request.stopSequences || undefined,
      });

      const responseText = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || this.estimateTokens(request.prompt + responseText);
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
        finishReason: this.mapFinishReason(response.choices[0]?.finish_reason),
        metadata: {
          model,
          responseTime,
          usage: response.usage,
        },
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, 0, true);
      
      this.logger.error(`Erreur génération OpenAI pour tenant ${tenantId}: ${error.message}`);
      this.handleError(error, 'OpenAI text generation');
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
      const model = this.configService.ai.openaiModel || 'gpt-4o';

      const response = await this.client.chat.completions.create({
        model,
        messages,
        max_tokens: request.maxTokens || this.configService.ai.maxTokens,
        temperature: request.temperature ?? this.configService.ai.temperature,
        stop: request.stopSequences || undefined,
        functions: request.functions as any, // Type casting pour compatibilité
      });

      const responseMessage = response.choices[0]?.message;
      const tokensUsed = response.usage?.total_tokens || 0;
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
          content: responseMessage?.content || '',
        },
        tokensUsed,
        finishReason: this.mapFinishReason(response.choices[0]?.finish_reason),
        functionCall: responseMessage?.function_call ? {
          name: responseMessage.function_call.name,
          arguments: JSON.parse(responseMessage.function_call.arguments || '{}'),
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
      
      this.logger.error(`Erreur chat completion OpenAI pour tenant ${tenantId}: ${error.message}`);
      this.handleError(error, 'OpenAI chat completion');
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

      const model = request.model || 'text-embedding-3-small';

      const response = await this.client.embeddings.create({
        model,
        input: request.text,
      });

      const embedding = response.data[0]?.embedding || [];
      const tokensUsed = response.usage?.total_tokens || this.estimateTokens(request.text);
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
      
      this.logger.error(`Erreur embedding OpenAI pour tenant ${tenantId}: ${error.message}`);
      this.handleError(error, 'OpenAI embedding');
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
      const model = this.configService.ai.openaiModel || 'gpt-4o';

      const stream = await this.client.chat.completions.create({
        model,
        messages,
        max_tokens: request.maxTokens || this.configService.ai.maxTokens,
        temperature: request.temperature ?? this.configService.ai.temperature,
        stop: request.stopSequences || undefined,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullText += content;
          request.onChunk?.(content);
        }

        // Vérification de fin de stream
        if (chunk.choices[0]?.finish_reason) {
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

      this.logger.debug(`Streaming généré pour le tenant ${tenantId} (${responseTime}ms, ${tokensUsed} tokens)`);

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, 0, true);
      
      this.logger.error(`Erreur streaming OpenAI pour tenant ${tenantId}: ${error.message}`);
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

  private mapFinishReason(reason: string | null | undefined): 'stop' | 'length' | 'content_filter' | 'function_call' {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'content_filter':
        return 'content_filter';
      case 'function_call':
        return 'function_call';
      default:
        return 'stop';
    }
  }

  private estimateTokens(text: string): number {
    // Estimation approximative pour les modèles OpenAI
    // GPT-4o: ~1 token ≈ 3.2 caractères pour le français
    return Math.ceil(text.length / 3.2);
  }

  getMetrics() {
    return this.metrics;
  }
}