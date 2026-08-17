import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Silence',
    short_name: 'Silence',
    description:
      'Create a profile, answer guided astrology questions, view a birth chart, and receive a personal remedy in your preferred language.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0f766e',
    icons: [
      { src: '/manifest-icon/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/manifest-icon/192?purpose=maskable', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/manifest-icon/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/manifest-icon/512?purpose=maskable', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
