import { ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';

export type AuthenticatedRequest = Request & { user?: { id?: string; role?: string } };

/** Every `/users/:id/...` route is scoped to the signed-in user themself. */
export function assertOwnUser(req: AuthenticatedRequest, id: string) {
  if (req.user?.id !== id) {
    throw new ForbiddenException('You can only access your own user record');
  }
}
