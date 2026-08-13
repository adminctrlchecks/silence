# API Documentation (Draft)

> Draft REST API for the Q&A application described in
> [REQUIREMENTS.md](REQUIREMENTS.md). This is a **design document** to align on
> before implementation. Endpoints, fields, and names are proposals — the
> investor/team can mark changes and they will be revised.

- **Base URL:** `/api/v1`
- **Format:** JSON (`Content-Type: application/json`)
- **Auth:** Bearer token (`Authorization: Bearer <token>`). Admin endpoints
  require an admin token; user endpoints require a user token (or a public/guest
  token, TBD).
- **Language:** every read endpoint accepts `?lang=<code>` (e.g. `en`, `hi`,
  `ta`). Defaults to `en`.
- **Category:** where relevant, `category` is one of `male | female | other`.

---

## 0. Conventions

### Enums
- `category`: `male`, `female`, `other`
- `level`: `common`, `level1`, `level2`
- `source` (of an answer): `admin`, `ai`

### Standard error shape
```json
{ "error": { "code": "NOT_FOUND", "message": "Question not found" } }
```

### Pagination (list endpoints)
`?page=1&limit=20` → response includes `{ "data": [...], "page": 1, "limit": 20, "total": 137 }`

---

## 1. Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/admin/login` | Admin login → returns admin token. |
| `POST` | `/auth/user/register` | Create a user + save details. |
| `POST` | `/auth/user/login` | User login → returns user token. |

**POST `/auth/admin/login`**
```json
// request
{ "email": "admin@example.com", "password": "••••••" }
// response
{ "token": "…", "admin": { "id": "a1", "name": "Admin" } }
```

**POST `/auth/user/register`** — recommended detail set (birth data is needed for
the astrology chart).
```json
// request
{
  "name": "Asha",
  "category": "female",              // male | female | other
  "dob": "1998-04-21",
  "timeOfBirth": "07:35",
  "placeOfBirth": { "city": "Chennai", "country": "IN" },
  "contact": "+91…",                 // phone or email
  "lang": "en",
  "consent": true
}
// response
{ "token": "…", "user": { "id": "u_1", "name": "Asha", "category": "female" } }
```

---

## 2. Admin — Questions

Questions are stored per **level** and per **category**.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/admin/questions?level=&category=&lang=` | List questions (filterable). |
| `POST` | `/admin/questions` | Add a question (level-wise). |
| `GET`  | `/admin/questions/{id}` | Get one question. |
| `PUT`  | `/admin/questions/{id}` | Update a question. |
| `DELETE` | `/admin/questions/{id}` | Delete a question. |

**POST `/admin/questions`**
```json
// request
{
  "level": "common",
  "category": "female",
  "text": "How many hours do you sleep?",
  "order": 3,
  "translations": { "hi": "आप कितने घंटे सोते हैं?", "ta": "…" }
}
// response
{ "id": "q_101", "level": "common", "category": "female", "text": "…", "order": 3 }
```

---

## 3. Admin — Answers (Level 1 & Level 2)

Each answer is linked to a question, a level, and a category. `source` records
whether it came from Admin or AI Mode.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/admin/answers?level=&category=&questionId=` | List answers. |
| `POST` | `/admin/answers` | Add/edit an answer for a question. |
| `PUT`  | `/admin/answers/{id}` | Update an answer. |
| `DELETE` | `/admin/answers/{id}` | Delete an answer. |
| `POST` | `/admin/answers/ai-generate` | **AI Mode** — generate a missing answer. |

**POST `/admin/answers`**
```json
{
  "questionId": "q_101",
  "level": "level1",
  "category": "female",
  "text": "Aim for 7–8 hours of sleep.",
  "source": "admin",
  "translations": { "hi": "…" }
}
```

**POST `/admin/answers/ai-generate`** — used when no admin answer exists.
The generated answer is **saved back as content** (`source: "ai"`) so the Admin
can review, edit, and approve it later.
```json
// request
{ "questionId": "q_101", "level": "level1", "category": "female", "lang": "en" }
// response
{ "id": "ans_88", "text": "…AI-generated answer…", "source": "ai", "saved": true, "reviewed": false }
```
> AI answers carry `reviewed: false` until an Admin approves them. Admin can
> filter unreviewed AI content via `GET /admin/answers?source=ai&reviewed=false`.

---

## 4. Admin — Remedies

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/admin/remedies?category=&lang=` | List remedies. |
| `POST` | `/admin/remedies` | Add a remedy. |
| `PUT`  | `/admin/remedies/{id}` | Update a remedy. |
| `DELETE` | `/admin/remedies/{id}` | Delete a remedy. |

**POST `/admin/remedies`**
```json
{
  "category": "female",
  "title": "Sleep hygiene",
  "text": "Keep a consistent bedtime…",
  "linkedTo": { "level": "level2", "questionId": "q_101" },
  "translations": { "hi": "…" }
}
```

---

## 5. Admin — Chart configuration

The chart is an **astrology-style chart** generated from Level 2 together with the
user's **birth details** (date, time, place). This endpoint defines *how* the
chart is built (the config); the actual chart for a user is produced on the user
side (§9).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/admin/chart-config?category=` | Get chart configuration. |
| `PUT`  | `/admin/chart-config` | Update chart configuration. |

```json
// PUT body
{
  "category": "female",
  "type": "astrology",
  "style": "north-indian",        // e.g. north-indian | south-indian | western
  "source": "level2",
  "requires": ["dob", "timeOfBirth", "placeOfBirth"]
}
```
> Computing an astrology chart needs an ephemeris/astrology engine (see the
> "Chart engine" note at the end of this document). The API surface stays the
> same regardless of which engine is used underneath.

---

## 6. Admin — Excel Import (Import Mode)

Bulk import for Common Questions, Level 1 answers, Level 2 answers, and Remedies.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/admin/import/template?type=` | Download an Excel template. |
| `POST` | `/admin/import` | Upload an Excel file (`multipart/form-data`). |
| `GET`  | `/admin/import/{jobId}` | Check import status / errors. |

**POST `/admin/import`** — `multipart/form-data`
- `type`: `questions | answers-level1 | answers-level2 | remedies`
- `file`: the `.xlsx` file

```json
// response
{ "jobId": "imp_55", "status": "processing" }
// GET /admin/import/imp_55
{ "jobId": "imp_55", "status": "done", "created": 120, "updated": 8, "errors": [] }
```

---

## 7. Admin — Languages / Translations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/admin/languages` | List supported languages. |
| `POST` | `/admin/languages` | Add a supported language. |
| `PUT`  | `/admin/translations/{entity}/{id}` | Set translations for a content item. |
| `POST` | `/admin/translations/auto` | **Gemini** — auto-translate a content item into target languages. |

**Starting languages (11):** `en`, `zh`, `hi`, `es`, `ar`, `fr`, `bn`, `pt`,
`ru`, `ja`, `te`. (`ar` is right-to-left — UI must support RTL.) More can be added
via `POST /admin/languages` with no code change.

**POST `/admin/translations/auto`**
```json
// request — translate one answer into all enabled languages
{ "entity": "answer", "id": "ans_88", "targets": ["zh","hi","es","ar","fr","bn","pt","ru","ja","te"] }
// response
{ "id": "ans_88", "translated": ["zh","hi","es","ar","fr","bn","pt","ru","ja","te"], "provider": "gemini" }
```

---

## 8. User — Flow

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/questions?level=&category=&lang=` | Get questions to show the user. |
| `POST` | `/responses` | Submit user's answer(s) to questions. |
| `GET`  | `/answers?questionId=&level=&category=&lang=` | Get the answer to show. |

**POST `/responses`**
```json
{
  "userId": "u_1",
  "level": "level1",
  "category": "female",
  "answers": [ { "questionId": "q_101", "value": "6 hours" } ]
}
```

---

## 9. User — Chart & Remedy

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/users/{id}/chart?lang=` | Get the chart generated from the user's Level 2 data. |
| `GET`  | `/users/{id}/remedy?lang=` | Get the remedy for the user. |

```json
// GET /users/u_1/chart
{ "userId": "u_1", "category": "female", "type": "bar", "data": [ /* … */ ] }
```

---

## 10. User — Details & Saved Data

The user's details, their questions+answers, and their chart are persisted.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/users/{id}` | Get user profile/details. |
| `PUT`  | `/users/{id}` | Update user details. |
| `GET`  | `/users/{id}/history` | Get saved Q&A + chart for the user. |

```json
// GET /users/u_1/history
{
  "userId": "u_1",
  "category": "female",
  "sessions": [
    {
      "date": "2026-08-13",
      "responses": [ { "questionId": "q_101", "value": "6 hours", "answerShown": "…" } ],
      "chart": { "type": "bar", "data": [ /* … */ ] },
      "remedy": { "title": "Sleep hygiene", "text": "…" }
    }
  ]
}
```

---

## 11. Suggested data model (summary)

```
Language(code, name)

Question(id, level, category, text, order)
  └─ QuestionTranslation(questionId, lang, text)

Answer(id, questionId, level, category, text, source)   // source: admin | ai
  └─ AnswerTranslation(answerId, lang, text)

Remedy(id, category, title, text, linkedLevel, linkedQuestionId)
  └─ RemedyTranslation(remedyId, lang, title, text)

ChartConfig(category, type, source, fields)

User(id, name, category, dob, timeOfBirth, placeOfBirth, contact, lang, consent)
UserResponse(id, userId, questionId, level, category, value, createdAt)
UserChart(id, userId, category, type, data, createdAt)

ImportJob(id, type, status, created, updated, errors)
```

---

## 12. Chart engine note

The astrology chart is a computed artifact, not free-form content. Two ways to
produce it:

- **Astrology engine / library** (deterministic, accurate): compute planetary
  positions from birth date/time/place using an ephemeris. Common open options:
  Swiss Ephemeris (`pyswisseph`), `flatlib`, or a hosted astrology API. This is
  the right tool for the *chart geometry itself*.
- **LLM — Gemini API (chosen):** used for turning the chart + Level 2 answers
  into readable interpretation text, for **AI Mode** fallback answers, and for
  **translation** across the 10 languages — not for the raw astronomical
  calculation.

Recommended split: **engine computes the chart, Gemini writes & translates the
words.** The `ai-generate` and `translations/auto` endpoints wrap Gemini, so the
provider can be swapped later without changing the API or frontend.
