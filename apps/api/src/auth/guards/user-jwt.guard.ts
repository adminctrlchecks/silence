import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Protects user endpoints (requires a valid user token). */
@Injectable()
export class UserJwtGuard extends AuthGuard('user-jwt') {}
