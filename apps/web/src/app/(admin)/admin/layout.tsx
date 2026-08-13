import Link from 'next/link';
import type { ReactNode } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Silence
            </Link>
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            <Link href="/admin" className="text-base font-semibold tracking-normal">
              Admin
            </Link>
          </div>
          <ThemeToggle />
        </div>
      </header>
      {children}
    </div>
  );
}
