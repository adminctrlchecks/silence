'use client';

import { History, LayoutDashboard, MessageSquareText, MoonStar, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { isActivePath, localizeHref } from './nav-links';

const appLinks = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/questions', label: 'Questions', icon: MessageSquareText },
  { href: '/app/chart', label: 'Chart', icon: MoonStar },
  { href: '/app/remedy', label: 'Remedy', icon: Sparkles },
  { href: '/history', label: 'History', icon: History },
];

function isActiveAppLink(href: string, pathname: string) {
  if (href !== '/app') return isActivePath(href, pathname);
  return (
    isActivePath('/app', pathname) &&
    !isActivePath('/app/questions', pathname) &&
    !isActivePath('/app/chart', pathname) &&
    !isActivePath('/app/remedy', pathname)
  );
}

export function UserAppNavigation() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden border-b border-border bg-card md:block" aria-label="User app navigation">
        <div className="mx-auto flex h-12 w-full max-w-7xl items-center gap-1 px-4 sm:px-6">
          {appLinks.map((item) => {
            const active = isActiveAppLink(item.href, pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={localizeHref(item.href, pathname)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                  active && 'bg-muted text-foreground shadow-sm',
                )}
              >
                <Icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <nav
        className="fixed inset-x-0 bottom-0 z-header border-t border-border bg-card/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-popover backdrop-blur md:hidden"
        aria-label="Mobile user app navigation"
      >
        <div className="grid grid-cols-5 gap-1">
          {appLinks.map((item) => {
            const active = isActiveAppLink(item.href, pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={localizeHref(item.href, pathname)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-[0.6875rem] font-semibold text-muted-foreground',
                  active && 'bg-muted text-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
