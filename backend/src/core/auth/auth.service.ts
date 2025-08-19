import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@core/config/config.service';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  tenantId: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    tenantId: string;
    roles: string[];
  };
  accessToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const rounds = this.configService.security.bcryptRounds;
    return bcrypt.hash(password, rounds);
  }

  async comparePasswords(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
  }

  async generateTokens(payload: JwtPayload): Promise<AuthResult> {
    const tokenPayload: JwtPayload = {
      sub: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      roles: payload.roles,
    };

    const accessToken = this.jwtService.sign(tokenPayload);

    this.logger.log(`Token généré pour l'utilisateur ${payload.email} (tenant: ${payload.tenantId})`);

    return {
      user: {
        id: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
        roles: payload.roles,
      },
      accessToken,
    };
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      this.logger.warn(`Token invalide: ${error.message}`);
      throw new UnauthorizedException('Token invalide');
    }
  }

  async validateUser(payload: JwtPayload): Promise<JwtPayload> {
    // Validation basique du payload JWT
    if (!payload.sub || !payload.email || !payload.tenantId) {
      throw new UnauthorizedException('Payload JWT invalide');
    }

    // TODO: Validation supplémentaire avec base de données
    // - Vérifier que l'utilisateur existe
    // - Vérifier que le tenant existe
    // - Vérifier les permissions

    return payload;
  }

  extractTenantFromUser(user: JwtPayload): string {
    if (!user.tenantId) {
      throw new UnauthorizedException('Tenant non défini pour l\'utilisateur');
    }
    return user.tenantId;
  }

  hasRole(user: JwtPayload, requiredRole: string): boolean {
    return user.roles && user.roles.includes(requiredRole);
  }

  hasAnyRole(user: JwtPayload, requiredRoles: string[]): boolean {
    if (!user.roles) return false;
    return requiredRoles.some(role => user.roles.includes(role));
  }

  isAdmin(user: JwtPayload): boolean {
    return this.hasRole(user, 'admin') || this.hasRole(user, 'super-admin');
  }
}