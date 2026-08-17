'use client';

import { KeyRound, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PasswordField } from '@/components/auth/password-field';

type Copy = {
  eyebrow: string;
  title: string;
  description: string;
  newPassword: string;
  confirmPassword: string;
  submit: string;
  submitting: string;
  success: string;
  invalidLink: string;
  requestNewLink: string;
};

export function ResetPasswordCard({
  endpoint,
  redirectTo,
  forgotPasswordHref,
  copy,
}: {
  endpoint: string;
  redirectTo: string;
  /** Where "request a new link" goes — differs for the user vs admin flow. */
  forgotPasswordHref: string;
  copy: Copy;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error?.message ?? 'Unable to reset password');
      }

      setMessage(copy.success);
      window.setTimeout(() => {
        router.replace(redirectTo);
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center px-4 py-10">
      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <KeyRound className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-primary">{copy.eyebrow}</p>
            <h1 className="mt-1 text-xl font-semibold tracking-normal">{copy.title}</h1>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy.description}</p>
          </div>
        </div>

        {!token ? (
          <div className="mt-5 space-y-3">
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {copy.invalidLink}
            </p>
            <Button asChild className="w-full">
              <Link href={forgotPasswordHref}>{copy.requestNewLink}</Link>
            </Button>
          </div>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={submit}>
            <PasswordField
              id="reset-new"
              label={copy.newPassword}
              autoComplete="new-password"
              value={newPassword}
              onChange={setNewPassword}
            />
            <PasswordField
              id="reset-confirm"
              label={copy.confirmPassword}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />

            {error ? (
              <div className="space-y-2">
                <p
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {error}
                </p>
                <Link href={forgotPasswordHref} className="inline-block text-sm font-medium text-primary">
                  {copy.requestNewLink}
                </Link>
              </div>
            ) : null}
            {message ? (
              <p
                role="status"
                className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary"
              >
                {message}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <KeyRound />}
              {pending ? copy.submitting : copy.submit}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
