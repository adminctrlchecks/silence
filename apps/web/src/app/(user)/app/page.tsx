import Link from 'next/link';
import { ArrowRight, History, MoonStar, Sparkles, UserRound } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';

export default async function UserAppPage() {
  const t = await getTranslations('UserApp');
  const nextSteps = [
    { label: t('questions'), href: '/app/questions', icon: ArrowRight },
    { label: t('chart'), href: '/app/chart', icon: MoonStar },
    { label: t('remedy'), href: '/app/remedy', icon: Sparkles },
    { label: t('profile'), href: '/profile', icon: UserRound },
    { label: t('history'), href: '/history', icon: History },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-medium text-primary">{t('eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{t('title')}</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {nextSteps.map(({ label, href, icon: Icon }) => (
            <Button key={href} asChild variant="outline" className="h-12 justify-start">
              <Link href={href}>
                <Icon />
                {label}
              </Link>
            </Button>
          ))}
        </div>
      </section>
    </main>
  );
}
