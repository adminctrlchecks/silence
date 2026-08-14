import { Injectable, Logger } from '@nestjs/common';

export interface GeocodeResult {
  city: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
}

const STUB_CITIES: GeocodeResult[] = [
  { city: 'Chennai', country: 'IN', lat: 13.0827, lng: 80.2707, timezone: 'Asia/Kolkata' },
  { city: 'New Delhi', country: 'IN', lat: 28.6139, lng: 77.2090, timezone: 'Asia/Kolkata' },
  { city: 'Mumbai', country: 'IN', lat: 19.0760, lng: 72.8777, timezone: 'Asia/Kolkata' },
  { city: 'New York', country: 'US', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York' },
  { city: 'London', country: 'GB', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
  { city: 'Paris', country: 'FR', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris' },
  { city: 'Tokyo', country: 'JP', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo' },
  { city: 'Cairo', country: 'EG', lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo' },
  { city: 'Moscow', country: 'RU', lat: 55.7558, lng: 37.6173, timezone: 'Europe/Moscow' },
  { city: 'Sydney', country: 'AU', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
  { city: 'Sao Paulo', country: 'BR', lat: -23.5505, lng: -46.6333, timezone: 'America/Sao_Paulo' },
];

@Injectable()
export class GeocodeService {
  private readonly logger = new Logger(GeocodeService.name);

  /** Whether the geocoding service is enabled via environment. */
  get enabled(): boolean {
    return Boolean(process.env.GEOCODE_API_KEY);
  }

  /** Which provider is active. */
  get provider(): 'open-meteo' | 'stub' {
    return this.enabled ? 'open-meteo' : 'stub';
  }

  async search(query: string): Promise<GeocodeResult[]> {
    if (!query?.trim()) return [];

    if (!this.enabled) {
      this.logger.debug(`Geocoding is in STUB mode. Query: ${query}`);
      return this.searchStub(query);
    }

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query,
      )}&count=10&language=en`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Geocoding service returned status ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.results || !Array.isArray(data.results)) {
        return this.searchStub(query);
      }
      
      return data.results.map((item: any) => ({
        city: item.name,
        country: item.country_code || 'US',
        lat: item.latitude,
        lng: item.longitude,
        timezone: item.timezone || 'UTC',
      }));
    } catch (err) {
      this.logger.error(`Geocoding call failed, falling back to stub: ${String(err)}`);
      return this.searchStub(query);
    }
  }

  private searchStub(query: string): GeocodeResult[] {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = STUB_CITIES.filter(
      (c) =>
        c.city.toLowerCase().includes(normalizedQuery) ||
        c.country.toLowerCase().includes(normalizedQuery),
    );
    if (matches.length > 0) {
      return matches;
    }
    
    // Generate a deterministic fallback based on the query string
    const hash = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockLat = 10 + (hash % 40); // 10..50
    const mockLng = 70 + (hash % 40); // 70..110
    
    return [
      {
        city: query,
        country: 'IN',
        lat: Number(mockLat.toFixed(4)),
        lng: Number(mockLng.toFixed(4)),
        timezone: 'Asia/Kolkata',
      },
    ];
  }
}
