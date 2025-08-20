import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@core/config/config.service';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  username: string;
  sub: string;
  tenantId?: string;
  roles?: string[];
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
   * Valide un utilisateur avec username/password
   */
  async validateUser(username: string, pass: string): Promise<UserEntity | null> {
    // Utilisateurs factices pour les tests (multi-tenant)
    const users = [
      { 
        userId: '1', 
        username: 'testuser', 
        password: 'testpassword',
        email: 'test@wikipro.com',
        tenantId: 'tenant-1',
        roles: ['user'],
        isActive: true
      },
      { 
        userId: '2', 
        username: 'admin', 
        password: 'adminpassword',
        email: 'admin@wikipro.com',
        tenantId: 'tenant-1',
        roles: ['admin', 'user'],
        isActive: true
      }
    ];

    const user = users.find(u => u.username === username);
    if (user && user.password === pass && user.isActive) {
      const { password, ...result } = user;
      return result as UserEntity;
    }
    return null;
  }

  /**
   * Valide un payload JWT
   */
  async validateJwtPayload(payload: JwtPayload): Promise<UserEntity> {
    if (!payload.sub || !payload.username) {
      throw new UnauthorizedException('Payload JWT invalide');
    }

    // Simulation de récupération utilisateur par ID
    const user: UserEntity = {
      userId: payload.sub,
      username: payload.username,
      tenantId: payload.tenantId || 'tenant-1',
      roles: payload.roles || ['user'],
      isActive: true
    };

    return user;
  }

  /**
   * Génère les tokens JWT pour un utilisateur
   */
  async generateTokens(user: UserEntity): Promise<LoginResponse> {
    const accessPayload: JwtPayload = {
      username: user.username,
      sub: user.userId,
      tenantId: user.tenantId,
      roles: user.roles
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
