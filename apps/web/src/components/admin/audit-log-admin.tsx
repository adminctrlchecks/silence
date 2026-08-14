'use client';

import { ADMIN_AUDIT_ACTIONS, type AdminAuditAction, type AdminAuditLogEntry, type Paginated } from '@silence/shared';
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type ActionFilter = AdminAuditAction | 'all';

const PAGE_SIZE = 20;

const actionLabels: Record<AdminAuditAction, string> = {
  admin_login: 'Admin login',
  admin_password_change: 'Password changed',
  admin_password_reset: 'Password reset',
  admin_impersonate_user: 'User app access',
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

function targetLabel(entry: AdminAuditLogEntry) {
  if (!entry.targetType && !entry.targetId) return 'None';
  if (entry.targetType && entry.targetId) return `${entry.targetType}: ${entry.targetId}`;
  return entry.targetId ?? entry.targetType ?? 'None';
}

export function AuditLogAdmin() {
  const [entries, setEntries] = useState<AdminAuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<ActionFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const actionOptions = useMemo(() => ADMIN_AUDIT_ACTIONS.map((value) => [value, actionLabels[value]] as const), []);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (action !== 'all') params.set('action', action);

      const result = await parseJson<Paginated<AdminAuditLogEntry>>(await fetch(`/api/admin/audit-log?${params}`));
      setEntries(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load audit log');
    } finally {
      setLoading(false);
    }
  }, [action, page]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Security audit</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">Admin activity log</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Recent sensitive admin events including sign-ins, password changes, resets, and user app access.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={loadEntries} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : undefined} />
            Refresh
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <Label htmlFor="auditActionFilter" className="sr-only">
              Action
            </Label>
            <select
              id="auditActionFilter"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={action}
              onChange={(event) => {
                setPage(1);
                setAction(event.target.value as ActionFilter);
              }}
            >
              <option value="all">All actions</option>
              {actionOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-muted-foreground">{total} matching events</span>
        </div>
      </section>

      {error ? (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="rounded-md border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h2 className="text-base font-semibold tracking-normal">Recent events</h2>
          </div>
          <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="px-4 py-2 text-start">Action</th>
                <th className="px-4 py-2 text-start">Admin</th>
                <th className="px-4 py-2 text-start">Target</th>
                <th className="px-4 py-2 text-start">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" />
                      Loading audit log
                    </span>
                  </td>
                </tr>
              ) : entries.length ? (
                entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{actionLabels[entry.action] ?? entry.action}</div>
                      <div className="mt-1 font-mono text-xs text-muted-foreground">{entry.action}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{entry.adminEmail}</div>
                      <div className="mt-1 font-mono text-xs text-muted-foreground">{entry.adminId}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="break-all font-mono text-xs">{targetLabel(entry)}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(entry.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-sm text-muted-foreground">
                    No audit events match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
          <Button type="button" variant="ghost" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft />
            Prev
          </Button>
          <span className="text-xs text-muted-foreground">
            {entries.length ? `${(page - 1) * PAGE_SIZE + 1}-${(page - 1) * PAGE_SIZE + entries.length}` : '0'} of {total}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      </section>
    </div>
  );
}
