import { PageContainer } from '@/components/layout/page-container';
import { LoadingState } from '@/components/ui/screen-state';

export default function UserAppLoading() {
  return (
    <PageContainer as="main" size="wide" className="py-8">
      <LoadingState title="Loading your session" />
    </PageContainer>
  );
}
