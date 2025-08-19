import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';
import { 
  BaseAiProvider, 
  TextGenerationRequest, 
  TextGenerationResponse,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatMessage,
  EmbeddingRequest,
  EmbeddingResponse
} from '@shared/interfaces/ai-provider.interface';
import { ProviderConfig, ProviderCapabilities } from '@shared/interfaces/provider.interface';
import { ConfigService } from '@core/config/config.service';
import { TelemetryService } from '@core/telemetry/telemetry.service';

@Injectable()
export class GeminiProvider extends BaseAiProvider {
  readonly name = 'gemini';
  readonly version = '2.5';
  readonly capabilities: ProviderCapabilities = {
    textGeneration: true,
    chatCompletion: true,
    functionCalling: true,
    streaming: true,
    embedding: false, // Gemini API ne propose pas encore d'embeddings
    imageGeneration: false,
  };

  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private readonly logger = new Logger(GeminiProvider.name);

  constructor(
    private configService: ConfigService,
    private telemetryService?: TelemetryService,
  ) {
    super({
      name: 'gemini',
      version: '2.5',
      enabled: true,
      priority: 100,
    });
  }

  async initialize(): Promise<void> {
    try {
      const apiKey = this.configService.ai.geminiApiKey;
      if (!apiKey) {
        throw new Error('Clé API Gemini manquante dans la configuration');
      }

      this.client = new GoogleGenerativeAI(apiKey);
      this.model = this.client.getGenerativeModel({ 
        model: this.configService.ai.geminiModel 
      });

      this.logger.log(`Provider Gemini initialisé avec le modèle: ${this.configService.ai.geminiModel}`);
    } catch (error) {
      this.logger.error(`Erreur d'initialisation Gemini: ${error.message}`);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Test simple avec un prompt minimal
      const result = await this.model.generateContent('Test de santé');
      return !!(result.response?.text());
    } catch (error) {
      this.logger.warn(`Health check Gemini échoué: ${error.message}`);
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

      const prompt = this.buildPrompt(request);
      const config = this.buildGenerationConfig(request);

      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: config,
      });

      const responseText = result.response.text();
      const tokensUsed = this.estimateTokens(request.prompt + responseText);
      const responseTime = Date.now() - startTime;

      // Mise à jour des métriques
      this.updateMetrics(responseTime, tokensUsed);

      // Télémétrie
      if (this.telemetryService) {
        this.telemetryService.trackAiProviderCall(
          tenantId,
          this.name,
          this.configService.ai.geminiModel,
          tokensUsed,
          responseTime
        );
      }

      this.logger.debug(`Génération de texte réussie pour le tenant ${tenantId} (${responseTime}ms, ${tokensUsed} tokens)`);

      return {
        text: responseText,
        tokensUsed,
        finishReason: 'stop',
        metadata: {
          model: this.configService.ai.geminiModel,
          responseTime,
        },
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, 0, true);
      
      this.logger.error(`Erreur génération Gemini pour tenant ${tenantId}: ${error.message}`);
      this.handleError(error, 'Gemini text generation');
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

      const contents = this.convertMessages(request.messages);
      const config = this.buildGenerationConfig(request);

      const result = await this.model.generateContent({
        contents,
        generationConfig: config,
      });

      const responseText = result.response.text();
      const tokensUsed = this.estimateTokens(
        request.messages.map(m => m.content).join('') + responseText
      );
      const responseTime = Date.now() - startTime;

      // Mise à jour des métriques
      this.updateMetrics(responseTime, tokensUsed);

      // Télémétrie
      if (this.telemetryService) {
        this.telemetryService.trackAiProviderCall(
          tenantId,
          this.name,
          this.configService.ai.geminiModel,
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
        finishReason: 'stop',
        metadata: {
          model: this.configService.ai.geminiModel,
          responseTime,
        },
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, 0, true);
      
      this.logger.error(`Erreur chat completion Gemini pour tenant ${tenantId}: ${error.message}`);
      this.handleError(error, 'Gemini chat completion');
    }
  }

  private buildPrompt(request: TextGenerationRequest): string {
    let prompt = '';
    
    if (request.systemPrompt) {
      prompt += `${request.systemPrompt}\n\n`;
    }
    
    prompt += this.sanitizePrompt(request.prompt);
    
    return prompt;
  }

  private buildGenerationConfig(request: TextGenerationRequest | ChatCompletionRequest): GenerationConfig {
    return {
      maxOutputTokens: request.maxTokens || this.configService.ai.maxTokens,
      temperature: request.temperature ?? this.configService.ai.temperature,
      stopSequences: request.stopSequences || [],
    };
  }

  private convertMessages(messages: ChatMessage[]) {
    return messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
  }

  private estimateTokens(text: string): number {
    // Estimation approximative : 1 token ≈ 4 caractères pour le français
    return Math.ceil(text.length / 4);
  }

  getMetrics() {
    return this.metrics;
  }
}