import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
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
export class OpenAIProvider extends BaseProvider {
  readonly type = AIProviderType.OPENAI;
  readonly name = 'OpenAI GPT';
  
  private openai: OpenAI;
  private readonly logger = new Logger(OpenAIProvider.name);

  constructor(
    private readonly apiKey: string,
    private readonly defaultModel = 'gpt-4',
    private readonly organization?: string,
  ) {
    super();
    
    this.config = {
      enabled: !!apiKey,
      priority: 9, // Priorité élevée pour OpenAI
      maxTokensPerRequest: 4096,
      maxRequestsPerMinute: 200,
      dailyTokenLimit: 100000,
      monthlyTokenLimit: 1000000,
      timeout: 30000,
      retryAttempts: 3,
      fallbackEnabled: true,
      models: [
        'gpt-4',
        'gpt-4-turbo-preview', 
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
      ],
      metadata: {
        defaultModel: defaultModel,
        organization: organization,
        supportsStreaming: true,
        supportsFunctions: true,
      },
    };
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      throw new Error('OpenAI API key not provided');
    }

    try {
      this.openai = new OpenAI({
        apiKey: this.apiKey,
        organization: this.organization,
        timeout: this.config.timeout,
        maxRetries: this.config.retryAttempts,
      });

      // Test de connectivité
      await this.healthCheck();
      this.setStatus(ProviderStatus.AVAILABLE);
      
      this.logger.log(`✅ Provider OpenAI initialisé avec succès (modèle: ${this.defaultModel})`);
    } catch (error) {
      this.setStatus(ProviderStatus.ERROR);
      throw this.handleProviderError(error, 'initialization');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // Test simple avec un message minimal
      const response = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
        temperature: 0,
      });

      const latency = Date.now() - startTime;
      
      if (response.choices && response.choices.length > 0) {
        this.updateMetrics(response.usage?.total_tokens || 5, latency);
        this.setStatus(ProviderStatus.AVAILABLE);
        return true;
      }
      
      throw new Error('Invalid response from OpenAI');
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
      const openaiMessages = this.convertToOpenAIFormat(messages);

      const response = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages: openaiMessages,
        max_tokens: request.maxTokens || this.config.maxTokensPerRequest,
        temperature: request.temperature || 0.7,
        stop: request.stopSequences,
        stream: false,
      });

      const duration = Date.now() - startTime;
      const tokensUsed = response.usage?.total_tokens || 0;

      this.updateMetrics(tokensUsed, duration);

      const responseMessage: ChatMessage = {
        role: 'assistant',
        content: response.choices[0].message.content || '',
        metadata: {
          model: response.model,
          created: response.created,
          id: response.id,
        },
      };

      return {
        message: responseMessage,
        tokensUsed,
        finishReason: this.mapFinishReason(response.choices[0].finish_reason),
        provider: this.type,
        duration,
        metadata: {
          model: response.model,
          usage: response.usage,
          systemFingerprint: response.system_fingerprint,
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
      const openaiMessages = this.convertToOpenAIFormat(messages);

      // Déclencher l'événement de début
      events.onStart?.({ sessionId: request.sessionId || '', provider: this.type });

      const stream = await this.openai.chat.completions.create({
        model: this.defaultModel,
        messages: openaiMessages,
        max_tokens: request.maxTokens || this.config.maxTokensPerRequest,
        temperature: request.temperature || 0.7,
        stop: request.stopSequences,
        stream: true,
        stream_options: {
          include_usage: true,
        },
      });

      let lastContent = '';
      
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          fullContent += delta.content;
          const deltaContent = delta.content;
          
          // Envoyer le chunk
          events.onChunk?.({
            content: fullContent,
            delta: deltaContent,
            isComplete: false,
            tokensUsed: totalTokens,
          });
        }

        // Vérifier si c'est terminé
        if (chunk.choices[0]?.finish_reason) {
          const duration = Date.now() - startTime;
          totalTokens = chunk.usage?.total_tokens || this.estimateTokens([
            { role: 'assistant', content: fullContent }
          ]);

          this.updateMetrics(totalTokens, duration);

          const finalResponse: ChatResponse = {
            message: {
              role: 'assistant',
              content: fullContent,
              metadata: {
                model: chunk.model,
                id: chunk.id,
              },
            },
            tokensUsed: totalTokens,
            finishReason: this.mapFinishReason(chunk.choices[0].finish_reason),
            provider: this.type,
            duration,
            metadata: {
              model: chunk.model,
              usage: chunk.usage,
            },
          };

          // Chunk final
          events.onChunk?.({
            content: fullContent,
            delta: '',
            isComplete: true,
            tokensUsed: totalTokens,
            finishReason: finalResponse.finishReason,
          });

          // Événement de completion
          events.onComplete?.(finalResponse);
          break;
        }
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics(0, duration, true);
      const providerError = this.handleProviderError(error, 'streaming chat');
      events.onError?.(providerError);
      throw providerError;
    }
  }

  private convertToOpenAIFormat(messages: ChatMessage[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    })) as OpenAI.Chat.ChatCompletionMessageParam[];
  }

  private mapFinishReason(reason: string | null): 'stop' | 'length' | 'content_filter' | 'function_call' {
    switch (reason) {
      case 'stop': return 'stop';
      case 'length': return 'length';
      case 'content_filter': return 'content_filter';
      case 'function_call': return 'function_call';
      default: return 'stop';
    }
  }

  private estimateTokens(messages: ChatMessage[]): number {
    // Estimation approximative: 1 token ≈ 4 caractères pour l'anglais
    // Plus conservatif pour être sûr
    const totalChars = messages.reduce((total, msg) => total + msg.content.length, 0);
    return Math.ceil(totalChars / 3);
  }
}