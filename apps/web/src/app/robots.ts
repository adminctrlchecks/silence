import type { MetadataRoute } from 'next';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3011').replace(/\/$/, '');

// docs/product-redesign/28-seo.md §8: allow the public/indexable routes,
// disallow authenticated app/admin/auth-utility routes (redundant with the
// per-page `noindex` metadata, but the spec calls for both). `/*/path`
// wildcards cover the locale-prefixed variants of everything except /admin,
// which has no [locale] route tree.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/privacy', '/terms'],
        disallow: [
          '/app',
          '/*/app',
          '/profile',
          '/*/profile',
          '/history',
          '/*/history',
          '/admin',
          '/login',
          '/*/login',
          '/register',
          '/*/register',
          '/forgot-password',
          '/*/forgot-password',
          '/reset-password',
          '/*/reset-password',
          '/api',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
