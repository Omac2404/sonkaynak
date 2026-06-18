import config from "./payload.config";
import { getPayload } from "payload";
import { ensureNewsIndex, buildNewsDoc, getMeili, NEWS_INDEX } from "./lib/meili";

/**
 * Yayınlanmış tüm haberleri Meilisearch'e toplu indeksler.
 * Çalıştır: pnpm --filter @sonkaynak/cms reindex
 */
const run = async () => {
  const payload = await getPayload({ config });
  payload.logger.info("🔎 Meilisearch reindex başlıyor…");

  await ensureNewsIndex();

  const { docs } = await payload.find({
    collection: "news",
    where: { _status: { equals: "published" } },
    depth: 1,
    limit: 1000,
    overrideAccess: true,
  });

  const meiliDocs = await Promise.all(docs.map((d) => buildNewsDoc(payload, d)));
  if (meiliDocs.length) {
    const task = await getMeili().index(NEWS_INDEX).addDocuments(meiliDocs);
    payload.logger.info(`📤 ${meiliDocs.length} haber gönderildi (task #${task.taskUid}).`);
  } else {
    payload.logger.info("Yayınlanmış haber bulunamadı.");
  }

  payload.logger.info("✅ Reindex tamamlandı.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
