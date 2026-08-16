'use client';

import { Shield, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { localizeHref } from './nav-links';

export function ProfileMenu({ signOutLabel }: { signOutLabel: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const profileHref = localizeHref('/profile', pathname);
  const loginHref = localizeHref('/login', pathname);

  const links = [
    { href: profileHref, label: 'Profile' },
    { href: `${profileHref}#security`, label: 'Security' },
    { href: `${profileHref}#privacy`, label: 'Privacy' },
  ];

  return (
    <>
      <Button type="button" variant="outline" size="iconSm" aria-label="Open profile menu" onClick={() => setOpen(true)}>
        <UserRound aria-hidden />
      </Button>
      <Drawer open={open} onOpenChange={setOpen} title="Account" description="Profile and security" side="end">
        <div className="space-y-5">
          <div className="rounded-md border border-border bg-muted p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Shield className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold">Silence account</p>
                <p className="text-xs text-muted-foreground">Reading profile and security</p>
              </div>
            </div>
          </div>
          <nav className="grid gap-2" aria-label="Account navigation">
            {links.map((link) => (
              <Button key={link.href} asChild variant="ghost" className="justify-start">
                <Link href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </Button>
            ))}
          </nav>
          <div className="border-t border-border pt-5">
            <SignOutButton endpoint="/api/auth/logout" redirectTo={loginHref} label={signOutLabel} />
          </div>
        </div>
      </Drawer>
    </>
  );
}
