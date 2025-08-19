import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../auth.service';

export const TENANT_KEY = 'tenant';
export const TenantContext = Reflector.createDecorator<string>();

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTenant = this.reflector.getAllAndOverride<string>(TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredTenant) {
      // Pas de restriction de tenant spécifiée
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    if (!user.tenantId) {
      throw new ForbiddenException('Tenant non défini pour l\'utilisateur');
    }

    // Vérification de l'isolation tenant
    if (user.tenantId !== requiredTenant) {
      this.logger.warn(
        `Tentative d'accès cross-tenant: utilisateur ${user.email} (tenant: ${user.tenantId}) ` +
        `tentant d'accéder aux ressources du tenant ${requiredTenant}`
      );
      throw new ForbiddenException('Accès interdit - Violation de l\'isolation tenant');
    }

    // Ajouter le tenantId à la requête pour usage ultérieur
    request.tenantId = user.tenantId;

    return true;
  }
}