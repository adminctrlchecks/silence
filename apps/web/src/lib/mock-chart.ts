import type { BirthChartResponse, ManglikResponse } from '@roxyapi/ui-react';

type Sign =
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

function nakshatra(name: string, pada: number, lord: 'Ketu' | 'Venus' | 'Sun' | 'Moon' | 'Mars' | 'Rahu' | 'Jupiter' | 'Saturn' | 'Mercury') {
  return { name, pada, key: pada, lord };
}

function block(rashi: Sign, entries: Array<Record<string, unknown>> = []) {
  return { rashi, signs: entries };
}

export const MOCK_BIRTH_CHART = {
  aries: block('aries', [
    { graha: 'Sun', longitude: 18.4, nakshatra: nakshatra('Bharani', 2, 'Venus'), isRetrograde: false, house: 10, awastha: 'Yuva' },
  ]),
  taurus: block('taurus', [
    { graha: 'Mercury', longitude: 47.2, nakshatra: nakshatra('Rohini', 1, 'Moon'), isRetrograde: false, house: 11, awastha: 'Kumara' },
  ]),
  gemini: block('gemini'),
  cancer: block('cancer', [
    { graha: 'Lagna', longitude: 101.2, nakshatra: nakshatra('Pushya', 3, 'Saturn'), isRetrograde: false, house: 1 },
    { graha: 'Moon', longitude: 104.8, nakshatra: nakshatra('Pushya', 4, 'Saturn'), isRetrograde: false, house: 1, awastha: 'Bala' },
  ]),
  leo: block('leo', [
    { graha: 'Venus', longitude: 133.5, nakshatra: nakshatra('Purva Phalguni', 2, 'Venus'), isRetrograde: false, house: 2, awastha: 'Yuva' },
  ]),
  virgo: block('virgo'),
  libra: block('libra', [
    { graha: 'Ketu', longitude: 197.6, nakshatra: nakshatra('Swati', 4, 'Rahu'), isRetrograde: true, house: 4 },
  ]),
  scorpio: block('scorpio', [
    { graha: 'Mars', longitude: 229.9, nakshatra: nakshatra('Jyeshtha', 2, 'Mercury'), isRetrograde: false, house: 5, awastha: 'Vriddha' },
  ]),
  sagittarius: block('sagittarius', [
    { graha: 'Jupiter', longitude: 252.1, nakshatra: nakshatra('Mula', 4, 'Ketu'), isRetrograde: true, house: 6, awastha: 'Kumara' },
  ]),
  capricorn: block('capricorn'),
  aquarius: block('aquarius', [
    { graha: 'Saturn', longitude: 313.4, nakshatra: nakshatra('Shatabhisha', 3, 'Rahu'), isRetrograde: false, house: 8, awastha: 'Yuva' },
  ]),
  pisces: block('pisces', [
    { graha: 'Rahu', longitude: 347.6, nakshatra: nakshatra('Revati', 4, 'Mercury'), isRetrograde: true, house: 9 },
  ]),
  frame: {
    label: 'Mock chart',
    date: '1998-04-21',
    time: '07:35',
    location: 'Chennai, IN',
  },
  meta: {
    Lagna: { graha: 'Lagna', rashi: 'cancer', longitude: 101.2, nakshatra: nakshatra('Pushya', 3, 'Saturn'), isRetrograde: false, house: 1 },
    Sun: { graha: 'Sun', rashi: 'aries', longitude: 18.4, nakshatra: nakshatra('Bharani', 2, 'Venus'), isRetrograde: false, house: 10, awastha: 'Yuva' },
    Moon: { graha: 'Moon', rashi: 'cancer', longitude: 104.8, nakshatra: nakshatra('Pushya', 4, 'Saturn'), isRetrograde: false, house: 1, awastha: 'Bala' },
    Mars: { graha: 'Mars', rashi: 'scorpio', longitude: 229.9, nakshatra: nakshatra('Jyeshtha', 2, 'Mercury'), isRetrograde: false, house: 5, awastha: 'Vriddha' },
    Mercury: { graha: 'Mercury', rashi: 'taurus', longitude: 47.2, nakshatra: nakshatra('Rohini', 1, 'Moon'), isRetrograde: false, house: 11, awastha: 'Kumara' },
    Jupiter: { graha: 'Jupiter', rashi: 'sagittarius', longitude: 252.1, nakshatra: nakshatra('Mula', 4, 'Ketu'), isRetrograde: true, house: 6, awastha: 'Kumara' },
    Venus: { graha: 'Venus', rashi: 'leo', longitude: 133.5, nakshatra: nakshatra('Purva Phalguni', 2, 'Venus'), isRetrograde: false, house: 2, awastha: 'Yuva' },
    Saturn: { graha: 'Saturn', rashi: 'aquarius', longitude: 313.4, nakshatra: nakshatra('Shatabhisha', 3, 'Rahu'), isRetrograde: false, house: 8, awastha: 'Yuva' },
    Rahu: { graha: 'Rahu', rashi: 'pisces', longitude: 347.6, nakshatra: nakshatra('Revati', 4, 'Mercury'), isRetrograde: true, house: 9 },
    Ketu: { graha: 'Ketu', rashi: 'libra', longitude: 197.6, nakshatra: nakshatra('Swati', 4, 'Rahu'), isRetrograde: true, house: 4 },
  },
} as unknown as BirthChartResponse;

export const MOCK_DOSHA_CARD = {
  frame: {
    ayanamsa: 'lahiri',
    ayanamsaDegrees: 24.12,
  },
  present: true,
  severity: 'Mild',
  description:
    'Mars sits in a milder Kuja house in this mock chart, so the preview can show the controlled-data card state without calling an external API.',
  exceptions: ['Mars receives benefic support', 'The placement is softened by sign dignity'],
  remedies: ['Offer a simple Tuesday prayer', 'Practice patience before major relationship decisions'],
  effects: {
    marriage: 'Adds intensity and directness in partnership.',
    personality: 'Supports courage, speed, and independent action.',
    timing: 'The pattern becomes easier to work with as maturity increases.',
    relationships: 'Best handled with clear communication and shared routines.',
  },
} satisfies ManglikResponse;
