import { Suspense } from 'react';
import { QuestionsAdmin } from '@/components/admin/questions-admin';

export default function AdminQuestionsPage() {
  return (
    <Suspense>
      <QuestionsAdmin />
    </Suspense>
  );
}
