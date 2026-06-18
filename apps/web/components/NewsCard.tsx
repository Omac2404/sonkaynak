import Image from "next/image";
import { type News, mediaUrl, newsUrl, categoryUrl, categoryColor } from "@/lib/shared";

function fmtDate(d?: string): string {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(
      new Date(d),
    );
  } catch {
    return "";
  }
}

function Cover({ src, alt, className, sizes }: { src?: string; alt: string; className: string; sizes?: string }) {
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-neutral-100 ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes ?? "(max-width:768px) 100vw, 400px"} className="object-cover" />
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-center bg-neutral-100 text-neutral-300 ${className}`}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 15l4-4 5 5M14 13l3-3 4 4" />
        <circle cx="8.5" cy="9.5" r="1.5" />
      </svg>
    </div>
  );
}

export function HeroCard({ news }: { news: News }) {
  return (
    <article className="group">
      <a href={newsUrl(news)} className="block overflow-hidden rounded-xl">
        <Cover
          src={mediaUrl(news.coverImage, "feature")}
          alt={news.title}
          className="aspect-[16/9] w-full object-cover"
        />
      </a>
      <div className="mt-4">
        {news.category && (
          <a
            href={categoryUrl(news.category)}
            className="inline-block rounded px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white"
            style={{ background: categoryColor(news.category) }}
          >
            {news.category.name}
          </a>
        )}
        <h2 className="mt-3 text-2xl font-black leading-tight text-sk-ink transition group-hover:text-sk-red md:text-3xl">
          <a href={newsUrl(news)}>{news.title}</a>
        </h2>
        {news.excerpt && <p className="mt-2 line-clamp-2 text-base leading-relaxed text-sk-muted">{news.excerpt}</p>}
      </div>
    </article>
  );
}

export function SideCard({ news }: { news: News }) {
  return (
    <a href={newsUrl(news)} className="group flex gap-3 p-3">
      <Cover
        src={mediaUrl(news.coverImage, "thumbnail")}
        alt={news.title}
        className="h-16 w-24 shrink-0 rounded-md object-cover"
      />
      <div>
        {news.category && (
          <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: categoryColor(news.category) }}>
            {news.category.name}
          </span>
        )}
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-sk-ink transition group-hover:text-sk-red">
          {news.title}
        </h3>
      </div>
    </a>
  );
}

export function GridCard({ news }: { news: News }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-sk-line">
      <a href={newsUrl(news)}>
        <Cover
          src={mediaUrl(news.coverImage, "card")}
          alt={news.title}
          className="aspect-[16/9] w-full object-cover"
        />
        <div className="p-4">
          {news.category && (
            <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: categoryColor(news.category) }}>
              {news.category.name}
            </span>
          )}
          <h3 className="mt-1.5 line-clamp-3 text-base font-bold leading-snug text-sk-ink transition group-hover:text-sk-red">
            {news.title}
          </h3>
          <div className="mt-2 text-xs text-neutral-400">{fmtDate(news.publishedAt ?? news.createdAt)}</div>
        </div>
      </a>
    </article>
  );
}
