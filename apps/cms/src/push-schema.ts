import config from "./payload.config";
import { getPayload } from "payload";

/**
 * Veritabanı şemasını (tabloları) oluşturur/günceller.
 *
 * Payload, drizzle "push"u yalnızca NODE_ENV !== "production" iken çalıştırır
 * (bkz. @payloadcms/drizzle connect.js). Bu script bu yüzden konteyner
 * açılışında NODE_ENV=development ile bir kez çalıştırılır; getPayload() init
 * sırasında pushDevSchema'yı tetikleyerek tüm tabloları kurar. Ardından
 * asıl sunucu NODE_ENV=production ile başlar (bkz. apps/cms/Dockerfile).
 *
 * Idempotent: tablolar varsa yalnızca eksik/değişen şemayı uygular.
 */
const run = async () => {
  const payload = await getPayload({ config });
  payload.logger.info("✅ Veritabanı şeması hazır (drizzle push tamamlandı).");
  process.exit(0);
};

run().catch((err) => {
  console.error("Şema push başarısız:", err);
  process.exit(1);
});
