'use client';

import type { Category } from '@silence/shared';
import { CATEGORIES } from '@silence/shared';
import { Check, Languages, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { dirFor, LANGUAGES, LANGUAGE_CODES } from '@/lib/i18n';
import {
  CATEGORY_COOKIE,
  LANGUAGE_COOKIE,
  normalizeCategory,
  normalizeSessionLanguage,
} from '@/lib/session-preferences';

function writeSessionCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

function pathnameWithLocale(pathname: string, locale: string) {
  const [, maybeLocale, ...rest] = pathname.split('/');
  const suffix = LANGUAGE_CODES.includes(maybeLocale) ? rest.join('/') : pathname.replace(/^\//, '');

  return `/${locale}${suffix ? `/${suffix}` : ''}`;
}

export function SessionPicker({
  initialLanguage,
  initialCategory,
}: {
  initialLanguage: string;
  initialCategory: Category | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('SessionPicker');
  const [language, setLanguage] = useState(() => normalizeSessionLanguage(initialLanguage));
  const [category, setCategory] = useState<Category | null>(() => normalizeCategory(initialCategory));

  function chooseLanguage(nextLanguage: string) {
    const normalized = normalizeSessionLanguage(nextLanguage);
    setLanguage(normalized);
    writeSessionCookie(LANGUAGE_COOKIE, normalized);
    document.documentElement.lang = normalized;
    document.documentElement.dir = dirFor(normalized);
    router.push(pathnameWithLocale(pathname, normalized));
  }

  function chooseCategory(nextCategory: Category) {
    setCategory(nextCategory);
    writeSessionCookie(CATEGORY_COOKIE, nextCategory);
    router.refresh();
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Languages className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">{t('language')}</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LANGUAGES.map((item) => {
            const selected = item.code === language;

            return (
              <Button
                key={item.code}
                type="button"
                variant={selected ? 'default' : 'outline'}
                size="sm"
                className="h-10 justify-between"
                dir={item.dir}
                aria-pressed={selected}
                onClick={() => chooseLanguage(item.code)}
              >
                <span className="truncate">{item.nativeName}</span>
                {selected ? <Check className="size-4 shrink-0" /> : null}
              </Button>
            );
          })}
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <UsersRound className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">{t('category')}</h2>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {CATEGORIES.map((item) => {
            const selected = item === category;

            return (
              <Button
                key={item}
                type="button"
                variant={selected ? 'default' : 'secondary'}
                size="sm"
                className="h-10 justify-between"
                aria-pressed={selected}
                onClick={() => chooseCategory(item)}
              >
                <span>{t(`categories.${item}`)}</span>
                {selected ? <Check className="size-4 shrink-0" /> : null}
              </Button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
