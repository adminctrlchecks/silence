# Design Tokens

> Proposed token architecture that turns [09-color-system.md](09-color-system.md), [10-typography-system.md](10-typography-system.md), and [11-spacing-grid-layout.md](11-spacing-grid-layout.md) into implementable design-system primitives.

---

## 1. Current Token State

- Tailwind v4 `@theme inline` maps semantic CSS variables for background, foreground, card, muted, primary, secondary, accent, border, ring, and radius. `CURRENT`
- Dark mode overrides the same semantic variables through `.dark`. `CURRENT`
- `--roxy-*` variables map the product tokens into `@roxyapi/ui` chart components. `CURRENT`
- Typography, spacing, shadows, status colors, z-index, breakpoints, and motion are not documented as a unified token system. `CURRENT`

## 2. Token Principles

- Use semantic tokens in components, not raw palette values. `PROPOSED`
- Keep primitive values available for documentation and design tooling, but implementation should consume semantic/component tokens. `PROPOSED`
- Support light/dark mode through token values, not component forks. `PROPOSED`
- Support RTL through logical spacing/layout utilities, not separate CSS copies. `PROPOSED`
- Keep component tokens sparse; only create them where semantics reduce duplication. `PROPOSED`

## 3. Token Layers

| Layer | Example | Use |
|---|---|---|
| Primitive | `palette.teal.700 = #0F766E` | Raw brand color inventory. `PROPOSED` |
| Semantic | `color.action.primary.bg` | Application meaning across components. `PROPOSED` |
| Component | `button.primary.bg` | Component-specific override only when needed. `PROPOSED` |
| Mode | `dark.color.surface.default` | Dark-mode values mapped to same semantic names. `PROPOSED` |

## 4. Color Tokens

| Token | Light | Dark | Usage |
|---|---|---|---|
| `color.bg.canvas` | `#FAF8F1` | `#151720` | Page background. `PROPOSED` |
| `color.bg.app` | `#F3F6F4` | `#1C1F2A` | App/admin workspace. `PROPOSED` |
| `color.surface.default` | `#FFFFFF` | `#232735` | Cards/forms/tables. `PROPOSED` |
| `color.surface.subtle` | `#EEF3F0` | `#2B3040` | Muted panels. `PROPOSED` |
| `color.text.primary` | `#17201F` | `#F4F0E8` | Main text. `PROPOSED` |
| `color.text.secondary` | `#52615E` | `#C4CBC7` | Secondary text. `PROPOSED` |
| `color.border.default` | `#D7DEDA` | `#3A4050` | Borders. `PROPOSED` |
| `color.action.primary.bg` | `#0F766E` | `#5BC8BA` | Primary CTA/active nav. `PROPOSED` |
| `color.action.primary.fg` | `#FFFFFF` | `#111820` | Primary CTA text. `PROPOSED` |
| `color.focus.ring` | `#0F766E` | `#5BC8BA` | Focus rings. `PROPOSED` |
| `color.status.error.*` | see [09](09-color-system.md) | see [09](09-color-system.md) | Error/destructive state. `PROPOSED` |

## 5. Typography Tokens

| Token | Value |
|---|---|
| `font.family.ui` | Existing Inter/system stack. `CURRENT` `PROPOSED` |
| `font.family.multilingual` | UI stack plus Noto/script fallbacks. `PROPOSED` |
| `font.weight.regular` | 400. `PROPOSED` |
| `font.weight.medium` | 500. `PROPOSED` |
| `font.weight.semibold` | 600. `PROPOSED` |
| `font.weight.bold` | 700. `PROPOSED` |
| `font.size.body.md` | 16px. `PROPOSED` |
| `lineHeight.body.md` | 26px. `PROPOSED` |
| `font.size.caption` | 12px. `PROPOSED` |
| `letterSpacing.default` | 0 / normal. `CURRENT` `PROPOSED` |

Full scale is defined in [10-typography-system.md](10-typography-system.md). `PROPOSED`

## 6. Spacing And Layout Tokens

| Token | Value | Usage |
|---|---:|---|
| `space.1` through `space.24` | 4px-96px | Standard spacing scale. `PROPOSED` |
| `container.narrow` | 720px | Legal/support/auth content. `PROPOSED` |
| `container.reading` | 880px | Questions/remedy/history. `PROPOSED` |
| `container.app` | 1120px | Dashboard/profile. `CURRENT` `PROPOSED` |
| `container.wide` | 1280px | Chart/admin. `CURRENT` `PROPOSED` |
| `gutter.mobile` | 16px | Mobile page padding. `CURRENT` `PROPOSED` |
| `gutter.tablet` | 24px | Tablet page padding. `CURRENT` `PROPOSED` |
| `gutter.desktop` | 32px | Desktop page padding. `PROPOSED` |

## 7. Radius, Border, Shadow

| Token | Value |
|---|---|
| `radius.sm` | 6px. `PROPOSED` |
| `radius.md` | 8px, matching current `--radius`. `CURRENT` `PROPOSED` |
| `radius.lg` | 10px. `PROPOSED` |
| `border.width.default` | 1px. `CURRENT` `PROPOSED` |
| `shadow.sm` | current subtle card shadow. `CURRENT` `PROPOSED` |
| `shadow.md` | popovers/modals only. `PROPOSED` |

## 8. Breakpoints

Use Tailwind's defaults unless implementation proves a need to customize. `CURRENT` `PROPOSED`

| Token | Approx Width | Use |
|---|---:|---|
| `breakpoint.sm` | 640px | Large mobile/small tablet. `CURRENT` |
| `breakpoint.md` | 768px | Tablet/admin toolbar transitions. `CURRENT` |
| `breakpoint.lg` | 1024px | Desktop nav/sidebar. `CURRENT` |
| `breakpoint.xl` | 1280px | Wide admin/chart layouts. `CURRENT` |

## 9. Motion Tokens

| Token | Value | Usage |
|---|---:|---|
| `motion.duration.fast` | 120ms | Hover/focus feedback. `PROPOSED` |
| `motion.duration.base` | 180-200ms | Current roxy duration is 200ms. `CURRENT` `PROPOSED` |
| `motion.duration.slow` | 300ms | Sidebar/drawer transitions. Current admin shell uses 300ms. `CURRENT` `PROPOSED` |
| `motion.easing.standard` | ease-out | UI transitions. `PROPOSED` |
| `motion.easing.emphasized` | cubic-bezier-based | Drawers/modals if needed. `PROPOSED` |

Reduced motion: set duration to near-zero and disable non-essential transforms. `PROPOSED`

## 10. Z-Index Tokens

| Token | Value | Usage |
|---|---:|---|
| `z.header` | 30 | Current admin header uses `z-30`. `CURRENT` `PROPOSED` |
| `z.overlay` | 40 | Current admin mobile overlay uses `z-40`. `CURRENT` `PROPOSED` |
| `z.sidebar` | 50 | Current admin sidebar uses `z-50`. `CURRENT` `PROPOSED` |
| `z.modal` | 60 | Dialogs/modals. `PROPOSED` |
| `z.toast` | 70 | Toasts/notifications. `PROPOSED` |

## 11. Component Token Examples

| Component | Tokens |
|---|---|
| Button primary | `button.primary.bg`, `button.primary.fg`, `button.primary.hoverBg`, `button.radius`, `button.height.md`. `PROPOSED` |
| Input | `input.bg`, `input.border`, `input.focusRing`, `input.radius`, `input.height`. `PROPOSED` |
| Card | `card.bg`, `card.border`, `card.radius`, `card.shadow`, `card.padding`. `PROPOSED` |
| Alert | `alert.{status}.bg`, `alert.{status}.fg`, `alert.{status}.border`. `PROPOSED` |
| Nav item | `nav.item.bg.active`, `nav.item.fg.active`, `nav.item.height`. `PROPOSED` |

## 12. Implementation Requirements

- Token names should be documented next to the actual CSS variables when implemented. `PROPOSED`
- Avoid introducing a separate token library unless the app grows beyond Tailwind/CSS variable needs. `PROPOSED`
- Add status/destructive tokens before relying on classes such as `text-destructive`. `CURRENT` `PROPOSED`
- Keep token changes scoped to the design system phase, then migrate components gradually. `PROPOSED`
