# ─────────────────────────────────────────────
# Son Kaynak — Admin (custom panel) production image
# Build context: repo KÖKÜ (sonkaynak-app), dockerfile: apps/admin/Dockerfile
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
# NEXT_PUBLIC_* derleme anında gömülür
ARG NEXT_PUBLIC_CMS_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_CMS_URL=$NEXT_PUBLIC_CMS_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @sonkaynak/admin build

# --- runtime ---
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3102
ENV HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build /app/apps/admin/.next/standalone ./
COPY --from=build /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=build /app/apps/admin/public ./apps/admin/public
EXPOSE 3102
CMD ["node", "apps/admin/server.js"]
