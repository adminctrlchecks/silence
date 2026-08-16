# Open Decisions

> Consolidated `NEEDS DECISION` register for Phase 1. Each decision has a recommended default so implementation can continue without blocking, while still making unresolved ownership explicit.

---

## 1. Business Model

- **Question:** Is Silence free, freemium/subscription, consultation funnel, internal admin tool, or multi-tenant SaaS?
- **Why it matters:** Determines pricing, paywalls, account tiers, billing, onboarding, and support.
- **Options:** Free product; paid consumer subscription; consultation funnel; internal admin-operated tool; multi-tenant SaaS.
- **Recommended option:** Start as a free/admin-operated reading product; defer billing and multi-tenant work.
- **Impact if unresolved:** Do not build pricing, billing, subscriptions, usage limits, teams, or paywalls.
- **Priority:** P0 decision for business strategy; P3 for implementation until confirmed.

## 2. Legal Owner And Legal Copy

- **Question:** What legal entity owns Silence, and who reviews Terms/Privacy/disclaimers?
- **Why it matters:** Terms, Privacy, copyright, structured data, and legal contact cannot be fabricated.
- **Options:** Individual owner; company/legal entity; defer public legal owner until entity is confirmed.
- **Recommended option:** Confirm legal owner and obtain legal review before production legal pages.
- **Impact if unresolved:** Terms/Privacy can be structured but not safely published as final legal copy.
- **Priority:** P0.

## 3. Privacy, Data Rights, And Retention

- **Question:** What are the retention, export, deletion, and privacy request processes for profile, birth details, responses, charts, remedies, and sessions?
- **Why it matters:** Silence stores sensitive personal and birth data.
- **Options:** Manual support request; self-serve export/delete; fixed retention; indefinite retention with user request path.
- **Recommended option:** Start with manual privacy/support request path, then scope self-serve export/delete.
- **Impact if unresolved:** Do not imply self-serve deletion/export exists.
- **Priority:** P0/P1.

## 4. AI Processing Disclosure

- **Question:** How should Silence disclose Gemini usage for AI answers, translations, and chart interpretation?
- **Why it matters:** Affects Privacy, consent, chart/remedy trust copy, and user transparency.
- **Options:** Privacy-only disclosure; consent-adjacent disclosure; per-page AI labels; admin-only AI labeling.
- **Recommended option:** Explain AI use in Privacy and consent-adjacent copy; keep admin source/review labels; avoid noisy user labels unless legal review requires.
- **Impact if unresolved:** Avoid final AI/privacy wording in production.
- **Priority:** P0.

## 5. Astrology/Remedy Disclaimer

- **Question:** What exact disclaimer should apply to chart interpretations and remedies?
- **Why it matters:** Remedies must not imply medical/legal/financial/guaranteed outcomes.
- **Options:** Terms-only disclaimer; concise on-page disclaimer; both.
- **Recommended option:** Both: concise chart/remedy page note plus full Terms section.
- **Impact if unresolved:** Do not publish strong outcome claims or treatment-like language.
- **Priority:** P0/P1.

## 6. Support Contact And Privacy Contact

- **Question:** What support channel should users use for account, privacy, accessibility, and content issues?
- **Why it matters:** Footer, contact page, Privacy, Accessibility Statement, and error recovery need a real path.
- **Options:** Email; form; ticketing system; admin-managed inbox.
- **Recommended option:** Start with a monitored support/privacy email or simple contact form.
- **Impact if unresolved:** Contact/support pages remain blocked or generic.
- **Priority:** P1.

## 7. Brand Identity

- **Question:** What final logo, wordmark, favicon, and brand ownership should Silence use?
- **Why it matters:** Affects navbar, auth, admin sidebar, favicon, OG image, and asset licensing.
- **Options:** Keep placeholder `S`; design custom mark; commission brand identity.
- **Recommended option:** Create a simple owned custom mark/wordmark and replace placeholder `S`.
- **Impact if unresolved:** Use temporary text mark only; do not create final app icons/OG assets as permanent.
- **Priority:** P0/P1.

## 8. Brand Name Localization

- **Question:** Should "Silence" remain untranslated in all locales?
- **Why it matters:** Affects brand consistency, wordmark, SEO, and message catalogs.
- **Options:** Keep global English brand; transliterate per locale; translate conceptually.
- **Recommended option:** Keep "Silence" as a global brand name.
- **Impact if unresolved:** Avoid locale-specific brand assets.
- **Priority:** P2.

## 9. Social Proof

- **Question:** Should homepage include testimonials, user counts, logos, awards, or certifications?
- **Why it matters:** None are documented in the repo; fabricating them is prohibited.
- **Options:** No social proof; real testimonials after collection; operational trust indicators only.
- **Recommended option:** Do not include social proof until real, permissioned evidence exists.
- **Impact if unresolved:** Homepage uses product explanation and privacy/trust copy instead.
- **Priority:** P1/P2.

## 10. Admin Localization

- **Question:** Should the admin UI itself be translated, or only the content it manages?
- **Why it matters:** Admin UI is currently English-only despite 11-language user support.
- **Options:** Keep admin English; translate admin UI; translate only content/editor labels.
- **Recommended option:** Keep admin shell English for first redesign unless operators require localization; fully support content translation workflows.
- **Impact if unresolved:** Do not promise multilingual admin UI.
- **Priority:** P1/P2.

## 11. Translation Review Policy

- **Question:** Are machine translations considered publishable, or must they be human-reviewed?
- **Why it matters:** Impacts content quality, admin states, and user trust.
- **Options:** Auto-publish machine translation; machine-generated pending review; source-language fallback.
- **Recommended option:** Track machine-translated vs human-reviewed status; prioritize review for public/user critical content.
- **Impact if unresolved:** Translation quality gaps may be invisible.
- **Priority:** P1.

## 12. Google OAuth

- **Question:** Should Google OAuth be implemented for production launch?
- **Why it matters:** Env variable names exist, but auth routes are not implemented.
- **Options:** Hide OAuth; implement user OAuth only; implement user/admin OAuth; defer.
- **Recommended option:** Hide until fully implemented; if added, user OAuth only first.
- **Impact if unresolved:** Do not show Google sign-in UI.
- **Priority:** P1/P2.

## 13. Contact Field And International Phone Handling

- **Question:** Should `contact` remain email-or-phone, and how should international phone validation work?
- **Why it matters:** Current auth uses contact; reset/email delivery may differ for phone vs email.
- **Options:** Email only; email or phone with validation; separate email/phone fields.
- **Recommended option:** Prefer email as primary account contact; keep phone optional only if SMS/support requirements are defined.
- **Impact if unresolved:** Keep copy generic but avoid promising SMS/password reset by phone.
- **Priority:** P1.

## 14. Cookie And Tracking Scope

- **Question:** Will the product use analytics/marketing cookies beyond auth/preferences/theme?
- **Why it matters:** Determines Cookie Policy, consent banner, privacy wording, and analytics implementation.
- **Options:** Essential cookies only; analytics cookies; marketing cookies.
- **Recommended option:** Essential cookies only for first redesign; add analytics only with privacy review.
- **Impact if unresolved:** Keep cookie policy as Privacy section and do not add tracking scripts.
- **Priority:** P1.

## 15. About Page Content

- **Question:** What factual company/team/operator story should appear on `/about`?
- **Why it matters:** Repo has no verified story; invented founder/operator content is prohibited.
- **Options:** Omit page; minimal product mission; full team/company story after review.
- **Recommended option:** Defer About or ship minimal product mission only.
- **Impact if unresolved:** Do not index or feature About as a major nav item.
- **Priority:** P2.

## 16. Accessibility Statement

- **Question:** Should Silence publish a formal accessibility statement now?
- **Why it matters:** Public conformance claims require testing and support contact.
- **Options:** No statement; statement of intent; tested conformance statement.
- **Recommended option:** Publish after WCAG audit and support contact are ready.
- **Impact if unresolved:** Keep accessibility requirements internal until verified.
- **Priority:** P2.

## 17. Device Sessions And Token Revocation

- **Question:** Should users/admins manage active sessions/devices?
- **Why it matters:** Refresh endpoints exist, but frontend silent refresh/device management is not implemented.
- **Options:** No device UI; revoke-all; full device list; persisted refresh-token sessions.
- **Recommended option:** Defer device UI until refresh-token persistence/revocation model is scoped.
- **Impact if unresolved:** Security settings show password change only.
- **Priority:** P2.

## 18. Custom Astrology Glyphs

- **Question:** Should Silence use custom zodiac/planet glyphs beyond Lucide icons and chart components?
- **Why it matters:** Requires licensing, consistency, accessibility, and i18n review.
- **Options:** Lucide only; chart-library symbols only; custom owned glyph set.
- **Recommended option:** Use Lucide for UI and chart-component symbols for chart data; avoid custom glyphs initially.
- **Impact if unresolved:** Do not add mixed icon families.
- **Priority:** P3.

## 19. AI Chat Or Deeper Conversational Features

- **Question:** Should Silence add AI chat or conversational readings?
- **Why it matters:** Competitors have adjacent features, but Silence currently has guided Q&A, not chat.
- **Options:** No chat; admin-only AI drafting; user AI chat; paid premium chat.
- **Recommended option:** No user AI chat in this redesign; keep AI as content/translation/interpretation support.
- **Impact if unresolved:** Do not design chat IA or safety/legal flows.
- **Priority:** P3.

## 20. Production Domain And Social Sharing

- **Question:** What canonical production domain and social sharing channels should metadata use?
- **Why it matters:** Affects canonical URLs, OG images, sitemap, structured data, and robots.
- **Options:** Current deployment domain; future branded domain; multiple domains.
- **Recommended option:** Use the current production domain until a branded domain is confirmed.
- **Impact if unresolved:** Metadata can be templated but final canonical/OG values need update.
- **Priority:** P1.
