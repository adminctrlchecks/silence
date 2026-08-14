import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  adminLoginSchema,
  userRegisterSchema,
  userLoginSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from '@silence/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  AdminLoginDto,
  ChangePasswordDto,
  UserRegisterDto,
  UserLoginDto,
  RefreshTokenDto,
} from '../common/dto';
import { AuthService } from './auth.service';
import { AdminJwtGuard } from './guards/admin-jwt.guard';
import { UserJwtGuard } from './guards/user-jwt.guard';

type AuthenticatedRequest = Request & { user?: { id?: string } };

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

  @Post('admin/change-password')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin')
  @ApiOperation({ summary: 'Change the signed-in admin password' })
  adminChangePassword(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(changePasswordSchema)) body: ChangePasswordDto,
  ) {
    return this.auth.changeAdminPassword(req.user?.id ?? '', body);
  }

  @Post('admin/user-session')
  @UseGuards(AdminJwtGuard)
  @ApiBearerAuth('admin')
  @ApiOperation({ summary: 'Create a user-app session for the signed-in admin' })
  adminUserSession(@Req() req: AuthenticatedRequest) {
    return this.auth.adminUserSession(req.user?.id ?? '');
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

  @Post('user/change-password')
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth('user')
  @ApiOperation({ summary: 'Change the signed-in user password' })
  userChangePassword(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(changePasswordSchema)) body: ChangePasswordDto,
  ) {
    return this.auth.changeUserPassword(req.user?.id ?? '', body);
  }
}
