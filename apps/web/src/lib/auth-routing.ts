export const USER_TOKEN_COOKIE = 'silence_user_token';

const protectedPrefixes = ['/app', '/profile', '/history', '/chart', '/remedy'];
const authPaths = ['/login', '/register'];

export type RouteDecision =
  | { kind: 'next' }
  | { kind: 'redirect'; pathname: string; redirectParam?: string };

export function decideUserRoute(pathname: string, search: string, hasUserToken: boolean): RouteDecision {
  const protectedRoute = protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const authRoute = authPaths.includes(pathname);

  if (protectedRoute && !hasUserToken) {
    return { kind: 'redirect', pathname: '/login', redirectParam: `${pathname}${search}` };
  }

  if (authRoute && hasUserToken) {
    return { kind: 'redirect', pathname: '/app' };
  }

  return { kind: 'next' };
}
