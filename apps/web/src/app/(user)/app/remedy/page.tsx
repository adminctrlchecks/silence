import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ClipboardList, History as HistoryIcon, MoonStar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ReadingDisclaimer } from '@/components/shared/reading-disclaimer';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/api';
import { normalizeSessionLanguage } from '@/lib/session-preferences';
import { getUserSession } from '@/lib/user-session';

export const metadata: Metadata = {
  title: 'Your Personal Remedy',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RemedyPage() {
  const t = await getTranslations('Remedy');
  const session = await getUserSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await publicApi.profile(session.userId, session.token);
  const activeSession = await publicApi.startOrResumeSession(profile.id, session.token);
  const remedy = await publicApi.remedy(
    profile.id,
    normalizeSessionLanguage(profile.lang),
    session.token,
    activeSession.id,
  );

  // Viewing the remedy snapshots it and marks the session complete
  // server-side (SessionsService.recordRemedy) — there's no separate
  // "finish reading" action to surface here; the natural next steps are to
  // review history or head back to the chart.
  const whyThisPractice = remedy.source === 'rule' && remedy.matchDetail ? remedy.matchDetail : t('whyGeneric');

  return (
    <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-8 sm:px-6">
      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="rounded-md border border-primary/20 bg-primary/10 p-2 text-primary">
            <Sparkles className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-medium text-primary">{t('eyebrow')}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal" dir="auto">
              {remedy.title}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-md border border-border bg-background px-2 py-1">
                {t('category', { category: remedy.category })}
              </span>
              {remedy.linkedLevel ? (
                <span className="rounded-md border border-border bg-background px-2 py-1">
                  {t('linkedLevel', { level: remedy.linkedLevel })}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* What to do / why / how-to-repeat as distinct sections per
          docs/product-redesign/14-page-specifications.md §7. */}
      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 text-primary" aria-hidden />
          <h2 className="text-sm font-semibold tracking-normal">{t('practice')}</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-foreground" dir="auto">
          {remedy.text}
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold tracking-normal">{t('whyThisPractice')}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground" dir="auto">
            {whyThisPractice}
          </p>
        </section>
        <section className="rounded-md border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold tracking-normal">{t('howToRepeat')}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('closing')}</p>
        </section>
      </div>

      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <ReadingDisclaimer />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/history">
              <HistoryIcon />
              {t('viewHistory')}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/app/chart">
              <MoonStar />
              {t('backToChart')}
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
