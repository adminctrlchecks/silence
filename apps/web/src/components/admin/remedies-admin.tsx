'use client';

import { CATEGORIES, LEVELS, type Category, type Level, type Paginated, type Question, type Remedy } from '@silence/shared';
import { Loader2, Pencil, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type CategoryFilter = Category | 'all';
type LinkLevel = Level | 'none';

type RemedyFormState = {
  id?: string;
  category: Category;
  title: string;
  text: string;
  linkedLevel: LinkLevel;
  linkedQuestionId: string;
};

const initialForm: RemedyFormState = {
  category: 'other',
  title: '',
  text: '',
  linkedLevel: 'none',
  linkedQuestionId: '',
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

export function RemediesAdmin() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [form, setForm] = useState<RemedyFormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({ limit: '100' });
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    return params.toString();
  }, [categoryFilter]);

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
    if (!window.confirm(`Delete "${remedy.title}"?`)) return;

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
          <select
            id="categoryFilter"
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
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
              <select
                id="category"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              </select>
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
              <select
                id="linkedLevel"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedQuestion">Linked question</Label>
              <select
                id="linkedQuestion"
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              </select>
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
              {remedies.length} shown
            </span>
          </div>

          {notice ? (
            <p className="m-4 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              {notice}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="m-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
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
                      </div>
                      <h3 className="mt-2 text-sm font-semibold tracking-normal">{remedy.title}</h3>
                      <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">{remedy.text}</p>
                      {linkedQuestion ? (
                        <p className="mt-2 truncate text-xs text-muted-foreground">Linked: {linkedQuestion.text}</p>
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
                        onClick={() => void deleteRemedy(remedy)}
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
        </section>
      </section>
    </div>
  );
}
