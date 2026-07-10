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

export function newsUrl(n: Pick<News, "slug" | "id">): string {
  return `/haber/${n.slug ?? n.id}`;
}

export function categoryUrl(c?: Category | null): string {
  return c ? `/kategori/${c.slug}` : "#";
}

// ── Kategori renk kodları ──
const CAT_COLORS: Record<string, string> = {
  gundem: "#d4141c",
  ekonomi: "#15803d",
  spor: "#1d4ed8",
  dunya: "#0891b2",
  siyaset: "#7c3aed",
  teknoloji: "#0ea5e9",
  saglik: "#db2777",
  yasam: "#ca8a04",
  "kultur-sanat": "#9333ea",
  yerel: "#ea580c",
};
const PALETTE = ["#d4141c", "#15803d", "#1d4ed8", "#0891b2", "#7c3aed", "#db2777", "#ca8a04", "#ea580c", "#0ea5e9", "#9333ea"];

export function categoryColor(c?: Category | { slug?: string } | string | null): string {
  const slug = typeof c === "string" ? c : c?.slug;
  if (!slug) return "#d4141c";
  if (CAT_COLORS[slug]) return CAT_COLORS[slug];
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
