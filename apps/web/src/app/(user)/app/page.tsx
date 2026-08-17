import type { NextStep, QuestionProgress, ReadingSessionSummary } from '@silence/shared';
import type { Metadata } from 'next';
import { CheckCircle2, Circle, History as HistoryIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { JourneyTracker, type JourneyStage, type JourneyStageStatus } from '@/components/dashboard/journey-tracker';
import { publicApi } from '@/lib/api';
import { normalizeSessionLanguage } from '@/lib/session-preferences';
import { getUserSession } from '@/lib/user-session';

const NEXT_STEP_HREF: Record<NextStep, string> = {
  start_reading: '/app/questions',
  continue_questions: '/app/questions',
  view_chart: '/app/chart',
  view_remedy: '/app/remedy',
  view_history: '/history',
};

const LEVEL_ORDER: Array<keyof QuestionProgress> = ['common', 'level1', 'level2'];

export const metadata: Metadata = {
  title: 'Your Reading Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

function formatDate(value: string, lang: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(date);
}

/** Every level's questions answered, with at least one question to answer. */
function questionsComplete(progress: QuestionProgress) {
  return LEVEL_ORDER.every((level) => progress[level].total > 0 && progress[level].answered >= progress[level].total);
}

export default async function UserAppPage() {
  const t = await getTranslations('UserApp');
  const levels = await getTranslations('Questions');
  const history = await getTranslations('History');
  const session = await getUserSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await publicApi.profile(session.userId, session.token);
  const dashboard = await publicApi.dashboard(profile.id, session.token);
  const { activeSession, profile: completeness, nextStep, totalSessions } = dashboard;
  const lang = normalizeSessionLanguage(profile.lang);

  const isReturning = !activeSession && totalSessions > 0;
  const recentReading: ReadingSessionSummary | null = isReturning
    ? (await publicApi.listSessions(profile.id, session.token, { limit: 1 })).data[0] ?? null
    : null;

  const primaryLabel =
    nextStep === 'start_reading' && totalSessions > 0 ? t('startNewReading') : t(`primaryAction.${nextStep}`);
  const primaryHref = NEXT_STEP_HREF[nextStep];
  const profileDone = completeness.percent >= 100;

  const subtitleKey = isReturning
    ? 'subtitleReturning'
    : activeSession?.status === 'chart_ready'
      ? 'subtitleChartReady'
      : activeSession?.status === 'remedy_ready'
        ? 'subtitleRemedyReady'
        : activeSession
          ? 'subtitleInProgress'
          : 'subtitleFirstTime';

  // Journey tracker: Profile -> Questions -> Chart -> Remedy -> Complete.
  // "Returning" (just finished, nothing active) shows every stage done,
  // alongside the recent-reading card below — there's no in-flight journey
  // to track, but the most recent one really did complete all five.
  const questionsDone = activeSession ? questionsComplete(activeSession.questionProgress) : isReturning;
  const chartDone = activeSession?.hasChart ?? isReturning;
  const remedyDone = activeSession?.hasRemedy ?? isReturning;

  function stageStatus(done: boolean, unlockedByPrevious: boolean): JourneyStageStatus {
    if (done) return 'done';
    if (unlockedByPrevious) return 'current';
    return 'upcoming';
  }

  const stages: JourneyStage[] = [
    { key: 'profile', label: t('journey.profile'), status: profileDone ? 'done' : 'current' },
    { key: 'questions', label: t('journey.questions'), status: stageStatus(questionsDone, profileDone) },
    { key: 'chart', label: t('journey.chart'), status: stageStatus(chartDone, questionsDone) },
    { key: 'remedy', label: t('journey.remedy'), status: stageStatus(remedyDone, chartDone) },
    { key: 'complete', label: t('journey.complete'), status: isReturning ? 'done' : 'upcoming' },
  ];

  return (
    <PageContainer as="main" size="wide" className="py-8">
      <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="text-sm font-medium text-primary">{t('eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{t('greeting', { name: profile.name })}</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{t(subtitleKey)}</p>
        {!activeSession && totalSessions === 0 ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{t('firstTimeExplainer')}</p>
        ) : null}

        <div className="mt-5">
          <Button asChild className="h-12 px-6 text-base">
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <JourneyTracker stages={stages} />
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Profile completeness */}
        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-normal">{t('profileCompleteness')}</h2>
            <span className="text-sm font-medium text-primary">{completeness.percent}%</span>
          </div>
          <div
            role="progressbar"
            aria-label={t('profileCompleteness')}
            aria-valuenow={completeness.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background"
          >
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completeness.percent}%` }} />
          </div>
          {completeness.missingFields.length ? (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">{t('missingFieldsIntro')}</p>
              <ul className="mt-2 space-y-1">
                {completeness.missingFields.map((field) => (
                  <li key={field} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Circle className="size-3 text-muted-foreground" aria-hidden />
                    {t(`fields.${field}`)}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/profile">{t('profile')}</Link>
              </Button>
            </div>
          ) : (
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5 text-primary" aria-hidden />
              {t('profileComplete')}
            </p>
          )}
        </section>

        {isReturning && recentReading ? (
          // Returning state (§12): no active session, but history exists —
          // lead with the latest reading instead of in-progress details.
          <section className="rounded-md border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold tracking-normal">{t('recentReading')}</h2>
              <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {history(`status.${recentReading.status}`)}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {recentReading.completedAt
                ? history('completedOn', { date: formatDate(recentReading.completedAt, lang) })
                : history('startedOn', { date: formatDate(recentReading.startedAt, lang) })}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">{t('totalReadings', { count: totalSessions })}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/history/${recentReading.id}`}>{history('viewDetails')}</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/history">
                  <HistoryIcon />
                  {t('viewFullHistory')}
                </Link>
              </Button>
            </div>
          </section>
        ) : (
          // Active reading status.
          <section className="rounded-md border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold tracking-normal">{t('readingStatus')}</h2>
              {activeSession ? (
                <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {t(`status.${activeSession.status}`)}
                </span>
              ) : null}
            </div>
            {activeSession ? (
              <dl className="mt-4 space-y-2">
                {LEVEL_ORDER.map((level) => (
                  <div key={level} className="flex items-center justify-between text-xs">
                    <dt className="text-muted-foreground">{levels(`levels.${level}`)}</dt>
                    <dd className="font-medium text-foreground">
                      {t('levelProgress', {
                        answered: activeSession.questionProgress[level].answered,
                        total: activeSession.questionProgress[level].total,
                      })}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">{t('noActiveReading')}</p>
            )}
          </section>
        )}
      </div>
    </PageContainer>
  );
}
