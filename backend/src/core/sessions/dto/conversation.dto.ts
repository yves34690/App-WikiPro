import { 
  IsString, 
  IsEnum, 
  IsNotEmpty, 
  IsOptional, 
  IsObject, 
  IsNumber,
  IsUUID,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AIProvider } from '../entities/session.entity';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Message utilisateur à envoyer au provider IA',
    example: 'Peux-tu analyser les tendances du marché pour Q1 2025?',
    minLength: 1,
    maxLength: 50000,
  })
  @IsString({ message: 'Le message doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le message ne peut pas être vide' })
  @MinLength(1, { message: 'Le message doit contenir au moins 1 caractère' })
  @MaxLength(50000, { message: 'Le message ne peut pas dépasser 50000 caractères' })
  @Transform(({ value }) => value?.trim())
  message: string;

  @ApiProperty({
    description: 'Métadonnées optionnelles pour le contexte de conversation',
    example: { 
      context: 'analyse_marche', 
      urgency: 'high',
      expected_format: 'structured_analysis'
    },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Les métadonnées doivent être un objet JSON valide' })
  @Transform(({ value }) => {
    if (!value) return {};
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        throw new Error('Métadonnées JSON invalides');
      }
    }
    return value;
  })
  metadata?: Record<string, any>;

  constructor(partial: Partial<CreateConversationDto> = {}) {
    Object.assign(this, partial);
    
    if (this.message) {
      this.message = this.message.trim();
    }
    
    if (!this.metadata) {
      this.metadata = {};
    }
  }

  // Méthodes utilitaires
  getCleanMessage(): string {
    return this.message?.trim().replace(/\s+/g, ' ') || '';
  }

  getMessageLength(): number {
    return this.getCleanMessage().length;
  }

  hasMetadata(): boolean {
    return this.metadata && Object.keys(this.metadata).length > 0;
  }

  // Validation métier
  validate(): string[] {
    const errors: string[] = [];

    if (!this.getCleanMessage()) {
      errors.push('Le message ne peut pas être vide ou contenir uniquement des espaces');
    }

    if (this.getMessageLength() > 50000) {
      errors.push('Le message ne peut pas dépasser 50000 caractères');
    }

    // Validation des métadonnées
    if (this.metadata) {
      try {
        JSON.stringify(this.metadata);
      } catch (error) {
        errors.push('Les métadonnées doivent être sérialisables en JSON');
      }

      const metadataSize = JSON.stringify(this.metadata).length;
      if (metadataSize > 5000) { // 5KB max pour conversation
        errors.push('Les métadonnées ne peuvent pas dépasser 5KB');
      }
    }

    return errors;
  }

  toLogSafe(): any {
    return {
      messageLength: this.getMessageLength(),
      hasMetadata: this.hasMetadata(),
      metadataKeys: this.metadata ? Object.keys(this.metadata) : [],
    };
  }
}

export class UpdateConversationDto {
  @ApiProperty({
    description: 'Réponse du provider IA',
    example: 'Basé sur l\'analyse des données disponibles, voici les tendances identifiées...',
    required: false,
    maxLength: 100000,
  })
  @IsOptional()
  @IsString({ message: 'La réponse doit être une chaîne de caractères' })
  @MaxLength(100000, { message: 'La réponse ne peut pas dépasser 100000 caractères' })
  @Transform(({ value }) => value?.trim())
  response?: string;

  @ApiProperty({
    description: 'Provider IA utilisé pour générer la réponse',
    example: 'openai',
    enum: AIProvider,
    required: false,
  })
  @IsOptional()
  @IsEnum(AIProvider, { 
    message: 'Le provider utilisé doit être openai, anthropic ou gemini' 
  })
  provider_used?: AIProvider;

  @ApiProperty({
    description: 'Nombre de tokens consommés',
    example: 1250,
    minimum: 0,
    maximum: 1000000,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Le nombre de tokens doit être un nombre' })
  @Min(0, { message: 'Le nombre de tokens ne peut pas être négatif' })
  @Max(1000000, { message: 'Le nombre de tokens ne peut pas dépasser 1,000,000' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  tokens_used?: number;

  @ApiProperty({
    description: 'Temps de traitement en millisecondes',
    example: 2500,
    minimum: 0,
    maximum: 300000, // 5 minutes max
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Le temps de traitement doit être un nombre' })
  @Min(0, { message: 'Le temps de traitement ne peut pas être négatif' })
  @Max(300000, { message: 'Le temps de traitement ne peut pas dépasser 5 minutes' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  processing_time_ms?: number;

  @ApiProperty({
    description: 'Métadonnées additionnelles de la réponse',
    example: { 
      model: 'gpt-4',
      temperature: 0.7,
      finish_reason: 'stop'
    },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Les métadonnées doivent être un objet JSON valide' })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        throw new Error('Métadonnées JSON invalides');
      }
    }
    return value;
  })
  metadata?: Record<string, any>;

  constructor(partial: Partial<UpdateConversationDto> = {}) {
    Object.assign(this, partial);
    
    if (this.response !== undefined) {
      this.response = this.response?.trim();
    }
  }

  // Méthodes utilitaires
  hasResponse(): boolean {
    return this.response !== undefined && this.response.trim().length > 0;
  }

  hasMetrics(): boolean {
    return (this.tokens_used !== undefined && this.tokens_used > 0) ||
           (this.processing_time_ms !== undefined && this.processing_time_ms > 0);
  }

  isEmpty(): boolean {
    return !this.hasResponse() && 
           !this.provider_used && 
           !this.hasMetrics() && 
           !this.metadata;
  }

  // Validation métier
  validate(): string[] {
    const errors: string[] = [];

    if (this.isEmpty()) {
      errors.push('Au moins un champ doit être fourni pour la mise à jour');
    }

    // Si des tokens sont utilisés, une réponse doit être présente
    if (this.tokens_used && this.tokens_used > 0 && !this.hasResponse()) {
      errors.push('Une réponse est requise si des tokens ont été utilisés');
    }

    // Si un temps de traitement est fourni, une réponse doit être présente
    if (this.processing_time_ms && this.processing_time_ms > 0 && !this.hasResponse()) {
      errors.push('Une réponse est requise si un temps de traitement est fourni');
    }

    // Cohérence entre provider_used et tokens_used
    if (this.tokens_used && this.tokens_used > 0 && !this.provider_used) {
      errors.push('Le provider utilisé doit être spécifié si des tokens ont été consommés');
    }

    // Validation des métadonnées
    if (this.metadata) {
      try {
        JSON.stringify(this.metadata);
      } catch (error) {
        errors.push('Les métadonnées doivent être sérialisables en JSON');
      }

      const metadataSize = JSON.stringify(this.metadata).length;
      if (metadataSize > 10000) { // 10KB max
        errors.push('Les métadonnées ne peuvent pas dépasser 10KB');
      }
    }

    return errors;
  }

  // Calculs de performance
  getTokenEfficiency(): number {
    if (!this.tokens_used || !this.processing_time_ms || 
        this.tokens_used === 0 || this.processing_time_ms === 0) {
      return 0;
    }
    return this.tokens_used / (this.processing_time_ms / 1000); // tokens/seconde
  }

  getCostEfficiencyScore(): number {
    const efficiency = this.getTokenEfficiency();
    const responseLength = this.response?.length || 0;
    
    if (efficiency === 0 || responseLength === 0) return 0;
    
    // Score basé sur tokens/seconde et longueur de réponse
    return (efficiency * responseLength) / 1000;
  }

  toLogSafe(): any {
    return {
      hasResponse: this.hasResponse(),
      responseLength: this.response?.length || 0,
      providerUsed: this.provider_used,
      tokensUsed: this.tokens_used || 0,
      processingTimeMs: this.processing_time_ms || 0,
      tokenEfficiency: this.getTokenEfficiency(),
      hasMetadata: !!this.metadata,
    };
  }
}

// DTO pour les requêtes de liste avec pagination et filtrage
export class ConversationQueryDto {
  @ApiProperty({
    description: 'ID de la session pour filtrer les conversations',
    example: 'uuid-session-id',
  })
  @IsUUID(4, { message: 'L\'ID de session doit être un UUID valide' })
  session_id: string;

  @ApiProperty({
    description: 'Numéro de page (commence à 1)',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La page doit être un nombre' })
  @Min(1, { message: 'La page doit être supérieure à 0' })
  @Transform(({ value }) => parseInt(value, 10) || 1)
  page?: number = 1;

  @ApiProperty({
    description: 'Nombre d\'éléments par page (max 100)',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La limite doit être un nombre' })
  @Min(1, { message: 'La limite doit être supérieure à 0' })
  @Max(100, { message: 'La limite ne peut pas dépasser 100' })
  @Transform(({ value }) => parseInt(value, 10) || 20)
  limit?: number = 20;

  @ApiProperty({
    description: 'Provider à filtrer',
    example: 'openai',
    enum: AIProvider,
    required: false,
  })
  @IsOptional()
  @IsEnum(AIProvider, { message: 'Provider invalide' })
  provider?: AIProvider;

  constructor(partial: Partial<ConversationQueryDto> = {}) {
    Object.assign(this, partial);
  }

  getOffset(): number {
    return ((this.page || 1) - 1) * (this.limit || 20);
  }

  toLogSafe(): any {
    return {
      sessionId: this.session_id,
      page: this.page,
      limit: this.limit,
      offset: this.getOffset(),
      provider: this.provider,
    };
  }
}