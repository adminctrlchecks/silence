# Priority Matrix

> P0-P3 prioritization for the Silence product redesign.

---

## 1. Priority Definitions

- **P0 Critical:** Required for the product to feel complete, trustworthy, and usable. `PROPOSED`
- **P1 High:** Major quality improvements that materially improve conversion, usability, accessibility, or operations. `PROPOSED`
- **P2 Medium:** Important polish/scalability work that can follow the first redesign pass. `PROPOSED`
- **P3 Later:** Optional enhancements or business-model-dependent work. `PROPOSED`

## 2. P0 Critical

| Item | Categories | Why |
|---|---|---|
| Proper homepage replacing session-picker first impression | UX, UI, content, SEO, responsive | Current homepage does not explain product. `CURRENT` |
| Public navbar and footer with legal links | UX, IA, legal, accessibility | Users need navigation and trust surfaces before signup. `PROPOSED` |
| Terms and Privacy routes/structure | legal, content, trust | Product collects birth/contact/response data. `CURRENT` |
| Registration restructuring with birth-data explanation | UX, content, legal, accessibility | Current form is long and under-explained. `CURRENT` |
| Dashboard journey-first redesign | UX, UI, architecture | Current dashboard has data but weak hierarchy. `CURRENT` |
| Loading/empty/error/success state system | UX, accessibility, technical | Current states are inconsistent/generic. `CURRENT` |
| Design tokens for color/type/spacing/status | UI, accessibility, technical | Current tokens lack full status/destructive system. `CURRENT` |
| Mobile navigation and responsive hardening | responsive, accessibility | Current user nav lacks mobile menu/bottom nav. `CURRENT` |
| No fabricated claims/social proof/legal copy | content, legal, trust | Required by task and product safety. `PROPOSED` |

## 3. P1 High

| Item | Categories | Why |
|---|---|---|
| Chart page beginner summary + technical details | UX, content, accessibility | Current chart is dense without enough education. `CURRENT` |
| Remedy structured practice card | UX, content, trust | Current remedy is mostly a paragraph. `CURRENT` |
| Profile split into overview/birth/security/privacy | UX, legal, security | Current profile mixes unrelated concerns. `CURRENT` |
| Admin pagination and confirmation dialogs | UX, accessibility, technical | Current `limit=100` and `window.confirm()` gaps affect operations. `CURRENT` |
| i18n QA and RTL screenshot pass | i18n, accessibility, responsive | 11 locales/Arabic are core product requirements. `DOCUMENTED` |
| SEO metadata, sitemap, robots, OG image | SEO, assets, performance | Current SEO is global/minimal. `CURRENT` |
| Asset basics: logo, favicon, OG, hero visual | UI, assets, brand | Current product has no brand assets. `CURRENT` |
| Admin dashboard urgency hierarchy | UX, admin operations | Current dashboard needs stronger prioritization. `CURRENT` |

## 4. P2 Medium

| Item | Categories | Why |
|---|---|---|
| How-it-works standalone page | content, SEO, UX | Can start as homepage section first. `PROPOSED` |
| Support/contact page | support, trust | Requires support ownership decision. `NEEDS DECISION` |
| User history timeline and pagination | UX, technical | Current history works but is plain and limited. `CURRENT` |
| Toast and dialog system refinement | UI, accessibility | Needed after core primitives. `PROPOSED` |
| Admin mobile filter/search sheets | responsive, admin UX | Important for mobile admin usability. `PROPOSED` |
| Translation review status model | i18n, admin, content | Improves quality beyond current translation rows. `PROPOSED` |
| Accessibility statement | accessibility, legal | Publish only after testing commitment. `NEEDS DECISION` |

## 5. P3 Later

| Item | Categories | Why |
|---|---|---|
| Pricing/billing | business, UX, technical | Business model not defined. `NEEDS DECISION` |
| Social/compatibility features | product, technical | Not in current Silence scope. `CURRENT` |
| Notifications/reminders | product, technical | No notification system exists. `CURRENT` |
| AI chat/deeper conversational readings | AI, legal, product | Requires product/legal/security decision. `NEEDS DECISION` |
| Native mobile app | product, architecture | Documented Phase 2 later. `DOCUMENTED` |
| Multi-tenant SaaS/team roles | business, architecture | Business model dependent. `NEEDS DECISION` |

## 6. Dependency Notes

- Tokens/components should precede page implementation. `PROPOSED`
- Legal routes can ship with placeholder reviewed-by-legal-needed structure only in internal environments; production needs approved copy. `NEEDS DECISION`
- Homepage depends on brand/asset direction but can use generated/product preview temporarily. `PROPOSED`
- Admin pagination and confirmation dialogs can be implemented independently of public redesign. `PROPOSED`
- OAuth should not appear until backend/frontend flow is implemented. `CURRENT` gap `PROPOSED`

## 7. Acceptance Criteria

- P0 items are complete before calling the redesign production-ready. `PROPOSED`
- P1 items are included in the first polish/hardening pass. `PROPOSED`
- P2/P3 items are not allowed to block critical trust/navigation/accessibility work. `PROPOSED`
- Business/legal-dependent work remains marked `NEEDS DECISION`. `PROPOSED`
