import { DEFAULT_LANGUAGE, LANGUAGES } from '@/lib/i18n';

/**
 * hreflang alternates for a public path, per
 * docs/product-redesign/28-seo.md §6 ("generate hreflang alternates for
 * all 11 supported locales... include x-default"). Resolves against the
 * root layout's `metadataBase`, so paths stay relative here.
 */
export function localeAlternates(path: string): Record<string, string> {
  const languages = Object.fromEntries(
    LANGUAGES.map((language) => [
      language.code,
      language.code === DEFAULT_LANGUAGE ? path || '/' : `/${language.code}${path}`,
    ]),
  );
  return { ...languages, 'x-default': path || '/' };
}
