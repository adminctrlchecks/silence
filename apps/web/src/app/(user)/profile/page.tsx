import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { ProfileNav } from '@/components/profile/profile-nav';
import { ProfileOverviewCard } from '@/components/profile/profile-overview-card';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/api';
import { ADMIN_TOKEN_COOKIE } from '@/lib/auth-routing';
import { getUserSession } from '@/lib/user-session';

export const metadata: Metadata = {
  title: 'Profile and Settings',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePage() {
  const t = await getTranslations('Profile');
  const categories = await getTranslations('SessionPicker');
  const session = await getUserSession();
  const cookieStore = await cookies();
  const hasAdminSession = Boolean(cookieStore.get(ADMIN_TOKEN_COOKIE)?.value);

  if (!session) {
    redirect('/login');
  }

  const profile = await publicApi.profile(session.userId, session.token);

  return (
    <PageContainer as="main" size="reading" className="py-8 space-y-5">
      {hasAdminSession ? (
        <div className="flex justify-end">
          <Button asChild variant="outline">
            <Link href="/admin">{t('adminPortal')}</Link>
          </Button>
        </div>
      ) : null}
      <ProfileNav
        labels={{
          overview: t('nav.overview'),
          birthDetails: t('nav.birthDetails'),
          security: t('nav.security'),
          privacy: t('nav.privacy'),
        }}
      />
      <ProfileOverviewCard
        initialProfile={profile}
        labels={{
          eyebrow: t('eyebrow'),
          title: t('title'),
          edit: t('edit'),
          cancel: t('cancel'),
          save: t('save'),
          saving: t('saving'),
          saved: t('saved'),
          name: t('name'),
          category: t('category'),
          language: t('language'),
          contact: t('contact'),
          consent: t('consent'),
          yes: t('yes'),
          no: t('no'),
          consentMissingNote: t('consentMissingNote'),
          categories: {
            male: categories('categories.male'),
            female: categories('categories.female'),
            other: categories('categories.other'),
          },
        }}
      />
    </PageContainer>
  );
}
