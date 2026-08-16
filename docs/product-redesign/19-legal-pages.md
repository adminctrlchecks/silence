# Legal Pages

> UX/content structure for Terms, Privacy, Cookie, Accessibility, and disclaimer surfaces. This is not legal advice.

---

## 1. Current Legal State

- No `/terms`, `/privacy`, `/cookie-policy`, `/accessibility`, or legal page routes exist in the inspected Next.js route tree. `CURRENT`
- Registration currently includes a consent checkbox: "I consent to saving my profile, birth details, answers, chart, and remedy." `CURRENT`
- Silence stores contact, DOB, time/place of birth, coordinates/timezone when available, user responses, charts, remedies, and reading sessions. `CURRENT`
- Gemini is used for AI answers, translation, and chart interpretation. `CURRENT`
- The repository does not contain reviewed legal copy. `CURRENT`

## 2. Required Legal/Trust Pages

| Page | Priority | Status |
|---|---:|---|
| Terms & Conditions (`/terms`) | P0 | `PROPOSED` content `NEEDS DECISION` legal review |
| Privacy Policy (`/privacy`) | P0 | `PROPOSED` content `NEEDS DECISION` legal review |
| Cookie Policy or cookie section | P1 | `NEEDS DECISION` based on actual cookies/tracking |
| Accessibility Statement | P2 | `PROPOSED` if the product commits publicly to WCAG target |
| Astrology/AI Disclaimer | P0/P1 | `NEEDS DECISION`; can be a section in Terms/Home/Auth first |

## 3. Legal Page Layout

- Container: `container.narrow` (720-840px). `PROPOSED`
- Header: page title, short non-legal summary, last updated date, effective date. `PROPOSED`
- Table of contents for long pages. `PROPOSED`
- Main content with clear headings and anchor links. `PROPOSED`
- Footer links to related legal/support pages. `PROPOSED`
- Mobile: sticky TOC is not required; use collapsible or top TOC links. `PROPOSED`

## 4. Terms & Conditions Structure

All final wording requires legal review. `NEEDS DECISION`

Recommended sections:
1. Acceptance of terms.
2. Description of Silence.
3. Eligibility/account responsibilities.
4. User profile and birth-data accuracy.
5. Astrology content and remedy disclaimer.
6. AI-assisted content/translation explanation.
7. Prohibited misuse.
8. Intellectual property/content ownership.
9. Account suspension/termination.
10. Limitation of liability/disclaimers.
11. Governing law/jurisdiction.
12. Contact information.

Do not claim medical, legal, financial, psychological, or guaranteed predictive outcomes unless approved by counsel. `PROPOSED`

## 5. Privacy Policy Structure

All final wording requires legal review. `NEEDS DECISION`

Recommended sections grounded in current data model:
1. Data collected: contact, name, category, language, DOB, birth time/place, coordinates/timezone, consent, responses, charts, remedies, sessions. `CURRENT`
2. How data is used: account, reading flow, chart generation, remedy selection, history. `CURRENT`
3. AI processing: answers, translations, chart interpretation through Gemini integration. `CURRENT`
4. Cookies/session storage: auth cookies, language/category preferences, theme; verify final cookie list before publishing. `CURRENT` `NEEDS DECISION`
5. Data retention: completed sessions/charts/remedy snapshots are stored; retention period needs decision. `CURRENT` `NEEDS DECISION`
6. Data sharing/processors: hosting, email provider, Gemini/Google processing if applicable; exact vendors need review. `NEEDS DECISION`
7. User rights: access, correction, deletion/export request path. `NEEDS DECISION`
8. Security measures: describe at a user-safe level only. `PROPOSED`
9. International transfers/local law. `NEEDS DECISION`
10. Contact/privacy owner. `NEEDS DECISION`

## 6. Cookie Policy

Known frontend cookie categories:
- User auth token cookie name exists in code. `CURRENT`
- Admin auth token cookie name exists in code. `CURRENT`
- Language and category preference cookies exist. `CURRENT`
- Theme persistence likely uses `next-themes` storage/cookie behavior; verify exact storage in implementation. `CURRENT` `NEEDS DECISION`

Recommended default: include a cookie section in Privacy first; split to `/cookies` only if legal review requires it. `PROPOSED`

## 7. Accessibility Statement

- State target standard only if the team commits to it; proposed target is WCAG 2.2 AA. `PROPOSED`
- Include known contact path for accessibility issues. `NEEDS DECISION`
- Do not claim conformance before testing. `PROPOSED`

## 8. Disclaimer Experience

Places to show concise disclaimer/support copy:
- Homepage trust/FAQ section. `PROPOSED`
- Registration consent area. `PROPOSED`
- Chart and remedy pages. `PROPOSED`
- Terms page. `PROPOSED`

Content direction:
- Silence provides reflective astrology guidance, not medical/legal/financial advice. `PROPOSED` `NEEDS DECISION`
- Remedies should be gentle practices; do not frame them as treatments or guaranteed outcomes. `PROPOSED` `NEEDS DECISION`

## 9. Registration Consent

Current consent line is a good minimal start but should link to Terms and Privacy once pages exist. `CURRENT` `PROPOSED`

Recommended pattern:
- Required checkbox.
- Short plain-language summary.
- Links to Terms and Privacy.
- Optional AI-processing disclosure if legal review requires explicit consent. `NEEDS DECISION`

## 10. Accessibility Requirements

- Legal pages must use semantic headings, readable line length, and skip links if page is long. `PROPOSED`
- TOC links must be keyboard accessible. `PROPOSED`
- Last updated/effective dates must be visible text, not only metadata. `PROPOSED`
- Text must support 200% zoom and all locales. `PROPOSED`

## 11. Open Legal Decisions

- Legal owner/company name. `NEEDS DECISION`
- Governing law/jurisdiction. `NEEDS DECISION`
- Privacy contact/support channel. `NEEDS DECISION`
- Data retention period. `NEEDS DECISION`
- Data export/deletion process. `NEEDS DECISION`
- Cookie/tracking scope after analytics decisions. `NEEDS DECISION`
- Exact AI processor disclosures. `NEEDS DECISION`

## 12. Acceptance Criteria

- Terms and Privacy links are visible before registration submission. `PROPOSED`
- No legal claims are published without legal review. `NEEDS DECISION`
- Users can understand what data is collected and why at a high level. `PROPOSED`
- Chart/remedy pages avoid unsupported outcome promises. `PROPOSED`
