import { Injectable } from '@nestjs/common';
import type { Category } from '@silence/shared';

export interface BirthDetails {
  dob: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:MM
  lat?: number;
  lng?: number;
  city: string;
  country: string;
}

/**
 * Computes the astrology chart geometry (docs/API.md §12).
 *
 * Stub: returns a deterministic placeholder structure so the API and UI can be
 * built end-to-end. Swap `compute()` for a real ephemeris engine — e.g. Swiss
 * Ephemeris (`swisseph`) — to produce actual planetary positions. The API
 * surface (this method's return shape) stays the same regardless of engine.
 */
@Injectable()
export class AstrologyService {
  compute(birth: BirthDetails, _category: Category) {
    // TODO: replace with real ephemeris calculation from birth date/time/place.
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    return {
      engine: 'placeholder',
      input: birth,
      houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, sign: (i % 12) + 1, planets: [] as string[] })),
      placements: planets.map((p, i) => ({ planet: p, house: (i % 12) + 1, degree: (i * 30) % 360 })),
    };
  }
}
