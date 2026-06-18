import type { Metadata } from "next";
import { getGaleriler, mediaUrl } from "@/lib/cms";

export const revalidate = 120;
export const metadata: Metadata = { title: "Foto Galeri" };

export default async function GaleriListe() {
  const galeriler = await getGaleriler(24);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <header className="mb-6 border-b-[3px] border-sk-red pb-3">
        <h1 className="flex items-center gap-3 text-2xl font-black text-sk-ink">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sk-red" />
          Foto Galeri
        </h1>
      </header>

      {galeriler.length === 0 ? (
        <p className="py-16 text-center text-sk-muted">Henüz galeri yok.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galeriler.map((g) => {
            const cover = mediaUrl(g.cover, "card");
            const count = g.items?.length ?? 0;
            return (
              <a key={g.id} href={`/galeri/${g.slug}`} className="group relative block overflow-hidden rounded-xl">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt={g.title} className="aspect-[4/3] w-full object-cover transition group-hover:scale-105" />
                ) : (
                  <div className="aspect-[4/3] w-full bg-neutral-100" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-0 p-4">
                  <span className="mb-1 inline-block rounded bg-sk-red px-2 py-0.5 text-[10px] font-bold text-white">
                    📷 {count} Fotoğraf
                  </span>
                  <h3 className="text-base font-bold leading-snug text-white">{g.title}</h3>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
