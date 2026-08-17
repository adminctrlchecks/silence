import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import {
  ArrowRight,
  BookOpenCheck,
  CircleHelp,
  History,
  Languages,
  LockKeyhole,
  MessageSquareText,
  MoonStar,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/components/layout/page-container';
import { SessionPicker } from '@/components/session/session-picker';
import { Button } from '@/components/ui/button';
import {
  CATEGORY_COOKIE,
  LANGUAGE_COOKIE,
  normalizeCategory,
  normalizeSessionLanguage,
} from '@/lib/session-preferences';
import { localeAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: {
    absolute: 'Silence - Multilingual Astrology Q&A',
  },
  description:
    'Create a profile, answer guided astrology questions, view a birth chart, and receive a personal remedy in your preferred language.',
  alternates: {
    canonical: '/',
    languages: localeAlternates('/'),
  },
  // No page-local `openGraph` override here: the root layout already sets an
  // identical openGraph title/description, and only the root layout's
  // (fully-resolved, includes the generated og:image) object gets inherited
  // — a page-level `openGraph` field replaces the parent's wholesale rather
  // than merging, which would silently drop og:type/og:site_name/og:image.
};

const STEP_ICONS = [UserRound, MessageSquareText, MoonStar, Sparkles, History] as const;
const BENEFIT_ICONS = [Languages, History, MoonStar, BookOpenCheck] as const;

type HomeT = Awaited<ReturnType<typeof getTranslations>>;

function ProductPreview({ t }: { t: HomeT }) {
  return (
    <div
      role="img"
      aria-label={t('previewAlt')}
      className="relative overflow-hidden rounded-lg border border-border bg-elevated p-4 shadow-card"
    >
      <div className="grid gap-3">
        <div className="rounded-md border border-border bg-background p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MessageSquareText className="size-4" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase text-primary">{t('previewGuidedQuestionLabel')}</p>
              <p className="mt-1 text-sm font-semibold">{t('previewGuidedQuestionText')}</p>
              <div className="mt-3 h-16 rounded-md border border-border bg-card" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_0.85fr]">
          <div className="rounded-md border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-primary">{t('previewChartLabel')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('previewChartText')}</p>
              </div>
              <span className="flex size-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                <MoonStar className="size-8 text-primary" aria-hidden />
              </span>
            </div>
          </div>
          <div className="rounded-md border border-border bg-secondary p-4 text-secondary-foreground">
            <p className="text-xs font-semibold uppercase">{t('previewRemedyLabel')}</p>
            <p className="mt-2 text-sm font-semibold">{t('previewRemedyText')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const cookieStore = await cookies();
  const language = normalizeSessionLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const category = normalizeCategory(cookieStore.get(CATEGORY_COOKIE)?.value);
  const common = await getTranslations('Common');
  const nav = await getTranslations('Nav');
  const t = await getTranslations('Home');

  const journeySteps = ([1, 2, 3, 4, 5] as const).map((n, index) => ({
    title: t(`step${n}Title`),
    description: t(`step${n}Description`),
    icon: STEP_ICONS[index],
  }));

  const benefits = ([1, 2, 3, 4] as const).map((n, index) => ({
    title: t(`benefit${n}Title`),
    description: t(`benefit${n}Description`),
    icon: BENEFIT_ICONS[index],
  }));

  const dataItems = ([1, 2, 3] as const).map((n) => ({
    title: t(`dataItem${n}Title`),
    description: t(`dataItem${n}Description`),
  }));

  const linkTags = {
    terms: (chunks: ReactNode) => (
      <Link href="/terms#disclaimer" className="text-primary underline underline-offset-2">
        {chunks}
      </Link>
    ),
    privacy: (chunks: ReactNode) => (
      <Link href="/privacy#ai-processing" className="text-primary underline underline-offset-2">
        {chunks}
      </Link>
    ),
  };

  const faqs = [
    { question: t('faq1Question'), answer: t('faq1Answer') },
    { question: t('faq2Question'), answer: t('faq2Answer') },
    { question: t('faq3Question'), answer: t('faq3Answer') },
    { question: t('faq4Question'), answer: t.rich('faq4Answer', linkTags) },
    { question: t('faq5Question'), answer: t.rich('faq5Answer', linkTags) },
  ];

  return (
    <main>
      <section className="border-b border-border bg-background">
        <PageContainer size="wide" className="grid gap-10 py-12 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-[1fr_32rem] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">{t('eyebrow')}</p>
            <h1 className="mt-3 text-display-md font-semibold text-foreground sm:text-display-lg">{t('title')}</h1>
            <p className="mt-5 text-body-lg text-muted-foreground">{t('heroSubtitle')}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#start">
                  {t('startCta')}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#how-it-works">{t('howItWorksCta')}</Link>
              </Button>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" aria-hidden />
              {t('savedNotice')}
            </p>
          </div>
          <ProductPreview t={t} />
        </PageContainer>
      </section>

      <section id="how-it-works" className="border-b border-border bg-card">
        <PageContainer size="wide" className="py-14">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">{t('howItWorksEyebrow')}</p>
            <h2 className="mt-2 text-heading-h2 font-semibold">{t('howItWorksTitle')}</h2>
          </div>
          <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {journeySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="rounded-md border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">{t('stepLabel', { number: index + 1 })}</span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </PageContainer>
      </section>

      <section className="border-b border-border bg-background">
        <PageContainer size="wide" className="py-14">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold text-primary">{t('whyEyebrow')}</p>
              <h2 className="mt-2 text-heading-h2 font-semibold">{t('whyTitle')}</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{t('whyDescription')}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <article key={benefit.title} className="rounded-md border border-border bg-card p-5 shadow-card">
                    <Icon className="size-5 text-primary" aria-hidden />
                    <h3 className="mt-4 text-base font-semibold">{benefit.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{benefit.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="border-b border-border bg-card">
        <PageContainer size="wide" className="grid gap-6 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">{t('trustEyebrow')}</p>
            <h2 className="mt-2 text-heading-h2 font-semibold">{t('trustTitle')}</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{t('trustDescription')}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href="/privacy">{nav('privacy')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/terms">{nav('terms')}</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3">
            {dataItems.map((item) => (
              <div key={item.title} className="flex gap-3 rounded-md border border-border bg-background p-4">
                <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section id="start" className="border-b border-border bg-background">
        <PageContainer size="wide" className="grid gap-8 py-14 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-semibold text-primary">{t('startPanelEyebrow')}</p>
            <h2 className="mt-2 text-heading-h2 font-semibold">{t('startPanelTitle')}</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{t('startPanelDescription')}</p>
            <Button asChild className="mt-5">
              <Link href="/register">
                {t('startPanelCta')}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
          <SessionPicker initialLanguage={language} initialCategory={category} />
        </PageContainer>
      </section>

      <section id="faq" className="border-b border-border bg-card">
        <PageContainer size="reading" className="py-14">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">{t('faqEyebrow')}</p>
            <h2 className="mt-2 text-heading-h2 font-semibold">{t('faqTitle')}</h2>
          </div>
          <div className="mt-8 grid gap-3">
            {faqs.map((item) => (
              <article key={item.question} className="rounded-md border border-border bg-background p-5">
                <div className="flex gap-3">
                  <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <h3 className="text-base font-semibold">{item.question}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="bg-background">
        <PageContainer size="reading" className="py-14 text-center">
          <h2 className="text-heading-h2 font-semibold">{t('finalTitle')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{t('finalDescription')}</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                {common('createProfile')}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">{common('signIn')}</Link>
            </Button>
          </div>
        </PageContainer>
      </section>
    </main>
  );
}
