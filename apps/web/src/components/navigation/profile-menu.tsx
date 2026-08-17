'use client';

import { Shield, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { localizeHref } from './nav-links';

export function ProfileMenu({ signOutLabel, signOutPendingLabel }: { signOutLabel: string; signOutPendingLabel?: string }) {
  const pathname = usePathname();
  const nav = useTranslations('Nav');
  const profile = useTranslations('Profile');
  const [open, setOpen] = useState(false);
  const loginHref = localizeHref('/login', pathname);

  const links = [
    { href: localizeHref('/profile', pathname), label: nav('profileLabel') },
    { href: localizeHref('/profile/security', pathname), label: profile('nav.security') },
    { href: localizeHref('/profile/privacy', pathname), label: profile('nav.privacy') },
  ];

  return (
    <>
      <Button type="button" variant="outline" size="iconSm" aria-label={nav('openProfileMenu')} onClick={() => setOpen(true)}>
        <UserRound aria-hidden />
      </Button>
      <Drawer open={open} onOpenChange={setOpen} title={nav('accountTitle')} description={nav('accountDescription')} side="end">
        <div className="space-y-5">
          <div className="rounded-md border border-border bg-muted p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Shield className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">{nav('accountTitle')}</p>
                <p className="text-xs text-muted-foreground">{nav('accountDescription')}</p>
              </div>
            </div>
          </div>
          <nav className="grid gap-2" aria-label={nav('accountNavLabel')}>
            {links.map((link) => (
              <Button key={link.href} asChild variant="ghost" className="justify-start">
                <Link href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>
          <div className="border-t border-border pt-5">
            <SignOutButton
              endpoint="/api/auth/logout"
              redirectTo={loginHref}
              label={signOutLabel}
              pendingLabel={signOutPendingLabel}
            />
          </div>
        </div>
      </Drawer>
    </>
  );
}
