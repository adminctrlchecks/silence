import { getTranslations } from 'next-intl/server';
import { SampleKundli } from '@/components/chart/sample-kundli';

export default async function ChartPage() {
  const t = await getTranslations('Chart');

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-5">
        <p className="text-sm font-medium text-primary">{t('eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{t('title')}</h1>
      </div>
      <SampleKundli />
    </main>
  );
}
