import { AstrologyService } from './astrology.service';

/**
 * Known-datum test. At the J2000 epoch (2000-01-01 12:00 UT) the Sun's tropical
 * ecliptic longitude is ~280.37° (Capricorn ~10.4°) — a standard textbook value,
 * independent of our engine. We anchor the test on that, plus structural checks.
 */
describe('AstrologyService', () => {
  const service = new AstrologyService();

  // Chennai coordinates so houses/ascendant are computed.
  const birth = {
    dob: '2000-01-01',
    timeOfBirth: '12:00',
    lat: 13.0827,
    lng: 80.2707,
    city: 'Chennai',
    country: 'IN',
  };

  const chart = service.compute(birth, 'other');

  it('reports the Swiss Ephemeris engine and tropical zodiac', () => {
    expect(chart.engine).toContain('swiss-ephemeris');
    expect(chart.zodiac).toBe('tropical');
    expect(chart.julianDay).toBeCloseTo(2451545, 0); // JD for J2000
  });

  it("computes the Sun's tropical longitude at J2000 (~280.37°, Capricorn)", () => {
    const sun = chart.placements.find((p) => p.planet === 'Sun')!;
    expect(sun).toBeDefined();
    expect(sun.longitude).toBeCloseTo(280.37, 1); // within 0.05°
    expect(sun.signName).toBe('Capricorn');
    expect(sun.degree).toBeCloseTo(10.37, 1);
    expect(sun.retrograde).toBe(false);
  });

  it('returns all nine grahas with Ketu opposite Rahu', () => {
    const names = chart.placements.map((p) => p.planet);
    expect(names).toEqual(
      expect.arrayContaining(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu']),
    );
    const rahu = chart.placements.find((p) => p.planet === 'Rahu')!;
    const ketu = chart.placements.find((p) => p.planet === 'Ketu')!;
    const separation = (ketu.longitude - rahu.longitude + 360) % 360;
    expect(separation).toBeCloseTo(180, 3); // exactly 180° apart
  });

  it('computes 12 houses and an ascendant when coordinates are given', () => {
    expect(chart.houses).toHaveLength(12);
    expect(chart.ascendant).not.toBeNull();
    expect(chart.ascendant!.sign).toBeGreaterThanOrEqual(1);
    expect(chart.ascendant!.sign).toBeLessThanOrEqual(12);
    // Every planet is assigned to a real house (1..12).
    for (const p of chart.placements) {
      expect(p.house).toBeGreaterThanOrEqual(1);
      expect(p.house).toBeLessThanOrEqual(12);
    }
  });

  it('falls back to whole-sign houses when coordinates are absent', () => {
    const noCoords = service.compute(
      { dob: '2000-01-01', timeOfBirth: '12:00', city: 'Chennai', country: 'IN' },
      'other',
    );
    expect(noCoords.houses).toHaveLength(0);
    expect(noCoords.ascendant).toBeNull();
    const sun = noCoords.placements.find((p) => p.planet === 'Sun')!;
    expect(sun.house).toBe(sun.sign); // whole-sign fallback
  });
});
