# SEO

> Public-facing SEO foundation for Silence.

---

## 1. Current SEO State

- Root layout exports one global metadata object: title `Silence`, description `Multilingual astrology Q&A.` `CURRENT`
- No per-page `metadata` or `generateMetadata` was found in the inspected frontend. `CURRENT`
- No sitemap, robots, custom Open Graph image, favicon/app icon assets, or custom not-found route exists. `CURRENT`
- Locale-prefixed routes exist for public/auth/user pages through `next-intl`. `CURRENT`
- Current homepage lacks enough explanatory content for search/social visitors. `CURRENT`

## 2. SEO Principles

- SEO should help users understand the product, not keyword-stuff astrology terms. `PROPOSED`
- Only public pages should be indexed; authenticated app/admin pages should not be search targets. `PROPOSED`
- Locale pages need proper canonical/alternate relationships. `PROPOSED`
- Do not publish claims about accuracy, testimonials, certifications, or user counts unless verified. `PROPOSED`

## 3. Public URL Structure

| Route | Indexing | Notes |
|---|---|---|
| `/{locale}` | Index | Homepage. `CURRENT` `PROPOSED` |
| `/{locale}/how-it-works` | Index | Product education. `PROPOSED` |
| `/{locale}/about` | Index only if factual content exists | `NEEDS DECISION` |
| `/{locale}/terms` | Index or noindex per legal preference | `NEEDS DECISION` |
| `/{locale}/privacy` | Index or noindex per legal preference | `NEEDS DECISION` |
| `/{locale}/login`, `/register`, reset pages | Noindex | Auth utility pages. `PROPOSED` |
| `/app`, `/profile`, `/history`, `/admin` | Noindex/protected | Authenticated/private. `CURRENT` `PROPOSED` |

## 4. Metadata Recommendations

| Page | Title | Meta Description |
|---|---|---|
| Home | `Silence - Multilingual Astrology Q&A` | `Create a profile, answer guided astrology questions, view a birth chart, and receive a personal remedy in your preferred language.` |
| How It Works | `How Silence Works` | `Learn how Silence guides you from profile and questions to a birth chart, personal remedy, and saved reading history.` |
| Login | `Sign in to Silence` | Noindex. |
| Register | `Create Your Silence Profile` | Noindex; include privacy/consent copy in page. |
| Privacy | `Privacy Policy - Silence` | Requires legal review. `NEEDS DECISION` |
| Terms | `Terms & Conditions - Silence` | Requires legal review. `NEEDS DECISION` |

`PROPOSED`

## 5. Heading Structure

- One `<h1>` per public page. `PROPOSED`
- Homepage H1 should be the brand/product name or literal offer, with value proposition in supporting copy. `PROPOSED`
- Section headings should describe content, not use vague marketing labels. `PROPOSED`
- Auth/admin/app pages should still use correct headings even if noindexed. `PROPOSED`

## 6. Canonical And Alternates

- Generate canonical URLs per locale. `PROPOSED`
- Generate `hreflang` alternates for all 11 supported locales where translations exist. `PROPOSED`
- Include `x-default` pointing to default locale/homepage. `PROPOSED`
- Avoid duplicate indexing of non-locale and locale paths; align with `next-intl` `localePrefix: 'always'`. `CURRENT` `PROPOSED`

## 7. Open Graph And Social Metadata

- Create a 1200x630 OG image. `PROPOSED`
- Use product visual/brand mark, not stock portrait/testimonial. `PROPOSED`
- Define title/description/image per public page. `PROPOSED`
- Add Twitter/X card metadata if social sharing is expected. `PROPOSED`

`NEEDS DECISION`: final domain/canonical production URL and social sharing channels.

## 8. Sitemap And Robots

Sitemap should include only public indexable routes and locale variants. `PROPOSED`

Robots should:
- Allow public homepage/how-it-works/about if launched.
- Disallow/noindex authenticated app/admin/auth utility routes.
- Include sitemap URL.

`PROPOSED`

## 9. Structured Data

Potential schemas:
- `WebSite` for product site. `PROPOSED`
- `Organization` only after legal owner/company is confirmed. `NEEDS DECISION`
- FAQ structured data only if FAQ content is stable and reviewed. `NEEDS DECISION`

Do not use health/medical/spiritual-service schema claims without legal/product review. `PROPOSED`

## 10. Content Requirements

- Homepage must define the product in plain language. `PROPOSED`
- How-it-works should explain the five content layers without exposing internal model jargon. `DOCUMENTED` `PROPOSED`
- Privacy/Terms should be available before signup. `PROPOSED`
- No fake testimonials, social proof, awards, or customer logos. `PROPOSED`

## 11. Technical SEO Acceptance Criteria

- Per-public-page metadata exists. `PROPOSED`
- Sitemap and robots exist. `PROPOSED`
- Favicon/app icons and OG image exist. `PROPOSED`
- Authenticated/admin pages are noindexed or protected from indexing. `PROPOSED`
- Locale alternates are correct and do not create duplicate canonical confusion. `PROPOSED`
- 404 page is custom and noindexed. `PROPOSED`
