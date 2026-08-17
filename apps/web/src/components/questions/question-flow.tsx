'use client';

import type { Answer, Category, Level, Question } from '@silence/shared';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type QuestionsByLevel = Record<Level, Question[]>;
type AnswersByQuestion = Record<string, string>;
type DisplayAnswersByQuestion = Record<string, Answer>;

const levels: Level[] = ['common', 'level1', 'level2'];

export function QuestionFlow({
  userId,
  sessionId,
  category,
  lang,
  questions,
  savedAnswers = {},
  initialDisplayAnswers = {},
}: {
  userId: string;
  sessionId: string;
  category: Category;
  lang: string;
  questions: QuestionsByLevel;
  savedAnswers?: AnswersByQuestion;
  initialDisplayAnswers?: DisplayAnswersByQuestion;
}) {
  const t = useTranslations('Questions');

  // Filter questions for active ones
  const filteredQuestions = useMemo(() => {
    const res = {} as QuestionsByLevel;
    for (const level of levels) {
      res[level] = (questions[level] ?? []).filter((q) => q.active !== false);
    }
    return res;
  }, [questions]);

  const levelComplete = (level: Level) =>
    filteredQuestions[level].length > 0 &&
    filteredQuestions[level].every((q) => {
      const val = savedAnswers[q.id]?.trim();
      return q.required === false ? true : Boolean(val);
    });

  const [step, setStep] = useState<Level>(
    () => levels.find((level) => !levelComplete(level)) ?? levels[levels.length - 1],
  );

  const [answers, setAnswers] = useState<AnswersByQuestion>(() => {
    const initial = { ...savedAnswers };
    if (typeof window !== 'undefined') {
      try {
        const draftStr = localStorage.getItem(`silence_draft_${sessionId}`);
        if (draftStr) {
          const drafts = JSON.parse(draftStr) as AnswersByQuestion;
          Object.assign(initial, drafts);
        }
      } catch {
        // ignore
      }
    }
    return initial;
  });

  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState<Partial<Record<Level, boolean>>>(() =>
    Object.fromEntries(levels.map((level) => [level, levelComplete(level)])),
  );
  const [displayAnswers, setDisplayAnswers] = useState<DisplayAnswersByQuestion>(initialDisplayAnswers);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);

  // Move focus to this layer's heading whenever it changes (but not on
  // first mount) — keyboard/screen-reader users otherwise stay on whatever
  // control triggered the change (a now-possibly-hidden tab/button).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const currentQuestions = filteredQuestions[step];
  const currentComplete = currentQuestions.every((question) => {
    const val = answers[question.id]?.trim();
    return question.required === false ? true : Boolean(val);
  });
  const currentIndex = levels.indexOf(step);
  const isFinalStep = currentIndex === levels.length - 1;

  const answeredCount = useMemo(
    () =>
      levels.reduce(
        (total, level) =>
          total + filteredQuestions[level].filter((question) => answers[question.id]?.trim()).length,
        0,
      ),
    [answers, filteredQuestions],
  );
  const totalCount = useMemo(
    () => levels.reduce((total, level) => total + filteredQuestions[level].length, 0),
    [filteredQuestions],
  );

  function updateAnswer(questionId: string, value: string) {
    setAnswers((current) => {
      const next = { ...current, [questionId]: value };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`silence_draft_${sessionId}`, JSON.stringify(next));
      }
      return next;
    });
  }

  async function saveCurrentStep() {
    setPending(true);
    setError(null);

    const response = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        sessionId,
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

  async function loadCurrentAnswers() {
    const results = await Promise.allSettled(
      currentQuestions.map(async (question) => {
        const params = new URLSearchParams({
          questionId: question.id,
          level: step,
          category,
          lang,
        });
        const response = await fetch(`/api/answers?${params.toString()}`);

        if (!response.ok) {
          return null;
        }

        return (await response.json()) as Answer;
      }),
    );

    setDisplayAnswers((current) => {
      const next = { ...current };

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          next[result.value.questionId] = result.value;
        }
      }

      return next;
    });
  }

  async function continueFlow() {
    try {
      await saveCurrentStep();
      await loadCurrentAnswers();
      setSaved((current) => ({ ...current, [step]: true }));
      setAnnouncement(t('savedAnnouncement', { level: t(`levels.${step}`) }));

      // Clear local drafts for this step
      if (typeof window !== 'undefined') {
        try {
          const draftStr = localStorage.getItem(`silence_draft_${sessionId}`);
          if (draftStr) {
            const drafts = JSON.parse(draftStr) as AnswersByQuestion;
            for (const q of currentQuestions) {
              delete drafts[q.id];
            }
            localStorage.setItem(`silence_draft_${sessionId}`, JSON.stringify(drafts));
          }
        } catch {
          // ignore
        }
      }

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
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{t('intro')}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('answered', { count: answeredCount, total: totalCount })}
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {levels.map((level) => (
            <Button
              key={level}
              type="button"
              variant={level === step ? 'default' : 'outline'}
              size="sm"
              className="shrink-0"
              onClick={() => setStep(level)}
              disabled={pending}
              aria-pressed={level === step}
            >
              {saved[level] ? <Check className="size-4" /> : null}
              {t(`levels.${level}`)}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
        <h2 ref={headingRef} tabIndex={-1} className="inline font-medium text-foreground outline-none">
          {t('progress', { current: currentIndex + 1, total: levels.length })}
        </h2>{' '}
        {t('stepHelp')}
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div className="mt-6 space-y-4">
        {currentQuestions.length ? (
          currentQuestions.map((question, index) => (
            <label key={question.id} className="block rounded-md border border-border bg-background p-4">
              <span className="text-xs font-medium text-muted-foreground">
                {t('questionNumber', { number: index + 1 })}
              </span>
              <span className="mt-2 block text-sm font-medium" dir="auto">
                {question.text}
              </span>
              {question.helpText ? (
                <span className="mt-1 block text-xs text-muted-foreground" dir="auto">
                  {question.helpText}
                </span>
              ) : null}
              {question.inputType === 'text' ? (
                <Input
                  type="text"
                  className="mt-3"
                  value={answers[question.id] ?? ''}
                  onChange={(event) => updateAnswer(question.id, event.target.value)}
                  placeholder={t('answerPlaceholder')}
                  aria-label={question.text}
                  required={question.required !== false}
                  dir="auto"
                />
              ) : (
                <Textarea
                  className="mt-3 resize-y"
                  value={answers[question.id] ?? ''}
                  onChange={(event) => updateAnswer(question.id, event.target.value)}
                  placeholder={t('answerPlaceholder')}
                  aria-label={question.text}
                  required={question.required !== false}
                  dir="auto"
                />
              )}
              {displayAnswers[question.id] ? (
                <div className="mt-3 rounded-md border border-primary/20 bg-primary/10 px-3 py-2">
                  <p className="text-xs font-medium text-primary">{t('answerLabel')}</p>
                  <p className="mt-1 text-sm leading-6 text-foreground" dir="auto">
                    {displayAnswers[question.id].text}
                  </p>
                </div>
              ) : null}
            </label>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{t('emptyTitle')}</p>
            <p className="mt-1">{t('empty')}</p>
          </div>
        )}
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div
        className={cn(
          'sticky bottom-20 z-10 mt-5 flex flex-wrap items-center gap-3 rounded-md border border-border bg-card/95 p-3 shadow-popover backdrop-blur',
          'md:static md:bottom-auto md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none',
        )}
      >
        <Button type="button" disabled={!currentQuestions.length || !currentComplete || pending} onClick={continueFlow}>
          {pending ? <Loader2 className="animate-spin" /> : isFinalStep ? <Check /> : <ArrowRight />}
          {pending ? t('saving') : isFinalStep ? t('finish') : t('continue')}
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
