import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { BirthChartView } from '@/components/chart/birth-chart-view';
import { publicApi } from '@/lib/api';
import { normalizeSessionLanguage } from '@/lib/session-preferences';
import { getUserSession } from '@/lib/user-session';

export default async function ChartPage() {
  const t = await getTranslations('Chart');
  const session = await getUserSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await publicApi.profile(session.userId, session.token);
  const activeSession = await publicApi.startOrResumeSession(profile.id, session.token);
  const chart = await publicApi.chart(
    profile.id,
    normalizeSessionLanguage(profile.lang),
    session.token,
    activeSession.id,
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-5">
        <p className="text-sm font-medium text-primary">{t('eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{t('title')}</h1>
      </div>
      <BirthChartView chart={chart} />
    </main>
  );
}
