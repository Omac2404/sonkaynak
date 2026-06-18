import { Meilisearch } from "meilisearch";
import type { Payload } from "payload";

export const NEWS_INDEX = "news";

/**
 * Tembel istemci: env değişkenleri (MEILI_*) payload.config'in dotenv'i
 * çalıştıktan SONRA okunmalı. Modül yükleme anında okursak (import sırası
 * nedeniyle) anahtar boş kalır → 401. Bu yüzden ilk kullanımda kurarız.
 */
let _client: Meilisearch | null = null;
export function getMeili(): Meilisearch {
  if (!_client) {
    _client = new Meilisearch({
      host: process.env.MEILI_HOST ?? "http://localhost:7700",
      apiKey: process.env.MEILI_MASTER_KEY,
    });
  }
  return _client;
}

export type NewsSearchDoc = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  categoryName: string;
  categorySlug: string;
  authorName: string;
  tags: string[];
  coverUrl: string | null;
  publishedAt: number;
};

/** Index'i oluştur ve ayarlarını uygula (idempotent). createIndex asenkron
 *  bir task olduğundan, ayarlar uygulanana kadar kısa aralıklarla denenir. */
export async function ensureNewsIndex(): Promise<void> {
  try {
    await getMeili().createIndex(NEWS_INDEX, { primaryKey: "id" });
  } catch {
    /* zaten var olabilir */
  }
  const index = getMeili().index(NEWS_INDEX);
  for (let i = 0; i < 12; i++) {
    try {
      await index.updateSettings({
        searchableAttributes: ["title", "excerpt", "categoryName", "authorName", "tags"],
        filterableAttributes: ["categorySlug"],
        sortableAttributes: ["publishedAt"],
      });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
}

async function resolveName(payload: Payload, collection: any, rel: any, fields: string[]): Promise<string> {
  if (!rel) return "";
  const obj = typeof rel === "object" ? rel : await payload.findByID({ collection, id: rel, depth: 0, overrideAccess: true }).catch(() => null);
  if (!obj) return "";
  return fields.map((f) => obj[f] ?? "").join(" ").trim();
}

async function resolveMediaUrl(payload: Payload, rel: any): Promise<string | null> {
  if (!rel) return null;
  const obj = typeof rel === "object" ? rel : await payload.findByID({ collection: "media", id: rel, depth: 0, overrideAccess: true }).catch(() => null);
  if (!obj) return null;
  return obj.sizes?.card?.url ?? obj.url ?? null;
}

/** Bir haber dokümanını Meili formatına çevirir. */
export async function buildNewsDoc(payload: Payload, doc: any): Promise<NewsSearchDoc> {
  const categoryObj = typeof doc.category === "object" ? doc.category : null;
  const [authorName, coverUrl] = await Promise.all([
    resolveName(payload, "authors", doc.author, ["name", "surname"]),
    resolveMediaUrl(payload, doc.coverImage),
  ]);
  const category =
    categoryObj ??
    (doc.category
      ? await payload.findByID({ collection: "categories", id: doc.category, depth: 0, overrideAccess: true }).catch(() => null)
      : null);

  return {
    id: doc.id,
    title: doc.title ?? "",
    slug: doc.slug ?? "",
    excerpt: doc.excerpt ?? "",
    categoryName: category?.name ?? "",
    categorySlug: category?.slug ?? "",
    authorName,
    tags: Array.isArray(doc.tags)
      ? doc.tags.map((t: any) => (typeof t === "object" ? t.name : "")).filter(Boolean)
      : [],
    coverUrl,
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt).getTime() : 0,
  };
}

/** Yayınlanmışsa index'e ekler, değilse index'ten çıkarır. */
export async function syncNewsToMeili(payload: Payload, doc: any): Promise<void> {
  if (doc._status === "published" && !doc.deletedAt) {
    const d = await buildNewsDoc(payload, doc);
    await getMeili().index(NEWS_INDEX).addDocuments([d]);
  } else {
    await removeNewsFromMeili(doc.id);
  }
}

export async function removeNewsFromMeili(id: number | string): Promise<void> {
  await getMeili().index(NEWS_INDEX).deleteDocument(id);
}
