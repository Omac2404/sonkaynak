import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ContinuousReader } from "@/components/ContinuousReader";
import { ArticleLightbox } from "@/components/ArticleLightbox";
import {
  getNewsBySlug,
  getRelatedNews,
  getSicakGundem,
  getLatestNews,
  getAdjacentNews,
  getMostRead,
  mediaUrl,
  authorName,
  categoryUrl,
  categoryColor,
  newsUrl,
  summaryBullets,
  type News,
} from "@/lib/cms";
import { RichText } from "@/lib/lexical";
import { ReadingProgress } from "@/components/ReadingProgress";
import { ShareBar, StickyShare } from "@/components/ShareTools";
import { ArticleFontSize } from "@/components/ArticleFontSize";
import { ViewTracker } from "@/components/ViewTracker";
import { MostReadList } from "@/components/MostReadList";
import { Newsletter } from "@/components/Newsletter";
import { GoogleNewsBox } from "@/components/GoogleNewsBox";

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
                <img src={img} alt="" loading="lazy" className="h-14 w-20 shrink-0 rounded-md object-cover" />
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
  const ozet = summaryBullets(news.excerpt, 4);

  const [related, sicak, latest, adjacent, mostRead] = await Promise.all([
    news.category ? getRelatedNews(news.category.id, news.id, 6) : Promise.resolve([]),
    getSicakGundem(),
    getLatestNews(5),
    news.publishedAt
      ? getAdjacentNews(news.publishedAt, news.category?.id ?? null)
      : Promise.resolve({ prev: null, next: null }),
    getMostRead(5),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const catColor = news.category ? categoryColor(news.category) : "#d4141c";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: news.seo?.metaDescription || news.excerpt,
    image: cover ? [cover] : [],
    datePublished: news.publishedAt,
    dateModified: news.updatedAt || news.publishedAt,
    author: {
      "@type": "Person",
      name: authorName(news.author),
      ...(news.author?.slug ? { url: `${siteUrl}/yazar/${news.author.slug}` } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: "Son Kaynak",
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(news.category ? { articleSection: news.category.name } : {}),
    ...(news.tags?.length ? { keywords: news.tags.map((t) => t.name).join(", ") } : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: `${siteUrl}/` },
      ...(news.category
        ? [{ "@type": "ListItem", position: 2, name: news.category.name, item: `${siteUrl}${categoryUrl(news.category)}` }]
        : []),
      { "@type": "ListItem", position: news.category ? 3 : 2, name: news.title, item: url },
    ],
  };

  return (
    <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <ReadingProgress />
      <StickyShare url={url} title={news.title} />
      <ViewTracker id={news.id} />
      <ArticleLightbox />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── ANA SÜTUN ── */}
      <article className="min-w-0">
        {/* Kategori renk şeridi */}
        <div className="mb-3 h-[3px] w-full rounded" style={{ background: catColor }} />
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

        {news.excerpt && ozet.length > 0 && (
          <aside className="mt-5 rounded-xl border border-sk-line bg-neutral-50 p-4 sm:p-5">
            <div className="mb-2.5 flex items-center gap-2">
              <span className="rounded bg-sk-red px-2 py-0.5 text-[11px] font-black uppercase tracking-wide text-white">
                Haberin Özeti
              </span>
            </div>
            <ul className="space-y-2">
              {ozet.map((b, i) => (
                <li key={i} className="flex gap-2.5 text-[15px] font-medium leading-relaxed text-neutral-700 md:text-base">
                  <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-sk-red" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </aside>
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
          <div className="flex items-center gap-3">
            <ArticleFontSize />
            <ShareBar url={url} title={news.title} />
          </div>
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

        {/* Önceki / Sonraki haber */}
        {(adjacent.prev || adjacent.next) && (
          <nav className="mt-8 grid max-w-[760px] gap-3 sm:grid-cols-2">
            {adjacent.prev ? (
              <a
                href={newsUrl(adjacent.prev)}
                className="group flex flex-col rounded-xl border border-sk-line bg-white p-4 transition hover:border-sk-red hover:shadow-md"
              >
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-neutral-400">‹ Önceki Haber</span>
                <span className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-sk-ink transition group-hover:text-sk-red">
                  {adjacent.prev.title}
                </span>
              </a>
            ) : (
              <span />
            )}
            {adjacent.next && (
              <a
                href={newsUrl(adjacent.next)}
                className="group flex flex-col rounded-xl border border-sk-line bg-white p-4 text-right transition hover:border-sk-red hover:shadow-md"
              >
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-neutral-400">Sonraki Haber ›</span>
                <span className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-sk-ink transition group-hover:text-sk-red">
                  {adjacent.next.title}
                </span>
              </a>
            )}
          </nav>
        )}

        {/* Yazar bio kutusu */}
        {news.author && (news.author.bio || news.author.title) && (
          <div className="mt-8 max-w-[760px] rounded-xl border border-sk-line bg-white p-5">
            <div className="flex items-start gap-4">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt={authorName(news.author)} loading="lazy" className="h-16 w-16 shrink-0 rounded-full object-cover" />
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
                      <img src={img} alt={n.title} loading="lazy" className="aspect-[16/9] w-full object-cover" />
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

        {/* Bülten kaydı */}
        <div className="mt-10 max-w-[760px]">
          <Newsletter />
        </div>

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
      <aside className="space-y-6 lg:sticky lg:top-4 lg:self-start">
        <MostReadList items={mostRead} />
        <SidebarList title="Sıcak Gündem" items={sicak.length ? sicak : latest.slice(0, 3)} />
        <GoogleNewsBox />
        <SidebarList title="Son Haberler" items={latest.slice(0, 3)} />
      </aside>
    </div>
  );
}
