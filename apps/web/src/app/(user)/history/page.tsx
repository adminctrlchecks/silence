import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { normalizeSessionLanguage } from '@/lib/session-preferences';
import { getUserSession } from '@/lib/user-session';

function formatDate(value: string, lang: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(lang, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default async function HistoryPage() {
  const t = await getTranslations('History');
  const levels = await getTranslations('Questions');
  const session = await getUserSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await publicApi.profile(session.userId, session.token);
  const lang = normalizeSessionLanguage(profile.lang);
  const history = await publicApi.history(profile.id, lang, session.token);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-5">
        <p className="text-sm font-medium text-primary">{t('eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{t('title')}</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-normal">{t('responses')}</h2>
            <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
              {t('count', { count: history.responses.length })}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {history.responses.length ? (
              history.responses.map((response) => (
                <article key={response.id} className="rounded-md border border-border bg-background p-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{levels(`levels.${response.level}`)}</span>
                    <span>{formatDate(response.createdAt, lang)}</span>
                  </div>
                  <p className="mt-2 break-words text-sm leading-6">{response.value}</p>
                </article>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                {t('emptyResponses')}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-normal">{t('charts')}</h2>
            <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
              {t('count', { count: history.charts.length })}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {history.charts.length ? (
              history.charts.map((chart) => (
                <article key={chart.id} className="rounded-md border border-border bg-background p-3">
                  <div className="text-xs text-muted-foreground">{formatDate(chart.createdAt, lang)}</div>
                  <p className="mt-2 text-sm font-medium">{chart.style}</p>
                  {chart.interpretation ? (
                    <p className="mt-2 line-clamp-5 text-sm leading-6 text-muted-foreground">
                      {chart.interpretation}
                    </p>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                {t('emptyCharts')}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
