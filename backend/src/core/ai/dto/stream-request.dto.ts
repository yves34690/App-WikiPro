import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChatRequestDto } from './chat-request.dto';

export class StreamRequestDto extends ChatRequestDto {
  @ApiProperty({
    description: 'ID de connexion WebSocket pour le streaming',
  })
  @IsUUID()
  connectionId: string;

  @ApiPropertyOptional({
    description: 'Callback URL pour recevoir les événements de stream',
  })
  @IsOptional()
  callbackUrl?: string;
}

export class StreamEventDto {
  @ApiProperty({
    enum: ['start', 'chunk', 'complete', 'error'],
    description: 'Type d\'événement de streaming',
  })
  event: 'start' | 'chunk' | 'complete' | 'error';

  @ApiPropertyOptional({
    description: 'Données de l\'événement',
  })
  data?: any;

  @ApiProperty({
    description: 'Timestamp de l\'événement',
  })
  timestamp: Date;
}

export class StreamChunkDto {
  @ApiProperty({
    description: 'Contenu du chunk',
  })
  content: string;

  @ApiProperty({
    description: 'Delta de contenu depuis le dernier chunk',
  })
  delta: string;

  @ApiProperty({
    description: 'Indique si c\'est le dernier chunk',
  })
  isComplete: boolean;

  @ApiPropertyOptional({
    description: 'Nombre de tokens utilisés jusqu\'à présent',
  })
  tokensUsed?: number;

  @ApiPropertyOptional({
    description: 'Raison de fin si c\'est le dernier chunk',
  })
  finishReason?: string;
}