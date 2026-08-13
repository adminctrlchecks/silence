import { NextResponse, type NextRequest } from 'next/server';
import { decideUserRoute, USER_TOKEN_COOKIE } from '@/lib/auth-routing';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasUserToken = Boolean(request.cookies.get(USER_TOKEN_COOKIE)?.value);
  const decision = decideUserRoute(pathname, search, hasUserToken);

  if (decision.kind === 'redirect') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = decision.pathname;
    redirectUrl.search = '';
    if (decision.redirectParam) redirectUrl.searchParams.set('redirect', decision.redirectParam);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
