import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { BirthDetailsCard } from '@/components/profile/birth-details-card';
import { ProfileNav } from '@/components/profile/profile-nav';
import { publicApi } from '@/lib/api';
import { getUserSession } from '@/lib/user-session';

export const metadata: Metadata = {
  title: 'Birth Details',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfileBirthDetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const t = await getTranslations('Profile');
  const auth = await getTranslations('Auth');
  const chart = await getTranslations('Chart');
  const session = await getUserSession();

  if (!session) {
    redirect('/login');
  }

  const { onboarding } = await searchParams;
  const profile = await publicApi.profile(session.userId, session.token);

  return (
    <PageContainer as="main" size="reading" className="py-8 space-y-5">
      <ProfileNav
        labels={{
          overview: t('nav.overview'),
          birthDetails: t('nav.birthDetails'),
          security: t('nav.security'),
          privacy: t('nav.privacy'),
        }}
      />
      <BirthDetailsCard
        initialProfile={profile}
        autoEdit={onboarding === '1'}
        labels={{
          eyebrow: t('birthDetailsEyebrow'),
          title: t('birthDetailsTitle'),
          description: t('birthDetailsDescription'),
          edit: t('edit'),
          cancel: t('cancel'),
          save: t('save'),
          saving: t('saving'),
          saved: t('saved'),
          dob: t('dob'),
          timeOfBirth: t('timeOfBirth'),
          placeOfBirth: t('placeOfBirth'),
          birthPlace: t('birthPlace'),
          birthPlacePlaceholder: t('birthPlacePlaceholder'),
          completeProfileTitle: t('completeProfileTitle'),
          completeProfileDescription: t('completeProfileDescription'),
          consentEditLabel: t('consentEditLabel'),
          whyWeAskTitle: auth('birthWhyTitle'),
          whyWeAskBody: auth('birthWhyBody'),
          changeImpactTitle: t('changeImpactTitle'),
          changeImpactBody: t('changeImpactBody'),
          accuracyLabel: chart('accuracy.label'),
          accuracyExact: chart('accuracy.exact'),
          accuracyApproximate: chart('accuracy.approximate'),
          accuracyUncertain: chart('accuracy.uncertain'),
        }}
      />
    </PageContainer>
  );
}
