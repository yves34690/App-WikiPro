import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TenantGuard } from './guards/tenant.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@core/config/config.service';
import { CoreConfigModule } from '@core/config/config.module';
import { UserModule } from '@core/users/user.module';
import { TenantModule } from '@core/tenants/tenant.module';

@Module({
  imports: [
    CoreConfigModule,
    UserModule,
    TenantModule,
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
    JwtAuthGuard,
  ],
  exports: [AuthService, TenantGuard, JwtAuthGuard],
})
export class AuthModule {}