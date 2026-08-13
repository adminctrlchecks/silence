# Silence

A multi-lingual **question-and-answer application** with an Admin side (builds
content: questions, answers, charts, remedies) and a User side (interacts with
questions, receives answers, a chart, and a remedy — all saved).

> Status: **design / documentation stage.** The goal right now is the interface
> and structure; content is added later by the Admin.

## Stack

- **Backend/API:** NestJS (single source of truth, port 3010)
- **Web + Admin:** Next.js — **Phase 1 (build now)**
- **Mobile:** React Native + Expo — **Phase 2 (later, same API)**
- **DB:** PostgreSQL (`silence_db`) · **Cache:** Redis · **AI + translation:** Gemini
- Deploys side-by-side with CtrlChecks on the Hostinger VPS (fully isolated)

## Documentation

- [Requirements understanding](docs/REQUIREMENTS.md) — how the investor's
  requirements have been interpreted, plus decisions.
- [API documentation (draft)](docs/API.md) — proposed REST API and data model.
- [Architecture](docs/ARCHITECTURE.md) — one backend, web + mobile clients, phasing.
- [Deployment plan](docs/DEPLOYMENT.md) — isolated deploy alongside CtrlChecks.

## Concept at a glance

```
Admin builds:                          User experiences:
  Common Questions          ─┐           pick language + category
  Level 1 answers (+ AI)     │           answer questions
  Level 2 answers            ├──────►    see answers
  Chart (from Level 2)       │           see chart (from Level 2)
  Remedies                  ─┘           see remedy → saved to their profile

Everywhere:  category = Male / Female / Other   ·   multi-lingual
Admin tools: Add-question (level-wise) · Excel import · AI Mode
```
