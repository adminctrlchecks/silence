import Link from 'next/link';
import { ArrowRight, History, MoonStar, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

const nextSteps = [
  { label: 'Question flow', href: '/app/questions', icon: ArrowRight },
  { label: 'Saved chart', href: '/app/chart', icon: MoonStar },
  { label: 'Profile', href: '/profile', icon: UserRound },
  { label: 'History', href: '/history', icon: History },
];

export default function UserAppPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <section className="rounded-md border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-medium text-primary">User workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">Your Silence session</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
