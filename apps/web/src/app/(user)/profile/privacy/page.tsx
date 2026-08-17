import type { Metadata } from 'next';
import { CheckCircle2, Circle, Database, ScrollText, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { ProfileNav } from '@/components/profile/profile-nav';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/api';
import { getUserSession } from '@/lib/user-session';

export const metadata: Metadata = {
  title: 'Privacy and Your Data',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfilePrivacyPage() {
  const t = await getTranslations('Profile');
  const p = await getTranslations('Privacy');
  const session = await getUserSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await publicApi.profile(session.userId, session.token);

  return (
    <PageContainer as="main" size="reading" className="py-8 space-y-4">
      <ProfileNav
        labels={{
          overview: t('nav.overview'),
          birthDetails: t('nav.birthDetails'),
          security: t('nav.security'),
          privacy: t('nav.privacy'),
        }}
      />

      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-medium text-primary">{p('eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{p('title')}</h1>
      </section>

      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <h2 className="text-sm font-semibold tracking-normal">{p('consentStatusTitle')}</h2>
        <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          {profile.consent ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          ) : (
            <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          )}
          {profile.consent ? p('consentGiven') : p('consentMissing')}
        </p>
        {!profile.consent ? (
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link href="/profile/birth-details">{p('manageBirthDetails')}</Link>
          </Button>
        ) : null}
      </section>

      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold tracking-normal">{p('dataWeStoreTitle')}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{p('dataWeStoreBody')}</p>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold tracking-normal">{p('aiTitle')}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{p('aiBody')}</p>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <ScrollText className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold tracking-normal">{p('legalTitle')}</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/terms">{p('readTerms')}</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/privacy">{p('readPrivacyPolicy')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/*
        NEEDS DECISION (docs/product-redesign/open-decisions.md #3 and #6):
        no self-serve export/delete exists, and no support channel/owner is
        documented yet, so this deliberately does not name a specific email
        or form — only the manual-request model the decision recommends
        starting with. Fill in the real channel once #6 is resolved.
      */}
      <Alert variant="info" title={p('requestTitle')}>
        {p('requestBody')}
      </Alert>
    </PageContainer>
  );
}
