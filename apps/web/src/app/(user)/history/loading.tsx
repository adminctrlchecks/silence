import { PageContainer } from '@/components/layout/page-container';
import { LoadingState } from '@/components/ui/screen-state';

export default function HistoryLoading() {
  return (
    <PageContainer as="main" size="reading" className="py-8">
      <LoadingState title="Loading history" />
    </PageContainer>
  );
}
