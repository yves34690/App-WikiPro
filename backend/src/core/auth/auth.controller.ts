import { Controller, Request, Post, UseGuards, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService, LoginResponse, UserEntity } from './auth.service';

class LoginDto {
  username: string;
  password: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Route de connexion.
   * Utilise le LocalAuthGuard pour valider les identifiants.
   * Si la validation réussit, le user est attaché à la requête
   * et on génère le token JWT.
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Connexion réussie',
    schema: {
      example: {
        user: {
          userId: "1",
          username: "testuser",
          email: "test@wikipro.com",
          tenantId: "tenant-1",
          roles: ["user"],
          isActive: true
        },
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        tokenType: "Bearer",
        expiresIn: "24h"
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Request() req): Promise<LoginResponse> {
    return this.authService.login(req.user);
  }

  /**
   * Route protégée.
   * Utilise le JwtAuthGuard pour valider le token JWT.
   * Si la validation réussit, on retourne les informations
   * de l'utilisateur contenues dans le token.
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer le profil utilisateur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profil utilisateur récupéré avec succès',
    schema: {
      example: {
        userId: "1",
        username: "testuser",
        email: "test@wikipro.com",
        tenantId: "tenant-1",
        roles: ["user"],
        isActive: true
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token manquant ou invalide' })
  getProfile(@Request() req): UserEntity {
    return req.user;
  }

  /**
   * Route de renouvellement des tokens
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renouvellement des tokens avec refresh token' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Tokens renouvelés avec succès' })
  @ApiResponse({ status: 401, description: 'Refresh token invalide' })
  async refresh(@Body('refreshToken') refreshToken: string): Promise<LoginResponse> {
    return this.authService.refreshTokens(refreshToken);
  }

  /**
   * Route de test pour vérifier le statut du service
   */
  @Get('health')
  @ApiOperation({ summary: 'Vérification du statut du service d\'authentification' })
  @ApiResponse({ status: 200, description: 'Service opérationnel' })
  healthCheck() {
    return { 
      status: 'ok', 
      service: 'auth',
      timestamp: new Date().toISOString()
    };
  }
}
