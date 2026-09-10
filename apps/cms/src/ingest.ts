import type { Payload } from "payload";
import Parser from "rss-parser";

const parser = new Parser({ timeout: 15000 });

function stripHtml(s: string): string {
  return String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Aktif ajans kaynaklarını çeker, RSS'i ayrıştırır, tekilleştirir ve haber oluşturur.
 * Kaynak bilgisi boş/pasif olanlar atlanır → izin/anahtar yoksa hiçbir şey olmaz.
 */
export async function runIngest(payload: Payload): Promise<{ created: number; errors: string[] }> {
  const errors: string[] = [];
  let created = 0;

  const sources = await payload.find({
    collection: "ajans-kaynaklari",
    where: { active: { equals: true } },
    limit: 50,
    depth: 0,
  });

  for (const s of sources.docs as any[]) {
    if (!s.feedUrl) continue;
    let status = "OK";
    try {
      if (!s.category) {
        status = "Hata: Hedef kategori seçilmemiş";
        await stamp(payload, s.id, status);
        errors.push(`${s.name}: kategori yok`);
        continue;
      }

      const headers: Record<string, string> = { "User-Agent": "SonKaynakBot/1.0" };
      if (s.username && s.password) {
        headers.Authorization = "Basic " + Buffer.from(`${s.username}:${s.password}`).toString("base64");
      }
      if (s.apiKey) headers["X-API-KEY"] = s.apiKey;

      const res = await fetch(s.feedUrl, { headers, signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const xml = await res.text();
      const feed = await parser.parseString(xml);

      const catId = typeof s.category === "object" ? s.category.id : s.category;
      let added = 0;

      for (const item of feed.items ?? []) {
        const guid = String(item.guid || item.link || item.title || "").trim();
        const title = (item.title || "").trim();
        if (!guid || !title) continue;

        // Tekilleştirme
        const exists = await payload.find({
          collection: "news",
          where: { sourceGuid: { equals: guid } },
          limit: 1,
          depth: 0,
        });
        if (exists.totalDocs > 0) continue;

        const rawBody = (item as any)["content:encoded"] || item.content || item.contentSnippet || "";
        const excerpt = stripHtml(item.contentSnippet || rawBody).slice(0, 300);

        await payload.create({
          collection: "news",
          data: {
            title: title.slice(0, 400),
            excerpt,
            body: String(rawBody),
            _status: s.autoPublish ? "published" : "draft",
            category: catId,
            sourceName: s.name,
            sourceGuid: guid,
            seo: { sourceUrl: item.link || "" },
            ...(s.autoPublish ? { publishedAt: new Date().toISOString() } : {}),
          } as any,
        });
        created++;
        added++;
        if (added >= 30) break; // tek turda kaynak başına en fazla 30 haber
      }

      status = `OK · ${added} yeni / ${feed.items?.length ?? 0} öğe`;
    } catch (e) {
      status = `Hata: ${(e as Error).message}`.slice(0, 200);
      errors.push(`${s.name}: ${(e as Error).message}`);
    }
    await stamp(payload, s.id, status);
  }

  return { created, errors };
}

async function stamp(payload: Payload, id: number, status: string) {
  try {
    await payload.update({
      collection: "ajans-kaynaklari",
      id,
      data: { lastFetchedAt: new Date().toISOString(), lastStatus: status } as any,
    });
  } catch {
    /* yoksay */
  }
}
