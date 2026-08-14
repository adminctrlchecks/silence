import type { NextStep, QuestionProgress } from '@silence/shared';
import { CheckCircle2, Circle, MoonStar, Sparkles, UserRound, History as HistoryIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/api';
import { getUserSession } from '@/lib/user-session';

const NEXT_STEP_HREF: Record<NextStep, string> = {
  start_reading: '/app/questions',
  continue_questions: '/app/questions',
  view_chart: '/app/chart',
  view_remedy: '/app/remedy',
  view_history: '/history',
};

const LEVEL_ORDER: Array<keyof QuestionProgress> = ['common', 'level1', 'level2'];

export default async function UserAppPage() {
  const t = await getTranslations('UserApp');
  const levels = await getTranslations('Questions');
  const session = await getUserSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await publicApi.profile(session.userId, session.token);
  const dashboard = await publicApi.dashboard(profile.id, session.token);
  const { activeSession, profile: completeness, nextStep, totalSessions } = dashboard;

  const primaryLabel =
    nextStep === 'start_reading' && totalSessions > 0 ? t('startNewReading') : t(`primaryAction.${nextStep}`);
  const primaryHref = NEXT_STEP_HREF[nextStep];

  const quickLinks = [
    { label: t('questions'), href: '/app/questions', icon: Sparkles },
    { label: t('chart'), href: '/app/chart', icon: MoonStar },
    { label: t('remedy'), href: '/app/remedy', icon: Sparkles },
    { label: t('profile'), href: '/profile', icon: UserRound },
    { label: t('history'), href: '/history', icon: HistoryIcon },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-medium text-primary">{t('eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{t('title')}</h1>
        <div className="mt-5">
          <Button asChild className="h-12 px-6 text-base">
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Profile completeness */}
        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-normal">{t('profileCompleteness')}</h2>
            <span className="text-sm font-medium text-primary">{completeness.percent}%</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${completeness.percent}%` }}
            />
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

        {/* Active reading status */}
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

        {/* Chart + remedy status */}
        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold tracking-normal">{t('readingArtifacts')}</h2>
          <dl className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <dt className="text-muted-foreground">{t('chartStatus')}</dt>
              <dd className="flex items-center gap-1.5 font-medium">
                {activeSession?.hasChart ? (
                  <CheckCircle2 className="size-3.5 text-primary" aria-hidden />
                ) : (
                  <Circle className="size-3 text-muted-foreground" aria-hidden />
                )}
                {activeSession?.hasChart ? t('chartReady') : t('chartPending')}
              </dd>
            </div>
            <div className="flex items-center justify-between text-xs">
              <dt className="text-muted-foreground">{t('remedyStatus')}</dt>
              <dd className="flex items-center gap-1.5 font-medium">
                {activeSession?.hasRemedy ? (
                  <CheckCircle2 className="size-3.5 text-primary" aria-hidden />
                ) : (
                  <Circle className="size-3 text-muted-foreground" aria-hidden />
                )}
                {activeSession?.hasRemedy ? t('remedyReady') : t('remedyPending')}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">{t('totalReadings', { count: totalSessions })}</p>
        </section>
      </div>

      <section className="mt-4 rounded-md border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold tracking-normal">{t('quickLinks')}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {quickLinks.map(({ label, href, icon: Icon }) => (
            <Button key={href} asChild variant="outline" className="h-12 justify-start">
              <Link href={href}>
                <Icon />
                {label}
              </Link>
            </Button>
          ))}
        </div>
      </section>
    </main>
  );
}
