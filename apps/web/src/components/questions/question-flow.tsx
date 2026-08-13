'use client';

import type { Category, Level, Question } from '@silence/shared';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

type QuestionsByLevel = Record<Level, Question[]>;
type AnswersByQuestion = Record<string, string>;

const levels: Level[] = ['common', 'level1', 'level2'];

export function QuestionFlow({
  userId,
  category,
  questions,
}: {
  userId: string;
  category: Category;
  questions: QuestionsByLevel;
}) {
  const t = useTranslations('Questions');
  const [step, setStep] = useState<Level>('common');
  const [answers, setAnswers] = useState<AnswersByQuestion>({});
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState<Partial<Record<Level, boolean>>>({});
  const [error, setError] = useState<string | null>(null);

  const currentQuestions = questions[step];
  const currentComplete = currentQuestions.every((question) => answers[question.id]?.trim());
  const currentIndex = levels.indexOf(step);
  const isFinalStep = currentIndex === levels.length - 1;

  const answeredCount = useMemo(
    () => levels.reduce((total, level) => total + questions[level].filter((question) => answers[question.id]?.trim()).length, 0),
    [answers, questions],
  );

  function updateAnswer(questionId: string, value: string) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  async function saveCurrentStep() {
    setPending(true);
    setError(null);

    const response = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        level: step,
        category,
        answers: currentQuestions.map((question) => ({
          questionId: question.id,
          value: answers[question.id]?.trim() ?? '',
        })),
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error?.message ?? t('saveError'));
    }
  }

  async function continueFlow() {
    try {
      await saveCurrentStep();
      setSaved((current) => ({ ...current, [step]: true }));

      if (!isFinalStep) {
        setStep(levels[currentIndex + 1]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveError'));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">{t('eyebrow')}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">{t('title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('answered', { count: answeredCount })}</p>
        </div>
        <div className="flex gap-2">
          {levels.map((level) => (
            <Button
              key={level}
              type="button"
              variant={level === step ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStep(level)}
              aria-pressed={level === step}
            >
              {saved[level] ? <Check className="size-4" /> : null}
              {t(`levels.${level}`)}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {currentQuestions.length ? (
          currentQuestions.map((question, index) => (
            <label key={question.id} className="block rounded-md border border-border bg-background p-4">
              <span className="text-xs font-medium text-muted-foreground">
                {t('questionNumber', { number: index + 1 })}
              </span>
              <span className="mt-2 block text-sm font-medium">{question.text}</span>
              <textarea
                className="mt-3 min-h-24 w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={answers[question.id] ?? ''}
                onChange={(event) => updateAnswer(question.id, event.target.value)}
                placeholder={t('answerPlaceholder')}
              />
            </label>
          ))
        ) : (
          <div className="rounded-md border border-border bg-background p-4 text-sm text-muted-foreground">
            {t('empty')}
          </div>
        )}
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="button" disabled={!currentQuestions.length || !currentComplete || pending} onClick={continueFlow}>
          {pending ? <Loader2 className="animate-spin" /> : isFinalStep ? <Check /> : <ArrowRight />}
          {isFinalStep ? t('finish') : t('continue')}
        </Button>
        {saved.level2 ? (
          <Button asChild variant="outline">
            <Link href="/app/chart">{t('viewChart')}</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
