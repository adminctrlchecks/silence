import type { Metadata } from 'next';
import { LegalPageLayout, LegalSection, type LegalSectionMeta } from '@/components/legal/legal-page-layout';
import { localeAlternates } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'The terms that govern using Silence.',
  alternates: {
    canonical: '/terms',
    languages: localeAlternates('/terms'),
  },
};

// All copy in this file is real and product-accurate (grounded in what the
// app actually does), but is NOT reviewed, final legal language — see
// docs/product-redesign/19-legal-pages.md §4 and open-decisions.md. Sections
// marked NEEDS LEGAL REVIEW below have no factual basis in the codebase to
// draw from (entity name, jurisdiction, liability language) and must not be
// filled in without counsel; do not invent specifics for them.
const sections: LegalSectionMeta[] = [
  { id: 'acceptance', label: 'Acceptance of terms' },
  { id: 'description', label: 'Description of Silence' },
  { id: 'eligibility', label: 'Eligibility and account responsibilities' },
  { id: 'accuracy', label: 'Profile and birth-data accuracy' },
  { id: 'disclaimer', label: 'Astrology content and remedy disclaimer' },
  { id: 'ai', label: 'AI-assisted content' },
  { id: 'misuse', label: 'Prohibited use' },
  { id: 'ip', label: 'Content and intellectual property' },
  { id: 'suspension', label: 'Suspension and termination' },
  { id: 'liability', label: 'Limitation of liability' },
  { id: 'law', label: 'Governing law' },
  { id: 'contact', label: 'Contact' },
];

export default function TermsPage() {
  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Terms & Conditions"
      summary="These terms cover how Silence works, what we ask of you, and what you can expect from the reading, chart, and remedy content."
      lastUpdated="Draft prepared 2026-08-17"
      sections={sections}
    >
      <LegalSection id="acceptance" title="1. Acceptance of terms">
        <p>
          By creating a profile or otherwise using Silence, you agree to these terms. If you don't agree, please
          don't use the service.
        </p>
      </LegalSection>

      <LegalSection id="description" title="2. Description of Silence">
        <p>
          Silence is a guided astrology reading experience. You create a profile with your birth details, answer a
          series of reflective questions across three layers (Common, Level 1, and Level 2), and Silence generates a
          birth chart and a personal remedy from that information. The reading flow, remedy suggestions, and much of
          the question/answer content are prepared and reviewed by Silence's administrators; some content is
          generated or translated with AI assistance (see §6). Silence is offered free of charge, without paid
          plans, subscriptions, or usage limits, as an admin-operated service.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" title="3. Eligibility and account responsibilities">
        <p>
          You're responsible for the accuracy of the information you provide, for keeping your password confidential,
          and for activity that happens under your account. Create one profile for yourself; don't create profiles on
          behalf of other people without their knowledge.
        </p>
        <p>{'NEEDS LEGAL REVIEW: '}minimum age / capacity-to-consent requirement.</p>
      </LegalSection>

      <LegalSection id="accuracy" title="4. Profile and birth-data accuracy">
        <p>
          Your birth chart is calculated from the date, time, and place of birth you provide. Silence shows an
          accuracy indicator (exact / approximate / uncertain) based on whether exact coordinates and timezone are
          available. Incomplete or incorrect birth details will produce a less accurate — or inaccurate — chart and
          remedy. You can review and update your birth details from your profile at any time; this may change the
          chart shown for future readings, though readings you've already completed keep their original chart as a
          historical record.
        </p>
      </LegalSection>

      <LegalSection id="disclaimer" title="5. Astrology content and remedy disclaimer">
        <p>
          Silence's readings, chart interpretations, and remedies are offered for reflection and self-understanding.
          They are not medical, legal, financial, or psychological advice, they do not diagnose or treat any
          condition, and they do not guarantee any outcome. Remedies are gentle, repeatable practices, not treatments
          — please use your own judgment, and consult a qualified professional for medical, legal, financial, or
          mental-health concerns.
        </p>
      </LegalSection>

      <LegalSection id="ai" title="6. AI-assisted content">
        <p>
          Some question answers, translations, and chart interpretations are generated with the help of Google's
          Gemini AI model. Where content has instead been written or reviewed by a Silence administrator, your
          reading history labels it separately. AI-generated content can be imperfect; treat it the same way as the
          rest of Silence's guidance — reflective, not authoritative.
        </p>
      </LegalSection>

      <LegalSection id="misuse" title="7. Prohibited use">
        <ul className="list-disc space-y-1.5 ps-5">
          <li>Impersonating another person, or creating a profile using someone else's identity without consent.</li>
          <li>Attempting to bypass, disable, or probe Silence's security, rate limits, or access controls.</li>
          <li>Scraping, bulk-extracting, or reselling Silence's question, remedy, or chart content.</li>
          <li>Using Silence for any unlawful purpose, or in a way that disrupts the service for other users.</li>
        </ul>
      </LegalSection>

      <LegalSection id="ip" title="8. Content and intellectual property">
        <p>
          The questions, remedies, chart presentation, and other content Silence's administrators prepare belong to
          Silence. Your own answers remain yours; by submitting them, you allow Silence to store and process them to
          generate your chart, select your remedy, and show your reading history to you.
        </p>
        <p>{'NEEDS LEGAL REVIEW: '}exact content-licensing language.</p>
      </LegalSection>

      <LegalSection id="suspension" title="9. Suspension and termination">
        <p>
          You can stop using Silence at any time. Silence may suspend or terminate access for accounts that violate
          §7 (Prohibited use) or these terms more broadly. Silence doesn't yet offer self-serve account deletion —
          see the Privacy Policy's data-request section for how to ask for your data to be removed.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="10. Limitation of liability">
        <p>{'NEEDS LEGAL REVIEW: '}standard limitation-of-liability / "as is" / no-warranty language, to be drafted by counsel.</p>
      </LegalSection>

      <LegalSection id="law" title="11. Governing law">
        <p>{'NEEDS LEGAL REVIEW: '}operating entity name and governing law / jurisdiction.</p>
      </LegalSection>

      <LegalSection id="contact" title="12. Contact">
        <p>{'NEEDS DECISION: '}a support/legal contact channel has not been finalized yet (see open-decisions.md #6).</p>
      </LegalSection>
    </LegalPageLayout>
  );
}
