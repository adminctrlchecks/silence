import type { Metadata } from 'next';
import { KeyRound } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
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
      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="rounded-md border border-primary/20 bg-primary/10 p-2 text-primary">
            <KeyRound className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-primary">{security('eyebrow')}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-normal">{security('title')}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{security('description')}</p>
          </div>
          <Button asChild variant="outline" className="shrink-0">
            <Link href="/profile/security">{security('manageCta')}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
