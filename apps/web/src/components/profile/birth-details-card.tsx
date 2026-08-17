'use client';

import type { UserProfile } from '@silence/shared';
import { AlertTriangle, CheckCircle2, HelpCircle, Loader2, Pencil, Save, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlacesAutocomplete } from '@/components/shared/places-autocomplete';

type Labels = {
  eyebrow: string;
  title: string;
  description: string;
  edit: string;
  cancel: string;
  save: string;
  saving: string;
  saved: string;
  dob: string;
  timeOfBirth: string;
  placeOfBirth: string;
  birthPlace: string;
  birthPlacePlaceholder: string;
  completeProfileTitle: string;
  completeProfileDescription: string;
  consentEditLabel: string;
  whyWeAskTitle: string;
  whyWeAskBody: string;
  changeImpactTitle: string;
  changeImpactBody: string;
  accuracyLabel: string;
  accuracyExact: string;
  accuracyApproximate: string;
  accuracyUncertain: string;
};

type FormState = {
  dob: string;
  timeOfBirth: string;
  city: string;
  country: string;
  lat?: number;
  lng?: number;
  timezone?: string;
  consent: boolean;
};

function formFromProfile(profile: UserProfile): FormState {
  return {
    dob: profile.dob,
    timeOfBirth: profile.timeOfBirth,
    city: profile.placeOfBirth.city,
    country: profile.placeOfBirth.country,
    lat: profile.placeOfBirth.lat,
    lng: profile.placeOfBirth.lng,
    timezone: (profile.placeOfBirth as { timezone?: string }).timezone,
    consent: profile.consent,
  };
}

function isIncomplete(profile: UserProfile): boolean {
  return (
    !profile.dob?.trim() ||
    !profile.timeOfBirth?.trim() ||
    !profile.placeOfBirth.city?.trim() ||
    !profile.placeOfBirth.country?.trim() ||
    !profile.consent
  );
}

function accuracyOf(profile: UserProfile): 'exact' | 'approximate' | 'uncertain' {
  const hasCoordinates = typeof profile.placeOfBirth.lat === 'number' && typeof profile.placeOfBirth.lng === 'number';
  const hasTimezone = Boolean((profile.placeOfBirth as { timezone?: string }).timezone);
  if (!hasCoordinates) return 'uncertain';
  if (!hasTimezone) return 'approximate';
  return 'exact';
}

const ACCURACY_STYLES = {
  exact: { icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  approximate: { icon: AlertTriangle, className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  uncertain: { icon: HelpCircle, className: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300' },
} as const;

export function BirthDetailsCard({
  initialProfile,
  autoEdit,
  labels,
}: {
  initialProfile: UserProfile;
  /** Open straight into edit mode — used for the onboarding (`?onboarding=1`) entry point. */
  autoEdit?: boolean;
  labels: Labels;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(() => autoEdit || isIncomplete(initialProfile));
  const [form, setForm] = useState<FormState>(() => formFromProfile(initialProfile));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const incomplete = isIncomplete(profile);
  const accuracy = accuracyOf(profile);
  const AccuracyIcon = ACCURACY_STYLES[accuracy].icon;
  const accuracyText = { exact: labels.accuracyExact, approximate: labels.accuracyApproximate, uncertain: labels.accuracyUncertain }[accuracy];

  async function save() {
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dob: form.dob,
          timeOfBirth: form.timeOfBirth,
          placeOfBirth: { city: form.city, country: form.country, lat: form.lat, lng: form.lng, timezone: form.timezone },
          ...(form.consent ? { consent: true } : {}),
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error?.message ?? 'Unable to save birth details');
      }

      setProfile(data as UserProfile);
      setForm(formFromProfile(data as UserProfile));
      setEditing(false);
      setMessage(labels.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save birth details');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">{labels.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">{labels.title}</h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{labels.description}</p>
        </div>
        {editing ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setForm(formFromProfile(profile));
              setEditing(false);
              setError(null);
            }}
          >
            <X />
            {labels.cancel}
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={() => setEditing(true)}>
            <Pencil />
            {labels.edit}
          </Button>
        )}
      </div>

      <div
        className={`mt-5 flex items-start gap-2 rounded-md border px-3 py-2 text-xs leading-5 ${ACCURACY_STYLES[accuracy].className}`}
        role="status"
      >
        <AccuracyIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        <span>
          <span className="font-semibold">{labels.accuracyLabel}: </span>
          {accuracyText}
        </span>
      </div>

      {incomplete ? (
        <div className="mt-4 flex items-start gap-3 rounded-md border border-primary/30 bg-primary/5 p-4">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground">{labels.completeProfileTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">{labels.completeProfileDescription}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <Alert variant="info" title={labels.whyWeAskTitle}>
          {labels.whyWeAskBody}
        </Alert>
      </div>

      {editing ? (
        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          {!incomplete ? (
            <div className="sm:col-span-2">
              <Alert variant="warning" title={labels.changeImpactTitle}>
                {labels.changeImpactBody}
              </Alert>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="profile-dob">{labels.dob}</Label>
            <Input
              id="profile-dob"
              type="date"
              value={form.dob}
              onChange={(event) => setForm((current) => ({ ...current, dob: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-time">{labels.timeOfBirth}</Label>
            <Input
              id="profile-time"
              type="time"
              value={form.timeOfBirth}
              onChange={(event) => setForm((current) => ({ ...current, timeOfBirth: event.target.value }))}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <PlacesAutocomplete
              label={labels.birthPlace}
              placeholder={labels.birthPlacePlaceholder}
              initialValue={form.city || form.country ? `${form.city}, ${form.country}` : ''}
              onSelect={(p) =>
                setForm((current) => ({ ...current, city: p.city, country: p.country, lat: p.lat, lng: p.lng, timezone: p.timezone }))
              }
              required
            />
          </div>

          {!profile.consent ? (
            <label className="flex items-start gap-2 text-sm text-muted-foreground sm:col-span-2">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(event) => setForm((current) => ({ ...current, consent: event.target.checked }))}
                className="mt-1 size-4 rounded border-border"
              />
              <span>{labels.consentEditLabel}</span>
            </label>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-2">
              {error}
            </p>
          ) : null}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Save />}
              {pending ? labels.saving : labels.save}
            </Button>
          </div>
        </form>
      ) : (
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-background p-3">
            <dt className="text-xs font-medium uppercase text-muted-foreground">{labels.dob}</dt>
            <dd className="mt-1 break-words text-sm font-medium">{profile.dob || '—'}</dd>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <dt className="text-xs font-medium uppercase text-muted-foreground">{labels.timeOfBirth}</dt>
            <dd className="mt-1 break-words text-sm font-medium">{profile.timeOfBirth || '—'}</dd>
          </div>
          <div className="rounded-md border border-border bg-background p-3 sm:col-span-2">
            <dt className="text-xs font-medium uppercase text-muted-foreground">{labels.placeOfBirth}</dt>
            <dd className="mt-1 break-words text-sm font-medium">
              {profile.placeOfBirth.city || profile.placeOfBirth.country
                ? `${profile.placeOfBirth.city}, ${profile.placeOfBirth.country}`
                : '—'}
            </dd>
          </div>
        </dl>
      )}

      {message ? (
        <p role="status" className="mt-4 rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
          {message}
        </p>
      ) : null}
    </section>
  );
}
