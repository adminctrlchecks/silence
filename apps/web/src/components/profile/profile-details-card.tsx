'use client';

import { CATEGORIES, LANGUAGES, type Category, type UserProfile } from '@silence/shared';
import { Loader2, Pencil, Save, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlacesAutocomplete } from '@/components/shared/places-autocomplete';

type Labels = {
  eyebrow: string;
  title: string;
  edit: string;
  cancel: string;
  save: string;
  saving: string;
  saved: string;
  name: string;
  category: string;
  language: string;
  dob: string;
  timeOfBirth: string;
  placeOfBirth: string;
  city: string;
  country: string;
  contact: string;
  consent: string;
  yes: string;
  no: string;
  categories: Record<Category, string>;
  birthPlace: string;
  birthPlacePlaceholder: string;
  completeProfileTitle: string;
  completeProfileDescription: string;
  consentEditLabel: string;
};

type FormState = {
  name: string;
  category: Category;
  lang: string;
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
    name: profile.name,
    category: profile.category,
    lang: profile.lang,
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

/** True for a profile still missing the birth details needed for a reading — e.g. a fresh Google sign-up (see AuthService.userGoogleAuth). */
function isIncomplete(profile: UserProfile): boolean {
  return (
    !profile.dob?.trim() ||
    !profile.timeOfBirth?.trim() ||
    !profile.placeOfBirth.city?.trim() ||
    !profile.placeOfBirth.country?.trim() ||
    !profile.consent
  );
}

export function ProfileDetailsCard({ initialProfile, labels }: { initialProfile: UserProfile; labels: Labels }) {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(() => isIncomplete(initialProfile));
  const [form, setForm] = useState<FormState>(() => formFromProfile(initialProfile));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const incomplete = isIncomplete(profile);

  const details = [
    { label: labels.name, value: profile.name },
    { label: labels.category, value: labels.categories[profile.category] },
    { label: labels.language, value: profile.lang },
    { label: labels.dob, value: profile.dob },
    { label: labels.timeOfBirth, value: profile.timeOfBirth },
    { label: labels.placeOfBirth, value: `${profile.placeOfBirth.city}, ${profile.placeOfBirth.country}` },
    { label: labels.contact, value: profile.contact },
    { label: labels.consent, value: profile.consent ? labels.yes : labels.no },
  ];

  async function save() {
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          lang: form.lang,
          dob: form.dob,
          timeOfBirth: form.timeOfBirth,
          placeOfBirth: {
            city: form.city,
            country: form.country,
            lat: form.lat,
            lng: form.lng,
            timezone: form.timezone,
          },
          // The API only ever accepts `consent: true` (completing onboarding) —
          // omit the field entirely rather than send `false` and fail validation.
          ...(form.consent ? { consent: true } : {}),
        }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error?.message ?? 'Unable to save profile');
      }

      setProfile(data as UserProfile);
      setForm(formFromProfile(data as UserProfile));
      setEditing(false);
      setMessage(labels.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile');
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

      {incomplete ? (
        <div className="mt-5 flex items-start gap-3 rounded-md border border-primary/30 bg-primary/5 p-4">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-foreground">{labels.completeProfileTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">{labels.completeProfileDescription}</p>
          </div>
        </div>
      ) : null}

      {editing ? (
        <form
          className="mt-6 grid gap-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="profile-name">{labels.name}</Label>
            <Input
              id="profile-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-category">{labels.category}</Label>
            <select
              id="profile-category"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as Category }))}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {labels.categories[category]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-lang">{labels.language}</Label>
            <select
              id="profile-lang"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.lang}
              onChange={(event) => setForm((current) => ({ ...current, lang: event.target.value }))}
            >
              {LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>
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
              initialValue={`${form.city}, ${form.country}`}
              onSelect={(p) =>
                setForm((current) => ({
                  ...current,
                  city: p.city,
                  country: p.country,
                  lat: p.lat,
                  lng: p.lng,
                  timezone: p.timezone,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.contact}</Label>
            <div className="flex h-10 items-center rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground">
              {profile.contact}
            </div>
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
          {details.map((detail) => (
            <div key={detail.label} className="rounded-md border border-border bg-background p-3">
              <dt className="text-xs font-medium uppercase text-muted-foreground">{detail.label}</dt>
              <dd className="mt-1 break-words text-sm font-medium">{detail.value}</dd>
            </div>
          ))}
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
