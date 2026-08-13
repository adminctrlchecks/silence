import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  adminLoginSchema,
  userRegisterSchema,
  userLoginSchema,
  refreshTokenSchema,
} from '@silence/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  AdminLoginDto,
  UserRegisterDto,
  UserLoginDto,
  RefreshTokenDto,
} from '../common/dto';
import { AuthService } from './auth.service';

// Tighter rate limit on credential endpoints to blunt brute-force attempts.
const AUTH_THROTTLE = { default: { limit: 10, ttl: 60_000 } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('admin/login')
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: 'Admin login → access + refresh tokens' })
  adminLogin(@Body(new ZodValidationPipe(adminLoginSchema)) body: AdminLoginDto) {
    return this.auth.adminLogin(body);
  }

  @Post('admin/refresh')
  @ApiOperation({ summary: 'Exchange an admin refresh token for a new access token' })
  adminRefresh(@Body(new ZodValidationPipe(refreshTokenSchema)) body: RefreshTokenDto) {
    return this.auth.refresh('admin', body.refreshToken);
  }

  @Post('user/register')
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: 'Register a user (name, category, birth details, password)' })
  userRegister(@Body(new ZodValidationPipe(userRegisterSchema)) body: UserRegisterDto) {
    return this.auth.userRegister(body);
  }

  @Post('user/login')
  @Throttle(AUTH_THROTTLE)
  @ApiOperation({ summary: 'User login → access + refresh tokens' })
  userLogin(@Body(new ZodValidationPipe(userLoginSchema)) body: UserLoginDto) {
    return this.auth.userLogin(body);
  }

  @Post('user/refresh')
  @ApiOperation({ summary: 'Exchange a user refresh token for a new access token' })
  userRefresh(@Body(new ZodValidationPipe(refreshTokenSchema)) body: RefreshTokenDto) {
    return this.auth.refresh('user', body.refreshToken);
  }
}
