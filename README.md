# Son Kaynak — Haber Platformu (Node.js)

WordPress eklentisinden taşınan yeni nesil haber platformu. Monorepo (Turborepo + pnpm),
TypeScript, Next.js (public site), Payload CMS (admin + API), PostgreSQL, Redis, Meilisearch,
MinIO. Tek sunucu Docker Compose ile çalışır.

## Yapı

```
sonkaynak-app/
├─ apps/
│  ├─ web/            # Next.js — ziyaretçi sitesi
│  └─ cms/            # Payload CMS — admin + API   (Faz 2)
├─ packages/          # paylaşılan tipler / config / ui   (sonraki fazlar)
├─ docker-compose.yml # altyapı: Postgres, Redis, Meilisearch, MinIO
└─ turbo.json
```

## Gereksinimler

- Node.js ≥ 20 (test: v24)
- pnpm ≥ 11
- Docker + Docker Compose

## Kurulum

```bash
# 1) Ortam değişkenleri
cp .env.example .env      # Windows: copy .env.example .env

# 2) Bağımlılıklar
pnpm install

# 3) Altyapıyı başlat (Postgres, Redis, Meilisearch, MinIO)
pnpm infra:up

# 4) Geliştirme
pnpm dev
```

- Web: http://localhost:3000
- (Faz 2) CMS/Admin: http://localhost:3001/admin
- MinIO konsol: http://localhost:9001
- Meilisearch: http://localhost:7700

## Faz planı

- **Faz 1 ✓** — Monorepo + Docker altyapısı + çalışan web iskeleti
- **Faz 2** — Payload CMS: koleksiyonlar, RBAC, onay akışı
- **Faz 3** — MySQL `wp_sk_*` → Postgres veri taşıma
- **Faz 4** — Public site UI (manşet, haber detay, kategori, yazar, arama)
- **Faz 5** — Meilisearch arama + Redis cache
- **Faz 6 (sonra)** — Worker + RSS/scraping
