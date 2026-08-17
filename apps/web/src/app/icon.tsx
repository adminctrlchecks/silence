import { ImageResponse } from 'next/og';
import { BrandMark } from '@/lib/brand-mark';

export const contentType = 'image/png';

interface IconMeta {
  id: '16' | '32';
  size: { width: number; height: number };
}

export function generateImageMetadata(): IconMeta[] {
  return [
    { id: '16', size: { width: 16, height: 16 } },
    { id: '32', size: { width: 32, height: 32 } },
  ];
}

export default function Icon({ id }: { id: string }) {
  const size = id === '16' ? 16 : 32;
  return new ImageResponse(<BrandMark size={size} />, { width: size, height: size });
}
