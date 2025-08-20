import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from '@google/generative-ai';
import {
  BaseProvider,
  AIProviderType,
  ChatRequest,
  ChatResponse,
  StreamEvents,
  ProviderStatus,
  ChatMessage,
} from './base-provider';

@Injectable()
export class GeminiProvider extends BaseProvider {
  readonly type = AIProviderType.GEMINI;
  readonly name = 'Google Gemini';
  
  private client: GoogleGenerativeAI;
  private model: GenerativeModel;
  private readonly logger = new Logger(GeminiProvider.name);

  constructor(
    private readonly apiKey: string,
    private readonly defaultModel = 'gemini-1.5-pro',
  ) {
    super();
    
    this.config = {
      enabled: !!apiKey,
      priority: 7, // Priorité légèrement plus faible
      maxTokensPerRequest: 8192,
      maxRequestsPerMinute: 40,
      dailyTokenLimit: 50000,
      monthlyTokenLimit: 500000,
      timeout: 30000,
      retryAttempts: 3,
      fallbackEnabled: true,
      models: [
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.0-pro',
        'gemini-pro-vision',
      ],
      metadata: {
        defaultModel: defaultModel,
        supportsStreaming: true,
        supportsFunctions: true,
        supportsVision: true,
        maxContextWindow: 1048576, // 1M tokens pour Gemini 1.5
      },
    };
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      throw new Error('Gemini API key not provided');
    }

    try {
      this.client = new GoogleGenerativeAI(this.apiKey);
      this.model = this.client.getGenerativeModel({ 
        model: this.defaultModel 
      });

      // Test de connectivité
      await this.healthCheck();
      this.setStatus(ProviderStatus.AVAILABLE);
      
      this.logger.log(`✅ Provider Gemini initialisé avec succès (modèle: ${this.defaultModel})`);
    } catch (error) {
      this.setStatus(ProviderStatus.ERROR);
      throw this.handleProviderError(error, 'initialization');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // Test simple avec un message minimal
      const result = await this.model.generateContent('Hi');
      const latency = Date.now() - startTime;
      
      if (result.response?.text()) {
        this.updateMetrics(this.estimateTokens([
          { role: 'user', content: 'Hi' },
          { role: 'assistant', content: result.response.text() }
        ]), latency);
        this.setStatus(ProviderStatus.AVAILABLE);
        return true;
      }
      
      throw new Error('Invalid response from Gemini');
    } catch (error) {
      this.logger.warn(`❌ Health check failed: ${error.message}`);
      this.handleProviderError(error, 'health check');
      return false;
    }
  }

  async chatCompletion(request: ChatRequest): Promise<ChatResponse> {
    this.validateRequest(request);
    
    const tokensNeeded = this.estimateTokens(request.messages);
    if (!this.canHandleRequest(tokensNeeded)) {
      throw new Error('Request exceeds provider limits');
    }

    const startTime = Date.now();
    
    try {
      const messages = this.sanitizeMessages(request.messages);
      const contents = this.convertToGeminiFormat(messages);
      const config = this.buildGenerationConfig(request);

      const result = await this.model.generateContent({
        contents,
        generationConfig: config,
      });

      const duration = Date.now() - startTime;
      const responseText = result.response.text();
      const tokensUsed = this.estimateTokens([
        ...messages,
        { role: 'assistant', content: responseText }
      ]);

      this.updateMetrics(tokensUsed, duration);

      const responseMessage: ChatMessage = {
        role: 'assistant',
        content: responseText,
        metadata: {
          model: this.defaultModel,
          candidateCount: result.response.candidates?.length || 1,
        },
      };

      return {
        message: responseMessage,
        tokensUsed,
        finishReason: this.mapFinishReason(result.response.candidates?.[0]?.finishReason),
        provider: this.type,
        duration,
        metadata: {
          model: this.defaultModel,
          usageMetadata: result.response.usageMetadata,
          safetyRatings: result.response.candidates?.[0]?.safetyRatings,
        },
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics(0, duration, true);
      throw this.handleProviderError(error, 'chat completion');
    }
  }

  async chatCompletionStream(request: ChatRequest, events: StreamEvents): Promise<void> {
    this.validateRequest(request);
    
    const tokensNeeded = this.estimateTokens(request.messages);
    if (!this.canHandleRequest(tokensNeeded)) {
      throw new Error('Request exceeds provider limits');
    }

    const startTime = Date.now();
    let totalTokens = 0;
    let fullContent = '';
    
    try {
      const messages = this.sanitizeMessages(request.messages);
      const contents = this.convertToGeminiFormat(messages);
      const config = this.buildGenerationConfig(request);

      // Déclencher l'événement de début
      events.onStart?.({ sessionId: request.sessionId || '', provider: this.type });

      const result = await this.model.generateContentStream({
        contents,
        generationConfig: config,
      });

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        
        if (chunkText) {
          fullContent += chunkText;
          
          // Envoyer le chunk
          events.onChunk?.({
            content: fullContent,
            delta: chunkText,
            isComplete: false,
            tokensUsed: totalTokens,
          });
        }
      }

      // Finaliser
      const duration = Date.now() - startTime;
      totalTokens = this.estimateTokens([
        ...messages,
        { role: 'assistant', content: fullContent }
      ]);

      this.updateMetrics(totalTokens, duration);

      const finalResponse = await result.response;
      const finalResponse2: ChatResponse = {
        message: {
          role: 'assistant',
          content: fullContent,
          metadata: {
            model: this.defaultModel,
          },
        },
        tokensUsed: totalTokens,
        finishReason: this.mapFinishReason(finalResponse.candidates?.[0]?.finishReason),
        provider: this.type,
        duration,
        metadata: {
          model: this.defaultModel,
          usageMetadata: finalResponse.usageMetadata,
        },
      };

      // Chunk final
      events.onChunk?.({
        content: fullContent,
        delta: '',
        isComplete: true,
        tokensUsed: totalTokens,
        finishReason: finalResponse2.finishReason,
      });

      // Événement de completion
      events.onComplete?.(finalResponse2);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics(0, duration, true);
      const providerError = this.handleProviderError(error, 'streaming chat');
      events.onError?.(providerError);
      throw providerError;
    }
  }

  private convertToGeminiFormat(messages: ChatMessage[]) {
    const contents = [];
    let systemInstruction = '';

    for (const msg of messages) {
      if (msg.role === 'system') {
        // Gemini traite les instructions système via systemInstruction
        systemInstruction += (systemInstruction ? '\n' : '') + msg.content;
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    // Si on a des instructions système, les ajouter en préfixe du premier message utilisateur
    if (systemInstruction && contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts[0].text = `${systemInstruction}\n\n${contents[0].parts[0].text}`;
    }

    return contents;
  }

  private buildGenerationConfig(request: ChatRequest): GenerationConfig {
    return {
      maxOutputTokens: request.maxTokens || this.config.maxTokensPerRequest,
      temperature: request.temperature || 0.7,
      stopSequences: request.stopSequences || [],
    };
  }

  private mapFinishReason(reason: any): 'stop' | 'length' | 'content_filter' | 'function_call' {
    switch (reason) {
      case 'STOP': return 'stop';
      case 'MAX_TOKENS': return 'length';
      case 'SAFETY': return 'content_filter';
      case 'RECITATION': return 'content_filter';
      default: return 'stop';
    }
  }

  private estimateTokens(messages: ChatMessage[]): number {
    // Estimation approximative pour Gemini: 1 token ≈ 4 caractères
    const totalChars = messages.reduce((total, msg) => total + msg.content.length, 0);
    return Math.ceil(totalChars / 4);
  }
}