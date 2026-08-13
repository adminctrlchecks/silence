# Multi-stage image for the Silence NestJS API.
# Build from the repo ROOT context:  docker build -f apps/api/Dockerfile -t silence-api .
# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
# openssl for the Prisma query engine; ca-certificates for HTTPS (Gemini).
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

# ── Build: install deps, generate Prisma client, compile shared + api ─────────
FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @silence/shared build \
  && pnpm --filter @silence/api prisma:generate \
  && pnpm --filter @silence/api build

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM base AS runtime
ENV NODE_ENV=production
ENV API_PORT=3010
# Carries the installed node_modules (incl. generated Prisma client + sweph
# prebuilt binary) and the compiled dist.
COPY --from=build /app /app
WORKDIR /app/apps/api
EXPOSE 3010
CMD ["node", "dist/src/main.js"]
