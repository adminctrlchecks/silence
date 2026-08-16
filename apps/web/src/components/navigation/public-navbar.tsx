'use client';

import { Menu, MoonStar } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { PageContainer } from '@/components/layout/page-container';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { LanguageSwitcher } from './language-switcher';
import { isActivePath, localizeHref } from './nav-links';
import { ProfileMenu } from './profile-menu';

const publicLinks = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/privacy', label: 'Privacy' },
];

export function PublicNavbar({
  authenticated,
  labels,
}: {
  authenticated: boolean;
  labels: {
    appName: string;
    mySession: string;
    signIn: string;
    startReading: string;
    signOut: string;
    adminSignIn: string;
  };
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const homeHref = localizeHref('/', pathname);
  const appHref = localizeHref('/app', pathname);
  const loginHref = localizeHref('/login', pathname);
  const registerHref = localizeHref('/register', pathname);

  return (
    <header className="sticky top-0 z-header border-b border-border bg-card/90 backdrop-blur">
      <PageContainer size="wide" className="flex h-16 items-center justify-between">
        <Link href={authenticated ? appHref : homeHref} className="flex items-center gap-3 font-semibold text-foreground">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <MoonStar className="size-4" aria-hidden />
          </span>
          <span className="text-base tracking-normal">{labels.appName}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Public navigation">
          {publicLinks.map((link) => {
            const href = localizeHref(link.href, pathname);
            const active = isActivePath(link.href, pathname);
            return (
              <Button key={link.href} asChild variant="ghost" size="sm" className={active ? 'bg-muted text-foreground' : undefined}>
                <Link href={href} aria-current={active ? 'page' : undefined}>
                  {link.label}
                </Link>
              </Button>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <ThemeToggle />
          {authenticated ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={appHref}>{labels.mySession}</Link>
              </Button>
              <ProfileMenu signOutLabel={labels.signOut} />
            </>
          ) : (
            <>
              <Button asChild variant="outline" size="sm">
                <Link href={loginHref}>{labels.signIn}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={registerHref}>{labels.startReading}</Link>
              </Button>
            </>
          )}
        </div>

        <Button type="button" variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
          <Menu aria-hidden />
        </Button>
      </PageContainer>

      <Drawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={labels.appName}
        description="Navigation"
        side="end"
        footer={
          <div className="space-y-2">
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href="/admin/login" onClick={() => setDrawerOpen(false)}>
                {labels.adminSignIn}
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        }
      >
        <div className="space-y-5">
          <LanguageSwitcher className="w-full justify-start" />
          <nav className="grid gap-2" aria-label="Mobile public navigation">
            {publicLinks.map((link) => (
              <Button key={link.href} asChild variant="ghost" className="justify-start">
                <Link href={localizeHref(link.href, pathname)} onClick={() => setDrawerOpen(false)}>
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>
          <div className="grid gap-2 border-t border-border pt-5">
            {authenticated ? (
              <>
                <Button asChild>
                  <Link href={appHref} onClick={() => setDrawerOpen(false)}>
                    {labels.mySession}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={localizeHref('/profile', pathname)} onClick={() => setDrawerOpen(false)}>
                    Profile
                  </Link>
                </Button>
                <SignOutButton endpoint="/api/auth/logout" redirectTo={loginHref} label={labels.signOut} />
              </>
            ) : (
              <>
                <Button asChild>
                  <Link href={registerHref} onClick={() => setDrawerOpen(false)}>
                    {labels.startReading}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={loginHref} onClick={() => setDrawerOpen(false)}>
                    {labels.signIn}
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
}
