'use client';

import Link from 'next/link';
import { CATEGORIES } from '@silence/shared';
import { Loader2, MoonStar } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LANGUAGES } from '@/lib/i18n';

type Mode = 'login' | 'register';

export function AuthCard({ mode }: { mode: Mode }) {
  const [pending, setPending] = useState(false);
  const registering = mode === 'register';

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MoonStar className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-normal">
              {registering ? 'Create your profile' : 'Welcome back'}
            </h1>
            <p className="text-sm text-muted-foreground">Silence</p>
          </div>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setPending(true);
            window.setTimeout(() => setPending(false), 600);
          }}
        >
          {registering ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" autoComplete="name" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    name="category"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm capitalize outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lang">Language</Label>
                  <select
                    id="lang"
                    name="lang"
                    className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    defaultValue="en"
                  >
                    {LANGUAGES.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input id="dob" name="dob" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeOfBirth">Time of birth</Label>
                  <Input id="timeOfBirth" name="timeOfBirth" type="time" required />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">Birth city</Label>
                  <Input id="city" name="city" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" required />
                </div>
              </div>
            </>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="contact">Email or phone</Label>
            <Input id="contact" name="contact" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete={registering ? 'new-password' : 'current-password'} required />
          </div>

          {registering ? (
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input name="consent" type="checkbox" className="mt-1 size-4 rounded border-border" required />
              <span>I consent to saving my profile, birth details, answers, chart, and remedy.</span>
            </label>
          ) : null}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : null}
            {registering ? 'Create profile' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-5 border-t border-border pt-5 text-center text-sm text-muted-foreground">
          {registering ? 'Already have a profile?' : 'New to Silence?'}{' '}
          <Link href={registering ? '/login' : '/register'} className="font-medium text-primary">
            {registering ? 'Sign in' : 'Create one'}
          </Link>
        </div>
      </div>
    </div>
  );
}
