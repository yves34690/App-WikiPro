import { IsArray, IsOptional, IsString, IsNumber, IsBoolean, IsEnum, ValidateNested, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AIProviderType } from '../providers/base-provider';

export class ChatMessageDto {
  @ApiProperty({
    enum: ['user', 'assistant', 'system'],
    description: 'Rôle du message',
  })
  @IsString()
  @IsEnum(['user', 'assistant', 'system'])
  role: 'user' | 'assistant' | 'system';

  @ApiProperty({
    description: 'Contenu du message',
    maxLength: 50000,
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Métadonnées optionnelles du message',
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ChatRequestDto {
  @ApiProperty({
    type: [ChatMessageDto],
    description: 'Tableau des messages de conversation',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @ApiPropertyOptional({
    description: 'Nombre maximum de tokens à générer',
    minimum: 1,
    maximum: 4096,
    default: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(4096)
  maxTokens?: number = 1000;

  @ApiPropertyOptional({
    description: 'Température pour la créativité (0-2)',
    minimum: 0,
    maximum: 2,
    default: 0.7,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number = 0.7;

  @ApiPropertyOptional({
    type: [String],
    description: 'Séquences d\'arrêt pour stopper la génération',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stopSequences?: string[];

  @ApiPropertyOptional({
    description: 'Activer le streaming de réponse',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  stream?: boolean = false;

  @ApiPropertyOptional({
    description: 'ID de session pour persistance',
  })
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @ApiPropertyOptional({
    enum: AIProviderType,
    description: 'Provider IA préféré (override automatique)',
  })
  @IsOptional()
  @IsEnum(AIProviderType)
  preferredProvider?: AIProviderType;
}