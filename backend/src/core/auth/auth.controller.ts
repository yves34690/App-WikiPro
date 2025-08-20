import { Controller, Post, Get, Body, UseGuards, Request, Logger, UnauthorizedException, Ip } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsUUID } from 'class-validator';
import { AuthService, JwtPayload } from './auth.service';
import { UserService } from '@core/users/user.service';
import { TenantService } from '@core/tenants/tenant.service';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsUUID()
  tenant_id: string;
}

export class VerifyTokenDto {
  @IsString()
  token: string;
}

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private tenantService: TenantService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Authentification avec tenant_id' })
  @ApiResponse({ status: 200, description: 'Authentification réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() loginDto: LoginDto, @Ip() ip: string): Promise<{
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      tenant_id: string;
    };
    access_token: string;
    tenant: {
      id: string;
      name: string;
      slug: string;
    };
  }> {
    this.logger.log(`Tentative de connexion: ${loginDto.email} pour le tenant ${loginDto.tenant_id}`);

    // Vérifier que le tenant existe et est accessible
    const tenant = await this.tenantService.findById(loginDto.tenant_id);
    if (!tenant.canAccess()) {
      throw new UnauthorizedException('Le tenant n\'est pas accessible');
    }

    // Rechercher l'utilisateur
    const user = await this.userService.findByEmailAndTenant(
      loginDto.email,
      loginDto.tenant_id,
    );

    if (!user) {
      this.logger.warn(`Utilisateur introuvable: ${loginDto.email} pour le tenant ${loginDto.tenant_id}`);
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (!user.canAccess()) {
      this.logger.warn(`Utilisateur inactif: ${loginDto.email}`);
      throw new UnauthorizedException('Compte utilisateur inactif');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await this.userService.validatePassword(user, loginDto.password);
    if (!isPasswordValid) {
      this.logger.warn(`Mot de passe incorrect pour: ${loginDto.email}`);
      throw new UnauthorizedException('Identifiants invalides');
    }

    // Générer le token JWT
    const jwtPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenant_id,
      roles: [user.role],
    };

    const authResult = await this.authService.generateTokens(jwtPayload);

    // Mettre à jour la dernière connexion
    await this.userService.updateLastLogin(user.id, user.tenant_id, ip);

    this.logger.log(`Connexion réussie: ${user.email} (tenant: ${tenant.slug})`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.getFullName(),
        role: user.role,
        tenant_id: user.tenant_id,
      },
      access_token: authResult.accessToken,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
    };
  }

  @Get('verify')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vérification du token JWT' })
  @ApiResponse({ status: 200, description: 'Token valide' })
  @ApiResponse({ status: 401, description: 'Token invalide' })
  async verifyToken(@Request() req): Promise<{
    valid: boolean;
    user: {
      id: string;
      email: string;
      tenant_id: string;
      roles: string[];
    };
    tenant: {
      id: string;
      name: string;
      slug: string;
    };
  }> {
    const user: JwtPayload = req.user;
    
    // Vérifier que le tenant existe toujours et est accessible
    const tenant = await this.tenantService.findById(user.tenantId);
    if (!tenant.canAccess()) {
      throw new UnauthorizedException('Le tenant n\'est plus accessible');
    }

    // Vérifier que l'utilisateur existe toujours
    const dbUser = await this.userService.findById(user.sub, user.tenantId);
    if (!dbUser.canAccess()) {
      throw new UnauthorizedException('L\'utilisateur n\'est plus actif');
    }

    this.logger.log(`Token vérifié pour: ${user.email} (tenant: ${tenant.slug})`);

    return {
      valid: true,
      user: {
        id: user.sub,
        email: user.email,
        tenant_id: user.tenantId,
        roles: user.roles,
      },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
      },
    };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir le profil utilisateur' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getProfile(@Request() req): Promise<JwtPayload> {
    this.logger.log(`Profil demandé pour l'utilisateur ${req.user.email}`);
    return req.user;
  }

  @Post('hash-password')
  @ApiOperation({ summary: 'Hasher un mot de passe (utilitaire)' })
  @ApiResponse({ status: 200, description: 'Mot de passe hashé' })
  async hashPassword(@Body() body: { password: string }): Promise<{ hash: string }> {
    // Cette route est temporaire pour faciliter les tests
    // TODO: Supprimer en production ou sécuriser
    const hash = await this.authService.hashPassword(body.password);
    return { hash };
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check du service d\'authentification' })
  @ApiResponse({ status: 200, description: 'Service opérationnel' })
  getAuthHealth(): { status: string; service: string } {
    return {
      status: 'healthy',
      service: 'authentication',
    };
  }
}