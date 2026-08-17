import { Info } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Concise chart/remedy disclaimer per docs/product-redesign/open-decisions.md
 * decision #5 ("concise on-page disclaimer plus full Terms section") — used
 * on both /app/chart and /app/remedy. Links to /terms, which 404s until
 * Phase 8 ships the legal pages (same pattern as the footer's legal links
 * added in Phase 2).
 */
export async function ReadingDisclaimer() {
  const t = await getTranslations('Disclaimer');

  return (
    <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>
        {t.rich('chartRemedy', {
          terms: (chunks: ReactNode) => (
            <Link href="/terms" className="font-medium underline underline-offset-2">
              {chunks}
            </Link>
          ),
        })}
      </span>
    </p>
  );
}
