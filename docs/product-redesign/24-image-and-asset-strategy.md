# Image And Asset Strategy

> Visual asset strategy for Silence: what assets are needed, where they belong, and how to handle licensing/performance/accessibility.

---

## 1. Current Asset State

- No `apps/web/public` directory exists in the inspected frontend, so there are no shipped favicons, app icons, Open Graph images, or static brand assets. `CURRENT`
- Current UI relies on CSS, cards, and `lucide-react` icons rather than imagery. `CURRENT`
- Chart visuals are rendered through app components and `@roxyapi/ui`, not image files. `CURRENT`
- No product screenshots, illustrations, logo assets, or social preview images are documented. `CURRENT`

## 2. Asset Principles

- Use visual assets to explain the product, not decorate around it. `PROPOSED`
- Prefer product-derived previews, generated illustration briefs, or owned assets over random stock photography. `PROPOSED`
- Do not use copyrighted astrology/zodiac artwork unless licensing is verified. `PROPOSED`
- Do not use fake user photos, testimonials, client logos, or certification badges. `PROPOSED`
- Every externally sourced asset needs source, license, attribution notes, and stored optimization derivatives. `PROPOSED`

## 3. Required Asset Inventory

| Asset | Placement | Specification | Priority |
|---|---|---|---|
| Product logo/mark | Navbar, favicon, admin sidebar, auth | Simple monochrome-capable `S`/celestial mark plus wordmark. `NEEDS DECISION` | P0 |
| Favicon/app icons | Browser/mobile homescreen | 16/32/180/192/512px variants, maskable icon. `PROPOSED` | P0 |
| Open Graph image | Social/search sharing | 1200x630, brand mark + product preview, localized only if needed. `PROPOSED` | P1 |
| Homepage hero visual | Homepage first viewport | Product preview composite: question card + chart + remedy, 16:10 or 4:3. `PROPOSED` | P0 |
| How-it-works visuals | Homepage/how-it-works | Three/five step icon-led sequence. `PROPOSED` | P1 |
| Empty-state illustrations | User/admin empty states | Small consistent line illustrations or icon-led panels. `PROPOSED` | P2 |
| Chart preview assets | Homepage/chart page | Use actual rendered chart components/screenshots, not decorative astrology art. `CURRENT` `PROPOSED` | P1 |

## 4. Homepage Hero Brief

Create an owned/generated bitmap or product-rendered composite:

- Subject: a calm modern app interface showing guided questions, a birth chart, and a remedy card.
- Style: clean product UI, warm neutral background, restrained celestial accents.
- Composition: interface-forward, readable at desktop and mobile crop.
- Aspect ratio: 16:10 desktop; mobile crop safe center.
- Avoid: human faces implying testimonials, religious/medical symbolism, dark unreadable star fields, generic horoscope wheels unrelated to the actual app.
- Alt text: "Preview of a Silence reading with guided questions, a birth chart, and a remedy." `PROPOSED`

## 5. External Asset Sources

Use external assets only when owned/generated/product-rendered assets are insufficient. `PROPOSED`

| Source | Use | Licensing Note |
|---|---|---|
| Unsplash | Background texture/photo only if a specific, non-generic image is needed | Official license says images can be used for free for commercial and non-commercial purposes without permission, with restrictions on resale/compilation. Source: [Unsplash License](https://unsplash.com/license). `PROPOSED` |
| Pexels | Similar fallback for photos/video | Official license page says photos/videos are free to use and attribution is not required, though appreciated. Source: [Pexels License](https://www.pexels.com/license/). `PROPOSED` |
| Lucide | Icons, not imagery | Lucide is released under the ISC License. Source: [Lucide License](https://lucide.dev/license). `CURRENT` `PROPOSED` |

Even when attribution is not required, keep an internal asset register with creator/source URL/date/license. `PROPOSED`

## 6. What Not To Use

- Random stock portraits to imply real users. `PROPOSED`
- Spiritual/medical imagery that could imply treatment claims. `PROPOSED`
- Busy zodiac collages that compete with actual chart data. `PROPOSED`
- Text-heavy images that cannot be localized or read by screen readers. `PROPOSED`
- Dark blurred backgrounds behind important homepage copy. `PROPOSED`

## 7. Icon-Led Empty States

Use `lucide-react` icons for:
- no history: `History` or `Clock`.
- no questions: `ClipboardList`.
- chart unavailable: `MoonStar` plus warning badge.
- no remedy: `Sparkles` or `HeartHandshake` if available.
- admin import empty/error: `FileSpreadsheet`, `AlertTriangle`.

`CURRENT` `PROPOSED`

## 8. Performance Requirements

- Use Next.js image optimization for bitmap assets where appropriate. `PROPOSED`
- Provide responsive sizes and avoid shipping oversized hero images to mobile. `PROPOSED`
- Prefer SVG/vector for logos/icons and generated raster only for rich visuals. `PROPOSED`
- Lazy-load below-fold images. `PROPOSED`
- Reserve aspect ratios to avoid layout shift. `PROPOSED`

## 9. Accessibility Requirements

- Informative images need specific alt text. `PROPOSED`
- Decorative patterns should be hidden from assistive tech. `PROPOSED`
- Product previews must not be the only way to understand the product. `PROPOSED`
- Chart visuals need textual summaries. `PROPOSED`
- Avoid images with embedded text unless the text is duplicated in HTML. `PROPOSED`

## 10. Asset Register Template

For every asset:

| Field | Required |
|---|---|
| Asset name | Yes |
| File path | Yes |
| Source/creator | Yes |
| License | Yes |
| Date acquired/generated | Yes |
| Usage locations | Yes |
| Alt text/decorative status | Yes |
| Optimization sizes | Yes |

`PROPOSED`

## 11. Acceptance Criteria

- Public homepage has a real product visual or owned/generated visual brief, not generic stock. `PROPOSED`
- Favicon/OG/app icons are present before production polish. `PROPOSED`
- Every external asset has source/license documented. `PROPOSED`
- Assets do not fabricate social proof or legal/trust claims. `PROPOSED`
- Image performance and alt text are testable. `PROPOSED`
