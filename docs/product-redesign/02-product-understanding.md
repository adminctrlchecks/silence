# Product Understanding

> What Silence actually is, who it's for, and how the domain works.

---

## 1. Product Definition `DOCUMENTED`

Silence is a **multilingual astrology question-and-answer knowledge application**. It is NOT a horoscope generator, social app, or marketplace. It is a **guided personal reading platform** where:

- An **Admin** (the astrologer/content creator) builds structured content: questions at three depth levels, answers (manual or AI-generated), astrology chart configurations, and remedies
- A **User** (the seeker) creates a profile with birth details, answers the questions through three progressive layers, receives a personalized astrology chart computed from their birth data, and gets a remedy matched to their chart and answers

The investor's stated intent (per REQUIREMENTS.md, 13 Aug 2026): build the **interface/structure** first, then populate it with content. The content itself is small for now.

## 2. Domain Model `DOCUMENTED` `CURRENT`

### The Five Content Layers

```
Layer 1: Common Questions     ← Admin creates, everyone answers
Layer 2: Level 1 Answers      ← Admin writes or AI generates; responses to common questions
Layer 3: Level 2 Answers      ← Deeper follow-up answers building on Level 1
Layer 4: Chart                ← Computed from birth details + Level 2 data (Swiss Ephemeris)
Layer 5: Remedy               ← Admin-created, matched by rules to chart/responses/category
```

### Categories
Everything is organized by three categories: **Male, Female, Other**. These are not just user demographics — they determine which questions are shown, which answers are returned, which remedies are offered. The entire content pipeline is category-segmented.

### Languages
11 languages at launch, with Arabic RTL:

| Language | Code | RTL | Global speakers |
|----------|------|-----|-----------------|
| English | en | No | ~1.5B |
| Chinese (Simplified) | zh | No | ~1.1B |
| Hindi | hi | No | ~600M |
| Spanish | es | No | ~560M |
| Arabic | ar | **Yes** | ~420M |
| French | fr | No | ~310M |
| Bengali | bn | No | ~270M |
| Portuguese | pt | No | ~260M |
| Russian | ru | No | ~255M |
| Japanese | ja | No | ~125M |
| Telugu | te | No | ~95M |

### AI Integration
- **Gemini (gemini-2.5-flash)** is the AI backbone
- Used for: generating answers when Admin hasn't written one, translating content across languages, writing chart interpretation text
- AI-generated answers are marked `source: "ai"` and `reviewed: false` — they stay in the review queue until an Admin approves them
- The AI is a **fallback**, not the primary content source. The Admin is the source of truth

### Astrology Engine
- **Swiss Ephemeris** (via `sweph` npm package, Moshier mode — no external data files needed)
- Computes: 9 Vedic grahas (Sun through Ketu), Placidus house system, ascendant
- Birth time is converted from local time using stored timezone
- Chart accuracy depends on having exact coordinates + timezone (three tiers: exact, approximate, uncertain)

## 3. User Types `DOCUMENTED` `CURRENT`

### User (Seeker)
- **Registration data:** Name, category (male/female/other), date of birth, time of birth, place of birth (city + country + lat/lng/timezone), contact (email or phone), preferred language, consent
- **Primary goal:** Receive a personalized astrology reading
- **Journey:** Pick language/category → Register → Answer questions (3 layers) → View chart → View remedy → Review history
- **Technical:** JWT user token in httpOnly cookie, separate from admin auth

### Admin (Content Operator)
- **Role:** Build and manage all content, review AI-generated content, monitor users and product health
- **Capabilities:** Question/answer/remedy CRUD, AI generation trigger, Excel bulk import, translation management, chart config, user inspection, admin-as-user impersonation, audit log review
- **Technical:** JWT admin token in separate httpOnly cookie, can create user sessions for impersonation

## 4. Business Rules `DOCUMENTED` `CURRENT`

### Reading Session Lifecycle
```
draft → in_progress → chart_ready → remedy_ready → complete
```
- A user can have only one non-complete session at a time (idempotent creation)
- Responses advance the session from `draft` to `in_progress`
- Requesting a chart advances to `chart_ready`
- Requesting a remedy advances to `remedy_ready` then `complete`
- Completed sessions are immutable — chart and remedy are snapshotted

### Remedy Selection (Rule Engine)
Remedies can declare filter rules:
- `planetFilter` — planet must be present in the session chart
- `signFilter` — sign must be on ascendant or any placement
- `houseFilter` — house must be occupied
- `keywordFilter` — keyword found in response text
- `linkedTo` — linked question must be answered in the session

Selection priority: most matched filters wins → higher priority → most recently updated → category fallback (no filters = always eligible)

### Content Translation
- Admin enters content in one language (typically English)
- Auto-translate triggers Gemini to generate translations for target languages
- Translations are stored as separate rows (not JSON blobs) for queryability
- Each entity (question, answer, remedy) has a dedicated translation table

## 5. What the Product Is NOT `ASSUMPTION`

Based on current documentation and implementation:

- **Not a social platform** — No user-to-user interaction, no sharing, no community
- **Not a marketplace** — No multiple astrologers, no booking, no payments (yet)
- **Not a content platform** — No articles, blog, educational content (beyond the reading itself)
- **Not a notification service** — No push notifications, no daily horoscopes, no alerts

## 6. Business Model `NEEDS DECISION`

The business model is **not defined** in the current documentation. Per the gap analysis (WORLD_CLASS_PRODUCT_GAP_ANALYSIS.md), options include:

1. **Direct-to-user subscription** — Free readings, paid premium chart/remedy access
2. **Consultation funnel** — Lead generation for live astrologer consultations
3. **Admin-operated internal tool** — Astrologer uses it with their own clients
4. **Multi-tenant SaaS** — Multiple astrology practices, each with their own content

**Current recommendation `PROPOSED`:** Start as a free product with optional future monetization. Focus on the reading experience quality before adding commerce. The first implementation should support the "Admin-operated consultation tool" model since that's closest to how the investor described usage.

## 7. Contradictions Between Documentation and Implementation

| Area | Documentation says | Implementation does | Resolution |
|------|-------------------|---------------------|------------|
| Chart type | API.md shows `"type": "bar"` in example response | Actually returns `"type": "astrology"` | Implementation is correct; API.md example is outdated |
| Session model | Gap analysis lists it as "not implemented" | ReadingSession model exists and works | Gap analysis was written before Phases 1-5 of the gap plan were implemented |
| Password reset | Gap analysis lists as missing | Password reset flow exists with email delivery | Same as above — implemented after the gap analysis was written |
| Admin audit log | Gap analysis lists as missing | AdminAuditLog model exists and records events | Same — implemented in later phases |

**Conclusion:** The gap analysis (WORLD_CLASS_PRODUCT_GAP_ANALYSIS.md) was the correct document at the time of writing but is partially outdated. Phases 1-7 of its recommended plan have been implemented. The UI/UX gaps it identified remain valid.
