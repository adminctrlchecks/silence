import type { UserChart } from '@silence/shared';
import { getTranslations } from 'next-intl/server';
import { RoxyVedicKundli } from '@/components/roxy-ui/vedic-kundli';
import { chartToRoxyBirthChart } from '@/lib/roxy-chart-adapter';

export async function BirthChartView({ chart }: { chart: UserChart }) {
  const t = await getTranslations('Chart');
  const roxyChart = chartToRoxyBirthChart(chart);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="rounded-md border border-border bg-card p-4 shadow-sm">
        <RoxyVedicKundli
          data={roxyChart}
          chartStyle={chart.style === 'south-indian' ? 'south' : 'north'}
          className="block min-h-[28rem] w-full"
          hideReadings
        />
      </div>
      <aside className="rounded-md border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium text-primary">{t('interpretation')}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {chart.interpretation ?? t('fallbackInterpretation')}
        </p>
      </aside>
    </div>
  );
}
