import { LoadingState } from '@/components/ui/screen-state';

export default function ChartLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <LoadingState title="Calculating your chart" />
    </main>
  );
}
