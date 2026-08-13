'use client';

import { createContext, useContext, type ReactNode } from 'react';

type AdminAuthSession = {
  authenticated: boolean;
};

const AdminAuthSessionContext = createContext<AdminAuthSession>({ authenticated: false });

export function AdminAuthSessionProvider({
  authenticated,
  children,
}: AdminAuthSession & {
  children: ReactNode;
}) {
  return (
    <AdminAuthSessionContext.Provider value={{ authenticated }}>
      {children}
    </AdminAuthSessionContext.Provider>
  );
}

export function useAdminAuthSession() {
  return useContext(AdminAuthSessionContext);
}
