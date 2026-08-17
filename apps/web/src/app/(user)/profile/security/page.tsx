import type { Metadata } from 'next';
import { ChevronLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChangePasswordCard } from '@/components/auth/change-password-card';
import { getUserSession } from '@/lib/user-session';

export const metadata: Metadata = {
  title: 'Account Security',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfileSecurityPage() {
  const security = await getTranslations('Security');
  const profile = await getTranslations('Profile');
  const session = await getUserSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="mx-auto w-full max-w-2xl space-y-5 px-4 py-8 sm:px-6">
      <Link href="/profile" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
        <ChevronLeft className="size-4 rtl:rotate-180" aria-hidden />
        {profile('title')}
      </Link>
      <ChangePasswordCard
        endpoint="/api/auth/change-password"
        redirectTo="/login"
        copy={{
          eyebrow: security('eyebrow'),
          title: security('title'),
          description: security('description'),
          currentPassword: security('currentPassword'),
          newPassword: security('newPassword'),
          confirmPassword: security('confirmPassword'),
          submit: security('submit'),
          submitting: security('submitting'),
          success: security('success'),
        }}
      />
    </main>
  );
}
