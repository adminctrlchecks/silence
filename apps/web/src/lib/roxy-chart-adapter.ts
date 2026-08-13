import type { UserChart } from '@silence/shared';
import type { BirthChartResponse as RoxyBirthChartResponse } from '@roxyapi/ui-react';
import { MOCK_BIRTH_CHART } from '@/lib/mock-chart';

type Planet = {
  name?: string;
  longitude?: number;
  sign?: string;
  house?: number;
  retrograde?: boolean;
  nakshatra?: { name?: string; pada?: number };
};

type ApiChartGeometry = {
  planets?: Planet[];
};

const signs = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

function signFromLongitude(longitude = 0) {
  const normalized = ((longitude % 360) + 360) % 360;
  return signs[Math.floor(normalized / 30)] ?? 'aries';
}

function adaptPlanet(planet: Planet) {
  return {
    graha: planet.name ?? 'Planet',
    longitude: planet.longitude ?? 0,
    nakshatra: {
      name: planet.nakshatra?.name ?? 'Unknown',
      pada: planet.nakshatra?.pada ?? 1,
      key: planet.nakshatra?.pada ?? 1,
      lord: 'Moon',
    },
    isRetrograde: Boolean(planet.retrograde),
    house: planet.house ?? 1,
  };
}

export function chartToRoxyBirthChart(chart: UserChart): RoxyBirthChartResponse {
  const source = chart.data as ApiChartGeometry | undefined;

  if (!source?.planets?.length) {
    return MOCK_BIRTH_CHART;
  }

  const next = structuredClone(MOCK_BIRTH_CHART) as Record<string, unknown>;

  for (const sign of signs) {
    next[sign] = { rashi: sign, signs: [] };
  }

  const meta: Record<string, unknown> = {};

  for (const planet of source.planets) {
    const sign = planet.sign ?? signFromLongitude(planet.longitude);
    const adapted = adaptPlanet(planet);
    const block = next[sign] as { rashi: string; signs: unknown[] };
    block.signs.push(adapted);
    meta[adapted.graha] = { ...adapted, rashi: sign };
  }

  next.meta = meta;
  next.frame = {
    label: 'API chart',
    style: chart.style,
    generatedAt: chart.createdAt,
  };

  return next as unknown as RoxyBirthChartResponse;
}
