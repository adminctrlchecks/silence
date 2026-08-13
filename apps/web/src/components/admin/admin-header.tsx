'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, PanelLeftClose, PanelLeftOpen, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { useAdminSidebar } from './sidebar-context';

function titleForPath(pathname: string) {
  if (pathname === '/admin') return 'Overview';
  const segment = pathname.split('/').filter(Boolean).at(-1);
  return segment ? segment.replace(/-/g, ' ') : 'Admin';
}

export function AdminHeader() {
  const pathname = usePathname();
  const { expanded, toggleDesktop, toggleMobile } = useAdminSidebar();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={toggleMobile} title="Open sidebar">
          <Menu />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden lg:inline-flex"
          onClick={toggleDesktop}
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">Admin</p>
          <h1 className="truncate text-base font-semibold capitalize tracking-normal">{titleForPath(pathname)}</h1>
        </div>

        <div className="hidden h-10 min-w-64 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm text-muted-foreground md:flex">
          <Search className="size-4" />
          <span>Search content</span>
        </div>

        <ThemeToggle />
        <Button asChild variant="outline" size="sm">
          <Link href="/">User app</Link>
        </Button>
      </div>
    </header>
  );
}
