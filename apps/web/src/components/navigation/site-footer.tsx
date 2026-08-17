'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { LanguageSwitcher } from './language-switcher';
import { localizeHref } from './nav-links';

export function SiteFooter({ appName, authenticated }: { appName: string; authenticated?: boolean }) {
  const pathname = usePathname();
  const nav = useTranslations('Nav');

  const productLinks = [
    { href: '/', label: nav('home') },
    { href: '/#how-it-works', label: nav('howItWorks') },
    { href: '/register', label: nav('startReading') },
    { href: '/login', label: nav('signIn') },
  ];

  const trustLinks = [
    { href: '/privacy', label: nav('privacy') },
    { href: '/terms', label: nav('terms') },
  ];

  return (
    <footer className="border-t border-border bg-card">
      <PageContainer size="wide" className="grid gap-8 py-10 md:grid-cols-[1fr_auto_auto]">
        <div className="max-w-sm">
          <p className="text-base font-semibold">{appName}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{nav('footerDescription')}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            {nav('copyright', { year: new Date().getFullYear(), appName })}
          </p>
        </div>
        <nav aria-label={nav('footerProductNavLabel')} className="grid content-start gap-2 text-sm">
          <p className="font-semibold text-foreground">{nav('product')}</p>
          {productLinks.map((link) => (
            <Link key={link.href} href={localizeHref(link.href, pathname)} className="text-muted-foreground hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="grid content-start gap-4">
          <nav aria-label={nav('footerTrustNavLabel')} className="grid gap-2 text-sm">
            <p className="font-semibold text-foreground">{nav('trust')}</p>
            {trustLinks.map((link) => (
              <Link key={link.href} href={localizeHref(link.href, pathname)} className="text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ))}
            <Link href="/admin/login" className="text-muted-foreground hover:text-foreground">
              {nav('adminSignIn')}
            </Link>
          </nav>
          <LanguageSwitcher authenticated={authenticated} />
        </div>
      </PageContainer>
    </footer>
  );
}
