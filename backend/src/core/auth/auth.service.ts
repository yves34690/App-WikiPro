import { Injectable, UnauthorizedException, Optional } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@core/config/config.service';
import { User } from '@database/entities/user.entity';
import * as bcrypt from 'bcryptjs';

export interface JwtPayload {
  username: string;
  sub: string;
  tenantId?: string;
  roles?: string[];
  tokenVersion?: number;
  iat?: number;
  exp?: number;
}

export interface UserEntity {
  userId: string;
  username: string;
  email?: string;
  tenantId: string;
  roles: string[];
  isActive: boolean;
}

export interface LoginResponse {
  user: Omit<UserEntity, 'password'>;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tenantId: string;
  tokenVersion: number;
}

@Injectable()
export class AuthService {
  constructor(
    @Optional()
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Hache un mot de passe
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare un mot de passe avec son hash
   */
  async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Valide un utilisateur avec username/password depuis la BDD ou données test
   */
  async validateUser(username: string, pass: string, tenantId?: string): Promise<UserEntity | null> {
    try {
      // Mode développement sans base de données - utilisateur test
      if (process.env.DATABASE_ENABLED === 'false') {
        if (username === 'test@example.com' && pass === 'password123') {
          return {
            userId: 'test-user-123',
            username: 'test@example.com',
            email: 'test@example.com',
            tenantId: tenantId || 'test-tenant-123',
            roles: ['user'],
            isActive: true
          };
        }
        if (username === 'admin@example.com' && pass === 'admin123') {
          return {
            userId: 'admin-user-123',
            username: 'admin@example.com',
            email: 'admin@example.com',
            tenantId: tenantId || 'test-tenant-123',
            roles: ['admin'],
            isActive: true
          };
        }
        return null;
      }

      // Mode normal avec base de données
      if (!this.userRepository) {
        throw new Error('User repository not available - database might be disabled');
      }

      // Chercher l'utilisateur par username et tenantId (si fourni)
      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password_hash') // Inclure le password_hash pour validation
        .where('user.username = :username', { username });

      // Si tenantId est fourni, l'ajouter à la requête
      if (tenantId) {
        queryBuilder.andWhere('user.tenant_id = :tenantId', { tenantId });
      }

      const user = await queryBuilder.getOne();

      if (!user) {
        return null;
      }

      // Vérifier si l'utilisateur peut se connecter
      if (!user.canLogin()) {
        return null;
      }

      // Valider le mot de passe
      const isPasswordValid = await user.validatePassword(pass);
      
      if (!isPasswordValid) {
        // Incrémenter les tentatives échouées
        user.incrementFailedAttempts();
        await this.userRepository.save(user);
        return null;
      }

      // Succès - reset des tentatives et mise à jour last_login
      user.resetFailedAttempts();
      await this.userRepository.save(user);

      // Retourner l'entité UserEntity compatible
      return {
        userId: user.id,
        username: user.username,
        email: user.email,
        tenantId: user.tenant_id,
        roles: user.roles,
        isActive: user.is_active,
      };

    } catch (error) {
      console.error('Erreur lors de la validation utilisateur:', error);
      return null;
    }
  }

  /**
   * Valide un payload JWT et récupère l'utilisateur depuis la BDD
   */
  async validateJwtPayload(payload: JwtPayload): Promise<UserEntity> {
    if (!payload.sub || !payload.username) {
      throw new UnauthorizedException('Payload JWT invalide');
    }

    try {
      // Récupérer l'utilisateur depuis la BDD
      const user = await this.userRepository.findOne({
        where: { 
          id: payload.sub,
          tenant_id: payload.tenantId 
        }
      });

      if (!user || !user.is_active) {
        throw new UnauthorizedException('Utilisateur introuvable ou inactif');
      }

      // Vérifier la version du token (pour invalidation)
      if (payload.tokenVersion && user.token_version !== payload.tokenVersion) {
        throw new UnauthorizedException('Token invalide (version)');
      }

      // Retourner l'entité UserEntity compatible
      return {
        userId: user.id,
        username: user.username,
        email: user.email,
        tenantId: user.tenant_id,
        roles: user.roles,
        isActive: user.is_active,
      };

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('Erreur lors de la validation JWT:', error);
      throw new UnauthorizedException('Erreur de validation JWT');
    }
  }

  /**
   * Génère les tokens JWT pour un utilisateur
   */
  async generateTokens(user: UserEntity): Promise<LoginResponse> {
    // Si c'est une entité User complète, récupérer token_version
    let tokenVersion = 1;
    if ('token_version' in user) {
      tokenVersion = (user as any).token_version;
    }

    const accessPayload: JwtPayload = {
      username: user.username,
      sub: user.userId,
      tenantId: user.tenantId,
      roles: user.roles,
      tokenVersion: tokenVersion
    };

    const refreshPayload: RefreshTokenPayload = {
      sub: user.userId,
      tenantId: user.tenantId,
      tokenVersion: 1 // Incrementer en cas de révocation
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: this.configService.security.jwtExpiration
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: '7d' // Refresh token valide 7 jours
    });
    
    return {
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        tenantId: user.tenantId,
        roles: user.roles,
        isActive: user.isActive
      },
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.security.jwtExpiration
    };
  }

  /**
   * Valide et renouvelle un refresh token
   */
  async refreshTokens(refreshToken: string): Promise<LoginResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken) as RefreshTokenPayload;
      
      // Récupérer l'utilisateur à partir du refresh token
      const user: UserEntity = {
        userId: payload.sub,
        username: 'user', // À récupérer depuis la DB en vrai
        tenantId: payload.tenantId,
        roles: ['user'],
        isActive: true
      };

      // Générer de nouveaux tokens
      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }

  /**
   * Gère la connexion et génère un token JWT
   */
  async login(user: UserEntity): Promise<LoginResponse> {
    if (!user || !user.userId) {
      throw new UnauthorizedException('User not found or invalid');
    }
    
    return this.generateTokens(user);
  }

  /**
   * Vérifie si un utilisateur a un rôle spécifique
   */
  hasRole(user: UserEntity, role: string): boolean {
    return user.roles && user.roles.includes(role);
  }

  /**
   * Vérifie si un utilisateur a au moins un des rôles spécifiés
   */
  hasAnyRole(user: UserEntity, roles: string[]): boolean {
    return user.roles && roles.some(role => user.roles.includes(role));
  }

  /**
   * Vérifie si un utilisateur est administrateur
   */
  isAdmin(user: UserEntity): boolean {
    return this.hasRole(user, 'admin');
  }
}
