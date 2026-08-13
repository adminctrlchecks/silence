'use client';

import {
  ANSWER_SOURCES,
  CATEGORIES,
  LANGUAGES,
  type Answer,
  type AnswerSource,
  type Category,
  type Level,
  type Paginated,
  type Question,
} from '@silence/shared';
import { Bot, Check, Loader2, Pencil, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type FilterValue<T extends string> = T | 'all';
type ReviewedFilter = 'all' | 'true' | 'false';

type AnswerFormState = {
  id?: string;
  questionId: string;
  level: Level;
  category: Category;
  source: AnswerSource;
  text: string;
  reviewed: boolean;
};

type AiFormState = {
  questionId: string;
  level: Level;
  category: Category;
  lang: string;
};

const answerLevels: Level[] = ['level1', 'level2'];

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

const initialForm: AnswerFormState = {
  questionId: '',
  level: 'level1',
  category: 'other',
  source: 'admin',
  text: '',
  reviewed: true,
};

const initialAiForm: AiFormState = {
  questionId: '',
  level: 'level1',
  category: 'other',
  lang: 'en',
};

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message ?? 'Request failed');
  }
  return data as T;
}

function validSource(value: string | null): FilterValue<AnswerSource> {
  return value === 'admin' || value === 'ai' ? value : 'all';
}

function validReviewed(value: string | null): ReviewedFilter {
  return value === 'true' || value === 'false' ? value : 'all';
}

export function AnswersAdmin() {
  const searchParams = useSearchParams();
  const [levelFilter, setLevelFilter] = useState<FilterValue<Level>>('all');
  const [categoryFilter, setCategoryFilter] = useState<FilterValue<Category>>('all');
  const [sourceFilter, setSourceFilter] = useState<FilterValue<AnswerSource>>(() => validSource(searchParams.get('source')));
  const [reviewedFilter, setReviewedFilter] = useState<ReviewedFilter>(() => validReviewed(searchParams.get('reviewed')));
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [form, setForm] = useState<AnswerFormState>(initialForm);
  const [aiForm, setAiForm] = useState<AiFormState>(initialAiForm);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const questionById = useMemo(() => new Map(questions.map((question) => [question.id, question])), [questions]);

  const answerQuery = useMemo(() => {
    const params = new URLSearchParams({ limit: '100' });
    if (levelFilter !== 'all') params.set('level', levelFilter);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (sourceFilter !== 'all') params.set('source', sourceFilter);
    if (reviewedFilter !== 'all') params.set('reviewed', reviewedFilter);
    return params.toString();
  }, [categoryFilter, levelFilter, reviewedFilter, sourceFilter]);

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

  const loadAnswers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await parseJson<Paginated<Answer>>(await fetch(`/api/admin/answers?${answerQuery}`));
      setAnswers(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load answers');
    } finally {
      setLoading(false);
    }
  }, [answerQuery]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    void loadAnswers();
  }, [loadAnswers]);

  useEffect(() => {
    const firstQuestionId = questions[0]?.id;
    if (!firstQuestionId) return;

    setForm((current) => (current.questionId ? current : { ...current, questionId: firstQuestionId }));
    setAiForm((current) => (current.questionId ? current : { ...current, questionId: firstQuestionId }));
  }, [questions]);

  function editAnswer(answer: Answer) {
    setForm({
      id: answer.id,
      questionId: answer.questionId,
      level: answer.level,
      category: answer.category,
      source: answer.source,
      text: answer.text,
      reviewed: answer.reviewed,
    });
    setError(null);
    setNotice(null);
  }

  async function saveAnswer() {
    if (!form.questionId) {
      setError('Select a question before saving an answer.');
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const baseBody = {
        questionId: form.questionId,
        level: form.level,
        category: form.category,
        source: form.source,
        text: form.text.trim(),
      };
      const body = form.id ? { ...baseBody, reviewed: form.reviewed } : baseBody;
      const url = form.id ? `/api/admin/answers/${form.id}` : '/api/admin/answers';
      const method = form.id ? 'PUT' : 'POST';

      await parseJson<Answer>(
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
      );

      setForm((current) => ({ ...initialForm, questionId: current.questionId }));
      setNotice(form.id ? 'Answer updated.' : 'Answer created.');
      await loadAnswers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save answer');
    } finally {
      setSaving(false);
    }
  }

  async function generateAnswer() {
    if (!aiForm.questionId) {
      setError('Select a question before generating an answer.');
      return;
    }

    setGenerating(true);
    setError(null);
    setNotice(null);

    try {
      await parseJson<Answer>(
        await fetch('/api/admin/answers/ai-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(aiForm),
        }),
      );
      setSourceFilter('ai');
      setReviewedFilter('false');
      setNotice('AI answer generated and added to the review queue.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate answer');
    } finally {
      setGenerating(false);
    }
  }

  async function approveAnswer(answer: Answer) {
    setError(null);
    setNotice(null);

    try {
      await parseJson<Answer>(
        await fetch(`/api/admin/answers/${answer.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reviewed: true }),
        }),
      );
      setNotice('Answer approved.');
      await loadAnswers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to approve answer');
    }
  }

  async function deleteAnswer(answer: Answer) {
    if (!window.confirm(`Delete this ${answer.source} answer?`)) return;

    setDeletingId(answer.id);
    setError(null);
    setNotice(null);

    try {
      await parseJson<{ deleted: boolean }>(
        await fetch(`/api/admin/answers/${answer.id}`, {
          method: 'DELETE',
        }),
      );
      await loadAnswers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete answer');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Answer bank</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">Answers and AI review</h2>
          </div>
          <Button type="button" variant="outline" onClick={loadAnswers} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : undefined} />
            Refresh
          </Button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="levelFilter">Level</Label>
            <select
              id="levelFilter"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value as FilterValue<Level>)}
            >
              <option value="all">All levels</option>
              {answerLevels.map((level) => (
                <option key={level} value={level}>
                  {levelLabels[level]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryFilter">Category</Label>
            <select
              id="categoryFilter"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as FilterValue<Category>)}
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sourceFilter">Source</Label>
            <select
              id="sourceFilter"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value as FilterValue<AnswerSource>)}
            >
              <option value="all">All sources</option>
              {ANSWER_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source === 'ai' ? 'AI' : 'Admin'}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reviewedFilter">Review</Label>
            <select
              id="reviewedFilter"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={reviewedFilter}
              onChange={(event) => setReviewedFilter(event.target.value as ReviewedFilter)}
            >
              <option value="all">All states</option>
              <option value="true">Reviewed</option>
              <option value="false">Unreviewed</option>
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <div className="space-y-5">
          <form
            className="rounded-md border border-border bg-card p-4 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              void saveAnswer();
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold tracking-normal">{form.id ? 'Edit answer' : 'Add answer'}</h2>
              {form.id ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => setForm(initialForm)}>
                  <X />
                  Cancel
                </Button>
              ) : null}
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="answerQuestion">Question</Label>
                <select
                  id="answerQuestion"
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.questionId}
                  onChange={(event) => setForm((current) => ({ ...current, questionId: event.target.value }))}
                  disabled={questionsLoading}
                  required
                >
                  <option value="">Select question</option>
                  {questions.map((question) => (
                    <option key={question.id} value={question.id}>
                      {levelLabels[question.level]} / {categoryLabels[question.category]} / {question.text}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="answerLevel">Level</Label>
                  <select
                    id="answerLevel"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.level}
                    onChange={(event) => setForm((current) => ({ ...current, level: event.target.value as Level }))}
                    required
                  >
                    {answerLevels.map((level) => (
                      <option key={level} value={level}>
                        {levelLabels[level]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answerCategory">Category</Label>
                  <select
                    id="answerCategory"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as Category }))}
                    required
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {categoryLabels[category]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="answerSource">Source</Label>
                  <select
                    id="answerSource"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.source}
                    onChange={(event) => setForm((current) => ({ ...current, source: event.target.value as AnswerSource }))}
                    required
                  >
                    {ANSWER_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {source === 'ai' ? 'AI' : 'Admin'}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 pt-7 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border"
                    checked={form.reviewed}
                    onChange={(event) => setForm((current) => ({ ...current, reviewed: event.target.checked }))}
                  />
                  Reviewed
                </label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="answerText">Answer text</Label>
                <textarea
                  id="answerText"
                  className="min-h-32 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.text}
                  onChange={(event) => setForm((current) => ({ ...current, text: event.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving || !form.text.trim() || !form.questionId}>
                {saving ? <Loader2 className="animate-spin" /> : form.id ? <Save /> : <Plus />}
                {form.id ? 'Save answer' : 'Add answer'}
              </Button>
            </div>
          </form>

          <form
            className="rounded-md border border-border bg-card p-4 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              void generateAnswer();
            }}
          >
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-primary" />
              <h2 className="text-base font-semibold tracking-normal">AI Mode</h2>
            </div>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aiQuestion">Question</Label>
                <select
                  id="aiQuestion"
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={aiForm.questionId}
                  onChange={(event) => setAiForm((current) => ({ ...current, questionId: event.target.value }))}
                  disabled={questionsLoading}
                  required
                >
                  <option value="">Select question</option>
                  {questions.map((question) => (
                    <option key={question.id} value={question.id}>
                      {levelLabels[question.level]} / {categoryLabels[question.category]} / {question.text}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="aiLevel">Level</Label>
                  <select
                    id="aiLevel"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={aiForm.level}
                    onChange={(event) => setAiForm((current) => ({ ...current, level: event.target.value as Level }))}
                  >
                    {answerLevels.map((level) => (
                      <option key={level} value={level}>
                        {levelLabels[level]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aiCategory">Category</Label>
                  <select
                    id="aiCategory"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={aiForm.category}
                    onChange={(event) => setAiForm((current) => ({ ...current, category: event.target.value as Category }))}
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {categoryLabels[category]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aiLang">Language</Label>
                <select
                  id="aiLang"
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={aiForm.lang}
                  onChange={(event) => setAiForm((current) => ({ ...current, lang: event.target.value }))}
                >
                  {LANGUAGES.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={generating || !aiForm.questionId}>
                {generating ? <Loader2 className="animate-spin" /> : <Bot />}
                Generate unreviewed answer
              </Button>
            </div>
          </form>
        </div>

        <section className="rounded-md border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold tracking-normal">Answers</h2>
            <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
              {answers.length} shown
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
                Loading answers
              </div>
            ) : answers.length ? (
              answers.map((answer) => {
                const question = questionById.get(answer.questionId);
                return (
                  <article key={answer.id} className="grid gap-3 p-4 2xl:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-md border border-border bg-background px-2 py-1">
                          {levelLabels[answer.level]}
                        </span>
                        <span className="rounded-md border border-border bg-background px-2 py-1">
                          {categoryLabels[answer.category]}
                        </span>
                        <span className="rounded-md border border-border bg-background px-2 py-1">
                          {answer.source === 'ai' ? 'AI' : 'Admin'}
                        </span>
                        <span className="rounded-md border border-border bg-background px-2 py-1">
                          {answer.reviewed ? 'Reviewed' : 'Unreviewed'}
                        </span>
                      </div>
                      <p className="mt-2 truncate text-xs text-muted-foreground">
                        {question ? question.text : answer.questionId}
                      </p>
                      <p className="mt-2 break-words text-sm leading-6">{answer.text}</p>
                    </div>
                    <div className="flex flex-wrap items-start gap-2">
                      {!answer.reviewed ? (
                        <Button type="button" variant="outline" size="sm" onClick={() => void approveAnswer(answer)}>
                          <Check />
                          Approve
                        </Button>
                      ) : null}
                      <Button type="button" variant="outline" size="sm" onClick={() => editAnswer(answer)}>
                        <Pencil />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void deleteAnswer(answer)}
                        disabled={deletingId === answer.id}
                      >
                        {deletingId === answer.id ? <Loader2 className="animate-spin" /> : <Trash2 />}
                        Delete
                      </Button>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="p-4 text-sm text-muted-foreground">No answers match these filters.</p>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
