'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bot,
  ClipboardList,
  FileSpreadsheet,
  Gauge,
  Languages,
  MessageSquareText,
  MoonStar,
  Settings2,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminSidebar } from './sidebar-context';

const navItems = [
  { href: '/admin', label: 'Overview', icon: Gauge },
  { href: '/admin/questions', label: 'Questions', icon: ClipboardList },
  { href: '/admin/answers', label: 'Answers', icon: MessageSquareText },
  { href: '/admin/answers?source=ai&reviewed=false', label: 'AI review', icon: Bot },
  { href: '/admin/remedies', label: 'Remedies', icon: MoonStar },
  { href: '/admin/chart-config', label: 'Chart config', icon: BarChart3 },
  { href: '/admin/import', label: 'Import', icon: FileSpreadsheet },
  { href: '/admin/languages', label: 'Languages', icon: Languages },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { open, expanded, hovered, mobileOpen, setHovered } = useAdminSidebar();

  return (
    <aside
      className={cn(
        'admin-sidebar-panel fixed inset-y-0 start-0 z-50 flex flex-col border-e border-border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out',
        open ? 'w-72' : 'w-20',
        mobileOpen ? 'translate-x-0' : 'admin-sidebar-mobile-closed -translate-x-full lg:translate-x-0',
      )}
      onMouseEnter={() => !expanded && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={cn('flex h-16 items-center border-b border-border px-4', open ? 'justify-start' : 'justify-center')}>
        <Link href="/admin" className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            S
          </span>
          {open ? (
            <span className="truncate text-base font-semibold tracking-normal">Silence Admin</span>
          ) : null}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className={cn('mb-3 text-xs font-medium uppercase text-muted-foreground', open ? 'px-3' : 'text-center')}>
          {open ? 'Menu' : '...'}
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href.split('?')[0]);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.label}
                  className={cn(
                    'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
                    open ? 'justify-start' : 'justify-center',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {open ? <span className="truncate">{item.label}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {(expanded || hovered || mobileOpen) && (
        <div className="m-3 rounded-md border border-border bg-muted p-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Settings2 className="size-4 text-primary" />
            Review queue
          </div>
          <p className="mt-1 text-xs text-muted-foreground">AI answers wait here before publishing.</p>
        </div>
      )}
    </aside>
  );
}
