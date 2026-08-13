import { RoxyVedicKundli } from '@/components/roxy-ui/vedic-kundli';
import { RoxyDoshaCard } from '@/components/roxy-ui/dosha-card';
import { MOCK_BIRTH_CHART, MOCK_DOSHA_CARD } from '@/lib/mock-chart';

export function SampleKundli() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="rounded-md border border-border bg-card p-4 shadow-sm">
        <RoxyVedicKundli
          data={MOCK_BIRTH_CHART}
          chartStyle="north"
          className="block min-h-[28rem] w-full"
          hideReadings
        />
      </div>
      <RoxyDoshaCard
        data={MOCK_DOSHA_CARD}
        type="manglik"
        className="block min-h-[28rem] w-full rounded-md border border-border bg-card p-4 shadow-sm"
      />
    </div>
  );
}
