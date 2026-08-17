import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/api';
import { normalizeSessionLanguage } from '@/lib/session-preferences';
import { getUserSession } from '@/lib/user-session';

export const metadata: Metadata = {
  title: 'Reading History',
  robots: {
    index: false,
    follow: false,
  },
};

const PAGE_SIZE = 10;

function formatDate(value: string, lang: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const t = await getTranslations('History');
  const session = await getUserSession();

  if (!session) {
    redirect('/login');
  }

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);

  const profile = await publicApi.profile(session.userId, session.token);
  const lang = normalizeSessionLanguage(profile.lang);
  const sessions = await publicApi.listSessions(profile.id, session.token, { page, limit: PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(sessions.total / sessions.limit));

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">{t('eyebrow')}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">{t('title')}</h1>
        </div>
        <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
          {t('count', { count: sessions.total })}
        </span>
      </div>

      {sessions.data.length ? (
        <>
          {/* Visual timeline per docs/product-redesign/14-page-specifications.md
              §8 — a connecting line ties sessions together chronologically
              instead of reading as an unrelated stack of cards. */}
          <ol className="relative space-y-3 ps-6">
            <span aria-hidden className="absolute inset-y-0 start-[calc(0.5rem-1px)] w-px bg-border" />
            {sessions.data.map((s) => (
              <li key={s.id} className="relative">
                <span
                  aria-hidden
                  className="absolute start-[calc(-1.5rem+0.25rem)] top-5 size-2.5 rounded-full border-2 border-primary bg-card"
                />
                <article className="rounded-md border border-border bg-card p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {t(`status.${s.status}`)}
                      </span>
                      <span className="text-xs text-muted-foreground">{t('startedOn', { date: formatDate(s.startedAt, lang) })}</span>
                      {s.completedAt ? (
                        <span className="text-xs text-muted-foreground">
                          {t('completedOn', { date: formatDate(s.completedAt, lang) })}
                        </span>
                      ) : null}
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/history/${s.id}`}>{t('viewDetails')}</Link>
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>
                      {t('questionsAnswered', {
                        answered: s.questionProgress.level2.answered,
                        total: s.questionProgress.level2.total,
                      })}
                    </span>
                    <span>
                      {t('chartLabel')}: {s.hasChart ? t('ready') : t('notReady')}
                    </span>
                    <span>
                      {t('remedyLabel')}: {s.hasRemedy ? t('ready') : t('notReady')}
                    </span>
                  </div>
                </article>
              </li>
            ))}
          </ol>

          {totalPages > 1 ? (
            <nav aria-label={t('pageOf', { current: page, total: totalPages })} className="mt-5 flex items-center justify-between gap-3">
              {page > 1 ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={page === 2 ? '/history' : `/history?page=${page - 1}`}>{t('previousPage')}</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  {t('previousPage')}
                </Button>
              )}
              <span className="text-xs text-muted-foreground">{t('pageOf', { current: page, total: totalPages })}</span>
              {page < totalPages ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/history?page=${page + 1}`}>{t('nextPage')}</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  {t('nextPage')}
                </Button>
              )}
            </nav>
          ) : null}
        </>
      ) : (
        <div className="rounded-md border border-dashed border-border bg-background p-6 text-center">
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
          <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground">{t('emptyExplainer')}</p>
          <Button asChild className="mt-4">
            <Link href="/app/questions">{t('startFirst')}</Link>
          </Button>
        </div>
      )}
    </main>
  );
}
