import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
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
export class AnthropicProvider extends BaseProvider {
  readonly type = AIProviderType.ANTHROPIC;
  readonly name = 'Anthropic Claude';
  
  private anthropic: Anthropic;
  private readonly logger = new Logger(AnthropicProvider.name);

  constructor(
    private readonly apiKey: string,
    private readonly defaultModel = 'claude-3-sonnet-20240229',
  ) {
    super();
    
    this.config = {
      enabled: !!apiKey,
      priority: 8, // Priorité élevée pour Anthropic
      maxTokensPerRequest: 4096,
      maxRequestsPerMinute: 60,
      dailyTokenLimit: 80000,
      monthlyTokenLimit: 800000,
      timeout: 30000,
      retryAttempts: 3,
      fallbackEnabled: true,
      models: [
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
        'claude-2.1',
        'claude-2.0',
      ],
      metadata: {
        defaultModel: defaultModel,
        supportsStreaming: true,
        supportsFunctions: false, // Claude ne supporte pas les function calls natifs
        maxContextWindow: 200000, // 200k tokens pour Claude-3
      },
    };
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      throw new Error('Anthropic API key not provided');
    }

    try {
      this.anthropic = new Anthropic({
        apiKey: this.apiKey,
        timeout: this.config.timeout,
        maxRetries: this.config.retryAttempts,
      });

      // Test de connectivité
      await this.healthCheck();
      this.setStatus(ProviderStatus.AVAILABLE);
      
      this.logger.log(`✅ Provider Anthropic initialisé avec succès (modèle: ${this.defaultModel})`);
    } catch (error) {
      this.setStatus(ProviderStatus.ERROR);
      throw this.handleProviderError(error, 'initialization');
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const startTime = Date.now();
      
      // Test simple avec un message minimal
      const response = await this.anthropic.messages.create({
        model: this.defaultModel,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'Hi' }],
      });

      const latency = Date.now() - startTime;
      
      if (response.content && response.content.length > 0) {
        this.updateMetrics(response.usage?.output_tokens || 5, latency);
        this.setStatus(ProviderStatus.AVAILABLE);
        return true;
      }
      
      throw new Error('Invalid response from Anthropic');
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
      const { anthropicMessages, systemMessage } = this.convertToAnthropicFormat(messages);

      const response = await this.anthropic.messages.create({
        model: this.defaultModel,
        max_tokens: request.maxTokens || this.config.maxTokensPerRequest,
        temperature: request.temperature || 0.7,
        messages: anthropicMessages,
        system: systemMessage,
        stop_sequences: request.stopSequences,
        stream: false,
      });

      const duration = Date.now() - startTime;
      const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

      this.updateMetrics(tokensUsed, duration);

      const responseContent = response.content
        .map(content => content.type === 'text' ? content.text : '')
        .join('');

      const responseMessage: ChatMessage = {
        role: 'assistant',
        content: responseContent,
        metadata: {
          model: response.model,
          id: response.id,
          type: response.type,
        },
      };

      return {
        message: responseMessage,
        tokensUsed,
        finishReason: this.mapFinishReason(response.stop_reason),
        provider: this.type,
        duration,
        metadata: {
          model: response.model,
          usage: response.usage,
          stopSequence: response.stop_sequence,
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
      const { anthropicMessages, systemMessage } = this.convertToAnthropicFormat(messages);

      // Déclencher l'événement de début
      events.onStart?.({ sessionId: request.sessionId || '', provider: this.type });

      const stream = await this.anthropic.messages.create({
        model: this.defaultModel,
        max_tokens: request.maxTokens || this.config.maxTokensPerRequest,
        temperature: request.temperature || 0.7,
        messages: anthropicMessages,
        system: systemMessage,
        stop_sequences: request.stopSequences,
        stream: true,
      });

      for await (const chunk of stream) {
        switch (chunk.type) {
          case 'message_start':
            totalTokens += chunk.message.usage?.input_tokens || 0;
            break;

          case 'content_block_delta':
            if (chunk.delta.type === 'text_delta') {
              fullContent += chunk.delta.text;
              
              // Envoyer le chunk
              events.onChunk?.({
                content: fullContent,
                delta: chunk.delta.text,
                isComplete: false,
                tokensUsed: totalTokens,
              });
            }
            break;

          case 'message_delta':
            totalTokens += chunk.usage?.output_tokens || 0;
            
            if (chunk.delta.stop_reason) {
              const duration = Date.now() - startTime;
              this.updateMetrics(totalTokens, duration);

              const finalResponse: ChatResponse = {
                message: {
                  role: 'assistant',
                  content: fullContent,
                  metadata: {
                    model: this.defaultModel,
                  },
                },
                tokensUsed: totalTokens,
                finishReason: this.mapFinishReason(chunk.delta.stop_reason),
                provider: this.type,
                duration,
                metadata: {
                  model: this.defaultModel,
                  usage: {
                    input_tokens: 0, // Sera mis à jour avec les vraies valeurs
                    output_tokens: totalTokens,
                  },
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
            }
            break;

          case 'message_stop':
            // Message terminé
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

  private convertToAnthropicFormat(messages: ChatMessage[]): {
    anthropicMessages: Anthropic.Messages.MessageParam[];
    systemMessage?: string;
  } {
    const anthropicMessages: Anthropic.Messages.MessageParam[] = [];
    let systemMessage: string | undefined;

    for (const msg of messages) {
      if (msg.role === 'system') {
        // Anthropic traite les messages système séparément
        systemMessage = systemMessage ? `${systemMessage}\n${msg.content}` : msg.content;
      } else if (msg.role === 'user' || msg.role === 'assistant') {
        anthropicMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    return { anthropicMessages, systemMessage };
  }

  private mapFinishReason(reason: string | null): 'stop' | 'length' | 'content_filter' | 'function_call' {
    switch (reason) {
      case 'end_turn':
      case 'stop_sequence': 
        return 'stop';
      case 'max_tokens': 
        return 'length';
      default: 
        return 'stop';
    }
  }

  private estimateTokens(messages: ChatMessage[]): number {
    // Estimation approximative pour Claude: 1 token ≈ 3.5 caractères
    const totalChars = messages.reduce((total, msg) => total + msg.content.length, 0);
    return Math.ceil(totalChars / 3.5);
  }
}