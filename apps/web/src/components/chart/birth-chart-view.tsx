import { getTranslations } from 'next-intl/server';
import { RoxyVedicKundli } from '@/components/roxy-ui/vedic-kundli';
import { chartToRoxyBirthChart } from '@/lib/roxy-chart-adapter';

type ChartGeometry = {
  ascendant?: { signName?: string; degree?: number } | null;
  placements?: Array<{
    planet?: string;
    signName?: string;
    house?: number;
    retrograde?: boolean;
  }>;
};

/** Accepts both the live `UserChart` (chart endpoint) and `SavedUserChart` (session/history) shapes. */
type ChartLike = {
  style: string;
  data: unknown;
  interpretation?: string | null;
  createdAt: string;
};

export async function BirthChartView({ chart }: { chart: ChartLike }) {
  const t = await getTranslations('Chart');
  const roxyChart = chartToRoxyBirthChart(chart);
  const geometry = chart.data as ChartGeometry;
  const ascendant = geometry.ascendant?.signName
    ? `${geometry.ascendant.signName}${
        typeof geometry.ascendant.degree === 'number' ? ` ${geometry.ascendant.degree.toFixed(1)}°` : ''
      }`
    : t('notAvailable');
  const placements = geometry.placements?.slice(0, 5) ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="rounded-md border border-border bg-card p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-primary">{t('chartLabel')}</p>
            <p className="text-xs text-muted-foreground">{t('chartHelp')}</p>
          </div>
          <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
            {chart.style}
          </span>
        </div>
        <RoxyVedicKundli
          data={roxyChart}
          chartStyle={chart.style === 'south-indian' ? 'south' : 'north'}
          className="block min-h-[28rem] w-full"
          hideReadings
        />
      </div>
      <aside className="rounded-md border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium text-primary">{t('interpretation')}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t('interpretationHelp')}</p>

        <dl className="mt-4 space-y-3 border-y border-border py-4 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">{t('ascendant')}</dt>
            <dd className="mt-1 text-foreground">{ascendant}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase text-muted-foreground">{t('keyPlacements')}</dt>
            <dd className="mt-2 flex flex-wrap gap-2">
              {placements.length ? (
                placements.map((placement) => (
                  <span
                    key={`${placement.planet}-${placement.signName}-${placement.house}`}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground"
                  >
                    {placement.planet} {placement.signName}
                    {placement.house ? ` | ${t('house', { house: placement.house })}` : ''}
                    {placement.retrograde ? ` | ${t('retrograde')}` : ''}
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">{t('notAvailable')}</span>
              )}
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-sm leading-6 text-muted-foreground" dir="auto">
          {chart.interpretation ?? t('fallbackInterpretation')}
        </p>
      </aside>
    </div>
  );
}
