import type { Metadata } from "next";
import { searchNews, hitToNews } from "@/lib/search";
import { GridCard } from "@/components/NewsCard";

export const metadata: Metadata = { title: "Arama" };

type Props = { searchParams: Promise<{ q?: string; sayfa?: string }> };

export default async function AraPage({ searchParams }: Props) {
  const { q = "", sayfa } = await searchParams;
  const page = Math.max(1, parseInt(sayfa ?? "1", 10) || 1);
  const query = q.trim();

  const result = query.length >= 2 ? await searchNews(query, page, 12) : { hits: [], total: 0, engine: "meili" as const };
  const totalPages = Math.ceil(result.total / 12);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <form action="/ara" className="mx-auto mb-8 flex max-w-xl gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Haberlerde ara…"
          autoComplete="off"
          className="flex-1 rounded-lg border border-sk-line px-4 py-3 text-base outline-none focus:border-sk-red"
        />
        <button type="submit" className="rounded-lg bg-sk-red px-6 py-3 font-bold text-white hover:bg-sk-red-dark">
          Ara
        </button>
      </form>

      {query.length >= 2 ? (
        <>
          <p className="mb-6 text-sm text-sk-muted">
            <strong className="text-sk-ink">{query}</strong> için {result.total} sonuç bulundu.
          </p>
          {result.hits.length === 0 ? (
            <p className="py-12 text-center text-sk-muted">Sonuç bulunamadı.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {result.hits.map((h) => (
                <GridCard key={h.id} news={hitToNews(h)} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-10 flex justify-center gap-2">
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/ara?q=${encodeURIComponent(query)}&sayfa=${p}`}
                  className={`rounded-md border px-3 py-1.5 text-sm font-bold ${
                    p === page
                      ? "border-sk-red bg-sk-red text-white"
                      : "border-sk-line text-sk-ink hover:border-sk-red hover:text-sk-red"
                  }`}
                >
                  {p}
                </a>
              ))}
            </nav>
          )}
        </>
      ) : (
        <p className="py-12 text-center text-sk-muted">Aramak için en az 2 karakter girin.</p>
      )}
    </div>
  );
}
