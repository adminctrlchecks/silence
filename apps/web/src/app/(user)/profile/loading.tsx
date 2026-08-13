import { LoadingState } from '@/components/ui/screen-state';

export default function ProfileLoading() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <LoadingState title="Loading profile" />
    </main>
  );
}
