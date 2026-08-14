import { AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { RoxyVedicKundli } from '@/components/roxy-ui/vedic-kundli';
import { chartToRoxyBirthChart } from '@/lib/roxy-chart-adapter';

type ChartGeometry = {
  ascendant?: { signName?: string; degree?: number } | null;
  accuracy?: 'exact' | 'approximate' | 'uncertain';
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

const ACCURACY_STYLES = {
  exact: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
  approximate: {
    icon: AlertCircle,
    className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  uncertain: {
    icon: HelpCircle,
    className: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300',
  },
} as const;

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
  const accuracy = geometry.accuracy ?? 'uncertain';
  const accuracyStyle = ACCURACY_STYLES[accuracy] ?? ACCURACY_STYLES.uncertain;
  const AccuracyIcon = accuracyStyle.icon;

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

        {/* Accuracy badge */}
        <div
          role="status"
          className={`mt-3 flex items-start gap-2 rounded-md border px-3 py-2 text-xs leading-5 ${accuracyStyle.className}`}
        >
          <AccuracyIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <span className="font-semibold">{t('accuracy.label')}: </span>
            {t(`accuracy.${accuracy}`)}
          </span>
        </div>

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
