import type { Metadata } from 'next';
import { NotFoundContent } from '@/components/not-found-content';

export const metadata: Metadata = {
  title: 'Admin page not found | Silence',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminNotFound() {
  return (
    <NotFoundContent
      title="Admin page not found"
      description="This admin route does not exist. Return to the dashboard or pick a content area from the sidebar."
      primaryHref="/admin"
      primaryLabel="Admin dashboard"
      secondaryHref="/admin/questions"
      secondaryLabel="Questions"
    />
  );
}
