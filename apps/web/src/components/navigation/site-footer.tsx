'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { LanguageSwitcher } from './language-switcher';
import { localizeHref } from './nav-links';

const productLinks = [
  { href: '/', label: 'Home' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/register', label: 'Start reading' },
  { href: '/login', label: 'Sign in' },
];

const trustLinks = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export function SiteFooter({ appName }: { appName: string }) {
  const pathname = usePathname();

  return (
    <footer className="border-t border-border bg-card">
      <PageContainer size="wide" className="grid gap-8 py-10 md:grid-cols-[1fr_auto_auto]">
        <div className="max-w-sm">
          <p className="text-base font-semibold">{appName}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Reflective astrology Q&A with saved readings, chart generation, and a personal remedy path.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">Copyright 2026 {appName}. Legal owner pending review.</p>
        </div>
        <nav aria-label="Footer product navigation" className="grid content-start gap-2 text-sm">
          <p className="font-semibold text-foreground">Product</p>
          {productLinks.map((link) => (
            <Link key={link.href} href={localizeHref(link.href, pathname)} className="text-muted-foreground hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="grid content-start gap-4">
          <nav aria-label="Footer trust navigation" className="grid gap-2 text-sm">
            <p className="font-semibold text-foreground">Trust</p>
            {trustLinks.map((link) => (
              <Link key={link.href} href={localizeHref(link.href, pathname)} className="text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ))}
            <Link href="/admin/login" className="text-muted-foreground hover:text-foreground">
              Admin sign in
            </Link>
          </nav>
          <LanguageSwitcher />
        </div>
      </PageContainer>
    </footer>
  );
}
