import type { Metadata } from 'next';
import { NotFoundContent } from '@/components/not-found-content';

export const metadata: Metadata = {
  title: 'Page not found | Silence',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <NotFoundContent
      title="This page is not available"
      description="The link may be mistyped, expired, or no longer part of Silence."
      primaryHref="/"
      primaryLabel="Go home"
      secondaryHref="/privacy"
      secondaryLabel="Privacy"
    />
  );
}
