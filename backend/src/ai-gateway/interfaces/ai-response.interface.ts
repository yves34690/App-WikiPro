export interface AIResponse {
  success: boolean;
  content: string;
  tokensUsed: number;
  responseTime: number;
  provider: string;
  model?: string;
  confidence?: number;
  sources?: string[];
  metadata?: {
    temperature?: number;
    maxTokens?: number;
    finishReason?: string;
    [key: string]: any;
  };
}

export interface RAGResponse {
  success: boolean;
  answer: string;
  relevantDocuments: RAGDocument[];
  confidence: number;
  tokensUsed: number;
  responseTime: number;
  query: string;
  tenantId: string;
  metadata?: {
    searchStrategy?: string;
    embeddingModel?: string;
    retrievalScore?: number;
    [key: string]: any;
  };
}

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  score: number;
  source: string;
  metadata?: {
    type?: string;
    category?: string;
    lastModified?: Date;
    [key: string]: any;
  };
}

export interface StreamingResponse {
  chunk: string;
  isComplete: boolean;
  tokensUsed?: number;
  metadata?: Record<string, any>;
}

export interface BatchProcessingResponse {
  batchId: string;
  totalRequests: number;
  completedRequests: number;
  failedRequests: number;
  results: AIResponse[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
}

export interface ChatContextResponse extends AIResponse {
  conversationId?: string;
  turnId?: string;
  contextWindow?: {
    messagesIncluded: number;
    tokensInContext: number;
    contextStrategy: string;
  };
}