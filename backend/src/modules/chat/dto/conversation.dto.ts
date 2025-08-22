import { IsString, IsUUID, IsOptional, IsNumber, IsBoolean, IsObject, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO pour créer une conversation - TICKET-BACKEND-002
 */
export class CreateConversationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsString()
  contextType?: string;

  @IsOptional()
  @IsObject()
  aiSettings?: Record<string, any>;
}

/**
 * DTO pour mettre à jour une conversation - TICKET-BACKEND-002
 */
export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  contextType?: string;

  @IsOptional()
  @IsObject()
  aiSettings?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}

/**
 * DTO pour la réponse d'une conversation avec analytics IA - TICKET-BACKEND-002
 */
export class ConversationResponseDto {
  id: string;
  title: string;
  description?: string;
  tenantId: string;
  userId: string;
  contextType: string;
  aiSettings: Record<string, any>;
  attachedDocuments: string[];
  metadata: Record<string, any>;
  
  // États
  isActive: boolean;
  isArchived: boolean;
  isPinned: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;

  // Statistiques de base
  messageCount: number;
  tokenCount: number;

  // Nouveaux analytics IA - TICKET-BACKEND-002
  totalCostUsd: number;
  totalTokens: number;
  avgResponseTimeMs?: number;

  // Métriques calculées
  aiStats?: {
    totalCost: number;
    totalTokens: number;
    avgResponseTime: number | null;
    messageCount: number;
    costPerMessage: number;
  };
}

/**
 * DTO pour les statistiques d'une conversation - TICKET-BACKEND-002
 */
export class ConversationStatsDto {
  conversationId: string;
  messageCount: number;
  totalTokens: number;
  totalCostUsd: number;
  avgResponseTimeMs?: number;
  lastMessageAt?: Date;
  unreadCount: number;
  
  // Répartition par provider IA
  providerStats: Array<{
    provider: string;
    messageCount: number;
    totalCost: number;
    avgResponseTime: number;
  }>;
  
  // Répartition par modèle IA
  modelStats: Array<{
    model: string;
    messageCount: number;
    totalCost: number;
    avgConfidenceScore: number;
  }>;
}

/**
 * DTO pour la recherche de conversations - TICKET-BACKEND-002
 */
export class SearchConversationsDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  contextType?: string;

  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean = false;

  // Filtres par coût et performance
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCostUsd?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minConfidenceScore?: number;
}

/**
 * DTO pour l'analytics agrégé des conversations - TICKET-BACKEND-002
 */
export class ConversationAnalyticsDto {
  tenantId: string;
  userId?: string;
  
  // Période d'analyse
  startDate: Date;
  endDate: Date;
  
  // Statistiques globales
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  totalCostUsd: number;
  
  // Moyennes
  avgMessagesPerConversation: number;
  avgCostPerConversation: number;
  avgResponseTime: number;
  avgConfidenceScore: number;
  
  // Répartition par provider
  providerBreakdown: Array<{
    provider: string;
    conversationCount: number;
    messageCount: number;
    totalCost: number;
    avgResponseTime: number;
    marketShare: number; // en pourcentage
  }>;
  
  // Répartition par modèle
  modelBreakdown: Array<{
    model: string;
    messageCount: number;
    totalCost: number;
    avgConfidenceScore: number;
    usage: number; // en pourcentage
  }>;
  
  // Tendances temporelles (par jour)
  dailyStats: Array<{
    date: string;
    conversationCount: number;
    messageCount: number;
    totalCost: number;
    avgResponseTime: number;
  }>;
}