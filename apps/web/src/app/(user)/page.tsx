import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LANGUAGES } from '@/lib/i18n';
import { CATEGORIES } from '@silence/shared';

export default function HomePage() {
  return (
    <main className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_22rem]">
      <section className="flex min-h-[calc(100vh-9rem)] flex-col justify-center gap-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Astrology Q&A</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Silence
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Choose a language and category to begin the guided question flow.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-md border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Language</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {LANGUAGES.map((language) => (
                <Button key={language.code} type="button" variant="outline" size="sm" dir={language.dir}>
                  {language.nativeName}
                </Button>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Category</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <Button key={category} type="button" variant="secondary" size="sm" className="capitalize">
                  {category}
                </Button>
              ))}
            </div>
          </section>
        </div>
      </section>

      <aside className="flex items-center">
        <div className="w-full rounded-md border border-border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold">Admin workspace</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Build questions, answers, charts, remedies, imports, and translations.
          </p>
          <Button asChild className="mt-5 w-full">
            <Link href="/admin">Open admin</Link>
          </Button>
        </div>
      </aside>
    </main>
  );
}
