import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Protects admin-only endpoints (requires a valid admin token). */
@Injectable()
export class AdminJwtGuard extends AuthGuard('admin-jwt') {}
