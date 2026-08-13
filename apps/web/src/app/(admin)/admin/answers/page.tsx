import { Suspense } from 'react';
import { AnswersAdmin } from '@/components/admin/answers-admin';

export default function AdminAnswersPage() {
  return (
    <Suspense>
      <AnswersAdmin />
    </Suspense>
  );
}
