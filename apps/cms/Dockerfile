# ─────────────────────────────────────────────
# Son Kaynak — CMS (Payload) production image
# Build context: repo KÖKÜ (sonkaynak-app), dockerfile: apps/cms/Dockerfile
# ─────────────────────────────────────────────
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable
WORKDIR /app

# --- bağımlılıklar ---
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/cms/package.json apps/cms/package.json
COPY apps/admin/package.json apps/admin/package.json
RUN pnpm install --frozen-lockfile

# --- build ---
FROM base AS build
COPY --from=deps /app ./
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# importmap üretimi + next build (prebuild script payload generate:importmap çalıştırır)
RUN pnpm --filter @sonkaynak/cms build

# --- runtime ---
# CMS standalone DEĞİL: Payload'ın çalışma anı dinamik bağımlılıkları
# (drizzle-kit ile şema push dahil) için tam node_modules ile next start.
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3101
ENV HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /app ./
WORKDIR /app/apps/cms
EXPOSE 3101
# Açılışta önce şema push (NODE_ENV=development, sadece bu komuta özel) → tablolar
# kurulur; ardından prod sunucu (container ENV NODE_ENV=production ile) başlar.
CMD ["sh", "-c", "NODE_ENV=development pnpm exec tsx src/push-schema.ts && pnpm exec next start -p 3101 -H 0.0.0.0"]
