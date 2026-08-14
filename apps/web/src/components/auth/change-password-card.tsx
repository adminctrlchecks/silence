'use client';

import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
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

function PasswordField({
  id,
  label,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  label: string;
  autoComplete: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const visibilityLabel = visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          minLength={autoComplete === 'new-password' ? 8 : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pe-11"
          required
        />
        <button
          type="button"
          className="absolute end-1 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => setVisible((current) => !current)}
          aria-label={visibilityLabel}
          title={visibilityLabel}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

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
        <PasswordField
          id={`${endpoint}-current`}
          label={copy.currentPassword}
          autoComplete="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
        />
        <PasswordField
          id={`${endpoint}-new`}
          label={copy.newPassword}
          autoComplete="new-password"
          value={newPassword}
          onChange={setNewPassword}
        />
        <PasswordField
          id={`${endpoint}-confirm`}
          label={copy.confirmPassword}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />

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
