import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChangePasswordCard } from '@/components/auth/change-password-card';
import { ProfileDetailsCard } from '@/components/profile/profile-details-card';
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
  const security = await getTranslations('Security');
  const categories = await getTranslations('SessionPicker');
  const session = await getUserSession();
  const cookieStore = await cookies();
  const hasAdminSession = Boolean(cookieStore.get(ADMIN_TOKEN_COOKIE)?.value);

  if (!session) {
    redirect('/login');
  }

  const profile = await publicApi.profile(session.userId, session.token);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8 sm:px-6">
      {hasAdminSession ? (
        <div className="flex justify-end">
          <Button asChild variant="outline">
            <Link href="/admin">{t('adminPortal')}</Link>
          </Button>
        </div>
      ) : null}
      <ProfileDetailsCard
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
          dob: t('dob'),
          timeOfBirth: t('timeOfBirth'),
          placeOfBirth: t('placeOfBirth'),
          city: t('city'),
          country: t('country'),
          contact: t('contact'),
          consent: t('consent'),
          yes: t('yes'),
          no: t('no'),
          birthPlace: t('birthPlace'),
          birthPlacePlaceholder: t('birthPlacePlaceholder'),
          completeProfileTitle: t('completeProfileTitle'),
          completeProfileDescription: t('completeProfileDescription'),
          consentEditLabel: t('consentEditLabel'),
          categories: {
            male: categories('categories.male'),
            female: categories('categories.female'),
            other: categories('categories.other'),
          },
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
    </main>
  );
}
