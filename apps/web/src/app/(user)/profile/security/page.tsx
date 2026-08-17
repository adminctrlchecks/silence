import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { ChangePasswordCard } from '@/components/auth/change-password-card';
import { ProfileNav } from '@/components/profile/profile-nav';
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
    <PageContainer as="main" size="narrow" className="py-8 space-y-5">
      <ProfileNav
        labels={{
          overview: profile('nav.overview'),
          birthDetails: profile('nav.birthDetails'),
          security: profile('nav.security'),
          privacy: profile('nav.privacy'),
        }}
      />
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
    </PageContainer>
  );
}
