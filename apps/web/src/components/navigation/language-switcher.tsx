'use client';

import { Languages } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { LANGUAGES, LANGUAGE_CODES } from '@/lib/i18n';
import { LANGUAGE_COOKIE } from '@/lib/session-preferences';
import { cn } from '@/lib/utils';

function pathnameWithLocale(pathname: string, locale: string) {
  const [, maybeLocale, ...rest] = pathname.split('/');
  const suffix = LANGUAGE_CODES.includes(maybeLocale) ? rest.join('/') : pathname.replace(/^\//, '');
  return `/${locale}${suffix ? `/${suffix}` : ''}`;
}

export function LanguageSwitcher({ className, label = 'Language' }: { className?: string; label?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [, maybeLocale] = pathname.split('/');
  const currentLocale = LANGUAGE_CODES.includes(maybeLocale) ? maybeLocale : 'en';

  function changeLanguage(locale: string) {
    document.cookie = `${LANGUAGE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
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
      <span className="sr-only">{label}</span>
      <select
        value={currentLocale}
        aria-label={label}
        onChange={(event) => changeLanguage(event.target.value)}
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
