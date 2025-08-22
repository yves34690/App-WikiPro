import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

/**
 * Entité Conversation - Représente une conversation de chat utilisateur
 * Chaque conversation appartient à un utilisateur et contient des messages
 */
@Entity('conversations')
@Index(['tenant_id', 'user_id'])
@Index(['tenant_id', 'created_at'])
@Index(['is_active'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Relations multi-tenant
  @Column({ type: 'uuid', name: 'tenant_id' })
  tenant_id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  // Relation avec User
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Configuration IA
  @Column({ type: 'varchar', length: 100, default: 'general' })
  context_type: string; // 'general', 'document_analysis', 'code_review', etc.

  @Column({ type: 'jsonb', default: '{}' })
  ai_settings: Record<string, any>; // Paramètres IA spécifiques

  @Column({ type: 'jsonb', default: '[]' })
  attached_documents: string[]; // IDs des documents attachés

  // Métadonnées
  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  // État de la conversation
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_archived: boolean;

  @Column({ type: 'boolean', default: false })
  is_pinned: boolean;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'last_message_at' })
  last_message_at: Date;

  // Audit
  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  created_by: string;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updated_by: string;

  // Relations
  @OneToMany(() => Message, message => message.conversation, { cascade: true })
  messages: Message[];

  // Statistiques (calcul en runtime ou dénormalisé)
  @Column({ type: 'int', default: 0, name: 'message_count' })
  message_count: number;

  @Column({ type: 'int', default: 0, name: 'token_count' })
  token_count: number;

  // Nouveaux champs analytics IA - TICKET-BACKEND-002
  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0.0000, name: 'total_cost_usd' })
  total_cost_usd: number; // Coût total de la conversation en USD

  @Column({ type: 'int', default: 0, name: 'total_tokens' })
  total_tokens: number; // Total des tokens (input + output)

  @Column({ type: 'int', nullable: true, name: 'avg_response_time_ms' })
  avg_response_time_ms: number; // Temps de réponse moyen des IA

  /**
   * Méthodes utilitaires
   */
  
  /**
   * Met à jour le timestamp du dernier message
   */
  updateLastMessageTime(): void {
    this.last_message_at = new Date();
    this.updated_at = new Date();
  }

  /**
   * Incrémente le compteur de messages
   */
  incrementMessageCount(): void {
    this.message_count++;
    this.updateLastMessageTime();
  }

  /**
   * Archive la conversation
   */
  archive(): void {
    this.is_archived = true;
    this.is_active = false;
    this.updated_at = new Date();
  }

  /**
   * Désarchive la conversation
   */
  unarchive(): void {
    this.is_archived = false;
    this.is_active = true;
    this.updated_at = new Date();
  }

  /**
   * Épingle/dépingle la conversation
   */
  togglePin(): void {
    this.is_pinned = !this.is_pinned;
    this.updated_at = new Date();
  }

  /**
   * Vérifie si l'utilisateur peut accéder à cette conversation
   */
  canAccess(userId: string, tenantId: string): boolean {
    return this.user_id === userId && this.tenant_id === tenantId && this.is_active;
  }

  /**
   * Génère un titre automatique basé sur le premier message
   */
  generateAutoTitle(firstMessageContent: string): string {
    if (!firstMessageContent) return 'Nouvelle conversation';
    
    // Prendre les premiers mots (max 50 caractères)
    const words = firstMessageContent.trim().split(' ');
    let title = '';
    
    for (const word of words) {
      if ((title + ' ' + word).length > 50) break;
      title += (title ? ' ' : '') + word;
    }
    
    return title || 'Nouvelle conversation';
  }

  /**
   * Met à jour les analytics IA après ajout d'un message - TICKET-BACKEND-002
   */
  updateAIAnalytics(message: any): void {
    // Mettre à jour les coûts
    if (message.cost_usd) {
      this.total_cost_usd += message.cost_usd;
    }

    // Mettre à jour les tokens
    if (message.token_count) {
      this.total_tokens += message.token_count;
      // Maintenir la cohérence avec l'ancien champ
      this.token_count = this.total_tokens;
    }

    this.updateLastMessageTime();
  }

  /**
   * Recalcule le temps de réponse moyen des IA - TICKET-BACKEND-002
   */
  async recalculateAvgResponseTime(messageRepository: any): Promise<void> {
    const result = await messageRepository
      .createQueryBuilder('message')
      .select('AVG(message.response_time_ms)', 'avg_time')
      .where('message.conversation_id = :conversationId', { conversationId: this.id })
      .andWhere('message.response_time_ms IS NOT NULL')
      .andWhere('message.role = :role', { role: 'assistant' })
      .getRawOne();

    this.avg_response_time_ms = result?.avg_time ? Math.round(result.avg_time) : null;
  }

  /**
   * Obtient les statistiques IA de la conversation - TICKET-BACKEND-002
   */
  getAIStats(): {
    totalCost: number;
    totalTokens: number;
    avgResponseTime: number | null;
    messageCount: number;
    costPerMessage: number;
  } {
    return {
      totalCost: this.total_cost_usd || 0,
      totalTokens: this.total_tokens || 0,
      avgResponseTime: this.avg_response_time_ms,
      messageCount: this.message_count || 0,
      costPerMessage: this.message_count > 0 ? (this.total_cost_usd || 0) / this.message_count : 0
    };
  }

  /**
   * Vérifie si la conversation dépasse un seuil de coût - TICKET-BACKEND-002
   */
  isOverCostThreshold(thresholdUsd: number = 1.0): boolean {
    return (this.total_cost_usd || 0) > thresholdUsd;
  }

  /**
   * Estime le coût du prochain message basé sur l'historique - TICKET-BACKEND-002
   */
  estimateNextMessageCost(): number {
    if (this.message_count === 0 || !this.total_cost_usd) {
      return 0.01; // Coût estimé par défaut
    }

    return this.total_cost_usd / this.message_count;
  }
}