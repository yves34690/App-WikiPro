import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@core/config/config.service';
import { AuthService, JwtPayload, UserEntity } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.security.jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    try {
      const user = await this.authService.validateJwtPayload(payload);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Utilisateur non valide ou inactif');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Token JWT invalide');
    }
  }
}
