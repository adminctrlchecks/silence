import { Suspense } from 'react';
import { RemediesAdmin } from '@/components/admin/remedies-admin';

export default function AdminRemediesPage() {
  return (
    <Suspense>
      <RemediesAdmin />
    </Suspense>
  );
}
