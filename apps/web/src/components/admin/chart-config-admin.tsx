'use client';

import { CATEGORIES, CHART_STYLES, type Category, type ChartConfig, type ChartStyle } from '@silence/shared';
import { Loader2, RefreshCw, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

const categoryLabels: Record<Category, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
};

const styleLabels: Record<ChartStyle, string> = {
  'north-indian': 'North Indian',
  'south-indian': 'South Indian',
  western: 'Western',
};

const requirementOptions = [
  { value: 'dob', label: 'Date of birth' },
  { value: 'timeOfBirth', label: 'Time of birth' },
  { value: 'placeOfBirth', label: 'Place of birth' },
];

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message ?? 'Request failed');
  }
  return data as T;
}

export function ChartConfigAdmin() {
  const [category, setCategory] = useState<Category>('other');
  const [config, setConfig] = useState<ChartConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const result = await parseJson<ChartConfig>(
        await fetch(`/api/admin/chart-config?category=${category}`),
      );
      setConfig(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load chart config');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  function toggleRequirement(value: string) {
    setConfig((current) => {
      if (!current) return current;
      const exists = current.requires.includes(value);
      return {
        ...current,
        requires: exists
          ? current.requires.filter((item) => item !== value)
          : [...current.requires, value],
      };
    });
  }

  async function saveConfig() {
    if (!config) return;

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const result = await parseJson<ChartConfig>(
        await fetch('/api/admin/chart-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: config.category,
            type: 'astrology',
            style: config.style,
            source: 'level2',
            requires: config.requires,
          }),
        }),
      );
      setConfig(result);
      setNotice('Chart config saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save chart config');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Chart engine</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">Astrology chart config</h2>
          </div>
          <Button type="button" variant="outline" onClick={loadConfig} disabled={loading}>
            <RefreshCw className={loading ? 'animate-spin' : undefined} />
            Refresh
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {CATEGORIES.map((item) => (
            <Button
              key={item}
              type="button"
              variant={item === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory(item)}
            >
              {categoryLabels[item]}
            </Button>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin" />
            Loading chart config
          </div>
        ) : config ? (
          <div className="max-w-2xl space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <div id="category" className="rounded-md border border-border bg-background px-3 py-2 text-sm">
                  {categoryLabels[config.category]}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <div id="source" className="rounded-md border border-border bg-background px-3 py-2 text-sm">
                  Level 2
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Chart style</Label>
              <Select
                id="style"
                value={config.style}
                onChange={(event) =>
                  setConfig((current) =>
                    current ? { ...current, style: event.target.value as ChartStyle } : current,
                  )
                }
              >
                {CHART_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {styleLabels[style]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Required profile fields</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {requirementOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded border-border"
                      checked={config.requires.includes(option.value)}
                      onChange={() => toggleRequirement(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {notice ? (
              <p className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
                {notice}
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="button" onClick={() => void saveConfig()} disabled={saving || !config.requires.length}>
              {saving ? <Loader2 className="animate-spin" /> : <Save />}
              Save config
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No chart config loaded.</p>
        )}
      </section>
    </div>
  );
}
