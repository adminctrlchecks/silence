'use client';

import type { AdminDashboardMetrics, Category, ContentMatrix, Level } from '@silence/shared';
import Link from 'next/link';
import { AlertTriangle, Bot, RefreshCw, Sparkles, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ErrorState, LoadingState } from '@/components/ui/screen-state';

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message ?? 'Request failed');
  }
  return data as T;
}

const levelLabels: Record<Level, string> = { common: 'Common', level1: 'Level 1', level2: 'Level 2' };
const categoryLabels: Record<Category, string> = { male: 'Male', female: 'Female', other: 'Other' };

function StatCard({ value, label, detail, warn }: { value: string | number; label: string; detail: string; warn?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-card p-4 shadow-sm">
      <p className={warn ? 'text-2xl font-semibold tracking-normal text-destructive' : 'text-2xl font-semibold tracking-normal'}>
        {value}
      </p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

export function DashboardOverview() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [matrix, setMatrix] = useState<ContentMatrix | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, cm] = await Promise.all([
        parseJson<AdminDashboardMetrics>(await fetch('/api/admin/dashboard/metrics')),
        parseJson<ContentMatrix>(await fetch('/api/admin/dashboard/content-matrix')),
      ]);
      setMetrics(m);
      setMatrix(cm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !metrics) {
    return <LoadingState title="Loading live metrics" />;
  }

  if (error || !metrics || !matrix) {
    return <ErrorState title="Unable to load dashboard" message={error ?? undefined} action={{ label: 'Retry', onClick: load }} />;
  }

  const missingRemedyCategories = metrics.remedies.categoriesMissingRemedy;
  const failedImports = metrics.imports.failed;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-normal">Live product health</h2>
        <Button type="button" variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : undefined} />
          Refresh
        </Button>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          value={metrics.users.total}
          label="Total users"
          detail={`+${metrics.users.newToday} today, +${metrics.users.newThisWeek} this week, +${metrics.users.newThisMonth} this month`}
        />
        <StatCard
          value={metrics.sessions.byStatus.complete}
          label="Completed readings"
          detail={`${metrics.sessions.byStatus.in_progress + metrics.sessions.byStatus.chart_ready + metrics.sessions.byStatus.remedy_ready} in progress, ${metrics.sessions.byStatus.draft} draft`}
        />
        <StatCard
          value={metrics.answers.unreviewedAi}
          label="Unreviewed AI answers"
          detail={metrics.answers.unreviewedAi > 0 ? 'Waiting in the review queue' : 'Queue is clear'}
          warn={metrics.answers.unreviewedAi > 0}
        />
        <StatCard
          value={`${metrics.questions.active}/${metrics.questions.total}`}
          label="Active questions"
          detail="Questions currently shown to users"
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          value={missingRemedyCategories.length}
          label="Categories missing a remedy"
          detail={missingRemedyCategories.length ? missingRemedyCategories.map((c) => categoryLabels[c]).join(', ') : 'All categories covered'}
          warn={missingRemedyCategories.length > 0}
        />
        <StatCard
          value={metrics.chart.aiFallbackCount}
          label="Chart AI fallbacks"
          detail={`${metrics.chart.total} charts generated total`}
          warn={metrics.chart.aiFallbackCount > 0}
        />
        <StatCard
          value={failedImports}
          label="Failed import jobs"
          detail={`${metrics.imports.total} import jobs total`}
          warn={failedImports > 0}
        />
        <StatCard value={metrics.sessions.total} label="Reading sessions" detail="All-time, every status" />
      </section>

      {metrics.answers.unreviewedAi > 0 ? (
        <Link
          href="/admin/answers?source=ai&reviewed=false"
          className="flex items-center gap-3 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <Bot className="size-5 shrink-0" />
          {metrics.answers.unreviewedAi} AI-generated answer{metrics.answers.unreviewedAi === 1 ? '' : 's'} waiting for review — open the queue
        </Link>
      ) : null}

      <section className="rounded-md border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold tracking-normal">Translation completeness</h2>
          <p className="mt-1 text-xs text-muted-foreground">Rows with a translation for each entity, by language.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs uppercase text-muted-foreground">
                <th className="px-4 py-2 text-start">Language</th>
                <th className="px-4 py-2 text-start">Questions</th>
                <th className="px-4 py-2 text-start">Answers</th>
                <th className="px-4 py-2 text-start">Remedies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {metrics.translations.map((t) => (
                <tr key={t.lang}>
                  <td className="px-4 py-2 font-medium uppercase">{t.lang}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {t.questionsTranslated}/{t.questionsTotal}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {t.answersTranslated}/{t.answersTotal}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {t.remediesTranslated}/{t.remediesTotal}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-md border border-border bg-card shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold tracking-normal">Content completeness matrix</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Levels × categories: question coverage, remedies, and full-language translation reach.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="px-4 py-2 text-start">Level</th>
                <th className="px-4 py-2 text-start">Category</th>
                <th className="px-4 py-2 text-start">Questions</th>
                <th className="px-4 py-2 text-start">Answered</th>
                <th className="px-4 py-2 text-start">Reviewed</th>
                <th className="px-4 py-2 text-start">Remedies</th>
                <th className="px-4 py-2 text-start">Fully translated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {matrix.cells.map((cell) => {
                const fullyTranslated = cell.languages.filter(
                  (l) => cell.questionsTotal > 0 && l.questionsTranslated === cell.questionsTotal,
                );
                const incompleteLangs = cell.languages
                  .filter((l) => !(cell.questionsTotal > 0 && l.questionsTranslated === cell.questionsTotal))
                  .map((l) => l.lang);
                const gap = cell.questionsTotal > 0 && cell.questionsWithAnswer < cell.questionsTotal;
                return (
                  <tr key={`${cell.level}:${cell.category}`} className={gap ? 'bg-destructive/5' : undefined}>
                    <td className="px-4 py-2 font-medium">{levelLabels[cell.level]}</td>
                    <td className="px-4 py-2">{categoryLabels[cell.category]}</td>
                    <td className="px-4 py-2 text-muted-foreground">{cell.questionsTotal}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {cell.questionsWithAnswer}/{cell.questionsTotal}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {cell.questionsWithReviewedAnswer}/{cell.questionsTotal}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {cell.remedyCount === 0 ? (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <AlertTriangle className="size-3.5" />0
                        </span>
                      ) : (
                        cell.remedyCount
                      )}
                    </td>
                    <td
                      className="px-4 py-2 text-muted-foreground"
                      title={incompleteLangs.length ? `Incomplete: ${incompleteLangs.join(', ')}` : 'All languages complete'}
                    >
                      {fullyTranslated.length}/{cell.languages.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {metrics.imports.recentFailures.length > 0 ? (
        <section className="rounded-md border border-destructive/30 bg-destructive/5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-destructive/20 px-4 py-3">
            <Sparkles className="size-4 text-destructive" />
            <h2 className="text-base font-semibold tracking-normal text-destructive">Recent import failures</h2>
          </div>
          <ul className="divide-y divide-destructive/10">
            {metrics.imports.recentFailures.map((job) => (
              <li key={job.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="font-medium">{job.type}</span>
                <span className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link
        href="/admin/users"
        className="flex items-center gap-3 rounded-md border border-border bg-card p-4 text-sm font-medium transition-colors hover:bg-muted"
      >
        <Users className="size-5 shrink-0 text-primary" />
        Browse users, search, and inspect a full reading journey
      </Link>
    </div>
  );
}
