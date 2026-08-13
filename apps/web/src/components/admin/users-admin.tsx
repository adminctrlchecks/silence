'use client';

import type { Paginated } from '@silence/shared';
import type { AdminUserDetail, AdminUserSummary } from '@/lib/api';
import { CalendarClock, Loader2, MapPin, RefreshCw, UserRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

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
  const [selected, setSelected] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async (id: string) => {
    setDetailLoading(true);
    setError(null);

    try {
      const user = await parseJson<AdminUserDetail>(await fetch(`/api/admin/users/${id}`));
      setSelected(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load user');
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await parseJson<Paginated<AdminUserSummary>>(
        await fetch('/api/admin/users?limit=100'),
      );
      setUsers(result.data);
      if (result.data[0]) {
        await loadDetail(result.data[0].id);
      } else {
        setSelected(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load users');
    } finally {
      setLoading(false);
    }
  }, [loadDetail]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">User records</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">Profiles and saved sessions</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review registered users, birth details, answers, and generated charts.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={loadUsers} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : undefined} />
            Refresh
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
              {users.length} shown
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
                  className="block w-full p-4 text-start transition-colors hover:bg-muted"
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
                          {user.responseCount} responses
                        </span>
                        <span className="rounded-md border border-border bg-background px-2 py-1">
                          {user.chartCount} charts
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No users have registered yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-md border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold tracking-normal">User details</h2>
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

              <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-md border border-border bg-background p-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <CalendarClock className="size-4 text-primary" />
                    Responses
                  </div>
                  <div className="mt-3 space-y-3">
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
                    Charts
                  </div>
                  <div className="mt-3 space-y-3">
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
