import { type AuthorWithCount, mediaUrl, authorName } from "@/lib/cms";

export function AuthorsSlider({ authors }: { authors: AuthorWithCount[] }) {
  if (!authors.length) return null;
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {authors.map((a) => {
        const avatar = mediaUrl(a.avatar, "thumbnail");
        return (
          <a
            key={a.id}
            href={`/yazar/${a.slug}`}
            className="group flex w-36 shrink-0 flex-col items-center gap-2 rounded-xl border border-sk-line p-4 text-center transition hover:shadow-md"
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={authorName(a)} className="h-16 w-16 rounded-full object-cover ring-2 ring-sk-red" />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-full bg-sk-red text-lg font-black text-white">
                {a.name?.[0]}
                {a.surname?.[0]}
              </span>
            )}
            <div>
              <div className="line-clamp-1 text-sm font-bold text-sk-ink group-hover:text-sk-red">{authorName(a)}</div>
              {a.title && <div className="line-clamp-1 text-[11px] text-sk-muted">{a.title}</div>}
              <div className="mt-0.5 text-[11px] font-semibold text-sk-red">{a.newsCount} haber</div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
