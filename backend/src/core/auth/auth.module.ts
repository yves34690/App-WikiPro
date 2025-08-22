import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@core/config/config.service';
import { CoreConfigModule } from '@core/config/config.module';
import { User } from '@database/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    CoreConfigModule,
    ...(process.env.DATABASE_ENABLED !== 'false' ? [
      TypeOrmModule.forFeature([User])
    ] : []),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [CoreConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.security.jwtSecret,
        signOptions: { expiresIn: configService.security.jwtExpiration },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    {
      provide: JwtStrategy,
      useFactory: (configService: ConfigService, authService: AuthService) => {
        return new JwtStrategy(configService, authService);
      },
      inject: [ConfigService, AuthService],
    },
  ],
  controllers: [AuthController],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}
