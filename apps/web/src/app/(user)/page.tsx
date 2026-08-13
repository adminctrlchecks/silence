import Link from 'next/link';
import { LANGUAGES } from '@/lib/i18n';
import { CATEGORIES } from '@silence/shared';

/**
 * Landing: pick language + category, then start the question flow.
 * Placeholder markup — the astrology theme replaces the visuals; the data
 * (11 languages incl. Arabic RTL, 3 categories) is already wired from the shared package.
 */
export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1>Silence</h1>
      <p>Multilingual astrology Q&amp;A. Choose your language and category to begin.</p>

      <section style={{ marginTop: '2rem' }}>
        <h2>Language</h2>
        <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', listStyle: 'none' }}>
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button type="button" dir={l.dir}>
                {l.nativeName} ({l.code})
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Category</h2>
        <ul style={{ display: 'flex', gap: '.5rem', listStyle: 'none' }}>
          {CATEGORIES.map((c) => (
            <li key={c}>
              <button type="button">{c}</button>
            </li>
          ))}
        </ul>
      </section>

      <p style={{ marginTop: '2rem' }}>
        <Link href="/admin">Admin panel →</Link>
      </p>
    </main>
  );
}
