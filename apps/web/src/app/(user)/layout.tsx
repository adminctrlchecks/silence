import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { AuthSessionProvider } from '@/components/auth/auth-session-provider';
import { PublicNavbar } from '@/components/navigation/public-navbar';
import { SiteFooter } from '@/components/navigation/site-footer';
import { UserAppNavigation } from '@/components/navigation/user-app-navigation';
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
        <PublicNavbar
          authenticated={authenticated}
          labels={{
            appName: common('appName'),
            mySession: t('mySession'),
            signIn: t('signIn'),
            startReading: common('createProfile'),
            signOut: 'Sign out',
            adminSignIn: common('signInAsAdmin'),
          }}
        />
        {authenticated ? <UserAppNavigation /> : null}
        <div className={authenticated ? 'pb-20 md:pb-0' : undefined}>
          <div className="min-h-[calc(100vh-4rem)]">{children}</div>
          <SiteFooter appName={common('appName')} />
        </div>
      </div>
    </AuthSessionProvider>
  );
}
