import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ContinuousReader } from "@/components/ContinuousReader";
import {
  getNewsBySlug,
  getRelatedNews,
  getSicakGundem,
  getLatestNews,
  mediaUrl,
  authorName,
  categoryUrl,
  categoryColor,
  newsUrl,
  type News,
} from "@/lib/cms";
import { RichText } from "@/lib/lexical";
import { ReadingProgress } from "@/components/ReadingProgress";

export const revalidate = 60;

function lexText(node: any): string {
  if (!node) return "";
  let out = typeof node.text === "string" ? node.text + " " : "";
  const kids = node.children ?? node.root?.children;
  if (Array.isArray(kids)) for (const k of kids) out += lexText(k);
  return out;
}
function readingMinutes(news: any): number {
  const text = news.body ? String(news.body).replace(/<[^>]+>/g, " ") : lexText(news.content);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 200));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) return { title: "Haber bulunamadı" };
  const desc = news.seo?.metaDescription || news.excerpt || news.title;
  const img = mediaUrl(news.coverImage, "feature");
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${newsUrl(news)}`;
  return {
    title: news.title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: news.title,
      description: desc,
      url,
      images: img ? [{ url: img, width: 1200, height: 630 }] : [],
      publishedTime: news.publishedAt,
    },
    twitter: { card: "summary_large_image", title: news.title, description: desc, images: img ? [img] : [] },
  };
}

function fmtDateTime(d?: string): string {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(d));
  } catch {
    return "";
  }
}

/* ── Paylaşım ikonları ── */
const SHARE = {
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  fb: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  wa: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884",
};

function ShareBar({ url, title, vertical = false }: { url: string; title: string; vertical?: boolean }) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { name: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, d: SHARE.x, color: "#000" },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, d: SHARE.fb, color: "#1877F2" },
    { name: "WhatsApp", href: `https://api.whatsapp.com/send?text=${t}%20${u}`, d: SHARE.wa, color: "#25D366" },
  ];
  return (
    <div className={`flex gap-2 ${vertical ? "flex-col" : "items-center"}`}>
      {!vertical && <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-neutral-400">Paylaş</span>}
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${l.name} ile paylaş`}
          className="sk-share grid h-9 w-9 place-items-center rounded-lg border border-sk-line text-neutral-600 transition hover:scale-105"
          style={{ ["--c" as any]: l.color }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
            <path d={l.d} />
          </svg>
        </a>
      ))}
    </div>
  );
}

function SidebarList({ title, items }: { title: string; items: News[] }) {
  if (!items.length) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-sk-line bg-white">
      <div className="flex items-center gap-2 bg-sk-red px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white">
        {title}
      </div>
      <div className="divide-y divide-sk-line">
        {items.map((n) => {
          const img = mediaUrl(n.coverImage, "thumbnail");
          return (
            <a key={n.id} href={newsUrl(n)} className="group flex gap-3 p-3">
              {img && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt="" className="h-14 w-20 shrink-0 rounded-md object-cover" />
              )}
              <div className="min-w-0">
                {n.category && <div className="text-[10px] font-extrabold uppercase text-sk-red">{n.category.name}</div>}
                <div className="mt-0.5 line-clamp-3 text-[13px] font-bold leading-snug text-sk-ink transition group-hover:text-sk-red">
                  {n.title}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default async function HaberDetay({ params }: Props) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) notFound();

  const cover = mediaUrl(news.coverImage, "feature");
  const coverCaption = (news.coverImage as any)?.caption as string | undefined;
  const avatar = mediaUrl(news.author?.avatar, "thumbnail");
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${newsUrl(news)}`;
  const readMin = readingMinutes(news);

  const [related, sicak, latest] = await Promise.all([
    news.category ? getRelatedNews(news.category.id, news.id, 6) : Promise.resolve([]),
    getSicakGundem(),
    getLatestNews(5),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.seo?.metaDescription || news.excerpt,
    image: cover ? [cover] : [],
    datePublished: news.publishedAt,
    dateModified: news.publishedAt,
    author: { "@type": "Person", name: authorName(news.author) },
    publisher: { "@type": "Organization", name: "Son Kaynak" },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── ANA SÜTUN ── */}
      <article className="min-w-0">
        {/* Breadcrumb */}
        <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-neutral-400">
          <a href="/" className="hover:text-sk-red">Anasayfa</a>
          <span>›</span>
          {news.category && (
            <>
              <a href={categoryUrl(news.category)} className="hover:text-sk-red">{news.category.name}</a>
              <span>›</span>
            </>
          )}
          <span className="line-clamp-1 text-neutral-500">{news.title}</span>
        </nav>

        {news.category && (
          <a href={categoryUrl(news.category)} className="inline-block rounded px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white" style={{ background: categoryColor(news.category) }}>
            {news.category.name}
          </a>
        )}

        <h1 className="mt-3 text-[28px] font-black leading-[1.2] text-sk-ink md:text-[40px]">{news.title}</h1>

        {news.excerpt && (
          <p className="mt-4 text-lg font-medium leading-relaxed text-neutral-600 md:text-xl">{news.excerpt}</p>
        )}

        {/* Başlık altı etiketler */}
        {news.tags && news.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
            {news.tags.map((t) => (
              <a key={t.id} href={`/etiket/${t.slug}`} className="text-[13px] font-extrabold uppercase tracking-tight text-sk-red transition hover:underline">
                #{t.name}
              </a>
            ))}
          </div>
        )}

        {/* Meta + paylaşım */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-sk-line py-3">
          <div className="flex items-center gap-3">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-neutral-100 text-sm font-black text-neutral-400">
                {(news.author?.name?.[0] ?? "S")}
              </span>
            )}
            <div>
              {news.author ? (
                <a href={`/yazar/${news.author.slug}`} className="block text-sm font-bold text-sk-ink hover:text-sk-red">
                  {authorName(news.author)}
                </a>
              ) : (
                <span className="block text-sm font-bold text-sk-ink">Son Kaynak</span>
              )}
              <span className="text-xs text-neutral-400">
                {fmtDateTime(news.publishedAt)} · {readMin} dk okuma
                {news.updatedAt &&
                  news.publishedAt &&
                  new Date(news.updatedAt).getTime() - new Date(news.publishedAt).getTime() > 300000 && (
                    <span className="ml-1 text-neutral-400">· Güncelleme: {fmtDateTime(news.updatedAt)}</span>
                  )}
              </span>
            </div>
          </div>
          <ShareBar url={url} title={news.title} />
        </div>

        {/* Kapak */}
        {cover && (
          <figure className="mt-6">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-100">
              <Image src={cover} alt={news.title} fill priority sizes="(max-width:1024px) 100vw, 820px" className="object-cover" />
            </div>
            {coverCaption && <figcaption className="mt-2 text-xs text-neutral-400">{coverCaption}</figcaption>}
          </figure>
        )}

        {/* Gövde — yeni editör HTML (body) varsa onu, yoksa eski Lexical içeriği */}
        <div className="sk-article-body mt-7 max-w-[760px]">
          {news.body ? (
            <div dangerouslySetInnerHTML={{ __html: news.body.replace(/<script[\s\S]*?<\/script>/gi, "") }} />
          ) : (
            <RichText data={news.content} />
          )}
        </div>

        {/* Künye */}
        <div className="mt-9 max-w-[760px] overflow-hidden rounded-xl border border-sk-line">
          <div className="bg-sk-ink px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-wider text-white">Künye</div>
          <div className="grid grid-cols-1 sm:grid-cols-2">
            {[
              ["Yayın Sahibi", "SONKAYNAK"],
              ["Sorumlu Yazı İşleri Müdürü", "Son Kaynak"],
              ["Yönetim Yeri", "Merkez / Kırıkkale"],
              ["İletişim / WhatsApp", "0538 441 07 71"],
            ].map(([k, v], i) => (
              <div key={i} className="border-b border-sk-line px-4 py-3 sm:[&:nth-child(odd)]:border-r">
                <div className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{k}</div>
                <div className="mt-0.5 text-[13px] font-bold text-sk-ink">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Etiketler */}
        {news.tags && news.tags.length > 0 && (
          <div className="mt-7 flex max-w-[760px] flex-wrap gap-2">
            {news.tags.map((t) => (
              <a
                key={t.id}
                href={`/etiket/${t.slug}`}
                className="rounded-full border border-sk-line bg-neutral-50 px-3.5 py-1.5 text-sm font-semibold text-neutral-600 transition hover:border-sk-red hover:bg-sk-red hover:text-white"
              >
                #{t.name}
              </a>
            ))}
          </div>
        )}

        {/* Alt paylaşım + geri */}
        <div className="mt-8 flex max-w-[760px] flex-wrap items-center justify-between gap-4 border-t border-sk-line pt-6">
          {news.category && (
            <a href={categoryUrl(news.category)} className="inline-flex items-center gap-1.5 rounded-lg bg-sk-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-sk-red">
              ← {news.category.name}
            </a>
          )}
          <ShareBar url={url} title={news.title} />
        </div>

        {/* Yazar bio kutusu */}
        {news.author && (news.author.bio || news.author.title) && (
          <div className="mt-8 max-w-[760px] rounded-xl border border-sk-line bg-white p-5">
            <div className="flex items-start gap-4">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt={authorName(news.author)} className="h-16 w-16 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-neutral-100 text-xl font-black text-neutral-400">
                  {news.author.name?.[0] ?? "S"}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <a href={`/yazar/${news.author.slug}`} className="text-lg font-black text-sk-ink transition hover:text-sk-red">
                  {authorName(news.author)}
                </a>
                {news.author.title && (
                  <div className="text-[11px] font-extrabold uppercase tracking-wide text-sk-red">{news.author.title}</div>
                )}
                {news.author.bio && (
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{news.author.bio}</p>
                )}
                <div className="mt-3">
                  <a href={`/yazar/${news.author.slug}`} className="text-[13px] font-bold text-sk-red hover:underline">
                    Tüm yazıları ›
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* İlgili Haberler */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 flex items-center gap-2 border-t-4 border-sk-red pt-5 text-lg font-black uppercase tracking-wide text-sk-ink">
              İlgili Haberler
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((n) => {
                const img = mediaUrl(n.coverImage, "card");
                return (
                  <a key={n.id} href={newsUrl(n)} className="group overflow-hidden rounded-xl border border-sk-line bg-white transition hover:shadow-lg">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={n.title} className="aspect-[16/9] w-full object-cover" />
                    ) : (
                      <div className="aspect-[16/9] w-full bg-neutral-100" />
                    )}
                    <div className="p-3.5">
                      {n.category && <div className="text-[10px] font-extrabold uppercase text-sk-red">{n.category.name}</div>}
                      <div className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-sk-ink transition group-hover:text-sk-red">
                        {n.title}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Kesintisiz okuma: en alta gelince aynı etiketten sıradaki haberler */}
        <ContinuousReader
          firstId={news.id}
          firstUrl={url}
          firstTitle={news.title}
          tagIds={Array.isArray(news.tags) ? news.tags.map((t) => (typeof t === "object" && t ? t.id : Number(t))).filter(Boolean) : []}
          categoryId={news.category?.id ?? null}
        />
      </article>

      {/* ── SIDEBAR ── */}
      <aside className="space-y-6">
        <SidebarList title="Sıcak Gündem" items={sicak.length ? sicak : latest.slice(0, 3)} />
        <SidebarList title="Son Haberler" items={latest.slice(0, 3)} />
      </aside>
    </div>
  );
}
