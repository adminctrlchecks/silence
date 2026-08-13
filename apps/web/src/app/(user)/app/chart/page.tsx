import { SampleKundli } from '@/components/chart/sample-kundli';

export default function ChartPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-5">
        <p className="text-sm font-medium text-primary">Sample chart</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Birth chart preview</h1>
      </div>
      <SampleKundli />
    </main>
  );
}
