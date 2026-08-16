import Link from 'next/link';
import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: {
    absolute: 'Silence - Multilingual Astrology Q&A',
  },
  description:
    'Create a profile, answer guided astrology questions, view a birth chart, and receive a personal remedy in your preferred language.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Silence - Multilingual Astrology Q&A',
    description:
      'Create a profile, answer guided astrology questions, view a birth chart, and receive a personal remedy in your preferred language.',
  },
};

const journeySteps = [
  {
    title: 'Create your profile',
    description: 'Choose a language and category, then save the birth details used for chart calculation.',
    icon: UserRound,
  },
  {
    title: 'Answer guided questions',
    description: 'Move through three layers of reflections so the reading can respond to your context.',
    icon: MessageSquareText,
  },
  {
    title: 'View your chart',
    description: 'See computed birth-chart details, accuracy context, and an interpretation when enough data exists.',
    icon: MoonStar,
  },
  {
    title: 'Receive a remedy',
    description: 'Get a personal practice selected from the content model managed by the Silence admin tools.',
    icon: Sparkles,
  },
  {
    title: 'Return anytime',
    description: 'Saved reading history lets you revisit responses, chart details, and remedies from your account.',
    icon: History,
  },
];

const benefits = [
  {
    title: '11-language starting point',
    description: 'Silence supports the documented seed language set, including Arabic RTL handling.',
    icon: Languages,
  },
  {
    title: 'Saved reading history',
    description: 'Your account can keep reading sessions, responses, chart snapshots, and remedy history.',
    icon: History,
  },
  {
    title: 'Birth-chart calculation',
    description: 'Chart pages use saved birth date, time, place, coordinates, and timezone when available.',
    icon: MoonStar,
  },
  {
    title: 'Content operations built in',
    description: 'Admin tools manage questions, answers, remedies, translations, imports, and review states.',
    icon: BookOpenCheck,
  },
];

const faqs = [
  {
    question: 'What is Silence?',
    answer:
      'Silence is a guided astrology Q&A app. You create a profile, answer reflections, view a chart, and receive a personal remedy path.',
  },
  {
    question: 'Why ask for birth time and place?',
    answer:
      'Birth date, time, and place are used to calculate chart details. If details are incomplete, chart accuracy can be approximate or uncertain.',
  },
  {
    question: 'Can I return to previous readings?',
    answer: 'Yes. Reading history is part of the current product flow for signed-in users.',
  },
  {
    question: 'Is this medical, legal, or financial advice?',
    answer:
      'No. Silence is for reflective astrology guidance. Final legal disclaimer wording still needs legal review before production.',
  },
  {
    question: 'How is AI used?',
    answer:
      'The current system can use AI assistance for answer generation, translation, and chart interpretation. Privacy wording needs legal review.',
  },
];

function ProductPreview() {
  return (
    <div
      role="img"
      aria-label="Preview of a Silence reading with guided questions, a birth chart, and a remedy."
      className="relative overflow-hidden rounded-lg border border-border bg-elevated p-4 shadow-card"
    >
      <div className="grid gap-3">
        <div className="rounded-md border border-border bg-background p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MessageSquareText className="size-4" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase text-primary">Guided question</p>
              <p className="mt-1 text-sm font-semibold">What pattern are you ready to understand more clearly?</p>
              <div className="mt-3 h-16 rounded-md border border-border bg-card" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_0.85fr]">
          <div className="rounded-md border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-primary">Birth chart</p>
                <p className="mt-1 text-sm text-muted-foreground">Ascendant and key placements</p>
              </div>
              <span className="flex size-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                <MoonStar className="size-8 text-primary" aria-hidden />
              </span>
            </div>
          </div>
          <div className="rounded-md border border-border bg-secondary p-4 text-secondary-foreground">
            <p className="text-xs font-semibold uppercase">Remedy</p>
            <p className="mt-2 text-sm font-semibold">A repeatable practice selected for this reading.</p>
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
  const t = await getTranslations('Home');

  return (
    <main>
      <section className="border-b border-border bg-background">
        <PageContainer size="wide" className="grid gap-10 py-12 lg:min-h-[calc(100svh-8rem)] lg:grid-cols-[1fr_32rem] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">{t('eyebrow')}</p>
            <h1 className="mt-3 text-display-md font-semibold text-foreground sm:text-display-lg">{t('title')}</h1>
            <p className="mt-5 text-body-lg text-muted-foreground">
              Answer guided astrology questions, generate a birth chart from your saved birth details, and receive a personal remedy in your preferred language.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#start">
                  Start your reading
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" aria-hidden />
              Your profile and reading are saved to your account when you create one.
            </p>
          </div>
          <ProductPreview />
        </PageContainer>
      </section>

      <section id="how-it-works" className="border-b border-border bg-card">
        <PageContainer size="wide" className="py-14">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">How it works</p>
            <h2 className="mt-2 text-heading-h2 font-semibold">A guided reading, not a one-click horoscope</h2>
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
                    <span className="text-xs font-semibold text-muted-foreground">Step {index + 1}</span>
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
              <p className="text-sm font-semibold text-primary">Why people use it</p>
              <h2 className="mt-2 text-heading-h2 font-semibold">Built around the reading journey already in the app</h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Silence focuses on profile, questions, chart, remedy, and history. It does not use fabricated testimonials or unverifiable outcome claims.
              </p>
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
            <p className="text-sm font-semibold text-primary">Trust and privacy</p>
            <h2 className="mt-2 text-heading-h2 font-semibold">Know why each detail is requested</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Birth date, time, and place support chart calculation. Your account can save responses, charts, remedies, and reading history so you can return later.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href="/privacy">Privacy</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/terms">Terms</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3">
            {[
              ['Birth details', 'Used for chart calculation and accuracy context.'],
              ['Reading responses', 'Saved with your session so guidance and history can work.'],
              ['AI assistance', 'Used in current generation and translation workflows; legal wording needs review.'],
            ].map(([title, description]) => (
              <div key={title} className="flex gap-3 rounded-md border border-border bg-background p-4">
                <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section id="start" className="border-b border-border bg-background">
        <PageContainer size="wide" className="grid gap-8 py-14 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-semibold text-primary">Start panel</p>
            <h2 className="mt-2 text-heading-h2 font-semibold">Choose how the reading begins</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Pick a language and category first. These preferences are saved locally and carried into profile creation.
            </p>
            <Button asChild className="mt-5">
              <Link href="/register">
                Continue to profile
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
            <p className="text-sm font-semibold text-primary">FAQ</p>
            <h2 className="mt-2 text-heading-h2 font-semibold">Before you start</h2>
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
          <h2 className="text-heading-h2 font-semibold">Ready to begin your reading?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Create a profile, save your preferences, and move through the guided Silence reading path.
          </p>
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
