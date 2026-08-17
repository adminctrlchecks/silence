import type { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { PageContainer } from '@/components/layout/page-container';
import { Alert } from '@/components/ui/alert';

export type LegalSectionMeta = { id: string; label: string };

/**
 * Shared chrome for /terms and /privacy per
 * docs/product-redesign/19-legal-pages.md §3: container.narrow, header with
 * title/summary/last-updated, a table of contents, and a visible draft
 * notice — the body copy in both pages is real and product-accurate but
 * explicitly NOT final, reviewed legal language (see the NEEDS LEGAL REVIEW
 * comments inside each page's sections), so this stays visible on the
 * live page rather than only as a source comment.
 */
export async function LegalPageLayout({
  eyebrow,
  title,
  summary,
  lastUpdated,
  sections,
  children,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  lastUpdated: string;
  sections: LegalSectionMeta[];
  children: ReactNode;
}) {
  const t = await getTranslations('Legal');
  const locale = await getLocale();

  return (
    <main>
      <PageContainer as="article" size="narrow" className="py-10">
        <header>
          <p className="text-sm font-medium text-primary">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">{title}</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">{summary}</p>
          <p className="mt-2 text-sm text-muted-foreground">{lastUpdated}</p>
        </header>

        <div className="mt-6">
          <Alert variant="warning" title={t('draftNotice')} />
        </div>

        {locale !== 'en' ? (
          <div className="mt-3">
            <Alert variant="info" title={t('translationNotice')} />
          </div>
        ) : null}

        <nav aria-label={t('tableOfContents')} className="mt-8 rounded-md border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('tableOfContents')}</p>
          <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="text-sm text-primary underline-offset-2 hover:underline">
                  {index + 1}. {section.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="prose-legal mt-8 space-y-8">{children}</div>
      </PageContainer>
    </main>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-xl font-semibold tracking-normal">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}
