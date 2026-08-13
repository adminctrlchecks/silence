import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  adminLoginSchema,
  userRegisterSchema,
  userLoginSchema,
  refreshTokenSchema,
  type AdminLoginInput,
  type UserRegisterInput,
  type UserLoginInput,
  type RefreshTokenInput,
} from '@silence/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthService } from './auth.service';

// Tighter rate limit on credential endpoints to blunt brute-force attempts.
const AUTH_THROTTLE = { default: { limit: 10, ttl: 60_000 } };

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('admin/login')
  @Throttle(AUTH_THROTTLE)
  adminLogin(@Body(new ZodValidationPipe(adminLoginSchema)) body: AdminLoginInput) {
    return this.auth.adminLogin(body);
  }

  @Post('admin/refresh')
  adminRefresh(@Body(new ZodValidationPipe(refreshTokenSchema)) body: RefreshTokenInput) {
    return this.auth.refresh('admin', body.refreshToken);
  }

  @Post('user/register')
  @Throttle(AUTH_THROTTLE)
  userRegister(@Body(new ZodValidationPipe(userRegisterSchema)) body: UserRegisterInput) {
    return this.auth.userRegister(body);
  }

  @Post('user/login')
  @Throttle(AUTH_THROTTLE)
  userLogin(@Body(new ZodValidationPipe(userLoginSchema)) body: UserLoginInput) {
    return this.auth.userLogin(body);
  }

  @Post('user/refresh')
  userRefresh(@Body(new ZodValidationPipe(refreshTokenSchema)) body: RefreshTokenInput) {
    return this.auth.refresh('user', body.refreshToken);
  }
}
