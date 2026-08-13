'use client';

import { createContext, useContext, type ReactNode } from 'react';

type AuthSession = {
  authenticated: boolean;
};

const AuthSessionContext = createContext<AuthSession>({ authenticated: false });

export function AuthSessionProvider({
  authenticated,
  children,
}: AuthSession & {
  children: ReactNode;
}) {
  return (
    <AuthSessionContext.Provider value={{ authenticated }}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  return useContext(AuthSessionContext);
}
