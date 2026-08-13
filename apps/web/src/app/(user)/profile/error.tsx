'use client';

import { ErrorState } from '@/components/ui/screen-state';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <ErrorState
        title="Profile could not load"
        message={error.message}
        action={{ label: 'Try again', onClick: reset }}
      />
    </main>
  );
}
