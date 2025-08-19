import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TenantGuard } from './guards/tenant.guard';
import { ConfigService } from '@core/config/config.service';
import { CoreConfigModule } from '@core/config/config.module';

@Module({
  imports: [
    CoreConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [CoreConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.security.jwtSecret,
        signOptions: { 
          expiresIn: configService.security.jwtExpiration 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    TenantGuard,
  ],
  exports: [AuthService, TenantGuard],
})
export class AuthModule {}