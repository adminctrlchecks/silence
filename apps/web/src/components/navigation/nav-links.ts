import { LANGUAGE_CODES } from '@/lib/i18n';

export function splitLocalizedPath(pathname: string) {
  const [, maybeLocale, ...rest] = pathname.split('/');
  const locale = LANGUAGE_CODES.includes(maybeLocale) ? maybeLocale : null;
  const pathWithoutLocale = locale ? `/${rest.join('/')}`.replace(/\/$/, '') || '/' : pathname;

  return { locale, pathWithoutLocale };
}

export function localizeHref(href: string, pathname: string) {
  const { locale } = splitLocalizedPath(pathname);
  if (!locale || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#')) return href;

  if (href === '/') return `/${locale}`;
  if (href.startsWith('/#')) return `/${locale}${href.slice(1)}`;
  return `/${locale}${href}`;
}

export function isActivePath(href: string, pathname: string) {
  const { pathWithoutLocale } = splitLocalizedPath(pathname);
  const baseHref = href.split('#')[0] || '/';
  return baseHref === '/' ? pathWithoutLocale === '/' : pathWithoutLocale === baseHref || pathWithoutLocale.startsWith(`${baseHref}/`);
}
