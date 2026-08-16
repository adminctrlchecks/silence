import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminLoginCard } from '@/components/admin/admin-login-card';

export const metadata: Metadata = {
  title: 'Admin Sign In',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginCard />
    </Suspense>
  );
}
