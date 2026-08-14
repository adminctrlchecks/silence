export const USER_TOKEN_COOKIE = 'silence_user_token';
export const ADMIN_TOKEN_COOKIE = 'silence_admin_token';

const protectedPrefixes = ['/app', '/profile', '/history', '/chart', '/remedy'];
const authPaths = ['/login', '/register'];
const adminAuthPath = '/admin/login';
// Reachable without an admin token, in addition to adminAuthPath.
const adminPublicPaths = [adminAuthPath, '/admin/forgot-password', '/admin/reset-password'];

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

export function decideAdminRoute(pathname: string, search: string, hasAdminToken: boolean): RouteDecision {
  const adminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  if (!adminRoute) {
    return { kind: 'next' };
  }

  if (pathname === adminAuthPath && hasAdminToken) {
    return { kind: 'redirect', pathname: '/admin' };
  }

  if (!adminPublicPaths.includes(pathname) && !hasAdminToken) {
    return { kind: 'redirect', pathname: adminAuthPath, redirectParam: `${pathname}${search}` };
  }

  return { kind: 'next' };
}
