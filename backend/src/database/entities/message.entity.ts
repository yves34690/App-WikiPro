import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from './user.entity';
import { Conversation } from './conversation.entity';

/**
 * Types de message dans le chat
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  FUNCTION = 'function',
}

/**
 * Status du message
 */
export enum MessageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing', 
  COMPLETED = 'completed',
  ERROR = 'error',
  CANCELLED = 'cancelled',
}

/**
 * Entité Message - Représente un message dans une conversation de chat
 * Stocke les messages utilisateur et les réponses IA
 */
@Entity('messages')
@Index(['tenant_id', 'conversation_id', 'created_at'])
@Index(['conversation_id', 'role'])
@Index(['status'])
@Index(['created_at'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relations multi-tenant
  @Column({ type: 'uuid', name: 'tenant_id' })
  tenant_id: string;

  @Column({ type: 'uuid', name: 'conversation_id' })
  conversation_id: string;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  user_id: string;

  // Relations
  @ManyToOne(() => Conversation, conversation => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Contenu du message
  @Column({ type: 'enum', enum: MessageRole })
  role: MessageRole;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true, name: 'content_raw' })
  content_raw: string; // Contenu brut avant traitement

  // Métadonnées IA
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'ai_provider' })
  ai_provider: string; // 'openai', 'anthropic', 'gemini', etc.

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'ai_model' })
  ai_model: string; // 'gpt-4', 'claude-3', etc.

  @Column({ type: 'jsonb', default: '{}', name: 'ai_parameters' })
  ai_parameters: Record<string, any>; // Paramètres de génération

  @Column({ type: 'int', nullable: true, name: 'token_count' })
  token_count: number;

  @Column({ type: 'int', nullable: true, name: 'prompt_tokens' })
  prompt_tokens: number;

  @Column({ type: 'int', nullable: true, name: 'completion_tokens' })
  completion_tokens: number;

  // État du message
  @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.COMPLETED })
  status: MessageStatus;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  error_message: string;

  @Column({ type: 'jsonb', nullable: true, name: 'error_details' })
  error_details: Record<string, any>;

  // Contexte et attachements
  @Column({ type: 'jsonb', default: '[]', name: 'attachments' })
  attachments: any[]; // Fichiers, images, documents attachés

  @Column({ type: 'jsonb', default: '{}', name: 'context_data' })
  context_data: Record<string, any>; // Contexte pour la génération

  @Column({ type: 'jsonb', default: '[]', name: 'citations' })
  citations: any[]; // Citations de documents pour RAG

  // Métadonnées
  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @Column({ type: 'boolean', default: true, name: 'is_visible' })
  is_visible: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_edited' })
  is_edited: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_flagged' })
  is_flagged: boolean;

  // Performance et analytics
  @Column({ type: 'int', nullable: true, name: 'response_time_ms' })
  response_time_ms: number; // Temps de réponse IA en ms

  @Column({ type: 'float', nullable: true })
  confidence: number; // Score de confiance de la réponse (0-1)

  // Nouveaux champs IA - TICKET-BACKEND-002
  @Column({ type: 'decimal', precision: 10, scale: 6, default: 0.000000, name: 'cost_usd' })
  cost_usd: number; // Coût en USD pour cette requête IA

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, name: 'confidence_score' })
  confidence_score: number; // Score de confiance normalisé (0.00-1.00)

  @Column({ type: 'int', nullable: true })
  rating: number; // Évaluation utilisateur (1-5)

  @Column({ type: 'text', nullable: true })
  feedback: string; // Feedback utilisateur

  // Message parent (pour les threads/réponses)
  @Column({ type: 'uuid', nullable: true, name: 'parent_message_id' })
  parent_message_id: string;

  @ManyToOne(() => Message, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_message_id' })
  parent_message: Message;

  // Ordre dans la conversation
  @Column({ type: 'int', name: 'sequence_number' })
  sequence_number: number;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completed_at: Date;

  // Audit
  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  created_by: string;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updated_by: string;

  /**
   * Hooks d'entité
   */
  @BeforeInsert()
  async setDefaults() {
    if (!this.sequence_number) {
      // Le sequence_number sera défini par le service
      this.sequence_number = 0;
    }
    
    if (this.status === MessageStatus.COMPLETED && !this.completed_at) {
      this.completed_at = new Date();
    }
  }

  /**
   * Méthodes utilitaires
   */

  /**
   * Marque le message comme en cours de traitement
   */
  markAsProcessing(): void {
    this.status = MessageStatus.PROCESSING;
    this.updated_at = new Date();
  }

  /**
   * Marque le message comme terminé
   */
  markAsCompleted(): void {
    this.status = MessageStatus.COMPLETED;
    this.completed_at = new Date();
    this.updated_at = new Date();
  }

  /**
   * Marque le message comme ayant échoué
   */
  markAsError(errorMessage: string, errorDetails?: any): void {
    this.status = MessageStatus.ERROR;
    this.error_message = errorMessage;
    this.error_details = errorDetails;
    this.updated_at = new Date();
  }

  /**
   * Met à jour les statistiques de tokens
   */
  updateTokenStats(promptTokens: number, completionTokens: number): void {
    this.prompt_tokens = promptTokens;
    this.completion_tokens = completionTokens;
    this.token_count = promptTokens + completionTokens;
    this.updated_at = new Date();
  }

  /**
   * Met à jour les métadonnées IA complètes - TICKET-BACKEND-002
   */
  updateAIMetadata(metadata: {
    costUsd?: number;
    confidenceScore?: number;
    responseTimeMs?: number;
    promptTokens?: number;
    completionTokens?: number;
  }): void {
    if (metadata.costUsd !== undefined) {
      this.cost_usd = metadata.costUsd;
    }
    
    if (metadata.confidenceScore !== undefined) {
      this.confidence_score = metadata.confidenceScore;
      // Maintenir la cohérence avec l'ancien champ confidence
      this.confidence = metadata.confidenceScore;
    }
    
    if (metadata.responseTimeMs !== undefined) {
      this.response_time_ms = metadata.responseTimeMs;
    }
    
    if (metadata.promptTokens !== undefined && metadata.completionTokens !== undefined) {
      this.updateTokenStats(metadata.promptTokens, metadata.completionTokens);
    }
    
    this.updated_at = new Date();
  }

  /**
   * Calcule le coût basé sur les tokens et le modèle - TICKET-BACKEND-002
   */
  calculateCost(): number {
    if (!this.prompt_tokens || !this.completion_tokens || !this.ai_provider || !this.ai_model) {
      return 0;
    }

    // Tarifs approximatifs (à configurer par provider plus tard)
    const pricing = this.getModelPricing();
    
    const inputCost = (this.prompt_tokens / 1000) * pricing.input;
    const outputCost = (this.completion_tokens / 1000) * pricing.output;
    
    return inputCost + outputCost;
  }

  /**
   * Obtient la tarification pour le modèle IA - TICKET-BACKEND-002
   */
  private getModelPricing(): { input: number; output: number } {
    // Tarification approximative en USD pour 1K tokens
    const defaultPricing = { input: 0.001, output: 0.002 };
    
    if (this.ai_provider === 'openai') {
      switch (this.ai_model) {
        case 'gpt-4':
        case 'gpt-4-turbo':
          return { input: 0.01, output: 0.03 };
        case 'gpt-3.5-turbo':
          return { input: 0.001, output: 0.002 };
        default:
          return defaultPricing;
      }
    }
    
    if (this.ai_provider === 'anthropic') {
      switch (this.ai_model) {
        case 'claude-3-opus':
          return { input: 0.015, output: 0.075 };
        case 'claude-3-sonnet':
          return { input: 0.003, output: 0.015 };
        case 'claude-3-haiku':
          return { input: 0.00025, output: 0.00125 };
        default:
          return defaultPricing;
      }
    }
    
    return defaultPricing;
  }

  /**
   * Vérifie si le message a des métriques IA complètes - TICKET-BACKEND-002
   */
  hasCompleteAIMetrics(): boolean {
    return !!(
      this.ai_provider &&
      this.ai_model &&
      this.prompt_tokens &&
      this.completion_tokens &&
      this.response_time_ms !== null &&
      this.cost_usd !== null
    );
  }

  /**
   * Ajoute une citation pour RAG
   */
  addCitation(source: string, content: string, score?: number): void {
    if (!this.citations) this.citations = [];
    
    this.citations.push({
      source,
      content,
      score,
      added_at: new Date(),
    });
    
    this.updated_at = new Date();
  }

  /**
   * Vérifie si l'utilisateur peut voir ce message
   */
  canView(userId: string, tenantId: string): boolean {
    return this.tenant_id === tenantId && 
           (this.user_id === userId || this.role === MessageRole.ASSISTANT) &&
           this.is_visible;
  }

  /**
   * Vérifie si l'utilisateur peut éditer ce message
   */
  canEdit(userId: string, tenantId: string): boolean {
    return this.tenant_id === tenantId && 
           this.user_id === userId && 
           this.role === MessageRole.USER &&
           this.status !== MessageStatus.PROCESSING;
  }

  /**
   * Calcule la longueur du contenu
   */
  getContentLength(): number {
    return this.content ? this.content.length : 0;
  }

  /**
   * Estime le nombre de tokens (approximation simple)
   */
  estimateTokenCount(): number {
    if (this.token_count) return this.token_count;
    
    // Estimation approximative : 4 caractères = 1 token
    return Math.ceil(this.getContentLength() / 4);
  }

  /**
   * Vérifie si le message est d'un assistant IA
   */
  isFromAI(): boolean {
    return this.role === MessageRole.ASSISTANT || this.role === MessageRole.FUNCTION;
  }

  /**
   * Vérifie si le message est d'un utilisateur
   */
  isFromUser(): boolean {
    return this.role === MessageRole.USER;
  }

  /**
   * Génère un résumé court du message
   */
  getSummary(maxLength: number = 100): string {
    if (!this.content) return '';
    
    if (this.content.length <= maxLength) {
      return this.content;
    }
    
    return this.content.substring(0, maxLength - 3) + '...';
  }
}