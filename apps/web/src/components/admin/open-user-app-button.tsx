'use client';

import { Loader2, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function OpenUserAppButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function openUserApp() {
    setPending(true);
    try {
      const response = await fetch('/api/auth/admin/user-session', { method: 'POST' });
      if (!response.ok) {
        router.replace('/login');
        return;
      }
      router.push('/app');
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={openUserApp} disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <UserRound />}
      User app
    </Button>
  );
}
