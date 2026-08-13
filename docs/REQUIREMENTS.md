# Requirements Understanding

> This document records how the requirements shared by the investor (WhatsApp,
> 13 Aug 2026) have been interpreted. It is written so the investor can read it,
> confirm what is correct, and mark what needs to change. Nothing here is final —
> it is a shared understanding to build on.

## 1. What the application is

A **question-and-answer knowledge application** with an **Admin side** and a
**User side**.

- The **Admin** builds up the content: the questions, the answers at each level,
  the charts, and the remedies.
- The **User** comes in, interacts with the questions, receives answers, sees a
  chart, and gets the remedy. Their data is saved.
- The app is **multi-lingual**.
- At **every level**, content is separated into three **categories**:
  **Male, Female, Other**.

The investor's note is that the *content itself is small for now* — the goal at
this stage is to build the **interface / structure**, which the investor will
then populate and update.

## 2. The five content layers (built by Admin)

| # | Layer | Who fills it | Notes |
|---|-------|--------------|-------|
| 1 | **Common Questions** | Admin | The base set of questions everyone answers. |
| 2 | **Level 1 – Answers** | Admin + **AI Mode** | Answers to the Common Questions. If Admin has not entered an answer, **AI Mode** produces one. |
| 3 | **Level 2 – Answers** | Admin (+ AI Mode) | A deeper layer of answers. |
| 4 | **Chart** | Generated | A chart is **created from the Level 2** data. |
| 5 | **Remedy** | Admin | The remedy shown to the user at the end. |

Every one of these layers is stored **per category (Male / Female / Other)**.

## 3. Admin capabilities

- Enter and manage all **Common Questions**.
- Enter answers for **Level 1** and **Level 2**; trigger **AI Mode** to fill
  gaps where no answer exists.
- Manage **Remedies**.
- **Add more questions** at any time, **level-wise** (an "Add Question" screen
  that targets a chosen level and category).
- **Import Mode (Excel):** bulk-load Common Questions, Level 1 answers,
  Level 2 answers, and Remedies from spreadsheets.
- Manage **translations** for all content (multi-lingual).

## 4. User capabilities

- Choose language and category (Male / Female / Other).
- Interact with the questions and receive the corresponding answers.
- See the **chart** built from their Level 2 responses.
- See the **remedy**.
- Provide their **details**; their questions, answers, and chart are **saved**.

## 5. Cross-cutting

- **Multi-lingual** across the whole app (Admin content + User interface).
- **Categories** Male / Female / Other apply at every level.
- **AI Mode** is a fallback answer generator when Admin content is missing.

## 6. Decisions (confirmed 13 Aug 2026)

The earlier open questions have been answered:

1. **"Chart" = astrology-style chart.** The chart generated from Level 2 is a
   domain (astrological) chart, not a generic bar/pie summary. This means the app
   likely needs **birth details** (date, time, place of birth) to compute it.
2. **Level 2 is a deeper follow-up to Level 1** — Level 2 questions/answers build
   on the corresponding Level 1 answer, not an independent set.
3. **AI Mode answers are saved for review.** When AI fills a missing answer, it is
   stored as content (`source: "ai"`) so the Admin can review/edit/approve it
   later, rather than being shown once and discarded.
4. **User details — recommended default set** (see below).
5. **Language — 10 major world languages at start**, powered by the **Gemini
   API** (Gemini handles both AI-Mode answers and translation). The enabled set
   is below; more can be added later as a config change, no rebuild.

### Starting languages (11)

| # | Language | Code | Approx. global speakers |
|---|----------|------|--------------------------|
| 1 | English | `en` | ~1.5 B |
| 2 | Chinese (Mandarin, Simplified) | `zh` | ~1.1 B |
| 3 | Hindi | `hi` | ~600 M |
| 4 | Spanish | `es` | ~560 M |
| 5 | Arabic | `ar` | ~420 M (RTL) |
| 6 | French | `fr` | ~310 M |
| 7 | Bengali | `bn` | ~270 M |
| 8 | Portuguese | `pt` | ~260 M |
| 9 | Russian | `ru` | ~255 M |
| 10 | Japanese | `ja` | ~125 M |
| 11 | Telugu | `te` | ~95 M |

> **Note:** Arabic is **right-to-left (RTL)** — the UI must support RTL layout for
> that language. Admin can enter content in one language and use Gemini to
> translate into the other nine.

### Recommended user details to collect

Because the chart is astrology-style, birth data is needed in addition to basic
identity:

| Field | Why |
|-------|-----|
| Name | Identity / display |
| Gender / category (male / female / other) | Drives all level content |
| Date of birth | Required for the astrology chart |
| Time of birth | Required for an accurate chart |
| Place of birth (city + country, or lat/long) | Required for the chart |
| Contact (phone or email) | To reach the user / save their record |
| Preferred language | Defaults to `en` for now |

*Privacy note: birth details + contact are personal data. Keep collection to the
above, store securely, and add a short consent line at sign-up.*
