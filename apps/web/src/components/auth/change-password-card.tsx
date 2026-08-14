'use client';

import { KeyRound, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Copy = {
  eyebrow: string;
  title: string;
  description: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  submit: string;
  submitting: string;
  success: string;
};

export function ChangePasswordCard({
  endpoint,
  redirectTo,
  copy,
}: {
  endpoint: string;
  redirectTo: string;
  copy: Copy;
}) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error?.message ?? 'Unable to change password');
      }

      setMessage(copy.success);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      window.setTimeout(() => {
        router.replace(redirectTo);
        router.refresh();
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to change password');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="rounded-md border border-primary/20 bg-primary/10 p-2 text-primary">
          <KeyRound className="size-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-medium text-primary">{copy.eyebrow}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-normal">{copy.title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{copy.description}</p>
        </div>
      </div>

      <form className="mt-5 grid gap-4 sm:grid-cols-3" onSubmit={submit}>
        <div className="space-y-2">
          <Label htmlFor={`${endpoint}-current`}>{copy.currentPassword}</Label>
          <Input
            id={`${endpoint}-current`}
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${endpoint}-new`}>{copy.newPassword}</Label>
          <Input
            id={`${endpoint}-new`}
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${endpoint}-confirm`}>{copy.confirmPassword}</Label>
          <Input
            id={`${endpoint}-confirm`}
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>

        {error ? (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive sm:col-span-3">
            {error}
          </p>
        ) : null}
        {message ? (
          <p role="status" className="rounded-md border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary sm:col-span-3">
            {message}
          </p>
        ) : null}

        <div className="sm:col-span-3">
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <KeyRound />}
            {pending ? copy.submitting : copy.submit}
          </Button>
        </div>
      </form>
    </section>
  );
}
