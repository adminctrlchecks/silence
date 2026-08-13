import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { publicApi } from '@/lib/api';
import { normalizeSessionLanguage } from '@/lib/session-preferences';
import { getUserSession } from '@/lib/user-session';

export default async function RemedyPage() {
  const t = await getTranslations('Remedy');
  const session = await getUserSession();

  if (!session) {
    redirect('/login');
  }

  const profile = await publicApi.profile(session.userId, session.token);
  const remedy = await publicApi.remedy(
    profile.id,
    normalizeSessionLanguage(profile.lang),
    session.token,
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-medium text-primary">{t('eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{remedy.title}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{remedy.text}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-md border border-border bg-background px-2 py-1">
            {t('category', { category: remedy.category })}
          </span>
          {remedy.linkedLevel ? (
            <span className="rounded-md border border-border bg-background px-2 py-1">
              {t('linkedLevel', { level: remedy.linkedLevel })}
            </span>
          ) : null}
        </div>
      </section>
    </main>
  );
}
