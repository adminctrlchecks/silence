'use client';

import { ErrorState } from '@/components/ui/screen-state';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Admin workspace could not load"
      message={error.message}
      action={{ label: 'Try again', onClick: reset }}
    />
  );
}
