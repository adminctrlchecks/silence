import { DEFAULT_LANGUAGE, LANGUAGES } from '@/lib/i18n';

/**
 * The canonical site origin, server-side only (safe to read raw
 * `process.env.VERCEL_*` here — this file is never imported by client
 * components). Prefers an explicit `NEXT_PUBLIC_SITE_URL`, then Vercel's
 * own stable-production-domain / current-deployment env vars, and only
 * falls back to localhost for local dev — previously canonical URLs,
 * OG images, and the sitemap/robots all silently fell back to
 * `localhost:3011` in any deploy that didn't have `NEXT_PUBLIC_SITE_URL`
 * set, which is exactly what was live in production.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, '');

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionUrl) return `https://${productionUrl}`;

  const deploymentUrl = process.env.VERCEL_URL;
  if (deploymentUrl) return `https://${deploymentUrl}`;

  return 'http://localhost:3011';
}

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
