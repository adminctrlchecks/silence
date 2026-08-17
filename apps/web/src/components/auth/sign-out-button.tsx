'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function SignOutButton({
  endpoint,
  redirectTo,
  label = 'Sign out',
  pendingLabel = 'Signing out',
}: {
  endpoint: string;
  redirectTo: string;
  label?: string;
  pendingLabel?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    try {
      await fetch(endpoint, { method: 'POST' });
    } finally {
      router.replace(redirectTo);
      router.refresh();
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={signOut} disabled={pending}>
      <LogOut />
      {pending ? pendingLabel : label}
    </Button>
  );
}
