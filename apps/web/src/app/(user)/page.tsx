import Link from 'next/link';
import { cookies } from 'next/headers';
import { ArrowRight, Languages, MoonStar, ShieldCheck } from 'lucide-react';
import { SessionPicker } from '@/components/session/session-picker';
import { Button } from '@/components/ui/button';
import {
  CATEGORY_COOKIE,
  LANGUAGE_COOKIE,
  normalizeCategory,
  normalizeSessionLanguage,
} from '@/lib/session-preferences';

const highlights = [
  { label: 'Language', value: '11', icon: Languages },
  { label: 'Chart', value: 'Astrology', icon: MoonStar },
  { label: 'Saved profile', value: 'JWT', icon: ShieldCheck },
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const language = normalizeSessionLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const category = normalizeCategory(cookieStore.get(CATEGORY_COOKIE)?.value);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_22rem]">
      <section className="flex min-h-[calc(100vh-9rem)] flex-col justify-center gap-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Astrology Q&A</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
            Silence
          </h1>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/register">
                Create profile
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        <SessionPicker initialLanguage={language} initialCategory={category} />
      </section>

      <aside className="flex items-center">
        <div className="w-full space-y-3">
          {highlights.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-md border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{value}</p>
                </div>
              </div>
            </div>
          ))}
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="/admin">Admin workspace</Link>
          </Button>
        </div>
      </aside>
    </main>
  );
}
