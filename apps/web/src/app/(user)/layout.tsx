import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export default async function UserLayout({ children }: { children: ReactNode }) {
  const common = await getTranslations('Common');
  const t = await getTranslations('UserLayout');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-base font-semibold tracking-normal">
            {common('appName')}
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/app">{t('mySession')}</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/login">{t('signIn')}</Link>
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
