import { 
  IsString, 
  IsOptional, 
  IsObject, 
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSessionDto {
  @ApiProperty({
    description: 'Nouveau titre de la session IA',
    example: 'Analyse stratégique Q1 2025 - Mise à jour',
    minLength: 1,
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Le titre doit être une chaîne de caractères' })
  @MinLength(1, { message: 'Le titre doit contenir au moins 1 caractère' })
  @MaxLength(255, { message: 'Le titre ne peut pas dépasser 255 caractères' })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[^<>\"'&]*$/, { 
    message: 'Le titre ne peut pas contenir de caractères HTML dangereux' 
  })
  title?: string;

  @ApiProperty({
    description: 'Métadonnées à fusionner avec les existantes',
    example: { 
      status: 'completed', 
      notes: 'Session terminée avec succès',
      updated_by: 'user_id'
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

  constructor(partial: Partial<UpdateSessionDto> = {}) {
    Object.assign(this, partial);
    
    // Nettoyer les données à la construction
    if (this.title !== undefined) {
      this.title = this.title?.trim();
    }
  }

  // Méthodes utilitaires
  getCleanTitle(): string | undefined {
    return this.title?.trim().replace(/\s+/g, ' ');
  }

  hasTitle(): boolean {
    return this.title !== undefined && this.title.trim().length > 0;
  }

  hasMetadata(): boolean {
    return this.metadata !== undefined && Object.keys(this.metadata).length > 0;
  }

  isEmpty(): boolean {
    return !this.hasTitle() && !this.hasMetadata();
  }

  // Validation métier personnalisée
  validate(): string[] {
    const errors: string[] = [];

    if (this.isEmpty()) {
      errors.push('Au moins un champ doit être fourni pour la mise à jour');
    }

    if (this.title !== undefined) {
      const cleanTitle = this.getCleanTitle();
      if (!cleanTitle) {
        errors.push('Le titre ne peut pas être vide ou contenir uniquement des espaces');
      }

      if (cleanTitle && cleanTitle.length > 255) {
        errors.push('Le titre ne peut pas dépasser 255 caractères');
      }
    }

    // Validation des métadonnées
    if (this.metadata !== undefined) {
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

      // Vérifier qu'il n'y a pas de clés avec des noms dangereux
      const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
      const providedKeys = Object.keys(this.metadata);
      const hasDangerousKeys = providedKeys.some(key => 
        dangerousKeys.includes(key.toLowerCase())
      );
      
      if (hasDangerousKeys) {
        errors.push('Les clés de métadonnées ne peuvent pas contenir des mots-clés réservés');
      }
    }

    return errors;
  }

  // Méthode pour fusionner avec les métadonnées existantes
  mergeWithExistingMetadata(existingMetadata: Record<string, any> = {}): Record<string, any> {
    if (!this.hasMetadata()) {
      return existingMetadata;
    }

    return {
      ...existingMetadata,
      ...this.metadata,
      // Toujours mettre à jour le timestamp de modification
      updated_at: new Date().toISOString(),
    };
  }

  // Sérialisation pour logs (sans données sensibles)
  toLogSafe(): any {
    return {
      hasTitle: this.hasTitle(),
      titleLength: this.title?.length || 0,
      hasMetadata: this.hasMetadata(),
      metadataKeys: this.metadata ? Object.keys(this.metadata) : [],
      isEmpty: this.isEmpty(),
    };
  }

  // Créer un objet avec seulement les champs définis
  toUpdateObject(): Partial<{ title: string; metadata: Record<string, any> }> {
    const updateObj: Partial<{ title: string; metadata: Record<string, any> }> = {};

    if (this.hasTitle()) {
      updateObj.title = this.getCleanTitle()!;
    }

    if (this.hasMetadata()) {
      updateObj.metadata = this.metadata;
    }

    return updateObj;
  }
}