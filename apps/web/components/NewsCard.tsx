import Image from "next/image";
import { type News, mediaUrl, newsUrl, categoryColor } from "@/lib/shared";

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
  const src = mediaUrl(news.coverImage, "feature");
  return (
    <article className="group">
      <a
        href={newsUrl(news)}
        className="relative block aspect-[16/10] overflow-hidden rounded-lg bg-neutral-200 sm:aspect-[16/9]"
      >
        {src ? (
          <Image src={src} alt={news.title} fill priority sizes="(max-width:1024px) 100vw, 960px" className="object-cover transition duration-300 group-hover:scale-[1.03]" />
        ) : (
          <div className="absolute inset-0" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          {news.category && (
            <span
              className="inline-block rounded px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white"
              style={{ background: categoryColor(news.category) }}
            >
              {news.category.name}
            </span>
          )}
          <h2 className="mt-2.5 text-xl font-black leading-tight text-white drop-shadow-sm sm:text-3xl md:text-[34px]">
            {news.title}
          </h2>
          {news.excerpt && (
            <p className="mt-2 hidden max-w-2xl line-clamp-2 text-[15px] leading-relaxed text-white/80 sm:block">
              {news.excerpt}
            </p>
          )}
        </div>
      </a>
    </article>
  );
}

export function PosterCard({ news }: { news: News }) {
  const src = mediaUrl(news.coverImage, "feature");
  return (
    <a
      href={newsUrl(news)}
      className="group relative block aspect-[16/10] overflow-hidden rounded-lg bg-neutral-800"
    >
      {src ? (
        <Image src={src} alt={news.title} fill sizes="(max-width:768px) 100vw, 440px" className="object-cover transition duration-300 group-hover:scale-105" />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        {news.category && (
          <span
            className="inline-block rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white"
            style={{ background: categoryColor(news.category) }}
          >
            {news.category.name}
          </span>
        )}
        <h3 className="mt-1.5 line-clamp-3 text-lg font-black leading-tight text-white drop-shadow-sm">
          {news.title}
        </h3>
      </div>
    </a>
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
    <article className="group overflow-hidden rounded-lg border border-sk-line bg-white transition hover:shadow-md">
      <a href={newsUrl(news)}>
        <Cover
          src={mediaUrl(news.coverImage, "card")}
          alt={news.title}
          className="aspect-[16/9] w-full object-cover"
        />
        <div className="p-3">
          <h3 className="line-clamp-3 text-[15px] font-bold leading-tight text-sk-ink transition group-hover:text-sk-red">
            {news.title}
          </h3>
          {news.category && (
            <span className="mt-2 inline-block text-[11px] font-extrabold uppercase tracking-wide text-sk-red">
              #{news.category.name}
            </span>
          )}
        </div>
      </a>
    </article>
  );
}
