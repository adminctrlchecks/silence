'use client';

import { KeyRound, Loader2, MailCheck } from 'lucide-react';
import Link from 'next/link';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Copy = {
  eyebrow: string;
  title: string;
  description: string;
  fieldLabel: string;
  fieldPlaceholder?: string;
  submit: string;
  submitting: string;
  success: string;
  backToLogin: string;
};

export function ForgotPasswordCard({
  endpoint,
  fieldName,
  loginHref,
  copy,
}: {
  endpoint: string;
  /** Request body key — 'contact' for users (phone/email), 'email' for admins. */
  fieldName: 'contact' | 'email';
  loginHref: string;
  copy: Copy;
}) {
  const [value, setValue] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [fieldName]: value }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error?.message ?? 'Unable to process the request');
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process the request');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center px-4 py-10">
      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            {sent ? <MailCheck className="size-5" /> : <KeyRound className="size-5" />}
          </span>
          <div>
            <p className="text-sm font-medium text-primary">{copy.eyebrow}</p>
            <h1 className="mt-1 text-xl font-semibold tracking-normal">{copy.title}</h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy.description}</p>
          </div>
        </div>

        {sent ? (
          <p
            role="status"
            className="mt-5 rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary"
          >
            {copy.success}
          </p>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={submit}>
            <div className="space-y-2">
              <Label htmlFor="forgot-field">{copy.fieldLabel}</Label>
              <Input
                id="forgot-field"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={copy.fieldPlaceholder}
                autoComplete={fieldName === 'email' ? 'email' : 'username'}
                required
              />
            </div>

            {error ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : null}
              {pending ? copy.submitting : copy.submit}
            </Button>
          </form>
        )}

        <div className="mt-5 border-t border-border pt-5 text-center text-sm text-muted-foreground">
          <Link href={loginHref} className="font-medium text-primary">
            {copy.backToLogin}
          </Link>
        </div>
      </section>
    </div>
  );
}
