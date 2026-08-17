'use client';

import { PageContainer } from '@/components/layout/page-container';
import { ErrorState } from '@/components/ui/screen-state';

export default function UserAppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer as="main" size="wide" className="py-8">
      <ErrorState
        title="Your session could not load"
        message={error.message}
        action={{ label: 'Try again', onClick: reset }}
      />
    </PageContainer>
  );
}
