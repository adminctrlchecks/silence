import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface AdminJwtPayload {
  sub: string;
  role: 'admin';
  email: string;
}

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ADMIN_SECRET ?? 'change-me-admin-secret',
    });
  }

  validate(payload: AdminJwtPayload) {
    if (payload.role !== 'admin') throw new UnauthorizedException();
    return { id: payload.sub, role: payload.role, email: payload.email };
  }
}
