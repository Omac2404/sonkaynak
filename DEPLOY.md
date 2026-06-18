# Son Kaynak — EasyPanel Deploy Rehberi

Bu monorepo **3 ayrı Next.js uygulaması** içerir; her biri kendi EasyPanel
"App" servisi olarak, aynı git deposundan ama farklı Dockerfile ile kurulur.

| Uygulama | Dizin | Port | Önerilen alt alan adı |
|----------|-------|------|------------------------|
| Web (genel site) | `apps/web` | 3100 | `www.alanadiniz.com` |
| CMS (Payload API) | `apps/cms` | 3101 | `cms.alanadiniz.com` |
| Admin (özel panel) | `apps/admin` | 3102 | `panel.alanadiniz.com` |

Ayrıca **4 altyapı servisi**: PostgreSQL, Redis, Meilisearch, MinIO.

---

## 0) Önkoşullar
- EasyPanel kurulu bir sunucu + bir proje (örn. `sonkaynak`).
- Git deposu (GitHub/GitLab) — bu klasör (`sonkaynak-app`) deponun kökü olmalı.
- Bir alan adı ve DNS yönetimi (3 alt alan adı + opsiyonel minio/meili).

---

## 1) Altyapı servislerini kur

### PostgreSQL
EasyPanel → **+ Service → Postgres**. Adı `sonkaynak-db`.
Veritabanı adı `sonkaynak`, bir kullanıcı/şifre belirle. Bağlantı dizesi:
```
postgres://KULLANICI:SIFRE@sonkaynak-db:5432/sonkaynak
```

### Redis
EasyPanel → **+ Service → Redis**. Adı `sonkaynak-redis`.
```
redis://sonkaynak-redis:6379
```

### Meilisearch
**+ Service → App**, image: `getmeili/meilisearch:v1.11`. Adı `sonkaynak-meili`.
- Environment: `MEILI_MASTER_KEY=<uzun-rastgele>`, `MEILI_ENV=production`
- Mount volume: `/meili_data`
- Port 7700 (yalnızca dahili; domain'e gerek yok)
```
MEILI_HOST=http://sonkaynak-meili:7700
```

### MinIO (medya/S3)
**+ Service → App**, image: `minio/minio`. Adı `sonkaynak-minio`.
- Command: `server /data --console-address ":9001"`
- Environment: `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`
- Volume: `/data`
- Domain bağla (örn. `minio.alanadiniz.com` → port 9000) — medya tarayıcıdan
  bu adresle çekileceği için **public** olmalı.
- Konsola girip (`:9001`) `sonkaynak-media` adında bir **bucket** oluştur ve
  erişimini **public/read** yap (haber görselleri herkese açık görünmeli).

---

## 2) Uygulama servislerini kur (her biri için tekrarla)

Her uygulama için **+ Service → App** ve **Source = GitHub** (bu repo, ana branch).

**Build ayarları:**
- Build Method: **Dockerfile**
- Dockerfile Path: `apps/web/Dockerfile` (cms/admin için ilgili yol)
- Build Context: **`.`** (repo kökü — Dockerfile'lar köke göre yazıldı)

> NEXT_PUBLIC_* değişkenleri **derleme anında** pakete gömülür. EasyPanel'de
> App → Build → **Build Args** kısmına eklenmeli (sadece Environment'a değil):
> - web:   `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CMS_URL`
> - admin: `NEXT_PUBLIC_CMS_URL`, `NEXT_PUBLIC_SITE_URL`
> - cms:   (build-arg gerekmiyor)

**Environment:** `.env.production.example` dosyasındaki ilgili bloğu yapıştır.

**Domain:** App → Domains → alt alan adını bağla, container port'unu gir
(web 3100, cms 3101, admin 3102). EasyPanel SSL'i (Let's Encrypt) otomatik verir.

### Kurulum sırası
1. **CMS** önce. İlk açılışta `onInit` çalışır:
   - sistem rolleri oluşur,
   - `ADMIN_EMAIL`/`ADMIN_PASSWORD` ile ilk admin kullanıcısı oluşur (DB boşsa),
   - Payload veritabanı tablolarını otomatik kurar (Postgres push).
2. **Web** ve **Admin** sonra (CMS'e bağımlılar).

---

## 3) Deploy sonrası

- **Admin'e giriş:** `https://panel.alanadiniz.com` → `ADMIN_EMAIL`/`ADMIN_PASSWORD`.
- **Arama dizinini doldur:** ilk içerikler eklendikten sonra CMS container'ında
  bir kez reindex:
  ```
  pnpm --filter @sonkaynak/cms reindex
  ```
  (EasyPanel → App → Console). Sonrasında haber kaydet/sil işlemleri Meili'yi
  hook'larla otomatik günceller.
- **Demo içerik (opsiyonel):** `pnpm --filter @sonkaynak/cms seed`.

---

## 4) Notlar / sorun giderme

- **Payload kendi admin arayüzü kapalı.** `cms.alanadiniz.com/admin` özel panele
  yönlenir. Geçici açmak gerekirse CMS env'ine `ENABLE_PAYLOAD_ADMIN=true`.
- **CORS hatası** alırsan `CORS_ORIGINS` içine ilgili origin'i ekle (şema + host,
  sonunda `/` yok).
- **Medya yüklenmiyor / 403:** MinIO bucket public-read mi, `S3_*` doğru mu,
  `S3_ENDPOINT` https mi kontrol et. `forcePathStyle` zaten açık (MinIO için).
- **NEXT_PUBLIC_* yanlış görünüyor:** Build Args'a eklemeyi unuttuysan olur;
  ekledikten sonra **yeniden build** gerekir (runtime env yetmez).
- **Dahili adresler:** servisler arası çağrılarda (CMS_URL, PAYLOAD_URL,
  DATABASE_URI, REDIS_URL, MEILI_HOST) EasyPanel servis adını kullan; bunlar
  internet üzerinden değil ağ içinden gider, daha hızlı ve güvenli.
- **Standalone çıktı:** üç uygulama da `output: "standalone"` ile derlenir;
  imajlar küçük, runtime'da `node apps/<app>/server.js` ile çalışır.
