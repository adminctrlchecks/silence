'use client';

import { CATEGORIES, LANGUAGES, type Category, type UserProfile } from '@silence/shared';
import { Loader2, Pencil, Save, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
};

type FormState = {
  name: string;
  category: Category;
  lang: string;
  dob: string;
  timeOfBirth: string;
  city: string;
  country: string;
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
  };
}

export function ProfileDetailsCard({ initialProfile, labels }: { initialProfile: UserProfile; labels: Labels }) {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<FormState>(() => formFromProfile(initialProfile));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
          placeOfBirth: { city: form.city, country: form.country },
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
          <div className="space-y-2">
            <Label htmlFor="profile-city">{labels.city}</Label>
            <Input
              id="profile-city"
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-country">{labels.country}</Label>
            <Input
              id="profile-country"
              value={form.country}
              onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>{labels.contact}</Label>
            <div className="flex h-10 items-center rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground">
              {profile.contact}
            </div>
          </div>

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
