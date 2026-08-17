import type { Metadata } from 'next';
import { LegalPageLayout, LegalSection, type LegalSectionMeta } from '@/components/legal/legal-page-layout';
import { localeAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What data Silence collects, how it is used, and your privacy choices.',
  alternates: {
    canonical: '/privacy',
    languages: localeAlternates('/privacy'),
  },
};

// See the same NEEDS LEGAL REVIEW / NEEDS DECISION note in apps/web/src/app/(user)/terms/page.tsx —
// this page's data-handling description is grounded in the actual codebase
// (cookie names, stored fields, AI usage), but retention period, data-
// processor/subprocessor disclosures, and international-transfer language
// need legal review before this is final.
const sections: LegalSectionMeta[] = [
  { id: 'data-collected', label: 'Data we collect' },
  { id: 'data-use', label: 'How we use your data' },
  { id: 'ai-processing', label: 'AI processing' },
  { id: 'cookies', label: 'Cookies and session storage' },
  { id: 'retention', label: 'Data retention' },
  { id: 'sharing', label: 'Data sharing and processors' },
  { id: 'rights', label: 'Your rights and data requests' },
  { id: 'security', label: 'Security measures' },
  { id: 'transfers', label: 'International transfers' },
  { id: 'contact', label: 'Contact' },
];

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      summary="What Silence stores about you, why, and how to ask about or remove it."
      lastUpdated="Draft prepared 2026-08-17"
      sections={sections}
    >
      <LegalSection id="data-collected" title="1. Data we collect">
        <p>Silence stores the information you provide to create a profile and generate readings:</p>
        <ul className="list-disc space-y-1.5 ps-5">
          <li>Contact (email or phone), name, category, and preferred language.</li>
          <li>Date of birth, time of birth, and place of birth (city/country, plus coordinates and timezone when available).</li>
          <li>Your consent status for storing the above.</li>
          <li>Your answers to Silence's guided questions.</li>
          <li>Generated birth charts and remedy results, and the reading sessions that tie them together.</li>
        </ul>
      </LegalSection>

      <LegalSection id="data-use" title="2. How we use your data">
        <p>
          Your data powers the reading flow itself: creating your account, calculating your birth chart, selecting a
          remedy, and showing your reading history back to you. Language and category preferences personalize which
          questions and remedies you see.
        </p>
      </LegalSection>

      <LegalSection id="ai-processing" title="3. AI processing">
        <p>
          Some question answers, translations, and chart interpretations are generated using Google's Gemini AI
          model. Where a Silence administrator has written or reviewed content instead, that's labeled separately in
          your reading history.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="4. Cookies and session storage">
        <p>Silence uses a small number of first-party cookies, all functional (no advertising or analytics cookies):</p>
        <ul className="list-disc space-y-1.5 ps-5">
          <li>Sign-in and refresh cookies, separately for your account and for admin accounts, so you stay signed in.</li>
          <li>A language-preference cookie and a category-preference cookie, so your choices persist between visits.</li>
        </ul>
        <p>
          Your light/dark theme preference is saved in your browser's local storage, not a cookie.{' '}
          {'NEEDS DECISION: '}confirm this list stays exhaustive before publishing (open-decisions.md, Cookie Policy).
        </p>
      </LegalSection>

      <LegalSection id="retention" title="5. Data retention">
        <p>
          Completed reading sessions — including your answers, chart, and remedy snapshot — are kept so your History
          page keeps working. {'NEEDS LEGAL REVIEW: '}a specific retention period has not been set.
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="6. Data sharing and processors">
        <p>
          Silence doesn't sell your data. Processing your data involves the infrastructure that hosts Silence and
          Google's Gemini API for the AI-assisted content described in §3. {'NEEDS LEGAL REVIEW: '}a complete,
          reviewed list of processors/subprocessors.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="7. Your rights and data requests">
        <p>
          Silence doesn't yet offer self-serve data export or account/data deletion. If you'd like a copy of your
          data, or want it deleted, you can reach out and we'll handle the request manually.{' '}
          {'NEEDS DECISION: '}a specific support/privacy contact channel hasn't been finalized (open-decisions.md
          #6) — this section will name one once it is, rather than implying a channel that doesn't exist yet.
        </p>
      </LegalSection>

      <LegalSection id="security" title="8. Security measures">
        <p>
          Traffic to Silence is encrypted in transit, passwords are stored using industry-standard hashing (never in
          plain text), and admin tools are access-controlled and separate from user accounts.
        </p>
      </LegalSection>

      <LegalSection id="transfers" title="9. International transfers">
        <p>{'NEEDS LEGAL REVIEW: '}international-transfer and applicable local-law language.</p>
      </LegalSection>

      <LegalSection id="contact" title="10. Contact">
        <p>{'NEEDS DECISION: '}a privacy contact channel has not been finalized yet (see open-decisions.md #6).</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
