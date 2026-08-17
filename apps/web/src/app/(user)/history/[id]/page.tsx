import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, MoonStar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { BirthChartView } from '@/components/chart/birth-chart-view';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/api';
import { normalizeSessionLanguage } from '@/lib/session-preferences';
import { getUserSession } from '@/lib/user-session';

export const metadata: Metadata = {
  title: 'Reading Detail',
  robots: {
    index: false,
    follow: false,
  },
};

function formatDate(value: string, lang: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default async function HistorySessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = await params;
  const t = await getTranslations('History');
  const levels = await getTranslations('Questions');
  const session = await getUserSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await publicApi.profile(session.userId, session.token);
  const lang = normalizeSessionLanguage(profile.lang);
  const detail = await publicApi.sessionDetail(profile.id, sessionId, session.token);

  return (
    <PageContainer as="main" size="reading" className="py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/history">
          <ArrowLeft className="size-4" />
          {t('back')}
        </Link>
      </Button>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
          {t(`status.${detail.status}`)}
        </span>
        <span className="text-xs text-muted-foreground">{t('startedOn', { date: formatDate(detail.startedAt, lang) })}</span>
        {detail.completedAt ? (
          <span className="text-xs text-muted-foreground">
            {t('completedOn', { date: formatDate(detail.completedAt, lang) })}
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold tracking-normal">{t('responses')}</h2>
          <div className="mt-4 space-y-3">
            {detail.responses.length ? (
              detail.responses.map((response) => (
                <article key={response.id} className="rounded-md border border-border bg-background p-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{levels(`levels.${response.level}`)}</span>
                    <span>{formatDate(response.createdAt, lang)}</span>
                  </div>
                  {response.questionText ? (
                    <p className="mt-2 break-words text-sm font-medium" dir="auto">
                      {response.questionText}
                    </p>
                  ) : null}
                  <p className="mt-1 break-words text-sm leading-6 text-muted-foreground" dir="auto">
                    {response.value}
                  </p>
                  {response.answerTextShown ? (
                    <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs">
                      <p className="font-medium text-primary">{levels('answerLabel')}</p>
                      <p className="mt-1 text-muted-foreground leading-5" dir="auto">
                        {response.answerTextShown}
                      </p>
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                {t('empty')}
              </p>
            )}
          </div>
        </section>

        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold tracking-normal">{t('remedySection')}</h2>
          {detail.remedy ? (
            <div className="mt-4">
              <div className="flex items-start gap-2">
                <span className="rounded-md border border-primary/20 bg-primary/10 p-2 text-primary">
                  <Sparkles className="size-4" aria-hidden />
                </span>
                <p className="text-sm font-medium" dir="auto">
                  {detail.remedy.title}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground" dir="auto">
                {detail.remedy.text}
              </p>
              {detail.remedy.source === 'rule' && detail.remedy.matchDetail ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  {t('whyThisRemedy')}: {detail.remedy.matchDetail}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-background p-5 text-center">
              <Sparkles className="size-5 text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">{t('noRemedy')}</p>
            </div>
          )}
        </section>
      </div>

      <section className="mt-4 rounded-md border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold tracking-normal">{t('chartSection')}</h2>
        {detail.chart ? (
          <BirthChartView chart={detail.chart} />
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-background p-5 text-center">
            <MoonStar className="size-5 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">{t('noChart')}</p>
          </div>
        )}
      </section>
    </PageContainer>
  );
}
