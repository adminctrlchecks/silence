import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthCard } from '@/components/auth/auth-card';

export const metadata: Metadata = {
  title: 'Admin Sign In',
  robots: {
    index: false,
    follow: false,
  },
};

// Renders the same unified sign-in card as /login, opened on the Admin tab
// (docs/ui-ux-audit-and-plan.md, Finding 1) rather than a separate,
// bespoke admin-only page. Kept as its own route because the admin route
// middleware (lib/auth-routing.ts) redirects unauthenticated /admin/*
// requests here by literal path, and because it's still useful as a
// direct, bookmarkable admin entry point.
export default function AdminLoginPage() {
  return (
    <Suspense>
      <AuthCard mode="login" defaultSignInAs="admin" />
    </Suspense>
  );
}
