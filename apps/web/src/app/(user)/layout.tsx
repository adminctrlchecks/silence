import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { AuthSessionProvider } from '@/components/auth/auth-session-provider';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { getUserSession } from '@/lib/user-session';

export default async function UserLayout({ children }: { children: ReactNode }) {
  const session = await getUserSession();
  const common = await getTranslations('Common');
  const t = await getTranslations('UserLayout');
  const authenticated = Boolean(session);

  return (
    <AuthSessionProvider authenticated={authenticated}>
      <div className="min-h-screen bg-background">
        {session?.isAdminSession ? (
          <div className="flex items-center justify-center gap-2 bg-amber-500/15 px-4 py-2 text-center text-xs font-medium text-amber-700 dark:text-amber-400">
            <ShieldAlert className="size-3.5 shrink-0" />
            {t('impersonationBanner')}
            <Link href="/admin" className="underline underline-offset-2">
              {t('exitToAdmin')}
            </Link>
          </div>
        ) : null}
        <header className="border-b border-border bg-card/85 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="text-base font-semibold tracking-normal">
              {common('appName')}
            </Link>
            <nav className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/app">{t('mySession')}</Link>
              </Button>
              {authenticated ? (
                <SignOutButton endpoint="/api/auth/logout" redirectTo="/login" />
              ) : (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/login">{t('signIn')}</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/admin/login">{common('signInAsAdmin')}</Link>
                  </Button>
                </>
              )}
              <ThemeToggle />
            </nav>
          </div>
        </header>
        {children}
      </div>
    </AuthSessionProvider>
  );
}
