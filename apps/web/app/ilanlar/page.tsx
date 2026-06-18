import type { Metadata } from "next";
import { getIlanlar, mediaUrl } from "@/lib/cms";

export const revalidate = 120;
export const metadata: Metadata = { title: "Resmî İlanlar" };

function fmt(d?: string) {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
  } catch {
    return "";
  }
}

export default async function IlanlarListe() {
  const ilanlar = await getIlanlar(36);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <header className="mb-6 border-b-[3px] border-sk-red pb-3">
        <h1 className="flex items-center gap-3 text-2xl font-black text-sk-ink">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sk-red" />
          Resmî İlanlar
        </h1>
      </header>

      {ilanlar.length === 0 ? (
        <p className="py-16 text-center text-sk-muted">Henüz ilan yok.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ilanlar.map((il) => {
            const cover = mediaUrl(il.coverImage, "card");
            return (
              <a key={il.id} href={`/ilan/${il.slug}`} className="group overflow-hidden rounded-xl border border-sk-line">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt={il.title} className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[16/9] w-full items-center justify-center bg-neutral-100 text-3xl">📄</div>
                )}
                <div className="p-4">
                  <h3 className="line-clamp-2 text-base font-bold leading-snug text-sk-ink group-hover:text-sk-red">{il.title}</h3>
                  <div className="mt-2 text-xs text-neutral-400">{fmt(il.createdAt)}</div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
