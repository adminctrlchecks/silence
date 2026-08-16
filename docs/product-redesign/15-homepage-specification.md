# Homepage Specification

> Dedicated specification for replacing the current `/` session picker with a real product homepage.

---

## 1. Current Homepage Audit

- Current `/` renders `HomePage` with "Astrology Q&A" eyebrow, "Silence" title, three CTA buttons, `SessionPicker`, and highlight cards for language/chart/saved profile. `CURRENT`
- The current page exposes technical copy such as "Saved profile: JWT". `CURRENT`
- Language/category selection exists and should be preserved as part of onboarding, but it should not be the whole first impression. `CURRENT` `PROPOSED`
- No footer, legal links, product explanation, FAQ, trust/privacy explanation, or real product visual exists. `CURRENT`

## 2. Purpose

The homepage should help a first-time visitor understand:

1. What Silence is.
2. Who it is for.
3. What personal data is requested and why.
4. How the reading works.
5. What to do next.

`PROPOSED`

## 3. Primary User

Anonymous seeker evaluating whether to start a personalized astrology reading. `ASSUMPTION`

Secondary users: returning users looking for sign in, admin users finding the admin portal. `CURRENT` `PROPOSED`

## 4. Entry And Exit Points

| Type | Paths |
|---|---|
| Entry | Direct URL, locale redirect, search/social links once SEO exists. `CURRENT` `PROPOSED` |
| Primary exit | Start reading -> language/category step -> register or login. `PROPOSED` |
| Secondary exits | Sign in, How it works, Privacy, Terms, Admin sign in. `PROPOSED` |

## 5. Page Hierarchy

1. Public navbar.
2. Hero with literal product headline and primary CTA.
3. Product visual/demo preview.
4. How it works in 3-5 steps.
5. Core benefits.
6. Trust/privacy explanation.
7. Language/category starting panel.
8. FAQ.
9. Final CTA.
10. Footer.

`PROPOSED`

Do not include testimonials, customer logos, user counts, awards, or certifications unless real verified data exists. `PROPOSED`

## 6. Hero

| Element | Specification |
|---|---|
| Eyebrow | "Multilingual astrology Q&A" or localized equivalent. `PROPOSED` |
| H1 | Use the brand/product name or literal offer: "Silence" with supporting copy explaining the product. `PROPOSED` |
| Supporting copy | "Answer guided questions, generate a birth chart from your saved birth details, and receive a personal remedy." This reflects current functionality. `CURRENT` `PROPOSED` |
| Primary CTA | "Start your reading" -> opens/scrolls to language/category start step or routes to `/register` with saved preferences. `PROPOSED` |
| Secondary CTA | "See how it works" -> `/how-it-works` or section anchor. `PROPOSED` |
| Trust note | Short privacy cue: "Your profile and reading are saved to your account." Avoid legal promises. `CURRENT` `PROPOSED` |

## 7. Product Visual

- Use an actual product preview or generated composite showing the reading journey: question card, chart preview, remedy card. `PROPOSED`
- Do not use random stock meditation/zodiac photography. `PROPOSED`
- Use aspect ratio around 4:3 or 16:10 on desktop; stack below hero copy on mobile. `PROPOSED`
- Alt text: "Preview of a Silence reading with guided questions, a birth chart, and a remedy." `PROPOSED`

## 8. How It Works Section

Use an ordered sequence:

1. Create your profile with language, category, and birth details. `CURRENT`
2. Answer three layers of guided questions. `CURRENT`
3. View your computed astrology chart and interpretation. `CURRENT`
4. Receive a remedy selected from admin-created rules/content. `CURRENT`
5. Return to reading history anytime. `CURRENT`

Each step should include one icon, 1 heading, and 1-2 sentences. `PROPOSED`

## 9. Benefits Section

| Benefit | Grounding |
|---|---|
| Multilingual reading experience | 11 languages and Arabic RTL are documented/current. `DOCUMENTED` `CURRENT` |
| Saved reading history | Reading sessions/history exist. `CURRENT` |
| Chart from birth details | Swiss Ephemeris chart generation exists. `CURRENT` |
| Admin-reviewed content model | Admin CRUD/review and AI source/review flags exist. `CURRENT` |

Avoid promising chart accuracy beyond the data quality currently available; use the existing exact/approximate/uncertain concept when explaining accuracy. `CURRENT` `PROPOSED`

## 10. Trust And Privacy Section

Purpose: explain why birth data is requested without pretending to be legal advice. `PROPOSED`

Content points:
- Birth date, time, and place are used to calculate the astrology chart. `DOCUMENTED` `CURRENT`
- The account saves responses, chart, remedy, and reading history. `CURRENT`
- Terms and Privacy pages should be available before signup. `PROPOSED`
- AI may be used for answer generation, translation, and chart interpretation; the exact privacy/legal wording requires review. `CURRENT` `NEEDS DECISION`

## 11. Start Panel

The current `SessionPicker` should become a lightweight start panel, not the dominant hero. `CURRENT` `PROPOSED`

Fields:
- Language: show native names and current locale. `CURRENT` `PROPOSED`
- Category: Male/Female/Other as content categories. `DOCUMENTED` `CURRENT`
- CTA: "Continue to profile" or "Create profile". `PROPOSED`

Behavior:
- Save choices to the existing preference cookies. `CURRENT`
- Route to localized `/register` or `/login` depending on user state. `PROPOSED`
- On mobile, panel appears after hero and before final CTA; do not hide it behind a hover-only interaction. `PROPOSED`

## 12. FAQ Section

Recommended questions:

- What is Silence?
- Why do you ask for birth time and place?
- What languages are supported?
- Can I return to previous readings?
- Is this medical, legal, or financial advice? Answer should be no; content is spiritual/reflective guidance and needs legal review for exact wording. `NEEDS DECISION`
- How is AI used? Explain current Gemini uses at a high level. `CURRENT` `PROPOSED`

## 13. Footer

Include:
- Product links: Home, How it works, Start reading.
- Account links: Sign in, Create profile.
- Trust links: Privacy, Terms, Support/Contact.
- Language selector.
- Admin sign in low-emphasis.
- Copyright/legal owner. `NEEDS DECISION`

`PROPOSED`

## 14. Loading, Empty, Error, Success

- Static homepage should load without blocking API calls. `PROPOSED`
- If language/category preferences fail to save, show inline non-blocking error and allow registration defaults. `PROPOSED`
- If translations are missing, fall back intentionally and report through i18n QA; do not show raw keys. `PROPOSED`
- Success state for start panel: preference saved and user moves to registration. `PROPOSED`

## 15. Mobile Layout

- Navbar: logo, language, menu. `PROPOSED`
- Hero: text first, CTA visible above fold, visual follows. `PROPOSED`
- Ensure a hint of the next section remains visible in common mobile viewports when hero is first shown. `PROPOSED`
- Start panel uses full-width controls and 44px minimum targets. `PROPOSED`
- Footer links stack by group. `PROPOSED`

## 16. Accessibility

- One `<h1>` only. `PROPOSED`
- Product visual has meaningful alt text or is hidden if purely decorative. `PROPOSED`
- CTA order is logical for keyboard users. `PROPOSED`
- Language selector announces current language and destination. `PROPOSED`
- Category selection uses radio/segmented control semantics. `PROPOSED`
- Motion/visual previews respect reduced motion. `PROPOSED`

## 17. SEO

| Field | Recommendation |
|---|---|
| Title | `Silence - Multilingual Astrology Q&A` |
| Meta description | `Create a profile, answer guided astrology questions, view a birth chart, and receive a personal remedy in your preferred language.` |
| H1 | `Silence` or `Silence Astrology Q&A` |
| Canonical | Locale-aware canonical strategy; default locale plus alternates. `PROPOSED` |
| Open Graph | Requires OG image asset. `PROPOSED` |
| Structured data | Organization/WebSite only after legal owner is confirmed. `NEEDS DECISION` |

## 18. Acceptance Criteria

- A first-time visitor can describe the product without clicking registration. `PROPOSED`
- Admin sign-in is available but no longer overemphasized. `PROPOSED`
- Language/category selection remains available and functional. `CURRENT` `PROPOSED`
- Terms and Privacy links are visible before signup. `PROPOSED`
- No fabricated social proof appears. `PROPOSED`
