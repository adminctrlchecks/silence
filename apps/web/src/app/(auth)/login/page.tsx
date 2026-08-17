import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthCard } from '@/components/auth/auth-card';

export const metadata: Metadata = {
  title: 'Sign in to Silence',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <Suspense>
      <AuthCard mode="login" />
    </Suspense>
  );
}
