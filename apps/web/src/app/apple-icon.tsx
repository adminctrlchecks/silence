import { ImageResponse } from 'next/og';
import { BrandMark } from '@/lib/brand-mark';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  // Apple touch icons are shown on an opaque home-screen tile, so fill the
  // full square with the brand color rather than leaving it transparent.
  return new ImageResponse(<BrandMark size={180} transparentBackground={false} />, size);
}
