/**
 * Shared brand mark used by the generated favicon/app-icon/OG-image routes
 * (see apps/web/src/app/icon.tsx, apple-icon.tsx, opengraph-image.tsx, manifest-icon/[size]/route.tsx).
 *
 * Owned/generated asset, not external stock art — per
 * docs/product-redesign/24-image-and-asset-strategy.md §2/§5. Rendered at request time via
 * `next/og`'s ImageResponse (Satori), so there is no binary file to license/attribute.
 *
 * Visual: a filled circle in the app's primary teal token with a white "S" glyph
 * (Silence) and a small four-point star accent (celestial motif), monochrome-capable.
 */
import type { CSSProperties, ReactElement } from 'react';

const BRAND_TEAL = '#0f766e';
const BRAND_TEAL_DARK = '#0a5f59';
const ON_BRAND = '#ffffff';

interface BrandMarkOptions {
  size: number;
  /** Fraction of `size` the circle mark occupies within its box (for maskable safe zones). */
  scale?: number;
  /** Render the mark alone, with a transparent background around the circle. */
  transparentBackground?: boolean;
}

export function BrandMark({ size, scale = 1, transparentBackground = true }: BrandMarkOptions): ReactElement {
  const markSize = Math.round(size * scale);
  const starSize = Math.max(4, Math.round(markSize * 0.16));

  const containerStyle: CSSProperties = {
    width: size,
    height: size,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: transparentBackground ? 'transparent' : BRAND_TEAL,
  };

  return (
    <div style={containerStyle}>
      <div
        style={{
          width: markSize,
          height: markSize,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${BRAND_TEAL} 0%, ${BRAND_TEAL_DARK} 100%)`,
          position: 'relative',
        }}
      >
        <div
          style={{
            color: ON_BRAND,
            fontSize: Math.round(markSize * 0.56),
            fontWeight: 700,
            fontFamily: 'Georgia, "Times New Roman", serif',
            lineHeight: 1,
            display: 'flex',
          }}
        >
          S
        </div>
        <div
          style={{
            position: 'absolute',
            top: Math.round(markSize * 0.16),
            right: Math.round(markSize * 0.16),
            width: starSize,
            height: starSize,
            background: ON_BRAND,
            opacity: 0.9,
            transform: 'rotate(45deg)',
            borderRadius: '2px',
            display: 'flex',
          }}
        />
      </div>
    </div>
  );
}

export const BRAND_COLORS = { teal: BRAND_TEAL, tealDark: BRAND_TEAL_DARK, onBrand: ON_BRAND };
