'use client';

import { PageContainer } from '@/components/layout/page-container';
import { ErrorState } from '@/components/ui/screen-state';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer as="main" size="reading" className="py-8">
      <ErrorState
        title="Profile could not load"
        message={error.message}
        action={{ label: 'Try again', onClick: reset }}
      />
    </PageContainer>
  );
}
