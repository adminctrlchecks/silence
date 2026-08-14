import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminJwtStrategy } from './strategies/admin-jwt.strategy';
import { UserJwtStrategy } from './strategies/user-jwt.strategy';
import { AdminAuditModule } from '../admin-audit/admin-audit.module';

@Module({
  imports: [PassportModule, JwtModule.register({}), AdminAuditModule],
  controllers: [AuthController],
  providers: [AuthService, AdminJwtStrategy, UserJwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
