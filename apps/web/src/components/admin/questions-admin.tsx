'use client';

import { CATEGORIES, LEVELS, type Category, type Level, type Paginated, type Question } from '@silence/shared';
import { Loader2, Pencil, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

type FilterValue<T extends string> = T | 'all';

type QuestionFormState = {
  id?: string;
  level: Level;
  category: Category;
  text: string;
  order: string;
};

const initialForm: QuestionFormState = {
  level: 'common',
  category: 'other',
  text: '',
  order: '0',
};

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

export function QuestionsAdmin() {
  const searchParams = useSearchParams();
  const search = searchParams.get('q')?.trim() ?? '';
  const [levelFilter, setLevelFilter] = useState<FilterValue<Level>>('all');
  const [categoryFilter, setCategoryFilter] = useState<FilterValue<Category>>('all');
  const [page, setPage] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState<QuestionFormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Question | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Any filter change invalidates the current page — restart from page 1
  // rather than risk landing on a now-empty or out-of-range page.
  useEffect(() => {
    setPage(1);
  }, [search, levelFilter, categoryFilter]);

  const query = useMemo(() => {
    const params = new URLSearchParams({ limit: String(PAGE_SIZE), page: String(page) });
    if (search) params.set('q', search);
    if (levelFilter !== 'all') params.set('level', levelFilter);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    return params.toString();
  }, [categoryFilter, levelFilter, page, search]);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await parseJson<Paginated<Question>>(await fetch(`/api/admin/questions?${query}`));
      setQuestions(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load questions');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function editQuestion(question: Question) {
    setForm({
      id: question.id,
      level: question.level,
      category: question.category,
      text: question.text,
      order: String(question.order),
    });
    setError(null);
  }

  async function saveQuestion() {
    setSaving(true);
    setError(null);

    try {
      const body = {
        level: form.level,
        category: form.category,
        text: form.text.trim(),
        order: Number.parseInt(form.order, 10) || 0,
      };
      const url = form.id ? `/api/admin/questions/${form.id}` : '/api/admin/questions';
      const method = form.id ? 'PUT' : 'POST';

      await parseJson<Question>(
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
      );

      setForm(initialForm);
      await loadQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save question');
    } finally {
      setSaving(false);
    }
  }

  async function deleteQuestion(question: Question) {
    setDeletingId(question.id);
    setError(null);

    try {
      await parseJson<{ deleted: boolean }>(
        await fetch(`/api/admin/questions/${question.id}`, {
          method: 'DELETE',
        }),
      );
      await loadQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete question');
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
            <p className="text-sm font-medium text-primary">Question bank</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">Level-wise questions</h2>
          </div>
          <Button type="button" variant="outline" onClick={loadQuestions} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : undefined} />
            Refresh
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="levelFilter">Level</Label>
            <Select
              id="levelFilter"
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value as FilterValue<Level>)}
            >
              <option value="all">All levels</option>
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {levelLabels[level]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryFilter">Category</Label>
            <Select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as FilterValue<Category>)}
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <form
          className="rounded-md border border-border bg-card p-4 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            void saveQuestion();
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold tracking-normal">
              {form.id ? 'Edit question' : 'Add question'}
            </h2>
            {form.id ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setForm(initialForm)}>
                <X />
                Cancel
              </Button>
            ) : null}
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  id="level"
                  value={form.level}
                  onChange={(event) => setForm((current) => ({ ...current, level: event.target.value as Level }))}
                  required
                >
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {levelLabels[level]}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as Category }))}
                  required
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {categoryLabels[category]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                min="0"
                value={form.order}
                onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text">Question text</Label>
              <textarea
                id="text"
                className="min-h-28 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                value={form.text}
                onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving || !form.text.trim()}>
              {saving ? <Loader2 className="animate-spin" /> : form.id ? <Save /> : <Plus />}
              {form.id ? 'Save changes' : 'Add question'}
            </Button>
          </div>
        </form>

        <section className="rounded-md border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold tracking-normal">Questions</h2>
            <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
              {total} total
            </span>
          </div>

          {error ? (
            <p role="alert" className="m-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <div className="divide-y divide-border">
            {loading ? (
              <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="animate-spin" />
                Loading questions
              </div>
            ) : questions.length ? (
              questions.map((question) => (
                <article key={question.id} className="grid gap-3 p-4 xl:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-md border border-border bg-background px-2 py-1">
                        {levelLabels[question.level]}
                      </span>
                      <span className="rounded-md border border-border bg-background px-2 py-1">
                        {categoryLabels[question.category]}
                      </span>
                      <span className="rounded-md border border-border bg-background px-2 py-1">
                        Order {question.order}
                      </span>
                    </div>
                    <p className="mt-2 break-words text-sm leading-6">{question.text}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => editQuestion(question)}>
                      <Pencil />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmTarget(question)}
                      disabled={deletingId === question.id}
                    >
                      {deletingId === question.id ? <Loader2 className="animate-spin" /> : <Trash2 />}
                      Delete
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No questions match these filters.</p>
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
        title="Delete question?"
        description={confirmTarget ? `"${confirmTarget.text}" will be permanently removed.` : undefined}
        onConfirm={() => confirmTarget && void deleteQuestion(confirmTarget)}
        pending={deletingId !== null}
      />
    </div>
  );
}
