import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { NotFoundContent } from '@/components/not-found-content';

export const metadata: Metadata = {
  title: { absolute: 'Page not found | Silence' },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NotFound() {
  const t = await getTranslations('NotFound');
  const nav = await getTranslations('Nav');

  return (
    <NotFoundContent
      title={t('rootTitle')}
      description={t('rootDescription')}
      primaryHref="/"
      primaryLabel={t('goHome')}
      secondaryHref="/privacy"
      secondaryLabel={nav('privacy')}
    />
  );
}
