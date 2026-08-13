import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { AdminAuthSessionProvider } from '@/components/admin/admin-auth-session-provider';
import { AdminShell } from '@/components/admin/admin-shell';
import { ADMIN_TOKEN_COOKIE } from '@/lib/auth-routing';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const authenticated = Boolean(cookieStore.get(ADMIN_TOKEN_COOKIE)?.value);

  return (
    <AdminAuthSessionProvider authenticated={authenticated}>
      <AdminShell>{children}</AdminShell>
    </AdminAuthSessionProvider>
  );
}
