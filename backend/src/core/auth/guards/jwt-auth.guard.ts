import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Ajouter logique personnalisée si nécessaire avant l'activation du guard
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();

    if (err || !user) {
      const authHeader = request.headers.authorization;
      
      // Logs pour debugging
      if (!authHeader) {
        throw new UnauthorizedException('Token d\'authentification manquant');
      }
      
      if (!authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Format de token invalide. Utilisez: Bearer <token>');
      }

      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token d\'authentification expiré');
      }

      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token d\'authentification invalide');
      }

      throw new UnauthorizedException('Authentification échouée');
    }

    // Vérifier que l'utilisateur est actif
    if (user.status !== 'active') {
      throw new UnauthorizedException('Compte utilisateur inactif');
    }

    return user;
  }
}