'use client';

import type { ReactNode } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { cn } from '@/lib/utils';
import { AdminHeader } from './admin-header';
import { AdminSidebar } from './admin-sidebar';
import { AdminSidebarProvider, useAdminSidebar } from './sidebar-context';

function AdminShellFrame({ children }: { children: ReactNode }) {
  const { open, mobileOpen, closeMobile } = useAdminSidebar();

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={closeMobile}
        />
      ) : null}
      <div className={cn('min-h-screen transition-[padding] duration-300 ease-in-out', open ? 'lg:ps-72' : 'lg:ps-20')}>
        <AdminHeader />
        <PageContainer as="main" size="wide" gutter="admin" className="py-5">
          {children}
        </PageContainer>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <AdminSidebarProvider>
      <AdminShellFrame>{children}</AdminShellFrame>
    </AdminSidebarProvider>
  );
}
