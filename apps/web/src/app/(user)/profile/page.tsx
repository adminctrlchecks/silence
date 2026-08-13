import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { getUserSession } from '@/lib/user-session';

export default async function ProfilePage() {
  const t = await getTranslations('Profile');
  const categories = await getTranslations('SessionPicker');
  const session = await getUserSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await publicApi.profile(session.userId, session.token);
  const details = [
    { label: t('name'), value: profile.name },
    { label: t('category'), value: categories(`categories.${profile.category}`) },
    { label: t('language'), value: profile.lang },
    { label: t('dob'), value: profile.dob },
    { label: t('timeOfBirth'), value: profile.timeOfBirth },
    {
      label: t('placeOfBirth'),
      value: `${profile.placeOfBirth.city}, ${profile.placeOfBirth.country}`,
    },
    { label: t('contact'), value: profile.contact },
    { label: t('consent'), value: profile.consent ? t('yes') : t('no') },
  ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-medium text-primary">{t('eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{t('title')}</h1>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {details.map((detail) => (
            <div key={detail.label} className="rounded-md border border-border bg-background p-3">
              <dt className="text-xs font-medium uppercase text-muted-foreground">{detail.label}</dt>
              <dd className="mt-1 break-words text-sm font-medium">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
