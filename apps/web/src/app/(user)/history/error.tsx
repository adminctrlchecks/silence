'use client';

import { ErrorState } from '@/components/ui/screen-state';

export default function HistoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <ErrorState
        title="History could not load"
        message={error.message}
        action={{ label: 'Try again', onClick: reset }}
      />
    </main>
  );
}
