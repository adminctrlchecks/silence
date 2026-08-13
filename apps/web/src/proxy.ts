import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { decideUserRoute, USER_TOKEN_COOKIE } from '@/lib/auth-routing';

const intlMiddleware = createIntlMiddleware(routing);

function splitLocale(pathname: string) {
  const [, maybeLocale, ...rest] = pathname.split('/');
  const hasLocale = routing.locales.includes(maybeLocale);

  return {
    locale: hasLocale ? maybeLocale : null,
    pathname: hasLocale ? `/${rest.join('/')}`.replace(/\/$/, '') || '/' : pathname,
  };
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const routed = splitLocale(pathname);
  const hasUserToken = Boolean(request.cookies.get(USER_TOKEN_COOKIE)?.value);
  const decision = decideUserRoute(routed.pathname, search, hasUserToken);

  if (decision.kind === 'redirect') {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = routed.locale ? `/${routed.locale}${decision.pathname}` : decision.pathname;
    redirectUrl.search = '';
    if (decision.redirectParam) redirectUrl.searchParams.set('redirect', decision.redirectParam);
    return NextResponse.redirect(redirectUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
