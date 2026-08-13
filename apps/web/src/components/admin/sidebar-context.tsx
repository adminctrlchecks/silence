'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type SidebarContextValue = {
  expanded: boolean;
  hovered: boolean;
  mobileOpen: boolean;
  open: boolean;
  setHovered: (hovered: boolean) => void;
  toggleDesktop: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
};

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function useAdminSidebar() {
  const value = useContext(SidebarContext);
  if (!value) throw new Error('useAdminSidebar must be used within AdminSidebarProvider');
  return value;
}

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    closeOnDesktop();
    window.addEventListener('resize', closeOnDesktop);
    return () => window.removeEventListener('resize', closeOnDesktop);
  }, []);

  const value = useMemo(
    () => ({
      expanded,
      hovered,
      mobileOpen,
      open: expanded || hovered || mobileOpen,
      setHovered,
      toggleDesktop: () => setExpanded((current) => !current),
      toggleMobile: () => setMobileOpen((current) => !current),
      closeMobile: () => setMobileOpen(false),
    }),
    [expanded, hovered, mobileOpen],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
