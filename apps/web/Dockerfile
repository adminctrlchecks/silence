# Multi-stage image for the Silence Next.js web app.
# Build from the repo ROOT context:  docker build -f apps/web/Dockerfile -t silence-web .
# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

# ── Build: install deps, compile shared, build the Next.js app ────────────────
FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
# NEXT_PUBLIC_* values are inlined at build time; override via --build-arg.
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3010/api/v1
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN pnpm --filter @silence/shared build \
  && pnpm --filter @silence/web build

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM base AS runtime
ENV NODE_ENV=production
# Server-side API base (proxied routes); override at run time.
ENV API_BASE_URL=http://localhost:3010/api/v1
COPY --from=build /app /app
WORKDIR /app/apps/web
EXPOSE 3011
CMD ["pnpm", "start"]
