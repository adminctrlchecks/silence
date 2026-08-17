import { DEFAULT_LANGUAGE, LANGUAGES } from '@silence/shared';
import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3011').replace(/\/$/, '');

// Only the routes that actually resolve without `noindex` (verified: every
// other page.tsx in this app sets `robots: { index: false }`) — see
// docs/product-redesign/28-seo.md §8 ("only public indexable routes").
const PUBLIC_PATHS = ['', '/privacy', '/terms'];

function localizedUrl(path: string, locale: string) {
  const prefix = locale === DEFAULT_LANGUAGE ? '' : `/${locale}`;
  return `${SITE_URL}${prefix}${path || ''}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: localizedUrl(path, DEFAULT_LANGUAGE),
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.5,
    alternates: {
      languages: Object.fromEntries([
        ...LANGUAGES.map((language) => [language.code, localizedUrl(path, language.code)]),
        ['x-default', localizedUrl(path, DEFAULT_LANGUAGE)],
      ]),
    },
  }));
}
