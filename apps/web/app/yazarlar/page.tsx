import type { Metadata } from "next";
import { getAuthorsForSlider, mediaUrl, authorName } from "@/lib/cms";

export const revalidate = 300;
export const metadata: Metadata = { title: "Yazarlar" };

export default async function YazarlarListe() {
  const authors = await getAuthorsForSlider(100);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <header className="mb-6 border-b-[3px] border-sk-red pb-3">
        <h1 className="flex items-center gap-3 text-2xl font-black text-sk-ink">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sk-red" />
          Yazarlar
        </h1>
      </header>

      {authors.length === 0 ? (
        <p className="py-16 text-center text-sk-muted">Henüz yazar yok.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {authors.map((a) => {
            const avatar = mediaUrl(a.avatar, "thumbnail");
            return (
              <a
                key={a.id}
                href={`/yazar/${a.slug}`}
                className="group flex flex-col items-center gap-3 rounded-xl border border-sk-line p-6 text-center transition hover:shadow-lg"
              >
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt={authorName(a)} className="h-20 w-20 rounded-full object-cover ring-4 ring-red-100" />
                ) : (
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-sk-red text-2xl font-black text-white">
                    {a.name?.[0]}
                    {a.surname?.[0]}
                  </span>
                )}
                <div>
                  <div className="font-bold text-sk-ink group-hover:text-sk-red">{authorName(a)}</div>
                  {a.title && <div className="text-xs text-sk-muted">{a.title}</div>}
                  <div className="mt-1 inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-sk-red">
                    {a.newsCount} haber
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
