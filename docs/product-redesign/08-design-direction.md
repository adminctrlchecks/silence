# Design Direction

> Brand and visual experience direction for Silence. This is not a visual redesign implementation; it defines the target product character for later UI work.

---

## 1. Current Brand State

- The product name is `Silence`. `CURRENT`
- The public homepage currently presents "Silence" as the main heading with an "Astrology Q&A" eyebrow. `CURRENT`
- The admin sidebar uses a simple square mark with the letter `S`. `CURRENT`
- No dedicated logo, favicon, app icon, Open Graph image, illustration system, or photography system exists in the repository. `CURRENT`
- Current visual language is mostly cards, borders, semantic CSS variables, Inter/system font, `lucide-react` icons, and muted teal/warm accents. `CURRENT`

## 2. Product Personality

| Attribute | Direction | Why |
|---|---|---|
| Calm | `PROPOSED` | Users are sharing personal reflections and birth details; the product should reduce anxiety. |
| Trustworthy | `PROPOSED` | Silence collects contact, DOB, birth time/place, responses, chart, and remedy data. |
| Reflective | `PROPOSED` | The core workflow is a guided Q&A, not a fast transaction. |
| International | `DOCUMENTED` | The product supports 11 starting languages including Arabic RTL. |
| Knowledgeable | `PROPOSED` | Astrology chart output needs to feel credible and explainable, not mystical without structure. |
| Warm | `PROPOSED` | Remedies should feel personal and humane rather than clinical or mechanical. |

## 3. Visual Personality

Silence should feel like a modern consultation platform with celestial cues, not a fantasy-themed astrology site. `PROPOSED`

Use:
- restrained night-sky/celestial references
- clean SaaS-like layout discipline
- warm accent moments for guidance/remedy
- spacious reading surfaces
- precise technical displays for chart data

Avoid:
- excessive gradients, glassmorphism, or glowing decorative blobs
- horoscope-magazine tropes
- fake testimonials, fake certifications, or invented astrologer authority
- stock photos of generic meditation scenes
- UI that hides uncertainty around chart accuracy or AI-generated interpretation

## 4. Target Experience By Area

| Area | Target Feel | Status |
|---|---|---|
| Homepage | Clear, trustworthy, explanatory, visually memorable enough to make a first-time visitor understand the offer. | `PROPOSED` |
| Auth | Calm onboarding, privacy-aware, step-by-step for registration. | `PROPOSED` |
| Dashboard | A guided reading workspace, not a link grid. | `PROPOSED` |
| Questions | Reflective, paced, safe for longer text input. | `PROPOSED` |
| Chart | Educational and inspectable: summary first, chart/table details second. | `PROPOSED` |
| Remedy | Personal practice/prescription with clear "what to do" and "why this was selected." | `PROPOSED` |
| History | A readable timeline of past readings. | `PROPOSED` |
| Admin | Quiet, dense, operational command center. | `PROPOSED` |

## 5. Brand Mark Direction

Current `S` square should be treated as a placeholder. `CURRENT` `PROPOSED`

Recommended mark brief:
- simple geometric `S` or silence/moon/star abstraction
- works at favicon size
- monochrome-capable
- not dependent on gradients
- compatible with both Latin and non-Latin locales
- paired with a wordmark using the same product name across locales unless the business decides to localize the brand

`NEEDS DECISION`: final logo/wordmark ownership, copyright, and whether the brand name remains untranslated globally.

## 6. Imagery Direction

Use imagery only where it improves comprehension or trust. `PROPOSED`

| Placement | Direction |
|---|---|
| Homepage hero | Product preview or generated celestial/astrology interface scene; not generic stock. |
| How it works | Simple sequence visuals: questions -> chart -> remedy. |
| Chart page | Functional chart visuals from the actual chart component, not decorative zodiac art. |
| Empty states | Lightweight line illustrations or icon-led states, consistent with `lucide-react`. |
| Legal/auth | No heavy imagery; prioritize readability and trust copy. |

## 7. UI Density Direction

- Public pages: editorial but disciplined, with full-width sections and strong hierarchy. `PROPOSED`
- User app: medium density; enough whitespace for reflection, but not oversized marketing cards. `PROPOSED`
- Admin: higher density; tables, filters, metrics, review queues, and operational warnings should be easy to scan. `PROPOSED`

## 8. Emotional Arc

| Journey Stage | Visual/Interaction Goal | Status |
|---|---|---|
| Landing | Curiosity and clarity | `PROPOSED` |
| Registration | Trust and permission | `PROPOSED` |
| Questions | Reflection and momentum | `PROPOSED` |
| Chart | Insight and orientation | `PROPOSED` |
| Remedy | Actionability and care | `PROPOSED` |
| Return | Continuity and memory | `PROPOSED` |

## 9. Design Risks

| Risk | Mitigation |
|---|---|
| Looking too mystical to trust | Use systematic layout, precise data labels, and legal/privacy visibility. `PROPOSED` |
| Looking too clinical for astrology | Use warm accents, gentle copy, and meaningful celestial imagery. `PROPOSED` |
| Overloading mobile users | Use progressive disclosure, bottom nav, and step-based forms. `PROPOSED` |
| Creating unsupported claims | Mark testimonials, certifications, legal claims, and accuracy statements as unavailable unless sourced. `PROPOSED` |

## 10. Success Criteria

- A new visitor can understand what Silence does without registering. `PROPOSED`
- A user understands why birth details are requested before submitting them. `PROPOSED`
- The chart page distinguishes computed facts, AI interpretation, and user guidance. `PROPOSED`
- Admin can scan operational issues without decorative distractions. `PROPOSED`
- The visual system works for Arabic RTL and longer translated strings. `PROPOSED`
