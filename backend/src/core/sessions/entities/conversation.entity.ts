import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Session, AIProvider } from './session.entity';

@Entity('conversations')
@Index('idx_conversations_session_created', ['session_id', 'created_at'])
@Index('idx_conversations_provider', ['provider_used'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  session_id: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  response: string;

  @Column({
    type: 'enum',
    enum: AIProvider,
    nullable: true,
  })
  provider_used: AIProvider;

  @Column({ type: 'int', default: 0 })
  tokens_used: number;

  @Column({ type: 'int', default: 0 })
  processing_time_ms: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  // Relations
  @ManyToOne(() => Session, (session) => session.conversations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  constructor(partial: Partial<Conversation> = {}) {
    Object.assign(this, partial);
  }

  // Méthodes métier
  hasResponse(): boolean {
    return !!this.response && this.response.trim().length > 0;
  }

  getTokenEfficiency(): number {
    if (!this.tokens_used || !this.processing_time_ms) {
      return 0;
    }
    return this.tokens_used / (this.processing_time_ms / 1000); // tokens par seconde
  }

  isProcessingComplete(): boolean {
    return this.hasResponse() && this.processing_time_ms > 0;
  }

  getMessageLength(): number {
    return this.message?.length || 0;
  }

  getResponseLength(): number {
    return this.response?.length || 0;
  }

  updateMetadata(key: string, value: any): void {
    this.metadata = {
      ...this.metadata,
      [key]: value,
    };
  }

  // Calcul de statistiques
  getCompressionRatio(): number {
    if (!this.hasResponse()) return 0;
    const inputLength = this.getMessageLength();
    const outputLength = this.getResponseLength();
    return inputLength > 0 ? outputLength / inputLength : 0;
  }

  // Sérialisation pour API
  toPublic(): any {
    return {
      id: this.id,
      message: this.message,
      response: this.response,
      provider_used: this.provider_used,
      tokens_used: this.tokens_used,
      processing_time_ms: this.processing_time_ms,
      metadata: this.metadata || {},
      has_response: this.hasResponse(),
      is_complete: this.isProcessingComplete(),
      created_at: this.created_at,
      statistics: {
        message_length: this.getMessageLength(),
        response_length: this.getResponseLength(),
        token_efficiency: this.getTokenEfficiency(),
        compression_ratio: this.getCompressionRatio(),
      },
    };
  }
}