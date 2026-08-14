import type { BirthChartResponse as RoxyBirthChartResponse } from '@roxyapi/ui-react';
import { MOCK_BIRTH_CHART } from '@/lib/mock-chart';

type Planet = {
  planet?: string;
  name?: string;
  longitude?: number;
  degree?: number;
  signName?: string;
  sign?: string | number;
  house?: number;
  retrograde?: boolean;
  nakshatra?: { name?: string; pada?: number };
};

type ApiChartGeometry = {
  ascendant?: { longitude?: number; signName?: string; degree?: number } | null;
  input?: { dob?: string; timeOfBirth?: string; city?: string; country?: string };
  placements?: Planet[];
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

function signKey(value?: string | number, longitude?: number) {
  if (typeof value === 'number') {
    return signs[value - 1] ?? signFromLongitude(longitude);
  }
  const normalized = value?.trim().toLowerCase().replace(/\s+/g, '-');
  return signs.find((sign) => sign === normalized) ?? signFromLongitude(longitude);
}

function adaptPlanet(planet: Planet) {
  return {
    graha: planet.planet ?? planet.name ?? 'Planet',
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

export function chartToRoxyBirthChart(chart: {
  data: unknown;
  style: string;
  createdAt: string;
}): RoxyBirthChartResponse {
  const source = chart.data as ApiChartGeometry | undefined;
  const planets = source?.placements?.length ? source.placements : source?.planets;

  if (!planets?.length) {
    return MOCK_BIRTH_CHART;
  }

  const next = structuredClone(MOCK_BIRTH_CHART) as Record<string, unknown>;

  for (const sign of signs) {
    next[sign] = { rashi: sign, signs: [] };
  }

  const meta: Record<string, unknown> = {};

  if (source?.ascendant) {
    const longitude = source.ascendant.longitude ?? 0;
    const sign = signKey(source.ascendant.signName, longitude);
    const lagna = {
      graha: 'Lagna',
      longitude,
      nakshatra: { name: 'Unknown', pada: 1, key: 1, lord: 'Moon' },
      isRetrograde: false,
      house: 1,
    };
    const block = next[sign] as { rashi: string; signs: unknown[] };
    block.signs.push(lagna);
    meta.Lagna = { ...lagna, rashi: sign };
  }

  for (const planet of planets) {
    const sign = signKey(planet.sign ?? planet.signName, planet.longitude);
    const adapted = adaptPlanet(planet);
    const block = next[sign] as { rashi: string; signs: unknown[] };
    block.signs.push(adapted);
    meta[adapted.graha] = { ...adapted, rashi: sign };
  }

  next.meta = meta;
  next.frame = {
    label: 'API chart',
    style: chart.style,
    date: source?.input?.dob,
    time: source?.input?.timeOfBirth,
    location: [source?.input?.city, source?.input?.country].filter(Boolean).join(', '),
    generatedAt: chart.createdAt,
  };

  return next as unknown as RoxyBirthChartResponse;
}
