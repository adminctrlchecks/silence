'use client';

import { CATEGORIES, type Category, type Paginated, type ReadingSessionDetail, type ReadingSessionSummary } from '@silence/shared';
import type { AdminUserDetail, AdminUserSummary } from '@/lib/api';
import {
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FilterValue<T extends string> = T | 'all';
type SortBy = 'createdAt' | 'name' | 'responseCount' | 'chartCount';

const PAGE_SIZE = 20;

const categoryLabels: Record<Category, string> = { male: 'Male', female: 'Female', other: 'Other' };
const sortLabels: Record<SortBy, string> = {
  createdAt: 'Newest',
  name: 'Name',
  responseCount: 'Responses',
  chartCount: 'Charts',
};
const statusLabels: Record<string, string> = {
  draft: 'Draft',
  in_progress: 'In progress',
  chart_ready: 'Chart ready',
  remedy_ready: 'Remedy ready',
  complete: 'Complete',
};

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message ?? 'Request failed');
  }
  return data as T;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export function UsersAdmin() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FilterValue<Category>>('all');
  const [sortBy, setSortBy] = useState<SortBy>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [selected, setSelected] = useState<AdminUserDetail | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const [sessions, setSessions] = useState<ReadingSessionSummary[]>([]);
  const [selectedSession, setSelectedSession] = useState<ReadingSessionDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionDetailLoading, setSessionDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadSessions = useCallback(async (userId: string) => {
    setSessionsLoading(true);
    setSelectedSession(null);
    try {
      const result = await parseJson<Paginated<ReadingSessionSummary>>(
        await fetch(`/api/admin/users/${userId}/sessions?limit=50`),
      );
      setSessions(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load reading sessions');
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const loadDetail = useCallback(
    async (id: string) => {
      setDetailLoading(true);
      setError(null);

      try {
        const user = await parseJson<AdminUserDetail>(await fetch(`/api/admin/users/${id}`));
        selectedIdRef.current = user.id;
        setSelected(user);
        await loadSessions(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load user');
      } finally {
        setDetailLoading(false);
      }
    },
    [loadSessions],
  );

  const loadSessionDetail = useCallback(async (userId: string, sessionId: string) => {
    setSessionDetailLoading(true);
    try {
      const detail = await parseJson<ReadingSessionDetail>(
        await fetch(`/api/admin/users/${userId}/sessions/${sessionId}`),
      );
      setSelectedSession(detail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load reading session');
    } finally {
      setSessionDetailLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        page: String(page),
        sortBy,
        sortDir,
      });
      if (search) params.set('search', search);
      if (categoryFilter !== 'all') params.set('category', categoryFilter);

      const result = await parseJson<Paginated<AdminUserSummary>>(await fetch(`/api/admin/users?${params}`));
      setUsers(result.data);
      setTotal(result.total);
      if (result.data[0]) {
        if (!result.data.some((u) => u.id === selectedIdRef.current)) {
          await loadDetail(result.data[0].id);
        }
      } else {
        selectedIdRef.current = null;
        setSelected(null);
        setSessions([]);
        setSelectedSession(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, sortBy, sortDir, loadDetail]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  const sortOptions = useMemo(() => Object.entries(sortLabels) as [SortBy, string][], []);

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">User records</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">Profiles and reading journeys</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search, filter, and open a user to see their entire reading journey.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={loadUsers} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : undefined} />
            Refresh
          </Button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <form onSubmit={submitSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search name or contact…"
                className="pl-9"
                aria-label="Search users"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>

          <div className="space-y-1">
            <Label htmlFor="userCategoryFilter" className="sr-only">
              Category
            </Label>
            <select
              id="userCategoryFilter"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={categoryFilter}
              onChange={(event) => {
                setPage(1);
                setCategoryFilter(event.target.value as FilterValue<Category>);
              }}
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="userSortBy" className="sr-only">
              Sort by
            </Label>
            <select
              id="userSortBy"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={sortBy}
              onChange={(event) => {
                setPage(1);
                setSortBy(event.target.value as SortBy);
              }}
            >
              {sortOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  Sort: {label}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setPage(1);
              setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
            }}
            title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortDir === 'asc' ? <ArrowUpAZ /> : <ArrowDownAZ />}
          </Button>
        </div>
      </section>

      {error ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(22rem,26rem)_1fr]">
        <div className="rounded-md border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold tracking-normal">Users</h2>
            <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
              {total} total
            </span>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="animate-spin" />
                Loading users
              </div>
            ) : users.length ? (
              users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  className={`block w-full p-4 text-start transition-colors hover:bg-muted ${selected?.id === user.id ? 'bg-muted' : ''}`}
                  onClick={() => void loadDetail(user.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                      <UserRound className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{user.contact}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-md border border-border bg-background px-2 py-1">
                          {user.category}
                        </span>
                        <span className="rounded-md border border-border bg-background px-2 py-1">
                          {user.sessionCount} sessions
                        </span>
                        <span className="rounded-md border border-border bg-background px-2 py-1">
                          {user.responseCount} responses
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No users match these filters.</p>
            )}
          </div>
          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
              <Button type="button" variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft />
                Prev
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ChevronRight />
              </Button>
            </div>
          ) : null}
        </div>

        <div className="rounded-md border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold tracking-normal">User journey</h2>
          </div>

          {detailLoading ? (
            <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2 className="animate-spin" />
              Loading details
            </div>
          ) : selected ? (
            <div className="space-y-5 p-4">
              <div>
                <p className="text-2xl font-semibold tracking-normal">{selected.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{selected.contact}</p>
              </div>

              <dl className="grid gap-3 md:grid-cols-2">
                {[
                  ['Category', selected.category],
                  ['Language', selected.lang],
                  ['Date of birth', selected.dob],
                  ['Time of birth', selected.timeOfBirth],
                  ['Place of birth', `${selected.placeOfBirth.city}, ${selected.placeOfBirth.country}`],
                  ['Consent', selected.consent ? 'Yes' : 'No'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-md border border-border bg-background p-3">
                    <dt className="text-xs font-medium uppercase text-muted-foreground">{label}</dt>
                    <dd className="mt-1 break-words text-sm font-medium">{value}</dd>
                  </div>
                ))}
              </dl>

              <section className="rounded-md border border-border bg-background p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarClock className="size-4 text-primary" />
                  Reading sessions
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
                  <div className="space-y-2">
                    {sessionsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="animate-spin" />
                        Loading sessions
                      </div>
                    ) : sessions.length ? (
                      sessions.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => void loadSessionDetail(selected.id, s.id)}
                          className={`block w-full rounded-md border p-3 text-start text-xs transition-colors hover:bg-muted ${
                            selectedSession?.id === s.id ? 'border-primary bg-primary/5' : 'border-border bg-card'
                          }`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md border border-border bg-background px-2 py-1 font-medium">
                              {statusLabels[s.status] ?? s.status}
                            </span>
                            <span className="text-muted-foreground">{formatDate(s.startedAt)}</span>
                          </div>
                          <p className="mt-2 text-muted-foreground">
                            Common {s.questionProgress.common.answered}/{s.questionProgress.common.total} · Level1{' '}
                            {s.questionProgress.level1.answered}/{s.questionProgress.level1.total} · Level2{' '}
                            {s.questionProgress.level2.answered}/{s.questionProgress.level2.total}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {s.hasChart ? 'Chart generated' : 'No chart yet'} · {s.hasRemedy ? 'Remedy shown' : 'No remedy yet'}
                          </p>
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No reading sessions yet.</p>
                    )}
                  </div>

                  <div className="rounded-md border border-border bg-card p-3">
                    {sessionDetailLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="animate-spin" />
                        Loading session
                      </div>
                    ) : selectedSession ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold">Responses</p>
                          <div className="mt-2 space-y-2">
                            {selectedSession.responses.length ? (
                              selectedSession.responses.map((r) => (
                                <div key={r.id} className="rounded-md border border-border bg-background p-2 text-xs">
                                  <div className="flex items-center justify-between text-muted-foreground">
                                    <span>{r.level}</span>
                                    <span>{formatDate(r.createdAt)}</span>
                                  </div>
                                  <p className="mt-1 break-words">{r.value}</p>
                                  {r.answerTextShown ? (
                                    <p className="mt-1 break-words rounded-sm bg-primary/5 p-1.5 text-primary">
                                      {r.answerTextShown}
                                    </p>
                                  ) : null}
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground">No responses saved.</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-semibold">Chart</p>
                          {selectedSession.chart ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                              {selectedSession.chart.style} · generated {formatDate(selectedSession.chart.createdAt)}
                            </p>
                          ) : (
                            <p className="mt-2 text-xs text-muted-foreground">No chart generated for this session.</p>
                          )}
                        </div>

                        <div>
                          <p className="flex items-center gap-1 text-sm font-semibold">
                            <Sparkles className="size-3.5 text-primary" />
                            Remedy
                          </p>
                          {selectedSession.remedy ? (
                            <div className="mt-2 text-xs">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{selectedSession.remedy.title}</p>
                                <span
                                  className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                                    selectedSession.remedy.source === 'rule'
                                      ? 'border-primary/30 bg-primary/10 text-primary'
                                      : 'border-border bg-background text-muted-foreground'
                                  }`}
                                >
                                  {selectedSession.remedy.source === 'rule' ? 'Rule match' : 'Category fallback'}
                                </span>
                              </div>
                              <p className="mt-1 text-muted-foreground">{selectedSession.remedy.text}</p>
                              {selectedSession.remedy.matchDetail ? (
                                <p className="mt-1 rounded-sm bg-primary/5 p-1.5 text-primary">
                                  Why: {selectedSession.remedy.matchDetail}
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs text-muted-foreground">No remedy shown for this session.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Select a session to see its detail.</p>
                    )}
                  </div>
                </div>
              </section>

              <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-md border border-border bg-background p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <CalendarClock className="size-4 text-primary" />
                    All saved responses
                  </div>
                  <div className="mt-3 max-h-64 space-y-3 overflow-y-auto">
                    {selected.responses.length ? (
                      selected.responses.map((response) => (
                        <article key={response.id} className="rounded-md border border-border bg-card p-3">
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>{response.level}</span>
                            <span>{formatDate(response.createdAt)}</span>
                          </div>
                          <p className="mt-2 break-words text-sm">{response.value}</p>
                        </article>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No responses saved yet.</p>
                    )}
                  </div>
                </section>

                <section className="rounded-md border border-border bg-background p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="size-4 text-primary" />
                    All charts
                  </div>
                  <div className="mt-3 max-h-64 space-y-3 overflow-y-auto">
                    {selected.charts.length ? (
                      selected.charts.map((chart) => (
                        <article key={chart.id} className="rounded-md border border-border bg-card p-3">
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>{chart.style}</span>
                            <span>{formatDate(chart.createdAt)}</span>
                          </div>
                          <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">
                            {chart.interpretation ?? 'No interpretation saved.'}
                          </p>
                        </article>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No charts generated yet.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">Select a user to view details.</p>
          )}
        </div>
      </section>
    </div>
  );
}
