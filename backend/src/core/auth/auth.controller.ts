import { Controller, Post, Get, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, JwtPayload } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Valider un token JWT' })
  @ApiResponse({ status: 200, description: 'Token valide' })
  @ApiResponse({ status: 401, description: 'Token invalide' })
  async validateToken(@Body() body: { token: string }): Promise<{ valid: boolean; payload?: JwtPayload }> {
    try {
      const payload = await this.authService.validateToken(body.token);
      return { valid: true, payload };
    } catch (error) {
      return { valid: false };
    }
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