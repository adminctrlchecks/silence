import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  HelpCircle,
  Home,
  Info,
  MapPin,
  Moon,
  Orbit,
  Sparkles,
  Sun,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { RoxyVedicKundli } from '@/components/roxy-ui/vedic-kundli';
import { ReadingDisclaimer } from '@/components/shared/reading-disclaimer';
import { Button } from '@/components/ui/button';
import { chartToRoxyBirthChart } from '@/lib/roxy-chart-adapter';

type ChartGeometry = {
  engine?: string;
  zodiac?: string;
  julianDay?: number;
  input?: {
    dob?: string;
    timeOfBirth?: string;
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
    timezone?: string;
  };
  ascendant?: { longitude?: number; sign?: number; signName?: string; degree?: number } | null;
  accuracy?: 'exact' | 'approximate' | 'uncertain';
  houses?: Array<{
    house?: number;
    sign?: number;
    signName?: string;
    degree?: number;
    cuspLongitude?: number;
  }>;
  placements?: Array<{
    planet?: string;
    longitude?: number;
    sign?: number;
    signName?: string;
    degree?: number;
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
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
  approximate: {
    icon: AlertCircle,
    className:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  uncertain: {
    icon: HelpCircle,
    className: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300',
  },
} as const;

const PLANET_ORDER = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];

function formatDegree(value: number | undefined, notAvailable: string, digits = 1) {
  return typeof value === 'number' ? `${value.toFixed(digits)}°` : notAvailable;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function formatCoordinate(value: number | undefined, notAvailable: string, axis?: 'lat' | 'lng') {
  if (typeof value !== 'number') return notAvailable;
  const suffix = axis === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
  return `${Math.abs(value).toFixed(4)}° ${suffix}`;
}

function byPlanetOrder(a: { planet?: string }, b: { planet?: string }) {
  const ai = PLANET_ORDER.indexOf(a.planet ?? '');
  const bi = PLANET_ORDER.indexOf(b.planet ?? '');
  return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
}

function houseCounts(placements: NonNullable<ChartGeometry['placements']>) {
  const counts = new Map<number, number>();
  for (const placement of placements) {
    if (typeof placement.house !== 'number') continue;
    counts.set(placement.house, (counts.get(placement.house) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

export async function BirthChartView({ chart }: { chart: ChartLike }) {
  const t = await getTranslations('Chart');
  const notAvailable = t('notAvailable');
  const roxyChart = chartToRoxyBirthChart(chart);
  const geometry = (chart.data ?? {}) as ChartGeometry;
  const placements = [...(geometry.placements ?? [])].sort(byPlanetOrder);
  const houses = geometry.houses ?? [];
  const accuracy = geometry.accuracy ?? 'uncertain';
  const accuracyStyle = ACCURACY_STYLES[accuracy] ?? ACCURACY_STYLES.uncertain;
  const AccuracyIcon = accuracyStyle.icon;
  const busiestHouse = houseCounts(placements)[0];
  const location = [geometry.input?.city, geometry.input?.country].filter(Boolean).join(', ') || notAvailable;
  const hasCoordinates = typeof geometry.input?.lat === 'number' && typeof geometry.input?.lng === 'number';
  const ascendant = geometry.ascendant?.signName
    ? `${geometry.ascendant.signName}${
        typeof geometry.ascendant.degree === 'number' ? ` ${formatDegree(geometry.ascendant.degree, notAvailable)}` : ''
      }`
    : notAvailable;
  const keyPlacements = placements
    .filter((placement) => ['Sun', 'Moon', 'Rahu', 'Ketu'].includes(placement.planet ?? ''))
    .slice(0, 4);
  const sourceWarning =
    accuracy === 'exact' ? null : accuracy === 'approximate' ? t('warningApproximate') : t('warningUncertain');

  const summary = [
    { label: t('ascendant'), value: ascendant, detail: t('detailAscendant'), icon: Sparkles },
    {
      label: t('labelSun'),
      value: placements.find((placement) => placement.planet === 'Sun')?.signName ?? notAvailable,
      detail: t('detailSun'),
      icon: Sun,
    },
    {
      label: t('labelMoon'),
      value: placements.find((placement) => placement.planet === 'Moon')?.signName ?? notAvailable,
      detail: t('detailMoon'),
      icon: Moon,
    },
    {
      label: t('labelActiveHouse'),
      value: busiestHouse ? t('house', { house: busiestHouse[0] }) : notAvailable,
      detail: busiestHouse ? t('activeHouseDetail', { count: busiestHouse[1] }) : t('detailNoHouseEmphasis'),
      icon: Home,
    },
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {summary.map(({ label, value, detail, icon: Icon }) => (
          <article key={label} className="rounded-md border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
              <Icon className="size-4 text-primary" />
              {label}
            </div>
            <p className="mt-2 text-xl font-semibold tracking-normal">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </article>
        ))}
      </section>

      {/* Plain-language summary + accuracy badge, ahead of the technical
          chart/tables per docs/product-redesign/14-page-specifications.md §6
          hierarchy ("plain-language summary -> accuracy badge -> chart
          visual -> key placements -> interpretation -> technical table"). */}
      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">{t('interpretation')}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">{t('interpretationHeading')}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t('interpretationHelp')}</p>
          </div>
          <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
            {t('generatedOn', { date: formatDate(chart.createdAt) })}
          </span>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground" dir="auto">
          {chart.interpretation ?? t('fallbackInterpretation')}
        </p>
        <div
          role="status"
          className={`mt-4 flex items-start gap-2 rounded-md border px-3 py-2 text-xs leading-5 ${accuracyStyle.className}`}
        >
          <AccuracyIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            <span className="font-semibold">{t('accuracy.label')}: </span>
            {t(`accuracy.${accuracy}`)}
          </span>
        </div>
        <div className="mt-4">
          <ReadingDisclaimer />
        </div>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/app/remedy">
            <Sparkles />
            {t('viewRemedy')}
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
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
          {/* The chart wheel itself is decorative for assistive tech: the same
              data is available as the accessible text summary below and the
              Placements table further down, so the graphic is hidden from
              the accessibility tree rather than exposed as unlabeled shapes. */}
          <p className="sr-only">{t('chartVisualAlt')}</p>
          <div aria-hidden="true">
            <RoxyVedicKundli
              data={roxyChart}
              chartStyle={chart.style === 'south-indian' ? 'south' : 'north'}
              className="block min-h-[28rem] w-full"
              hideReadings
            />
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-md border border-border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium text-primary">{t('chartSummaryHeading')}</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <dt className="text-xs font-medium uppercase text-muted-foreground">{t('birthDataLabel')}</dt>
                  <dd className="mt-1">
                    {geometry.input?.dob ?? notAvailable} {t('atConnector')} {geometry.input?.timeOfBirth ?? notAvailable}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <dt className="text-xs font-medium uppercase text-muted-foreground">{t('birthPlaceLabel')}</dt>
                  <dd className="mt-1">{location}</dd>
                  <dd className="mt-1 text-xs text-muted-foreground">
                    {hasCoordinates
                      ? `${formatCoordinate(geometry.input?.lat, notAvailable, 'lat')}, ${formatCoordinate(geometry.input?.lng, notAvailable, 'lng')}`
                      : t('coordinatesNotAvailable')}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Orbit className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <dt className="text-xs font-medium uppercase text-muted-foreground">{t('calculationLabel')}</dt>
                  <dd className="mt-1">{geometry.engine ?? notAvailable}</dd>
                  <dd className="mt-1 text-xs text-muted-foreground">
                    {t('zodiacSuffix', { zodiac: geometry.zodiac ?? notAvailable })}
                    {typeof geometry.julianDay === 'number' ? ` | ${t('julianDayLabel', { value: geometry.julianDay })}` : ''}
                  </dd>
                </div>
              </div>
            </dl>
          </section>

          <section className="rounded-md border border-border bg-card p-4 shadow-sm">
            {sourceWarning ? (
              <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" />
                {sourceWarning}
              </p>
            ) : null}
            <p className={sourceWarning ? 'mt-3 text-xs text-muted-foreground' : 'text-xs text-muted-foreground'}>
              {t('timezoneLabel', { value: geometry.input?.timezone ?? notAvailable })}
            </p>
          </section>
        </aside>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="rounded-md border border-border bg-card shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-base font-semibold tracking-normal">{t('placementsHeading')}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t('placementsDescription')}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">{t('placementsDescription')}</caption>
              <thead>
                <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                  <th scope="col" className="px-4 py-2 text-start">{t('columnPlanet')}</th>
                  <th scope="col" className="px-4 py-2 text-start">{t('columnSign')}</th>
                  <th scope="col" className="px-4 py-2 text-start">{t('columnDegree')}</th>
                  <th scope="col" className="px-4 py-2 text-start">{t('columnHouse')}</th>
                  <th scope="col" className="px-4 py-2 text-start">{t('columnMotion')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {placements.length ? (
                  placements.map((placement) => (
                    <tr key={`${placement.planet}-${placement.longitude}`}>
                      <td className="px-4 py-3 font-medium">{placement.planet ?? notAvailable}</td>
                      <td className="px-4 py-3 text-muted-foreground">{placement.signName ?? notAvailable}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDegree(placement.degree, notAvailable)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {placement.house ? t('house', { house: placement.house }) : notAvailable}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {placement.retrograde ? t('retrograde') : t('motionDirect')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                      {notAvailable}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <section className="rounded-md border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium text-primary">{t('keyPlacements')}</p>
          <div className="mt-3 space-y-2">
            {keyPlacements.length ? (
              keyPlacements.map((placement) => (
                <div key={`${placement.planet}-${placement.signName}`} className="rounded-md border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{placement.planet}</p>
                    <span className="rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground">
                      {placement.house ? t('house', { house: placement.house }) : notAvailable}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {placement.signName ?? notAvailable} {formatDegree(placement.degree, notAvailable)}
                    {placement.retrograde ? ` | ${t('retrograde')}` : ''}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{notAvailable}</p>
            )}
          </div>
        </section>
      </section>

      <section className="rounded-md border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium text-primary">{t('housesHeading')}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {houses.length ? (
            houses.map((house) => (
              <div
                key={house.house}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-background p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{house.house ? t('house', { house: house.house }) : notAvailable}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{house.signName ?? notAvailable}</p>
                </div>
                <span className="text-xs text-muted-foreground">{formatDegree(house.degree, notAvailable)}</span>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-border bg-background p-3 text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
              {t('housesFallback')}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
