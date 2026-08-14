'use client';

import { Suspense, type FormEvent, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Menu, PanelLeftClose, PanelLeftOpen, Search, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { useAdminAuthSession } from './admin-auth-session-provider';
import { OpenUserAppButton } from './open-user-app-button';
import { useAdminSidebar } from './sidebar-context';

function titleForPath(pathname: string) {
  if (pathname === '/admin') return 'Overview';
  const segment = pathname.split('/').filter(Boolean).at(-1);
  return segment ? segment.replace(/-/g, ' ') : 'Admin';
}

function contentSearchLabel(pathname: string) {
  if (pathname.startsWith('/admin/questions')) return 'Search questions';
  if (pathname.startsWith('/admin/answers')) return 'Search answers';
  if (pathname.startsWith('/admin/remedies')) return 'Search remedies';
  return null;
}

function SearchFallback() {
  return (
    <div className="hidden h-10 min-w-64 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm text-muted-foreground md:flex">
      <Search className="size-4" />
      <span>Search content</span>
    </div>
  );
}

function AdminContentSearch({ pathname }: { pathname: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const label = contentSearchLabel(pathname);
  const currentSearch = useMemo(() => searchParams.get('q') ?? '', [searchParams]);
  const [value, setValue] = useState(currentSearch);

  useEffect(() => {
    setValue(currentSearch);
  }, [currentSearch, pathname]);

  if (!label) return null;

  function applySearch(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = nextValue.trim();

    if (trimmed) params.set('q', trimmed);
    else params.delete('q');
    params.delete('page');

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applySearch(value);
  }

  return (
    <form
      role="search"
      className="hidden h-10 min-w-64 max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm md:flex xl:max-w-md"
      onSubmit={onSubmit}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        aria-label={label}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        placeholder={label}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      {value ? (
        <button
          type="button"
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Clear search"
          title="Clear search"
          onClick={() => {
            setValue('');
            applySearch('');
          }}
        >
          <X className="size-4" />
        </button>
      ) : null}
    </form>
  );
}

export function AdminHeader() {
  const pathname = usePathname();
  const { expanded, toggleDesktop, toggleMobile } = useAdminSidebar();
  const { authenticated } = useAdminAuthSession();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggleMobile}
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <Menu />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden lg:inline-flex"
          onClick={toggleDesktop}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">Admin</p>
          <h1 className="truncate text-base font-semibold capitalize tracking-normal">{titleForPath(pathname)}</h1>
        </div>

        <Suspense fallback={<SearchFallback />}>
          <AdminContentSearch pathname={pathname} />
        </Suspense>

        <ThemeToggle />
        {authenticated ? <OpenUserAppButton /> : null}
        {authenticated ? (
          <SignOutButton endpoint="/api/auth/admin/logout" redirectTo="/admin/login" />
        ) : null}
      </div>
    </header>
  );
}
