'use client';

import { Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { LANGUAGES, LANGUAGE_CODES } from '@/lib/i18n';
import { LANGUAGE_COOKIE } from '@/lib/session-preferences';
import { cn } from '@/lib/utils';

function pathnameWithLocale(pathname: string, locale: string) {
  const [, maybeLocale, ...rest] = pathname.split('/');
  const suffix = LANGUAGE_CODES.includes(maybeLocale) ? rest.join('/') : pathname.replace(/^\//, '');
  return `/${locale}${suffix ? `/${suffix}` : ''}`;
}

export function LanguageSwitcher({
  className,
  /** Signed-in users also get their saved profile language updated (see below) so
   *  question/chart/remedy content — not just UI chrome — follows the switch too. */
  authenticated,
}: {
  className?: string;
  authenticated?: boolean;
}) {
  const t = useTranslations('Nav');
  const pathname = usePathname();
  const router = useRouter();
  const [, maybeLocale] = pathname.split('/');
  const currentLocale = LANGUAGE_CODES.includes(maybeLocale) ? maybeLocale : 'en';

  async function changeLanguage(locale: string) {
    document.cookie = `${LANGUAGE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;

    if (authenticated) {
      // Best-effort: the UI-chrome switch below happens regardless of
      // whether this succeeds. Reading content (questions/chart/remedy) is
      // fetched using the profile's saved `lang`, not the page locale, so
      // without this the nav/labels would switch language but the actual
      // reading content wouldn't.
      try {
        await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lang: locale }),
        });
      } catch {
        // Ignore — UI language still switches below.
      }
    }

    router.push(pathnameWithLocale(pathname, locale));
    router.refresh();
  }

  return (
    <label
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground',
        className,
      )}
    >
      <Languages className="size-4 text-muted-foreground" aria-hidden />
      <span className="sr-only">{t('language')}</span>
      <select
        value={currentLocale}
        aria-label={t('language')}
        onChange={(event) => void changeLanguage(event.target.value)}
        className="min-w-0 bg-transparent text-sm font-medium outline-none"
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>
    </label>
  );
}
