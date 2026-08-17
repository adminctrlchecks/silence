import { ImageResponse } from 'next/og';
import { BrandMark, BRAND_COLORS } from '@/lib/brand-mark';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Silence — guided astrology questions, a birth chart, and a personal remedy, in your language.';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 96px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e6f4f2 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 48 }}>
          <BrandMark size={96} />
          <div style={{ display: 'flex', fontSize: 56, fontWeight: 700, color: BRAND_COLORS.tealDark }}>Silence</div>
        </div>
        <div style={{ display: 'flex', fontSize: 44, fontWeight: 600, color: '#0f172a', maxWidth: 920, lineHeight: 1.2 }}>
          Multilingual Astrology Q&amp;A
        </div>
        <div style={{ display: 'flex', fontSize: 28, fontWeight: 400, color: '#475569', maxWidth: 900, marginTop: 20, lineHeight: 1.4 }}>
          Answer guided questions, view your birth chart, and get a personal remedy — in your language.
        </div>
      </div>
    ),
    size,
  );
}
