import { IsString, IsUUID, IsEnum, IsOptional, IsNumber, IsBoolean, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageRole, MessageStatus } from '@database/entities/message.entity';

/**
 * DTO pour créer un message avec métadonnées IA - TICKET-BACKEND-002
 */
export class CreateMessageDto {
  @IsUUID()
  conversationId: string;

  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsEnum(MessageRole)
  role: MessageRole;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  contentRaw?: string;

  // Métadonnées IA
  @IsOptional()
  @IsString()
  aiProvider?: string;

  @IsOptional()
  @IsString()
  aiModel?: string;

  @IsOptional()
  @IsObject()
  aiParameters?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tokenCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  promptTokens?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  completionTokens?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  responseTimeMs?: number;

  // Nouveaux champs IA - TICKET-BACKEND-002
  @IsOptional()
  @IsNumber()
  @Min(0)
  costUsd?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceScore?: number;

  @IsOptional()
  @IsUUID()
  parentMessageId?: string;
}

/**
 * DTO pour mettre à jour un message avec métadonnées IA - TICKET-BACKEND-002
 */
export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @IsOptional()
  @IsString()
  aiProvider?: string;

  @IsOptional()
  @IsString()
  aiModel?: string;

  @IsOptional()
  @IsObject()
  aiParameters?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tokenCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  promptTokens?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  completionTokens?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  responseTimeMs?: number;

  // Nouveaux champs IA - TICKET-BACKEND-002
  @IsOptional()
  @IsNumber()
  @Min(0)
  costUsd?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceScore?: number;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsObject()
  errorDetails?: any;

  @IsOptional()
  @Type(() => Date)
  completedAt?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence?: number;

  @IsOptional()
  @IsObject()
  citations?: any[];
}

/**
 * DTO pour la réponse d'un message avec métriques IA - TICKET-BACKEND-002
 */
export class MessageResponseDto {
  id: string;
  conversationId: string;
  tenantId: string;
  userId?: string;
  role: MessageRole;
  content: string;
  contentRaw?: string;
  status: MessageStatus;
  sequenceNumber: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // Métadonnées IA
  aiProvider?: string;
  aiModel?: string;
  aiParameters?: Record<string, any>;
  tokenCount?: number;
  promptTokens?: number;
  completionTokens?: number;
  responseTimeMs?: number;

  // Nouveaux champs IA - TICKET-BACKEND-002
  costUsd?: number;
  confidenceScore?: number;

  // Métriques de performance
  confidence?: number;
  rating?: number;
  feedback?: string;
  citations?: any[];
  attachments?: any[];
  contextData?: Record<string, any>;
  metadata?: Record<string, any>;

  // Flags
  isVisible: boolean;
  isEdited: boolean;
  isFlagged: boolean;

  // Erreurs
  errorMessage?: string;
  errorDetails?: any;
}

/**
 * DTO pour les métriques IA d'un message - TICKET-BACKEND-002
 */
export class MessageAIMetricsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  costUsd?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  responseTimeMs?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  promptTokens?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  completionTokens?: number;
}

/**
 * DTO pour évaluer un message - TICKET-BACKEND-002
 */
export class RateMessageDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}