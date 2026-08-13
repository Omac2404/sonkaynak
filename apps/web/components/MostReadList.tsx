import { mediaUrl, newsUrl, type News } from "@/lib/cms";

/** Numaralı "En Çok Okunanlar" listesi (sidebar + anasayfa). */
export function MostReadList({
  items,
  title = "En Çok Okunanlar",
  withImages = false,
}: {
  items: News[];
  title?: string;
  withImages?: boolean;
}) {
  if (!items.length) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-sk-line bg-white">
      <div className="flex items-center gap-2 bg-sk-ink px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white">
        <span className="text-sk-red">★</span> {title}
      </div>
      <ol className="divide-y divide-sk-line">
        {items.map((n, i) => {
          const img = withImages ? mediaUrl(n.coverImage, "thumbnail") : null;
          return (
            <li key={n.id}>
              <a href={newsUrl(n)} className="group flex items-center gap-3 p-3">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-md text-sm font-black ${
                    i < 3 ? "bg-sk-red text-white" : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {i + 1}
                </span>
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" loading="lazy" className="h-12 w-16 shrink-0 rounded-md object-cover" />
                )}
                <span className="min-w-0 line-clamp-2 text-[13px] font-bold leading-snug text-sk-ink transition group-hover:text-sk-red">
                  {n.title}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
