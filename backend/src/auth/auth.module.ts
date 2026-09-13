import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { OAuthService } from './oauth.service';
import { SecurityService } from './security.service';

import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';

import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    PrismaModule,

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-jwt-key-2026',
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    OtpService,
    OAuthService,
    SecurityService,
    JwtStrategy,
    RolesGuard,
  ],

  exports: [AuthService, OtpService, OAuthService, SecurityService],
})
export class AuthModule {}
