# Color System

> Proposed accessible color system for Silence, grounded in the current Tailwind v4 CSS variables in `apps/web/src/app/globals.css`.

---

## 1. Current Color State

| Token | Current Value | Notes |
|---|---|---|
| `--background` | light `oklch(0.985 0.008 95)`, dark `oklch(0.16 0.016 250)` | Warm near-white and deep dark surface. `CURRENT` |
| `--foreground` | light `oklch(0.2 0.018 260)`, dark `oklch(0.94 0.012 95)` | High contrast body text. `CURRENT` |
| `--card` | light white, dark dark surface | Used across most UI cards. `CURRENT` |
| `--primary` | light teal, dark brighter teal | Main CTA/focus brand color. `CURRENT` |
| `--secondary` | warm beige/brown | Used for subtle highlight surfaces. `CURRENT` |
| `--accent` | warm coral/orange | Used sparingly. `CURRENT` |
| `--border`, `--ring`, `--muted` | semantic support tokens | Present and used broadly. `CURRENT` |
| `--roxy-*` | mapped to Silence tokens | Used to theme `@roxyapi/ui`. `CURRENT` |
| `destructive` utility classes | referenced in components but not defined in `@theme inline` | Add explicit error/destructive tokens. `CURRENT` `PROPOSED` |

## 2. Color Strategy

Silence should use a calm neutral base, teal/jade for trust/action, amber for guidance/remedy warmth, and restrained plum/coral for emphasis. `PROPOSED`

This avoids a one-note dark-blue astrology palette while still supporting celestial product cues. `PROPOSED`

## 3. Proposed Core Palette

| Semantic Token | HEX | RGB | Usage | Contrast Notes |
|---|---|---|---|---|
| `color.bg.canvas` | `#FAF8F1` | 250,248,241 | Public/user page background | Warm enough for brand, still neutral. `PROPOSED` |
| `color.bg.app` | `#F3F6F4` | 243,246,244 | App/admin muted background | Differentiates app workspace from marketing canvas. `PROPOSED` |
| `color.surface.default` | `#FFFFFF` | 255,255,255 | Cards, forms, tables | Use with `#17201F` text for AA. `PROPOSED` |
| `color.surface.subtle` | `#EEF3F0` | 238,243,240 | Secondary panels, empty states | Avoid for long text unless contrast checked. `PROPOSED` |
| `color.surface.elevated` | `#FFFFFF` | 255,255,255 | Modals, popovers | Pair with shadow/border, not only color. `PROPOSED` |
| `color.text.primary` | `#17201F` | 23,32,31 | Primary body/headings | High contrast on light surfaces. `PROPOSED` |
| `color.text.secondary` | `#52615E` | 82,97,94 | Supporting copy | AA for normal text on white/near-white should be verified in implementation. `PROPOSED` |
| `color.text.muted` | `#6E7A77` | 110,122,119 | Captions/meta | Use 12-14px only with sufficient contrast. `PROPOSED` |
| `color.border.default` | `#D7DEDA` | 215,222,218 | Borders/dividers | Use stronger border on tables/forms. `PROPOSED` |
| `color.brand.primary` | `#0F766E` | 15,118,110 | Primary buttons, active nav, links | White text passes AA for normal text. `PROPOSED` |
| `color.brand.primaryHover` | `#0A5F59` | 10,95,89 | Hover/pressed primary | Stronger contrast. `PROPOSED` |
| `color.brand.secondary` | `#F1B84B` | 241,184,75 | Remedy/guidance highlight | Use dark text, not white. `PROPOSED` |
| `color.brand.accent` | `#B65C4A` | 182,92,74 | Special emphasis/illustration accents | Avoid as large text color on light without checking. `PROPOSED` |
| `color.brand.deep` | `#20233A` | 32,35,58 | Celestial hero/nav contrast areas | Do not dominate whole app. `PROPOSED` |

## 4. Proposed Status Palette

| Token | HEX | Usage | Notes |
|---|---|---|---|
| `color.success.bg` | `#E8F7EE` | Success alert background | `PROPOSED` |
| `color.success.fg` | `#176B3A` | Success text/icon | `PROPOSED` |
| `color.warning.bg` | `#FFF4D6` | Warning/caution background | `PROPOSED` |
| `color.warning.fg` | `#7A4E00` | Warning text/icon | `PROPOSED` |
| `color.error.bg` | `#FDECEC` | Error/destructive background | `PROPOSED` |
| `color.error.fg` | `#A83232` | Error/destructive text/icon | Defines missing destructive semantics. `PROPOSED` |
| `color.info.bg` | `#EAF3FF` | Informational panels | `PROPOSED` |
| `color.info.fg` | `#1F5E99` | Informational text/icon | `PROPOSED` |
| `color.disabled.bg` | `#E5E9E7` | Disabled controls | `PROPOSED` |
| `color.disabled.fg` | `#8A9692` | Disabled labels/icons | Use opacity and cursor styles together. `PROPOSED` |

## 5. Dark Mode Palette

| Token | HEX | Usage |
|---|---|---|
| `color.bg.canvas.dark` | `#151720` | Page background. `PROPOSED` |
| `color.bg.app.dark` | `#1C1F2A` | App/admin background. `PROPOSED` |
| `color.surface.default.dark` | `#232735` | Cards/forms. `PROPOSED` |
| `color.surface.subtle.dark` | `#2B3040` | Muted panels. `PROPOSED` |
| `color.text.primary.dark` | `#F4F0E8` | Primary text. `PROPOSED` |
| `color.text.secondary.dark` | `#C4CBC7` | Supporting text. `PROPOSED` |
| `color.border.default.dark` | `#3A4050` | Borders. `PROPOSED` |
| `color.brand.primary.dark` | `#5BC8BA` | Primary buttons/links. `PROPOSED` |
| `color.brand.secondary.dark` | `#F4C86A` | Warm guidance accents. `PROPOSED` |
| `color.error.fg.dark` | `#FF9D9D` | Error text/icon. `PROPOSED` |

Dark mode should be practical and readable, not a permanently dark-blue product. `PROPOSED`

## 6. Component Usage Rules

- Primary CTA: `brand.primary` background with white or deep text depending on mode. `PROPOSED`
- Secondary CTA: border/default surface; avoid low-contrast beige text buttons. `PROPOSED`
- Remedy highlights: amber secondary surface with dark text. `PROPOSED`
- Chart accuracy: success/warning/error tokens depending on exact/approximate/uncertain state. `PROPOSED`
- Admin alerts: status tokens plus icons and text, never color alone. `PROPOSED`
- Links: primary foreground, underline on hover/focus in body copy. `PROPOSED`

## 7. Accessibility Requirements

- Target WCAG 2.2 AA for all text and interactive states. `PROPOSED`
- Verify exact contrast ratios during implementation with the final Tailwind variable values. `PROPOSED`
- Do not use amber/orange as small text on white without checking contrast. `PROPOSED`
- Focus ring must be visible on both light and dark backgrounds and not rely on box-shadow color alone. `PROPOSED`
- Error states must combine icon, text, and `role="alert"` where appropriate. Current components already use `role="alert"` in several forms. `CURRENT`

## 8. Migration Notes

- Keep semantic CSS variables rather than hard-coding colors in components. `PROPOSED`
- Add explicit Tailwind tokens for `destructive/error`, `success`, `warning`, and `info`. `PROPOSED`
- Map `--roxy-*` variables to the same semantic tokens so astrology widgets match the product. `CURRENT` `PROPOSED`
- Run a CSS class audit for `text-destructive`/`bg-destructive` after defining the missing tokens. `PROPOSED`
