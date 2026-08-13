import { Suspense } from 'react';
import { AdminLoginCard } from '@/components/admin/admin-login-card';

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginCard />
    </Suspense>
  );
}
