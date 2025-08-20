import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo_url: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ type: 'varchar', length: 50, default: 'trial' })
  plan_type: string; // trial, basic, premium, enterprise

  @Column({ type: 'timestamp', nullable: true })
  plan_expires_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relations
  @OneToMany(() => User, (user) => user.tenant, { cascade: true })
  users: User[];

  constructor(partial: Partial<Tenant> = {}) {
    Object.assign(this, partial);
  }

  // Méthodes métier
  isActive(): boolean {
    return this.is_active;
  }

  isPlanExpired(): boolean {
    if (!this.plan_expires_at) return false;
    return new Date() > this.plan_expires_at;
  }

  canAccess(): boolean {
    return this.isActive() && !this.isPlanExpired();
  }
}