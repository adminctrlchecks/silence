import type { Metadata } from 'next';
import { NotFoundContent } from '@/components/not-found-content';

export const metadata: Metadata = {
  title: 'Page not found | Silence',
  robots: {
    index: false,
    follow: false,
  },
};

export default function UserNotFound() {
  return (
    <NotFoundContent
      title="We could not find that page"
      description="Return to your reading dashboard or use the footer links for privacy and terms."
      primaryHref="/app"
      primaryLabel="Go to dashboard"
      secondaryHref="/"
      secondaryLabel="Home"
    />
  );
}
