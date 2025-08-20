import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '@core/entities/user.entity';
import { Conversation } from './conversation.entity';

export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  GEMINI = 'gemini',
}

@Entity('ai_sessions')
@Index('idx_ai_sessions_user_created', ['user_id', 'created_at'])
@Index('idx_ai_sessions_provider', ['provider'])
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({
    type: 'enum',
    enum: AIProvider,
  })
  provider: AIProvider;

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Conversation, (conversation) => conversation.session, {
    cascade: ['soft-remove'],
  })
  conversations: Conversation[];

  constructor(partial: Partial<Session> = {}) {
    Object.assign(this, partial);
  }

  // Méthodes métier
  getConversationCount(): number {
    return this.conversations?.length || 0;
  }

  getLastActivity(): Date {
    if (!this.conversations || this.conversations.length === 0) {
      return this.created_at;
    }
    
    const lastConversation = this.conversations
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())[0];
    
    return lastConversation.created_at;
  }

  isProviderSupported(provider: string): boolean {
    return Object.values(AIProvider).includes(provider as AIProvider);
  }

  updateMetadata(key: string, value: any): void {
    this.metadata = {
      ...this.metadata,
      [key]: value,
    };
  }

  // Sérialisation pour API
  toPublic(): any {
    return {
      id: this.id,
      title: this.title,
      provider: this.provider,
      metadata: this.metadata,
      conversation_count: this.getConversationCount(),
      last_activity: this.getLastActivity(),
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}