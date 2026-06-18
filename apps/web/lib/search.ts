import { Meilisearch } from "meilisearch";
import type { News } from "./cms";
import { searchNews as searchNewsPg } from "./cms";

const meili = new Meilisearch({
  host: process.env.MEILI_HOST ?? "http://localhost:7700",
  apiKey: process.env.MEILI_MASTER_KEY,
});

const NEWS_INDEX = "news";
const CMS_PUBLIC = process.env.NEXT_PUBLIC_CMS_URL ?? "http://localhost:3101";

export type SearchHit = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  categoryName?: string;
  categorySlug?: string;
  coverUrl?: string | null;
};

function absUrl(u?: string | null): string | undefined {
  if (!u) return undefined;
  return u.startsWith("http") ? u : `${CMS_PUBLIC}${u}`;
}

/** Meili hit'ini NewsCard'ın beklediği biçime çevirir. */
export function hitToNews(h: SearchHit): News {
  return {
    id: h.id,
    title: h.title,
    slug: h.slug,
    excerpt: h.excerpt,
    coverImage: h.coverUrl ? ({ id: 0, url: absUrl(h.coverUrl) } as any) : null,
    category: h.categoryName ? ({ id: 0, name: h.categoryName, slug: h.categorySlug ?? "" } as any) : null,
  };
}

export type SearchResult = { hits: SearchHit[]; total: number; engine: "meili" | "postgres" };

/**
 * Meilisearch ile arama; Meili erişilemezse Postgres LIKE'a düşer.
 */
export async function searchNews(q: string, page = 1, limit = 12): Promise<SearchResult> {
  const query = q.trim();
  if (query.length < 2) return { hits: [], total: 0, engine: "meili" };

  try {
    const res = await meili.index(NEWS_INDEX).search(query, {
      limit,
      offset: (page - 1) * limit,
      sort: ["publishedAt:desc"],
      attributesToHighlight: ["title"],
      highlightPreTag: "<mark>",
      highlightPostTag: "</mark>",
    });
    const hits = res.hits.map((h: any) => ({
      id: h.id,
      title: h.title,
      slug: h.slug,
      excerpt: h.excerpt,
      categoryName: h.categoryName,
      categorySlug: h.categorySlug,
      coverUrl: h.coverUrl,
      titleHighlighted: h._formatted?.title,
    })) as (SearchHit & { titleHighlighted?: string })[];
    return { hits, total: res.estimatedTotalHits ?? hits.length, engine: "meili" };
  } catch {
    // Yedek: Postgres
    const pg = await searchNewsPg(query, page, limit);
    const hits: SearchHit[] = pg.docs.map((n) => ({
      id: n.id,
      title: n.title,
      slug: n.slug,
      excerpt: n.excerpt,
      categoryName: n.category?.name,
      categorySlug: n.category?.slug,
      coverUrl: n.coverImage && typeof n.coverImage === "object" ? n.coverImage.url ?? null : null,
    }));
    return { hits, total: pg.totalDocs, engine: "postgres" };
  }
}
