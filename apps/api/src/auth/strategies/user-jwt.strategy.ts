import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface UserJwtPayload {
  sub: string;
  role: 'user';
  /** Set when this token was issued via admin-as-user (POST /auth/admin/user-session). */
  isAdminSession?: boolean;
}

@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_USER_SECRET ?? 'change-me-user-secret',
    });
  }

  validate(payload: UserJwtPayload) {
    if (payload.role !== 'user') throw new UnauthorizedException();
    return { id: payload.sub, role: payload.role, isAdminSession: payload.isAdminSession ?? false };
  }
}
