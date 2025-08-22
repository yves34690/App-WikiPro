import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

/**
 * Entité User - Gestion des utilisateurs multi-tenant
 * 
 * Fonctionnalités :
 * - Multi-tenant avec isolation stricte
 * - Hash automatique des mots de passe
 * - Gestion des rôles et permissions
 * - Support activation/désactivation
 * - Audit trail complet
 */
@Entity('users')
@Index(['tenant_id', 'email'], { unique: true }) // Email unique par tenant
@Index(['tenant_id', 'username'], { unique: true }) // Username unique par tenant
@Index(['tenant_id']) // Index pour filtrage tenant
@Index(['is_active']) // Index pour users actifs
@Index(['last_login_at']) // Index pour analytics
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ==========================================
  // INFORMATIONS UTILISATEUR
  // ==========================================

  @Column({ type: 'varchar', length: 100 })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false }) // Exclu par défaut des requêtes
  password_hash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  last_name: string;

  // ==========================================
  // MULTI-TENANT
  // ==========================================

  @Column({ type: 'uuid' })
  tenant_id: string;

  // ==========================================
  // RÔLES ET PERMISSIONS
  // ==========================================

  @Column({ type: 'simple-array', default: () => "'user'" })
  roles: string[];

  @Column({ type: 'jsonb', default: '{}' })
  permissions: Record<string, any>;

  @Column({ type: 'jsonb', default: '{}' })
  preferences: Record<string, any>;

  // ==========================================
  // ÉTAT ET SÉCURITÉ
  // ==========================================

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  email_verified_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  last_login_ip: string;

  @Column({ type: 'int', default: 0 })
  failed_login_attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  locked_until: Date;

  // ==========================================
  // TOKENS ET SESSIONS
  // ==========================================

  @Column({ type: 'varchar', length: 255, nullable: true })
  email_verification_token: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password_reset_token: string;

  @Column({ type: 'timestamp', nullable: true })
  password_reset_expires: Date;

  @Column({ type: 'int', default: 1 })
  token_version: number; // Pour invalider tous les JWT

  // ==========================================
  // MÉTADONNÉES
  // ==========================================

  @Column({ type: 'jsonb', default: '{}' })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  // ==========================================
  // HOOKS LIFECYCLE
  // ==========================================

  /**
   * Hash automatique du mot de passe avant insertion
   */
  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    if (this.password_hash && !this.isPasswordHashed(this.password_hash)) {
      this.password_hash = await bcrypt.hash(this.password_hash, 12);
    }
  }

  /**
   * Hash automatique du mot de passe avant mise à jour
   */
  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    if (this.password_hash && !this.isPasswordHashed(this.password_hash)) {
      this.password_hash = await bcrypt.hash(this.password_hash, 12);
    }
  }

  // ==========================================
  // MÉTHODES UTILITAIRES
  // ==========================================

  /**
   * Vérifie si un mot de passe est déjà hashé
   */
  private isPasswordHashed(password: string): boolean {
    return password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$');
  }

  /**
   * Vérifie un mot de passe
   */
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }

  /**
   * Définit un nouveau mot de passe
   */
  async setPassword(password: string): Promise<void> {
    this.password_hash = await bcrypt.hash(password, 12);
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    return this.roles && this.roles.includes(role);
  }

  /**
   * Vérifie si l'utilisateur a au moins un des rôles
   */
  hasAnyRole(roles: string[]): boolean {
    return this.roles && roles.some(role => this.roles.includes(role));
  }

  /**
   * Vérifie si l'utilisateur est administrateur
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Vérifie si l'utilisateur est actif et non bloqué
   */
  canLogin(): boolean {
    if (!this.is_active) return false;
    if (this.locked_until && this.locked_until > new Date()) return false;
    return true;
  }

  /**
   * Incrémente les tentatives de connexion échouées
   */
  incrementFailedAttempts(): void {
    this.failed_login_attempts += 1;
    
    // Bloquer après 5 tentatives pour 30 minutes
    if (this.failed_login_attempts >= 5) {
      this.locked_until = new Date(Date.now() + 30 * 60 * 1000);
    }
  }

  /**
   * Reset les tentatives de connexion après succès
   */
  resetFailedAttempts(): void {
    this.failed_login_attempts = 0;
    this.locked_until = null;
    this.last_login_at = new Date();
  }

  /**
   * Incrémente la version du token (invalide tous les JWT)
   */
  invalidateTokens(): void {
    this.token_version += 1;
  }

  /**
   * Retourne les informations publiques de l'utilisateur
   */
  toPublicProfile() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      first_name: this.first_name,
      last_name: this.last_name,
      roles: this.roles,
      is_active: this.is_active,
      is_verified: this.is_verified,
      last_login_at: this.last_login_at,
      created_at: this.created_at,
    };
  }
}