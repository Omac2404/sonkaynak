/**
 * Payload CMS REST API istemcisi (sunucu tarafı / RSC).
 * Faz 5'te arama Meilisearch'e taşınacak; gerisi cache/ISR ile kalır.
 */

import { cached } from "./redis";
import type { Media, Category, Tag, Author, News } from "./shared";

// İstemci-güvenli tipler + saf yardımcıları (mediaUrl, newsUrl, categoryUrl, authorName) yeniden ihraç et
export * from "./shared";

const CMS_INTERNAL = process.env.CMS_URL ?? "http://localhost:3101";

type ListResponse<T> = { docs: T[]; totalDocs: number; totalPages: number; page: number };

async function cms<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const res = await fetch(`${CMS_INTERNAL}${path}`, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (e) {
    console.warn("[cms] fetch başarısız:", path, (e as Error).message);
    return null;
  }
}

const PUBLISHED = "where[_status][equals]=published";

// ── Koleksiyon sorguları ──
export async function getCategories(): Promise<Category[]> {
  const r = await cms<ListResponse<Category>>(`/api/categories?sort=order&limit=100`, 300);
  return r?.docs ?? [];
}

export async function getLatestNews(limit = 12): Promise<News[]> {
  const r = await cms<ListResponse<News>>(
    `/api/news?${PUBLISHED}&depth=1&sort=-publishedAt&limit=${limit}`,
  );
  return r?.docs ?? [];
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  const r = await cms<ListResponse<News>>(
    `/api/news?where[slug][equals]=${encodeURIComponent(slug)}&${PUBLISHED}&depth=2&limit=1`,
  );
  return r?.docs?.[0] ?? null;
}

export async function getRelatedNews(categoryId: number, excludeId: number, limit = 6): Promise<News[]> {
  const r = await cms<ListResponse<News>>(
    `/api/news?where[category][equals]=${categoryId}&where[id][not_equals]=${excludeId}&${PUBLISHED}&depth=1&sort=-publishedAt&limit=${limit}`,
  );
  return r?.docs ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const r = await cms<ListResponse<Category>>(
    `/api/categories?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
    300,
  );
  return r?.docs?.[0] ?? null;
}

export async function getNewsByCategory(categoryId: number, page = 1, limit = 12): Promise<ListResponse<News>> {
  const r = await cms<ListResponse<News>>(
    `/api/news?where[category][equals]=${categoryId}&${PUBLISHED}&depth=1&sort=-publishedAt&limit=${limit}&page=${page}`,
  );
  return r ?? { docs: [], totalDocs: 0, totalPages: 0, page: 1 };
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const r = await cms<ListResponse<Author>>(
    `/api/authors?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`,
    300,
  );
  return r?.docs?.[0] ?? null;
}

export async function getNewsByAuthor(authorId: number, limit = 24): Promise<News[]> {
  const r = await cms<ListResponse<News>>(
    `/api/news?where[author][equals]=${authorId}&${PUBLISHED}&depth=1&sort=-publishedAt&limit=${limit}`,
  );
  return r?.docs ?? [];
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const r = await cms<ListResponse<Tag>>(
    `/api/tags?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
    300,
  );
  return r?.docs?.[0] ?? null;
}

export async function getNewsByTag(tagId: number, limit = 24): Promise<News[]> {
  const r = await cms<ListResponse<News>>(
    `/api/news?where[tags][in]=${tagId}&${PUBLISHED}&depth=1&sort=-publishedAt&limit=${limit}`,
  );
  return r?.docs ?? [];
}

export async function searchNews(q: string, page = 1, limit = 12): Promise<ListResponse<News>> {
  const eq = encodeURIComponent(q);
  const r = await cms<ListResponse<News>>(
    `/api/news?${PUBLISHED}&where[or][0][title][like]=${eq}&where[or][1][excerpt][like]=${eq}&depth=1&sort=-publishedAt&limit=${limit}&page=${page}`,
    0,
  );
  return r ?? { docs: [], totalDocs: 0, totalPages: 0, page: 1 };
}

// ── Global'ler (kürasyon) ──
type GlobalResp<T> = T;

export async function getAnaMenu(): Promise<Category[]> {
  const r = await cms<GlobalResp<{ items?: { category?: Category }[] }>>(`/api/globals/ana-menu?depth=1`, 300);
  return (r?.items ?? []).map((i) => i.category).filter(Boolean) as Category[];
}

export async function getManset(): Promise<News[]> {
  const r = await cms<GlobalResp<{ items?: { news?: News }[] }>>(`/api/globals/manset?depth=2`);
  return (r?.items ?? []).map((i) => i.news).filter(Boolean) as News[];
}

export async function getSicakGundem(): Promise<News[]> {
  const r = await cms<GlobalResp<{ items?: { news?: News }[] }>>(`/api/globals/sicak-gundem?depth=2`);
  return (r?.items ?? []).map((i) => i.news).filter(Boolean) as News[];
}

export async function getSecmece(): Promise<News[]> {
  const r = await cms<GlobalResp<{ items?: { news?: News }[] }>>(`/api/globals/secmece?depth=2`);
  return (r?.items ?? []).map((i) => i.news).filter(Boolean) as News[];
}

export async function getOzel(): Promise<News[]> {
  const r = await cms<GlobalResp<{ items?: { news?: News }[] }>>(`/api/globals/ozel?depth=2`);
  return (r?.items ?? []).map((i) => i.news).filter(Boolean) as News[];
}

export type AuthorWithCount = Author & { newsCount: number };
export async function getAuthorsForSlider(limit = 20): Promise<AuthorWithCount[]> {
  return cached("authors:slider", 300, async () => {
    const r = await cms<ListResponse<Author>>(`/api/authors?depth=1&limit=${limit}`, 300);
    const authors = r?.docs ?? [];
    const withCounts = await Promise.all(
      authors.map(async (a) => {
        const c = await cms<ListResponse<News>>(`/api/news?where[author][equals]=${a.id}&${PUBLISHED}&limit=1`, 300);
        return { ...a, newsCount: c?.totalDocs ?? 0 };
      }),
    );
    return withCounts;
  });
}

export type TickerData = {
  sonDakika?: { text: string; url?: string }[];
  sonDakikaSpeed?: number;
  editorSecimi?: { text: string; url?: string }[];
  editorSecimiSpeed?: number;
};
export async function getTicker(): Promise<TickerData> {
  return (await cms<TickerData>(`/api/globals/ticker`)) ?? {};
}

// ── Galeri / Firma / İlan / Vefat / Story ──
export type Galeri = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  cover?: Media | null;
  items?: { image?: Media | null; caption?: string }[];
  createdAt?: string;
};
export type Firma = {
  id: number;
  name: string;
  slug: string;
  logo?: Media | null;
  category?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  description?: string;
};
export type Ilan = {
  id: number;
  title: string;
  slug: string;
  coverImage?: Media | null;
  content?: any;
  body?: string;
  createdAt?: string;
};
export type Vefat = { id: number; isim: string; aciklama?: string; haberUrl?: string; aktif?: boolean; order?: number };
export type Story = { id: number; news?: News | null; order?: number };

export async function getGaleriler(limit = 12): Promise<Galeri[]> {
  const r = await cms<ListResponse<Galeri>>(`/api/galeriler?${PUBLISHED}&depth=1&sort=-createdAt&limit=${limit}`);
  return r?.docs ?? [];
}
export async function getGaleriBySlug(slug: string): Promise<Galeri | null> {
  const r = await cms<ListResponse<Galeri>>(
    `/api/galeriler?where[slug][equals]=${encodeURIComponent(slug)}&${PUBLISHED}&depth=2&limit=1`,
  );
  return r?.docs?.[0] ?? null;
}
export async function getFirmalar(category?: string): Promise<Firma[]> {
  const filter = category ? `&where[category][equals]=${encodeURIComponent(category)}` : "";
  const r = await cms<ListResponse<Firma>>(`/api/firmalar?${PUBLISHED}&depth=1&sort=name${filter}&limit=200`);
  return r?.docs ?? [];
}
export async function getFirmaBySlug(slug: string): Promise<Firma | null> {
  const r = await cms<ListResponse<Firma>>(
    `/api/firmalar?where[slug][equals]=${encodeURIComponent(slug)}&${PUBLISHED}&depth=1&limit=1`,
  );
  return r?.docs?.[0] ?? null;
}
export async function getIlanlar(limit = 24): Promise<Ilan[]> {
  const r = await cms<ListResponse<Ilan>>(`/api/ilanlar?${PUBLISHED}&depth=1&sort=-createdAt&limit=${limit}`);
  return r?.docs ?? [];
}
export async function getIlanBySlug(slug: string): Promise<Ilan | null> {
  const r = await cms<ListResponse<Ilan>>(
    `/api/ilanlar?where[slug][equals]=${encodeURIComponent(slug)}&${PUBLISHED}&depth=1&limit=1`,
  );
  return r?.docs?.[0] ?? null;
}
export async function getVefat(): Promise<Vefat[]> {
  const r = await cms<ListResponse<Vefat>>(`/api/vefat?where[aktif][equals]=true&sort=order&limit=20`);
  return r?.docs ?? [];
}
export async function getStories(): Promise<Story[]> {
  const r = await cms<ListResponse<Story>>(`/api/stories?depth=2&sort=order&limit=20`);
  return r?.docs ?? [];
}

/** Son haberlerdeki en sık geçen etiketler ("Bugün neler oldu?" şeridi için). */
export async function getTrendingTags(limit = 8): Promise<Tag[]> {
  const r = await cms<ListResponse<News>>(`/api/news?${PUBLISHED}&depth=1&sort=-publishedAt&limit=40`, 120);
  const counts = new Map<number, { tag: Tag; n: number }>();
  for (const news of r?.docs ?? []) {
    for (const t of news.tags ?? []) {
      if (typeof t !== "object" || !t) continue;
      const e = counts.get(t.id) ?? { tag: t, n: 0 };
      e.n += 1;
      counts.set(t.id, e);
    }
  }
  return [...counts.values()].sort((a, b) => b.n - a.n).slice(0, limit).map((e) => e.tag);
}

/**
 * Kesintisiz okuma için "sıradaki haber": önce aynı etiket, yoksa aynı kategori,
 * o da yoksa en yeni. Zaten gösterilenler (exclude) hariç.
 */
export async function getNextArticle(
  tagIds: number[],
  categoryId: number | null,
  excludeIds: number[],
): Promise<News | null> {
  const notIn = excludeIds.length ? `&where[id][not_in]=${excludeIds.join(",")}` : "";
  const pick = async (filter: string): Promise<News | null> => {
    const r = await cms<ListResponse<News>>(
      `/api/news?${PUBLISHED}${filter}${notIn}&depth=2&sort=-publishedAt&limit=1`,
      30,
    );
    return r?.docs?.[0] ?? null;
  };
  if (tagIds.length) {
    const byTag = await pick(`&where[tags][in]=${tagIds.join(",")}`);
    if (byTag) return byTag;
  }
  if (categoryId) {
    const byCat = await pick(`&where[category][equals]=${categoryId}`);
    if (byCat) return byCat;
  }
  return pick("");
}
export async function getAllNewsForSitemap(limit = 1000): Promise<News[]> {
  const r = await cms<ListResponse<News>>(`/api/news?${PUBLISHED}&depth=0&sort=-publishedAt&limit=${limit}`, 300);
  return r?.docs ?? [];
}

export type SiteSettings = {
  siteName?: string;
  siteDescription?: string;
  logo?: Media | null;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  gaId?: string;
  gscVerify?: string;
  footerAbout?: string;
  footerCopyright?: string;
  footerColumns?: { title?: string; links?: { label: string; url: string }[] }[];
};
export async function getSettings(): Promise<SiteSettings> {
  return (await cms<SiteSettings>(`/api/globals/site-settings?depth=1`, 900)) ?? {};
}

export type VitrinSlot = { category?: Category; pinnedNews?: News | null };
export async function getVitrin(): Promise<{ category: Category; featured?: News; rest: News[] }[]> {
  // Vitrin birden çok kategori sorgusu yapar (N+1) → Redis'te 60 sn cache
  return cached("vitrin:home", 60, async () => {
    const r = await cms<{ slots?: VitrinSlot[] }>(`/api/globals/vitrin?depth=1`);
    const slots = r?.slots ?? [];
    const out: { category: Category; featured?: News; rest: News[] }[] = [];
    for (const s of slots) {
      if (!s.category) continue;
      const list = await getNewsByCategory(s.category.id, 1, 5);
      const featuredId = (s.pinnedNews as any)?.id ?? (s.pinnedNews as any) ?? null;
      const featured = list.docs.find((n) => n.id === featuredId) ?? list.docs[0];
      const rest = list.docs.filter((n) => n.id !== featured?.id).slice(0, 4);
      out.push({ category: s.category, featured, rest });
    }
    return out;
  });
}
