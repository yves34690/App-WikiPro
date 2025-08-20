import { 
  IsString, 
  IsEnum, 
  IsNotEmpty, 
  IsOptional, 
  IsObject, 
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AIProvider } from '../entities/session.entity';

export class CreateSessionDto {
  @ApiProperty({
    description: 'Titre de la session IA',
    example: 'Analyse stratégique Q1 2025',
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le titre ne peut pas être vide' })
  @MinLength(1, { message: 'Le titre doit contenir au moins 1 caractère' })
  @MaxLength(255, { message: 'Le titre ne peut pas dépasser 255 caractères' })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[^<>\"'&]*$/, { 
    message: 'Le titre ne peut pas contenir de caractères HTML dangereux' 
  })
  title: string;

  @ApiProperty({
    description: 'Provider IA à utiliser pour cette session',
    example: 'openai',
    enum: AIProvider,
  })
  @IsEnum(AIProvider, { 
    message: 'Le provider doit être openai, anthropic ou gemini' 
  })
  @IsNotEmpty({ message: 'Le provider est obligatoire' })
  provider: AIProvider;

  @ApiProperty({
    description: 'Métadonnées optionnelles pour la session',
    example: { 
      context: 'analyse financière', 
      department: 'stratégie',
      priority: 'high'
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

  constructor(partial: Partial<CreateSessionDto> = {}) {
    Object.assign(this, partial);
    
    // Nettoyer et valider les données à la construction
    if (this.title) {
      this.title = this.title.trim();
    }
    
    if (!this.metadata) {
      this.metadata = {};
    }
  }

  // Méthodes utilitaires
  getCleanTitle(): string {
    return this.title?.trim().replace(/\s+/g, ' ') || '';
  }

  hasMetadata(): boolean {
    return this.metadata && Object.keys(this.metadata).length > 0;
  }

  isProviderSupported(): boolean {
    return Object.values(AIProvider).includes(this.provider);
  }

  // Validation métier personnalisée
  validate(): string[] {
    const errors: string[] = [];

    if (!this.getCleanTitle()) {
      errors.push('Le titre ne peut pas être vide ou contenir uniquement des espaces');
    }

    if (this.title && this.title.length > 255) {
      errors.push('Le titre ne peut pas dépasser 255 caractères');
    }

    if (!this.isProviderSupported()) {
      errors.push('Provider non supporté. Utilisez: openai, anthropic ou gemini');
    }

    // Validation des métadonnées
    if (this.metadata) {
      try {
        JSON.stringify(this.metadata);
      } catch (error) {
        errors.push('Les métadonnées doivent être sérialisables en JSON');
      }

      // Limiter la taille des métadonnées
      const metadataSize = JSON.stringify(this.metadata).length;
      if (metadataSize > 10000) { // 10KB max
        errors.push('Les métadonnées ne peuvent pas dépasser 10KB');
      }
    }

    return errors;
  }

  // Sérialisation pour logs (sans données sensibles)
  toLogSafe(): any {
    return {
      title: this.getCleanTitle(),
      provider: this.provider,
      hasMetadata: this.hasMetadata(),
      metadataKeys: this.metadata ? Object.keys(this.metadata) : [],
    };
  }
}