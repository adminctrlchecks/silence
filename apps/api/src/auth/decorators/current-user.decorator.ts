import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthPrincipal {
  id: string;
  role: 'admin' | 'user';
  email?: string;
}

/** Injects the authenticated principal (set by the JWT strategy). */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthPrincipal => {
    return ctx.switchToHttp().getRequest().user;
  },
);
