import { LoadingState } from '@/components/ui/screen-state';

export default function HistoryLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <LoadingState title="Loading history" />
    </main>
  );
}
