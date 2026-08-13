# Silence — Autonomous Build Loop Prompt

Paste the block below into a **new chat** at the project root
(`C:\Users\user\Desktop\Silence`). It drives the entire build phase-by-phase.
Optionally prefix with `/loop` (no interval) for auto-continuation across turns.

---

```
You are building "Silence", a multilingual astrology Q&A web app, in the monorepo
at C:\Users\user\Desktop\Silence. The full plan and your live task state are in
docs/PLAN.md. Follow it exactly.

START-UP (do once):
1. Read README.md and docs/REQUIREMENTS.md, API.md, ARCHITECTURE.md,
   DEPLOYMENT.md, then docs/PLAN.md in full.
2. Confirm the toolchain: pnpm install; ensure `pnpm build` is green before
   starting new work.

THEN LOOP (repeat until done — do NOT stop between phases):
- Pick the next unchecked `[ ]` task in docs/PLAN.md whose dependencies are all
  checked and which is not tagged `(blocked: …)`.
- Create branch feat/<task-id>. Implement ONLY that task.
- Verify using the task's Verify commands (build / typecheck / test). They MUST
  pass; if not, fix within the task before moving on. Never mark a task done with
  a failing build or test, and never fake a result.
- Commit (Conventional Commits) with trailer
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`, push, and open/update
  a PR to `main` with body trailer
  `🤖 Generated with [Claude Code](https://claude.com/claude-code)`. Squash-merge when green.
- Update docs/PLAN.md: flip `[ ]`→`[x]`, add a one-line note, and append a dated
  line to the Progress log.
- Immediately continue to the next task. Complete every phase P0→P12 in order
  without pausing for approval between phases.

HARD RULES:
- Never modify, restart, or reuse anything belonging to CtrlChecks. Silence is
  fully isolated (own folder /opt/silence, DB silence_db/silence_user, ports
  3010/3011, own systemd units + Nginx vhost) per docs/DEPLOYMENT.md.
- Secrets only in gitignored .env / deploy/.secrets.env — never commit them.
- Postgres localhost-only; read-only inspect + back up before any VPS change.
- Decisions A–E are already locked in docs/PLAN.md — do not re-litigate them.

STOPPING:
- Stop only when every task is `[x]`, OR the only remaining tasks are blocked.
- Two legitimate blockers, each needs input you cannot invent:
    * GitHub auth for the first push (P0-6) — if `gh auth status` fails, stop and
      ask for auth (or a PAT) once, then continue.
    * Hostinger credentials for Phase 11 — if deploy/.secrets.env is missing, tag
      P11 tasks (blocked: needs Hostinger credentials) and STOP with a precise
      list of what you need (VPS host/IP, SSH user, SSH key path, sudo, desired
      DB password). Do everything up to P10 first regardless.
- On stop, summarize: phases completed, what's blocked, and the exact next action
  required from the user.
```

---

## What you (the human) may need to provide when it stops
- **GitHub**: run `gh auth login` on this machine beforehand, or paste a PAT when asked.
- **Gemini**: put `GEMINI_API_KEY=…` in `apps/api/.env` (P2 uses a stub without it).
- **Hostinger (Phase 11)**: create `deploy/.secrets.env` from
  `deploy/.secrets.env.example` with: `VPS_HOST`, `VPS_USER`, `SSH_KEY_PATH`,
  `SILENCE_DB_PASSWORD`, `JWT_ADMIN_SECRET`, `JWT_USER_SECRET`. The loop creates
  `silence_db` + all tables (via `prisma migrate deploy`) on the VPS once these exist.
