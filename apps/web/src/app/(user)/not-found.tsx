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

export default async function UserNotFound() {
  const t = await getTranslations('NotFound');
  const nav = await getTranslations('Nav');

  return (
    <NotFoundContent
      title={t('userTitle')}
      description={t('userDescription')}
      primaryHref="/app"
      primaryLabel={t('goDashboard')}
      secondaryHref="/"
      secondaryLabel={nav('home')}
    />
  );
}
