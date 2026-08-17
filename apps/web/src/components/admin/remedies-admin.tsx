'use client';

import { CATEGORIES, LEVELS, type Category, type Level, type Paginated, type Question, type Remedy } from '@silence/shared';
import { Ban, Loader2, Pencil, Plus, RefreshCw, Save, Sparkles, Trash2, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ErrorState } from '@/components/ui/screen-state';

type CategoryFilter = Category | 'all';
type LinkLevel = Level | 'none';

type RemedyFormState = {
  id?: string;
  category: Category;
  title: string;
  text: string;
  linkedLevel: LinkLevel;
  linkedQuestionId: string;
  priority: number;
  enabled: boolean;
  planetFilter: string;
  signFilter: string;
  houseFilter: string;
  keywordFilter: string;
};

const initialForm: RemedyFormState = {
  category: 'other',
  title: '',
  text: '',
  linkedLevel: 'none',
  linkedQuestionId: '',
  priority: 0,
  enabled: true,
  planetFilter: '',
  signFilter: '',
  houseFilter: '',
  keywordFilter: '',
};

/** How many rule fields a remedy declares — shown as a "targeting" badge in the list. */
function ruleFieldCount(remedy: Remedy) {
  return [remedy.linkedQuestionId, remedy.planetFilter, remedy.signFilter, remedy.houseFilter, remedy.keywordFilter].filter(
    Boolean,
  ).length;
}

const levelLabels: Record<Level, string> = {
  common: 'Common',
  level1: 'Level 1',
  level2: 'Level 2',
};

const categoryLabels: Record<Category, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
};

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message ?? 'Request failed');
  }
  return data as T;
}

const PAGE_SIZE = 20;

export function RemediesAdmin() {
  const searchParams = useSearchParams();
  const search = searchParams.get('q')?.trim() ?? '';
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [page, setPage] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<RemedyFormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Remedy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Any filter change invalidates the current page.
  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(page) });
    if (search) params.set('q', search);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    return params.toString();
  }, [categoryFilter, page, search]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const questionById = useMemo(() => new Map(questions.map((question) => [question.id, question])), [questions]);
  const linkedQuestions = useMemo(
    () =>
      questions.filter((question) => {
        const levelMatch = form.linkedLevel === 'none' || question.level === form.linkedLevel;
        const categoryMatch = question.category === form.category;
        return levelMatch && categoryMatch;
      }),
    [form.category, form.linkedLevel, questions],
  );

  const loadQuestions = useCallback(async () => {
    setQuestionsLoading(true);
    try {
      const result = await parseJson<Paginated<Question>>(await fetch('/api/admin/questions?limit=100'));
      setQuestions(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load questions');
    } finally {
      setQuestionsLoading(false);
    }
  }, []);

  const loadRemedies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await parseJson<Paginated<Remedy>>(await fetch(`/api/admin/remedies?${query}`));
      setRemedies(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load remedies');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    void loadRemedies();
  }, [loadRemedies]);

  function editRemedy(remedy: Remedy) {
    setForm({
      id: remedy.id,
      category: remedy.category,
      title: remedy.title,
      text: remedy.text,
      linkedLevel: remedy.linkedLevel ?? 'none',
      linkedQuestionId: remedy.linkedQuestionId ?? '',
      priority: remedy.priority ?? 0,
      enabled: remedy.enabled ?? true,
      planetFilter: remedy.planetFilter ?? '',
      signFilter: remedy.signFilter ?? '',
      houseFilter: remedy.houseFilter ?? '',
      keywordFilter: remedy.keywordFilter ?? '',
    });
    setError(null);
    setNotice(null);
  }

  async function saveRemedy() {
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const linkedTo =
        form.linkedLevel !== 'none' && form.linkedQuestionId
          ? { level: form.linkedLevel, questionId: form.linkedQuestionId }
          : undefined;
      const body = {
        category: form.category,
        title: form.title.trim(),
        text: form.text.trim(),
        ...(linkedTo ? { linkedTo } : {}),
        priority: form.priority,
        enabled: form.enabled,
        // null (not undefined) so clearing a field on an existing remedy actually clears it.
        planetFilter: form.planetFilter.trim() || null,
        signFilter: form.signFilter.trim() || null,
        houseFilter: form.houseFilter.trim() || null,
        keywordFilter: form.keywordFilter.trim() || null,
      };
      const url = form.id ? `/api/admin/remedies/${form.id}` : '/api/admin/remedies';
      const method = form.id ? 'PUT' : 'POST';

      await parseJson<Remedy>(
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
      );

      setForm(initialForm);
      setNotice(form.id ? 'Remedy updated.' : 'Remedy created.');
      await loadRemedies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save remedy');
    } finally {
      setSaving(false);
    }
  }

  async function deleteRemedy(remedy: Remedy) {
    setDeletingId(remedy.id);
    setError(null);
    setNotice(null);

    try {
      await parseJson<{ deleted: boolean }>(
        await fetch(`/api/admin/remedies/${remedy.id}`, {
          method: 'DELETE',
        }),
      );
      await loadRemedies();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete remedy');
    } finally {
      setDeletingId(null);
      setConfirmTarget(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Remedy bank</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">Category remedies</h2>
          </div>
          <Button type="button" variant="outline" onClick={loadRemedies} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : undefined} />
            Refresh
          </Button>
        </div>

        <div className="mt-4 max-w-sm space-y-2">
          <Label htmlFor="categoryFilter">Category</Label>
          <Select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </Select>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <form
          className="rounded-md border border-border bg-card p-4 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            void saveRemedy();
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-normal">{form.id ? 'Edit remedy' : 'Add remedy'}</h2>
            {form.id ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm(initialForm)}>
                <X />
                Cancel
              </Button>
            ) : null}
          </div>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value as Category, linkedQuestionId: '' }))
                }
                required
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text">Remedy text</Label>
              <textarea
                id="text"
                className="min-h-32 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                value={form.text}
                onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedLevel">Linked level</Label>
              <Select
                id="linkedLevel"
                value={form.linkedLevel}
                onChange={(event) =>
                  setForm((current) => ({ ...current, linkedLevel: event.target.value as LinkLevel, linkedQuestionId: '' }))
                }
              >
                <option value="none">No linked level</option>
                {LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {levelLabels[level]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedQuestion">Linked question</Label>
              <Select
                id="linkedQuestion"
                value={form.linkedQuestionId}
                onChange={(event) => setForm((current) => ({ ...current, linkedQuestionId: event.target.value }))}
                disabled={form.linkedLevel === 'none' || questionsLoading}
              >
                <option value="">Select question</option>
                {linkedQuestions.map((question) => (
                  <option key={question.id} value={question.id}>
                    {levelLabels[question.level]} / {question.text}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-3 rounded-md border border-dashed border-border p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="size-4 text-primary" />
                Targeting rules
              </div>
              <p className="text-xs text-muted-foreground">
                Optional — every filter set below must match for this remedy to be selected over a plainer one. Leave
                all blank for a category-wide fallback.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="planetFilter">Planet(s)</Label>
                  <Input
                    id="planetFilter"
                    placeholder="Saturn, Mars"
                    value={form.planetFilter}
                    onChange={(event) => setForm((current) => ({ ...current, planetFilter: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signFilter">Sign(s)</Label>
                  <Input
                    id="signFilter"
                    placeholder="Capricorn"
                    value={form.signFilter}
                    onChange={(event) => setForm((current) => ({ ...current, signFilter: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="houseFilter">House(s)</Label>
                  <Input
                    id="houseFilter"
                    placeholder="6, 8, 12"
                    value={form.houseFilter}
                    onChange={(event) => setForm((current) => ({ ...current, houseFilter: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywordFilter">Response keyword(s)</Label>
                  <Input
                    id="keywordFilter"
                    placeholder="burnout, exhausted"
                    value={form.keywordFilter}
                    onChange={(event) => setForm((current) => ({ ...current, keywordFilter: event.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={form.priority}
                    onChange={(event) => setForm((current) => ({ ...current, priority: Number(event.target.value) || 0 }))}
                  />
                </div>
                <label className="flex items-center gap-2 pt-7 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border"
                    checked={form.enabled}
                    onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))}
                  />
                  Enabled
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={saving || !form.title.trim() || !form.text.trim()}>
              {saving ? <Loader2 className="animate-spin" /> : form.id ? <Save /> : <Plus />}
              {form.id ? 'Save remedy' : 'Add remedy'}
            </Button>
          </div>
        </form>

        <section className="rounded-md border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold tracking-normal">Remedies</h2>
            <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
              {total} total
            </span>
          </div>

          {notice ? (
            <p className="m-4 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              {notice}
            </p>
          ) : null}
          {error ? (
            <div className="m-4">
              <ErrorState title="Unable to load remedies" message={error} action={{ label: 'Retry', onClick: loadRemedies }} />
            </div>
          ) : null}

          <div className="divide-y divide-border">
            {loading ? (
              <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="animate-spin" />
                Loading remedies
              </div>
            ) : remedies.length ? (
              remedies.map((remedy) => {
                const linkedQuestion = remedy.linkedQuestionId ? questionById.get(remedy.linkedQuestionId) : null;
                return (
                  <article key={remedy.id} className="grid gap-3 p-4 xl:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-md border border-border bg-background px-2 py-1">
                          {categoryLabels[remedy.category]}
                        </span>
                        {remedy.linkedLevel ? (
                          <span className="rounded-md border border-border bg-background px-2 py-1">
                            {levelLabels[remedy.linkedLevel]}
                          </span>
                        ) : null}
                        {ruleFieldCount(remedy) > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-primary">
                            <Sparkles className="size-3" />
                            {ruleFieldCount(remedy)} rule{ruleFieldCount(remedy) === 1 ? '' : 's'}
                          </span>
                        ) : null}
                        {remedy.priority ? (
                          <span className="rounded-md border border-border bg-background px-2 py-1">priority {remedy.priority}</span>
                        ) : null}
                        {remedy.enabled === false ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-destructive">
                            <Ban className="size-3" />
                            Disabled
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-2 text-sm font-semibold tracking-normal">{remedy.title}</h3>
                      <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">{remedy.text}</p>
                      {linkedQuestion ? (
                        <p className="mt-2 truncate text-xs text-muted-foreground">Linked: {linkedQuestion.text}</p>
                      ) : null}
                      {remedy.planetFilter || remedy.signFilter || remedy.houseFilter || remedy.keywordFilter ? (
                        <p className="mt-2 truncate text-xs text-muted-foreground">
                          {[
                            remedy.planetFilter && `planet: ${remedy.planetFilter}`,
                            remedy.signFilter && `sign: ${remedy.signFilter}`,
                            remedy.houseFilter && `house: ${remedy.houseFilter}`,
                            remedy.keywordFilter && `keyword: ${remedy.keywordFilter}`,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-start gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => editRemedy(remedy)}>
                        <Pencil />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmTarget(remedy)}
                        disabled={deletingId === remedy.id}
                      >
                        {deletingId === remedy.id ? <Loader2 className="animate-spin" /> : <Trash2 />}
                        Delete
                      </Button>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No remedies match these filters.</p>
            )}
          </div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page <= 1 || loading}>
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          ) : null}
        </section>
      </section>

      <ConfirmDialog
        open={confirmTarget !== null}
        onOpenChange={(next) => {
          if (!next) setConfirmTarget(null);
        }}
        title="Delete remedy?"
        description={confirmTarget ? `"${confirmTarget.title}" will be permanently removed.` : undefined}
        onConfirm={() => confirmTarget && void deleteRemedy(confirmTarget)}
        pending={deletingId !== null}
      />
    </div>
  );
}
