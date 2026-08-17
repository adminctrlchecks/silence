'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { localizeHref, splitLocalizedPath } from '@/components/navigation/nav-links';

export function ProfileNav({
  labels,
}: {
  labels: { overview: string; birthDetails: string; security: string; privacy: string };
}) {
  const pathname = usePathname();
  const { pathWithoutLocale } = splitLocalizedPath(pathname);

  const items = [
    { href: '/profile', label: labels.overview },
    { href: '/profile/birth-details', label: labels.birthDetails },
    { href: '/profile/security', label: labels.security },
    { href: '/profile/privacy', label: labels.privacy },
  ];

  return (
    <nav aria-label={labels.overview} className="mb-5 flex gap-2 overflow-x-auto pb-1">
      {items.map((item) => {
        const active = pathWithoutLocale === item.href;
        return (
          <Link
            key={item.href}
            href={localizeHref(item.href, pathname)}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              active && 'bg-primary/10 text-primary',
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
