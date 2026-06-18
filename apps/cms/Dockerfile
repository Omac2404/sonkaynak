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
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3101
ENV HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /app/apps/cms/.next/standalone ./
COPY --from=build /app/apps/cms/.next/static ./apps/cms/.next/static
COPY --from=build /app/apps/cms/public ./apps/cms/public
EXPOSE 3101
CMD ["node", "apps/cms/server.js"]
