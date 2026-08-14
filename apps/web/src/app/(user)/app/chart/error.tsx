'use client';

import { ErrorState } from '@/components/ui/screen-state';

export default function ChartError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <ErrorState
        title="Your chart could not load"
        message={error.message}
        action={{ label: 'Retry chart', onClick: reset }}
      />
    </main>
  );
}
