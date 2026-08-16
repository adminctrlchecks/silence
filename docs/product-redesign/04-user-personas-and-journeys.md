# User Personas & Journeys

> Who uses Silence, and how they move through it today vs. how they should.

---

## 1. Personas `ASSUMPTION`

No real user research exists yet (per `docs/analasis.txt` instructions: do not invent product information). These are working personas inferred from the domain model and the investor's stated intent — not validated research. They should be replaced with real personas once user interviews or analytics exist.

### Persona A — "The Seeker" (primary user)
- **Who:** An individual curious about what astrology says about their life circumstances (career, relationships, wellbeing)
- **Motivation:** Wants personalized guidance, not generic horoscope content
- **Tech comfort:** Varies widely — the product supports 11 languages specifically to reach non-English-first audiences
- **Device:** Likely mobile-first given global, multilingual reach
- **Trust bar:** Must feel safe sharing birth date/time/place — sensitive personal data
- **Success:** Completes all three question layers, understands their chart, receives a remedy that feels relevant

### Persona B — "The Content Operator" (admin)
- **Who:** The astrologer or content team member who populates and maintains questions/answers/remedies
- **Motivation:** Efficiently manage content across categories, levels, and 11 languages without manual translation work for every entry
- **Tech comfort:** Comfortable with structured admin panels and bulk operations (Excel import)
- **Success:** Can review AI-generated content quickly, spot missing translations, monitor user activity, keep content current

### Persona C — "The Returning User"
- **Who:** A user who completed one reading and comes back
- **Motivation:** Track their reading history, start a new reading (life changes), review past remedies
- **Success:** Easily finds history, understands they can start fresh, sees value in returning

---

## 2. Current Journey Map — Seeker (as-built) `CURRENT`

```
Land on "/" → See language grid + category grid → Pick language → Pick category
   → Click "Create profile" → /register (long form: name, DOB, time, place, contact, password, consent)
   → Submit → Redirect to /app
   → See dashboard: profile completeness bar, "Start reading" CTA
   → Click CTA → /app/questions
   → Answer Common questions → Save → See approved answers inline
   → Answer Level 1 questions → Save
   → Answer Level 2 questions → Save
   → Click "View chart" → /app/chart
   → See Vedic Kundli diagram + planet table + Gemini interpretation text
   → Navigate to /app/remedy
   → See remedy title/text/why-this-practice
   → Session marked complete
   → Can visit /history to see past sessions
```

**Friction points identified:**
1. Landing page requires 2 clicks (language, category) before the user even knows what the product is
2. Registration form has 9+ visible fields with no explanation of why birth time/place matter for astrology
3. No onboarding after registration — dropped straight into a dashboard
4. Question flow has no framing — user doesn't know how many total questions exist across all 3 levels until they're in it
5. Chart page assumes astrology literacy — no glossary or "what is an ascendant" help
6. No moment of delight/celebration when the reading completes
7. No email confirmation or receipt of the completed reading

## 3. Proposed Journey Map — Seeker `PROPOSED`

```
Land on "/" → See homepage: hero explaining the product, sample chart preview,
   how-it-works (3 steps), trust signals → Click "Start your reading"
   → Language + category picker (as a lightweight modal/step, not the whole page)
   → /register → Progressive form: Step 1 (name/category/language) →
     Step 2 (birth details, with inline "why we ask" tooltip) →
     Step 3 (contact/password/consent)
   → Submit → Brief onboarding screen: "Here's what happens next" (3-step preview)
   → /app dashboard: Personalized greeting, visual journey tracker (not just cards)
   → /app/questions: Framed intro ("12 questions, ~5 minutes"), progress bar across all layers
   → /app/chart: Chart + plain-language summary above the technical data,
     expandable glossary for astrology terms
   → /app/remedy: Presented as a "personal practice" card with structure
     (what to do, why, how often) instead of a paragraph
   → Completion moment: confirmation + optional share/save
   → /history: Visual timeline of readings, not just a list
```

## 4. Current Journey Map — Admin (as-built) `CURRENT`

```
/admin/login → /admin dashboard (metrics + module grid)
   → /admin/questions: create/edit questions per level+category
   → /admin/answers: write or AI-generate answers, review AI queue
   → /admin/remedies: create remedies with rule filters
   → /admin/languages: add languages, trigger auto-translate
   → /admin/import: bulk upload via Excel
   → /admin/users: inspect user profiles and reading sessions
   → /admin/audit-log: review sensitive action history
```

**Friction points identified:**
1. Admin UI is entirely untranslated (English-only), which is inconsistent with the product's 11-language promise for the team operating it
2. Dashboard metrics are plain numbers — no trend lines, no visual prioritization of what needs attention
3. No pagination on questions/answers/remedies admin lists beyond a 100-item fetch limit — content silently truncates past that
4. Delete actions use unstyled `window.confirm()` dialogs
5. No global search connecting the admin sections (search exists in the header, but scoped)

## 5. Proposed Journey Map — Admin `PROPOSED`
Largely keep the existing information architecture (it is functionally comprehensive) but:
- Add proper pagination everywhere
- Replace `window.confirm()` with a proper confirmation dialog component
- Add visual data intelligence to the dashboard (sparklines, completion donuts per language/category)
- Defer full admin i18n unless the team operating it is genuinely multilingual — flagged as `NEEDS DECISION`

---

## 6. Emotional Arc `PROPOSED`

| Stage | Current feeling | Target feeling |
|-------|-----------------|-----------------|
| Landing | Confused ("what is this?") | Curious, informed |
| Registration | Burdened (long form) | Trusting, guided |
| Questions | Surveyed | Reflective, engaged |
| Chart | Overwhelmed by data | Fascinated, understood |
| Remedy | Reading a paragraph | Receiving a gift |
| Return visit | Neutral | Anticipatory |
