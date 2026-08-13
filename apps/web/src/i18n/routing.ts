import { DEFAULT_LANGUAGE, LANGUAGES } from '@silence/shared';
import { defineRouting } from 'next-intl/routing';
import { LANGUAGE_COOKIE } from '@/lib/session-preferences';

export const locales = LANGUAGES.map((language) => language.code) as [string, ...string[]];

export const routing = defineRouting({
  locales,
  defaultLocale: DEFAULT_LANGUAGE,
  localePrefix: 'always',
  localeCookie: {
    name: LANGUAGE_COOKIE,
    sameSite: 'lax',
  },
});
