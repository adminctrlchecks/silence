# Typography System

> Typography recommendation for public, user, admin, and multilingual surfaces.

---

## 1. Current Typography State

- Global `body` declares `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. `CURRENT`
- No local font files, `next/font`, Google Fonts import, or dedicated multilingual font loading strategy exists in the inspected frontend. `CURRENT`
- Current UI uses mostly `text-sm`, `text-base`, `text-xl`, `text-3xl`, `text-4xl`, and `sm:text-5xl` Tailwind utilities. `CURRENT`
- Letter spacing is generally `tracking-normal`, which aligns with the requirement to avoid negative letter spacing. `CURRENT`
- Admin/user copy uses English message keys and translated user-side catalogs; admin visible strings are mostly hard-coded English. `CURRENT`

## 2. Typography Goals

- High readability for long reflective answers and remedy text. `PROPOSED`
- Strong hierarchy on public pages without oversized marketing typography inside app panels. `PROPOSED`
- Reliable rendering across English, Chinese, Hindi, Spanish, Arabic, French, Bengali, Portuguese, Russian, Japanese, and Telugu. `DOCUMENTED` `PROPOSED`
- Good performance through system fonts or carefully scoped local/variable fonts. `PROPOSED`

## 3. Font Stack

### Primary UI Stack

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Keep this as the default UI stack. `CURRENT` `PROPOSED`

### Multilingual Fallback Stack

Add script-appropriate fallbacks after the primary UI stack. `PROPOSED`

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  "Noto Sans",
  "Noto Sans Arabic",
  "Noto Sans Devanagari",
  "Noto Sans Bengali",
  "Noto Sans Telugu",
  "Noto Sans JP",
  "Noto Sans SC",
  sans-serif;
```

`NEEDS DECISION`: whether to ship local Noto subsets or rely on OS-level script fonts. Recommended default: use system fonts for Phase 1 implementation, then add local subsets only if screenshots show poor rendering.

### Display Font

Do not add a decorative display font in the first redesign pass. `PROPOSED`

Reason: Silence must work across 11 languages; a Latin-only display face would create inconsistent brand expression and add performance cost. Use weight, size, spacing, and layout for display hierarchy first. `PROPOSED`

## 4. Type Scale

| Token | Size | Line Height | Weight | Usage |
|---|---:|---:|---:|---|
| `text.display.lg` | 56px | 64px | 650-700 | Homepage desktop hero only. `PROPOSED` |
| `text.display.md` | 44px | 52px | 650-700 | Public page hero/tablet. `PROPOSED` |
| `text.heading.h1` | 36px | 44px | 650 | App/page primary headings. `PROPOSED` |
| `text.heading.h2` | 28px | 36px | 650 | Section headings. `PROPOSED` |
| `text.heading.h3` | 22px | 30px | 600 | Cards, subsections. `PROPOSED` |
| `text.heading.h4` | 18px | 26px | 600 | Dense panels/admin card headings. `PROPOSED` |
| `text.body.lg` | 18px | 30px | 400 | Homepage support copy, long explanations. `PROPOSED` |
| `text.body.md` | 16px | 26px | 400 | Main reading/remedy text. `PROPOSED` |
| `text.body.sm` | 14px | 22px | 400 | UI body, tables, metadata. `PROPOSED` |
| `text.label.md` | 14px | 20px | 500-600 | Form labels, nav labels. `PROPOSED` |
| `text.caption` | 12px | 18px | 400-500 | Helper text, badges, timestamps. `PROPOSED` |
| `text.button` | 14px | 20px | 600 | Buttons. `PROPOSED` |

## 5. Responsive Typography

- Do not scale font size with viewport width. Use fixed breakpoints. `PROPOSED`
- Mobile hero max: 40px/48px; desktop hero max: 56px/64px. `PROPOSED`
- App/dashboard headings should not exceed 32-36px on desktop. `PROPOSED`
- Admin headings should stay compact: 16-24px depending on page depth. `PROPOSED`
- Long translated labels should wrap rather than shrink below 12px. `PROPOSED`

## 6. Content-Specific Rules

| Surface | Rule |
|---|---|
| Questions | Question text uses `body.md` or `label.md`; user textarea content uses 16px minimum on mobile to avoid zoom issues. `PROPOSED` |
| Answers/guidance | Use 15-16px with 1.6 line-height; preserve `dir="auto"` for mixed-language content. Current question flow already uses `dir="auto"` in several content blocks. `CURRENT` `PROPOSED` |
| Chart tables | Use compact 13-14px table text with clear headers and row spacing. `PROPOSED` |
| Remedy | Use readable 16px/28px body, with practice steps broken into scannable sections. `PROPOSED` |
| Legal pages | Use 16px/28px body, 20-28px section headings, max-width 760-840px. `PROPOSED` |
| Admin tables | Use 13-14px body; never use hero-scale headings inside cards. `PROPOSED` |

## 7. Internationalization Requirements

- Use `dir="auto"` for user-generated answers, admin-authored translated content, Gemini interpretation, and remedy text. `CURRENT` `PROPOSED`
- Avoid uppercase transformations for translated strings except short English admin labels; uppercase can harm scripts without case. `PROPOSED`
- Allow 30-50% text expansion in buttons, nav, and cards. `PROPOSED`
- Arabic RTL must keep numerals, dates, and mixed English terms readable. `PROPOSED`
- Do not use letter spacing for Arabic, Devanagari, Bengali, Telugu, Chinese, or Japanese text. `PROPOSED`

## 8. Accessibility Requirements

- Body text minimum 16px for long-form reading surfaces. `PROPOSED`
- Small captions at 12px should not carry critical information alone. `PROPOSED`
- Text must remain readable at 200% zoom without clipping. `PROPOSED`
- Form labels must remain visible; placeholders are not labels. Current `Label` component is used in auth/profile fields. `CURRENT`
- Line length: 60-80 characters for long prose; narrower for legal/support copy on mobile. `PROPOSED`

## 9. Implementation Notes

- Define typography tokens in CSS variables or a Tailwind-compatible theme layer rather than repeating raw class stacks. `PROPOSED`
- Keep `tracking-normal`; use weight/size for hierarchy. `CURRENT` `PROPOSED`
- If `next/font` is introduced, use local or self-hosted fonts and avoid blocking multilingual fallback rendering. `PROPOSED`
