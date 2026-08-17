'use client';

import type { Answer, Paginated, Question, Remedy } from '@silence/shared';
import { Check, Languages, Loader2, Plus, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

type LanguageRow = {
  code: string;
  name: string;
  rtl: boolean;
};

type Entity = 'question' | 'answer' | 'remedy';
type ContentItem = {
  id: string;
  label: string;
};

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message ?? 'Request failed');
  }
  return data as T;
}

function itemLabel(entity: Entity, item: Question | Answer | Remedy) {
  if (entity === 'remedy') {
    const remedy = item as Remedy;
    return `${remedy.title} / ${remedy.category}`;
  }

  if (entity === 'answer') {
    const answer = item as Answer;
    return `${answer.level} / ${answer.category} / ${answer.text}`;
  }

  const question = item as Question;
  return `${question.level} / ${question.category} / ${question.text}`;
}

export function LanguagesAdmin() {
  const [languages, setLanguages] = useState<LanguageRow[]>([]);
  const [entity, setEntity] = useState<Entity>('question');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [targets, setTargets] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [rtl, setRtl] = useState(false);
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const targetLanguages = useMemo(() => languages.filter((language) => language.code !== 'en'), [languages]);

  const loadLanguages = useCallback(async () => {
    setLoadingLanguages(true);
    setError(null);

    try {
      const result = await parseJson<{ data: LanguageRow[] }>(await fetch('/api/admin/languages'));
      setLanguages(result.data);
      setTargets((current) => (current.length ? current : result.data.filter((lang) => lang.code !== 'en').map((lang) => lang.code)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load languages');
    } finally {
      setLoadingLanguages(false);
    }
  }, []);

  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    setError(null);

    try {
      const endpoint =
        entity === 'question'
          ? '/api/admin/questions?limit=100'
          : entity === 'answer'
            ? '/api/admin/answers?limit=100'
            : '/api/admin/remedies?limit=100';
      const result = await parseJson<Paginated<Question | Answer | Remedy>>(await fetch(endpoint));
      const nextItems = result.data.map((item) => ({ id: item.id, label: itemLabel(entity, item) }));
      setItems(nextItems);
      setSelectedId((current) => (nextItems.some((item) => item.id === current) ? current : nextItems[0]?.id ?? ''));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load content items');
    } finally {
      setLoadingItems(false);
    }
  }, [entity]);

  useEffect(() => {
    void loadLanguages();
  }, [loadLanguages]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  async function saveLanguage() {
    setSavingLanguage(true);
    setError(null);
    setNotice(null);

    try {
      await parseJson<LanguageRow>(
        await fetch('/api/admin/languages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, name, rtl }),
        }),
      );
      setCode('');
      setName('');
      setRtl(false);
      setNotice('Language saved.');
      await loadLanguages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save language');
    } finally {
      setSavingLanguage(false);
    }
  }

  async function autoTranslate() {
    if (!selectedId || !targets.length) {
      setError('Select an item and at least one target language.');
      return;
    }

    setTranslating(true);
    setError(null);
    setNotice(null);

    try {
      const result = await parseJson<{ id: string; translated: string[]; provider: string }>(
        await fetch('/api/admin/translations/auto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entity, id: selectedId, targets }),
        }),
      );
      setNotice(`Translated ${result.id} into ${result.translated.join(', ')} with ${result.provider}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to auto-translate content');
    } finally {
      setTranslating(false);
    }
  }

  function toggleTarget(codeValue: string) {
    setTargets((current) =>
      current.includes(codeValue)
        ? current.filter((item) => item !== codeValue)
        : [...current, codeValue],
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Languages</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">Languages and auto-translate</h2>
          </div>
          <Button type="button" variant="outline" onClick={loadLanguages} disabled={loadingLanguages}>
            <RefreshCw className={loadingLanguages ? 'animate-spin' : undefined} />
            Refresh
          </Button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <div className="space-y-5">
          <form
            className="rounded-md border border-border bg-card p-4 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              void saveLanguage();
            }}
          >
            <div className="flex items-center gap-2">
              <Languages className="size-4 text-primary" />
              <h2 className="text-base font-semibold tracking-normal">Add language</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr] xl:grid-cols-1 2xl:grid-cols-[120px_1fr]">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="it"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Italian"
                  required
                />
              </div>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="size-4 rounded border-border"
                checked={rtl}
                onChange={(event) => setRtl(event.target.checked)}
              />
              Right-to-left
            </label>
            <Button type="submit" className="mt-4 w-full" disabled={savingLanguage || !code.trim() || !name.trim()}>
              {savingLanguage ? <Loader2 className="animate-spin" /> : <Plus />}
              Save language
            </Button>
          </form>

          <section className="rounded-md border border-border bg-card shadow-sm">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-base font-semibold tracking-normal">Enabled languages</h2>
            </div>
            <div className="divide-y divide-border">
              {loadingLanguages ? (
                <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                  <Loader2 className="animate-spin" />
                  Loading languages
                </div>
              ) : (
                languages.map((language) => (
                  <div key={language.code} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{language.name}</p>
                      <p className="text-xs text-muted-foreground">{language.code}</p>
                    </div>
                    <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                      {language.rtl ? 'RTL' : 'LTR'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="rounded-md border border-border bg-card p-4 shadow-sm">
          <h2 className="text-base font-semibold tracking-normal">Auto-translate content</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="entity">Entity</Label>
              <Select
                id="entity"
                value={entity}
                onChange={(event) => setEntity(event.target.value as Entity)}
              >
                <option value="question">Question</option>
                <option value="answer">Answer</option>
                <option value="remedy">Remedy</option>
              </Select>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="item">Item</Label>
              <Select
                id="item"
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
                disabled={loadingItems}
              >
                <option value="">Select item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <Label>Target languages</Label>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {targetLanguages.map((language) => (
                <label
                  key={language.code}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground"
                >
                  <span>
                    {language.name} ({language.code})
                  </span>
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border"
                    checked={targets.includes(language.code)}
                    onChange={() => toggleTarget(language.code)}
                  />
                </label>
              ))}
            </div>
          </div>

          {notice ? (
            <p className="mt-4 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              {notice}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button type="button" className="mt-4" onClick={() => void autoTranslate()} disabled={translating || !selectedId || !targets.length}>
            {translating ? <Loader2 className="animate-spin" /> : <Check />}
            Auto-translate
          </Button>
        </section>
      </section>
    </div>
  );
}
