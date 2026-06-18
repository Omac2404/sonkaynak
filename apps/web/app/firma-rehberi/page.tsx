import type { Metadata } from "next";
import { getFirmalar, mediaUrl } from "@/lib/cms";

export const revalidate = 300;
export const metadata: Metadata = { title: "Firma Rehberi" };

type Props = { searchParams: Promise<{ kat?: string }> };

export default async function FirmaRehberi({ searchParams }: Props) {
  const { kat } = await searchParams;
  const firmalar = await getFirmalar(kat);
  const all = kat ? await getFirmalar() : firmalar;
  const categories = Array.from(new Set(all.map((f) => f.category).filter(Boolean))) as string[];

  return (
    <div className="mx-auto grid max-w-[1240px] gap-8 px-4 py-8 lg:grid-cols-[1fr_260px]">
      <main>
        <header className="mb-6 border-b-[3px] border-sk-red pb-3">
          <h1 className="flex items-center gap-3 text-2xl font-black text-sk-ink">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-sk-red" />
            Firma Rehberi{kat ? ` — ${kat}` : ""}
          </h1>
        </header>

        {firmalar.length === 0 ? (
          <p className="py-16 text-center text-sk-muted">Bu kategoride firma yok.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {firmalar.map((f) => {
              const logo = mediaUrl(f.logo, "thumbnail");
              return (
                <a key={f.id} href={`/firma/${f.slug}`} className="group flex flex-col items-center gap-3 rounded-xl border border-sk-line p-5 text-center transition hover:shadow-lg">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-sk-line bg-neutral-50">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt={f.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-2xl">🏢</span>
                    )}
                  </div>
                  <div className="text-sm font-bold leading-snug text-sk-ink group-hover:text-sk-red">{f.name}</div>
                  {f.category && <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-sk-red">{f.category}</span>}
                  {f.phone && <span className="text-xs text-sk-muted">{f.phone}</span>}
                </a>
              );
            })}
          </div>
        )}
      </main>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="overflow-hidden rounded-xl border border-sk-line">
          <div className="bg-sk-red px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white">Kategoriler</div>
          <a href="/firma-rehberi" className={`flex items-center justify-between border-b border-sk-line px-4 py-2.5 text-sm font-bold ${!kat ? "bg-red-50 text-sk-red" : "text-sk-ink"}`}>
            Tümü <span className="text-xs text-sk-muted">{all.length}</span>
          </a>
          {categories.map((c) => {
            const cnt = all.filter((f) => f.category === c).length;
            return (
              <a key={c} href={`/firma-rehberi?kat=${encodeURIComponent(c)}`} className={`flex items-center justify-between border-b border-sk-line px-4 py-2.5 text-sm font-bold last:border-0 ${kat === c ? "bg-red-50 text-sk-red" : "text-sk-ink hover:bg-neutral-50"}`}>
                {c} <span className="text-xs text-sk-muted">{cnt}</span>
              </a>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
