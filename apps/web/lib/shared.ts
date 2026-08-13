/**
 * İstemci-güvenli tipler ve saf yardımcılar (ioredis/server fetch İÇERMEZ).
 * Hem sunucu (cms.ts) hem istemci bileşenleri (NewsCard, VitrinTabs) buradan import eder.
 */

const CMS_PUBLIC = process.env.NEXT_PUBLIC_CMS_URL ?? "http://localhost:3101";

export type Media = {
  id: number;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
  sizes?: Record<string, { url?: string; width?: number; height?: number }>;
};

export type Category = { id: number; name: string; slug: string; order?: number; description?: string };
export type Tag = { id: number; name: string; slug: string };

export type Author = {
  id: number;
  name: string;
  surname: string;
  fullName?: string;
  slug: string;
  title?: string;
  bio?: string;
  email?: string;
  avatar?: Media | null;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
};

export type News = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: any;
  body?: string;
  coverImage?: Media | null;
  category?: Category | null;
  author?: Author | null;
  tags?: Tag[];
  sonDakika?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  seo?: { focusKeyword?: string; metaDescription?: string };
  seoScore?: number;
};

export function mediaUrl(
  m?: Media | number | null,
  size?: "thumbnail" | "card" | "feature",
): string | undefined {
  if (!m || typeof m === "number") return undefined;
  const rel = size && m.sizes?.[size]?.url ? m.sizes[size]!.url : m.url;
  if (!rel) return undefined;
  return rel.startsWith("http") ? rel : `${CMS_PUBLIC}${rel}`;
}

export function authorName(a?: Author | null): string {
  if (!a) return "Son Kaynak";
  return a.fullName ?? `${a.name ?? ""} ${a.surname ?? ""}`.trim();
}

/** "5 saat önce" tarzı göreli zaman; 1 haftadan eskiyse tam tarih. */
export function timeAgo(d?: string): string {
  if (!d) return "";
  const then = new Date(d).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.floor((Date.now() - then) / 1000);
  if (s < 60) return "az önce";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} dakika önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat önce`;
  const dd = Math.floor(h / 24);
  if (dd < 7) return `${dd} gün önce`;
  try {
    return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
  } catch {
    return "";
  }
}

/** Kart/rozet için kaba okuma süresi (dk). Metin yoksa null. */
export function readingTime(news: Pick<News, "body" | "excerpt">): number | null {
  let text = "";
  if (news.body) text = String(news.body).replace(/<[^>]+>/g, " ");
  else if (news.excerpt) text = news.excerpt;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  if (!words) return null;
  return Math.max(1, Math.round(words / 200));
}

/** Özet metnini cümlelere bölüp madde madde listeye çevirir (Haberin Özeti kutusu). */
export function summaryBullets(text?: string, max = 4): string[] {
  if (!text) return [];
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .slice(0, max);
}

export function newsUrl(n: Pick<News, "slug" | "id">): string {
  return `/haber/${n.slug ?? n.id}`;
}

export function categoryUrl(c?: Category | null): string {
  return c ? `/kategori/${c.slug}` : "#";
}

// ── Kategori renk kodları ──
// Tüm kategori/etiket renkleri tek marka kırmızısı.
export function categoryColor(_c?: Category | { slug?: string } | string | null): string {
  return "#d4141c";
}
