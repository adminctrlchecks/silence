import { Injectable, Logger } from '@nestjs/common';
import * as sweph from 'sweph';
import type { Category } from '@silence/shared';

export interface BirthDetails {
  dob: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:MM (local time)
  lat?: number;
  lng?: number;
  city: string;
  country: string;
  timezone?: string;
}

const { constants: C } = sweph;

/** Tropical zodiac signs, index 0 = Aries. */
const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;

/** The classical grahas: seven visible bodies + the lunar nodes (Rahu/Ketu). */
const BODIES: ReadonlyArray<{ name: string; id: number }> = [
  { name: 'Sun', id: C.SE_SUN },
  { name: 'Moon', id: C.SE_MOON },
  { name: 'Mercury', id: C.SE_MERCURY },
  { name: 'Venus', id: C.SE_VENUS },
  { name: 'Mars', id: C.SE_MARS },
  { name: 'Jupiter', id: C.SE_JUPITER },
  { name: 'Saturn', id: C.SE_SATURN },
  { name: 'Rahu', id: C.SE_MEAN_NODE }, // North node (Ketu is derived, +180°)
];

// Moshier semi-analytic ephemeris: accurate to ~arcseconds and needs NO data
// files, so it runs identically on Windows dev, CI, and the VPS.
const CALC_FLAGS = C.SEFLG_MOSEPH | C.SEFLG_SPEED;

function round(n: number, dp = 4): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

function signOf(longitude: number) {
  const lon = ((longitude % 360) + 360) % 360;
  const index = Math.floor(lon / 30); // 0..11
  return { sign: index + 1, signName: SIGNS[index], degree: round(lon - index * 30) };
}

/** Is `lon` inside the arc [start, end) going anticlockwise, handling 360° wrap? */
function inArc(lon: number, start: number, end: number): boolean {
  const l = ((lon % 360) + 360) % 360;
  const s = ((start % 360) + 360) % 360;
  const e = ((end % 360) + 360) % 360;
  return s <= e ? l >= s && l < e : l >= s || l < e;
}

/**
 * Converts a local date/time in a specific timezone to a UTC Date.
 */
export function localToUtc(dob: string, timeOfBirth: string, timezone?: string): Date {
  const [year, month, day] = (dob || '2000-01-01').split('-').map(Number);
  const [hour, minute] = (timeOfBirth || '12:00').split(':').map(Number);
  const fallbackDate = new Date(Date.UTC(year, month - 1, day, hour, minute));

  if (!timezone) {
    return fallbackDate;
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    
    const parts = formatter.formatToParts(fallbackDate);
    const getPart = (type: string) => Number(parts.find(p => p.type === type)?.value);
    
    const y = getPart('year');
    const m = getPart('month');
    const d = getPart('day');
    let h = getPart('hour');
    if (h === 24) h = 0;
    const min = getPart('minute');
    
    const formattedDate = new Date(Date.UTC(y, m - 1, d, h, min));
    const diffMs = fallbackDate.getTime() - formattedDate.getTime();
    
    return new Date(fallbackDate.getTime() + diffMs);
  } catch (_err) {
    return fallbackDate;
  }
}

/**
 * Computes the astrology chart geometry from birth date/time/place using the
 * Swiss Ephemeris (via `sweph`, Moshier mode). Engine produces the geometry;
 * Gemini writes the interpretation text elsewhere (docs/API.md §12).
 */
@Injectable()
export class AstrologyService {
  private readonly logger = new Logger(AstrologyService.name);

  compute(birth: BirthDetails, _category: Category) {
    const jd = this.julianDayUT(birth);

    const placements = BODIES.map((body) => {
      const res = sweph.calc_ut(jd, body.id, CALC_FLAGS);
      if (res.error) this.logger.warn(`sweph calc ${body.name}: ${res.error}`);
      const longitude = res.data[0];
      const speed = res.data[3];
      return {
        planet: body.name,
        longitude: round(longitude),
        ...signOf(longitude),
        retrograde: speed < 0,
        house: 0, // filled in once we know the house cusps
      };
    });

    // Ketu is exactly opposite Rahu.
    const rahu = placements.find((p) => p.planet === 'Rahu')!;
    const ketuLon = (rahu.longitude + 180) % 360;
    placements.push({
      planet: 'Ketu',
      longitude: round(ketuLon),
      ...signOf(ketuLon),
      retrograde: true, // nodes are always retrograde in mean motion
      house: 0,
    });

    const { ascendant, houses } = this.computeHouses(jd, birth);

    // Assign each planet to a house by longitude, when we have real cusps.
    if (houses.length === 12) {
      for (const p of placements) {
        const idx = houses.findIndex((h, i) =>
          inArc(p.longitude, h.cuspLongitude, houses[(i + 1) % 12].cuspLongitude),
        );
        p.house = idx >= 0 ? idx + 1 : p.sign; // fallback to sign number
      }
    } else {
      // No birthplace coordinates → use the planet's sign as a whole-sign house.
      for (const p of placements) p.house = p.sign;
    }

    return {
      engine: 'swiss-ephemeris/moshier',
      zodiac: 'tropical',
      input: birth,
      julianDay: round(jd, 6),
      accuracy: this.determineAccuracy(birth),
      ascendant,
      houses,
      placements,
    };
  }

  private determineAccuracy(birth: BirthDetails): 'exact' | 'approximate' | 'uncertain' {
    const hasCoords = typeof birth.lat === 'number' && typeof birth.lng === 'number';
    const hasTimezone = typeof birth.timezone === 'string' && birth.timezone.length > 0;
    
    if (hasCoords && hasTimezone) {
      return 'exact';
    }
    if (hasCoords || (birth.city?.trim() && birth.country?.trim())) {
      return 'approximate';
    }
    return 'uncertain';
  }

  private julianDayUT(birth: BirthDetails): number {
    const utcDate = localToUtc(birth.dob, birth.timeOfBirth, birth.timezone);
    const y = utcDate.getUTCFullYear();
    const m = utcDate.getUTCMonth() + 1;
    const d = utcDate.getUTCDate();
    const hh = utcDate.getUTCHours();
    const mm = utcDate.getUTCMinutes();
    const ss = utcDate.getUTCSeconds();
    const hour = hh + mm / 60 + ss / 3600;
    return sweph.julday(y, m, d, hour, C.SE_GREG_CAL);
  }

  private computeHouses(jd: number, birth: BirthDetails) {
    const hasCoords = typeof birth.lat === 'number' && typeof birth.lng === 'number';
    if (!hasCoords) {
      return {
        ascendant: null as null | { longitude: number; sign: number; signName: string; degree: number },
        houses: [] as Array<{ house: number; sign: number; signName: string; degree: number; cuspLongitude: number }>,
      };
    }
    try {
      const h = sweph.houses(jd, birth.lat as number, birth.lng as number, 'P'); // Placidus
      const cusps = h.data.houses; // 12 cusp longitudes
      const ascLon = h.data.points[0]; // Ascendant
      return {
        ascendant: { longitude: round(ascLon), ...signOf(ascLon) },
        houses: cusps.map((cusp: number, i: number) => ({
          house: i + 1,
          ...signOf(cusp),
          cuspLongitude: round(cusp),
        })),
      };
    } catch (err) {
      this.logger.error(`House computation failed: ${String(err)}`);
      return { ascendant: null, houses: [] };
    }
  }
}
