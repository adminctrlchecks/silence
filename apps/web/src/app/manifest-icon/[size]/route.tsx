import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { BrandMark } from '@/lib/brand-mark';

const ALLOWED_SIZES = new Set([192, 512]);

/**
 * Serves the PWA-manifest icon sizes (192/512, "any" and "maskable" purpose)
 * referenced from apps/web/src/app/manifest.ts. The multi-size favicon and
 * apple touch icon are handled separately by the icon.tsx / apple-icon.tsx
 * file conventions.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ size: string }> }) {
  const { size: sizeParam } = await context.params;
  const size = Number.parseInt(sizeParam, 10);
  if (!ALLOWED_SIZES.has(size)) {
    return new Response('Not found', { status: 404 });
  }

  const isMaskable = request.nextUrl.searchParams.get('purpose') === 'maskable';
  // Maskable icons need the mark inside a safe zone (~80% of the canvas) so
  // platform masks (circle, squircle, etc.) never clip it.
  return new ImageResponse(<BrandMark size={size} scale={isMaskable ? 0.7 : 1} transparentBackground={!isMaskable} />, {
    width: size,
    height: size,
  });
}
