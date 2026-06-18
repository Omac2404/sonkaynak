import type { Metadata } from "next";
import { getCategories, getNewsByCategory, categoryUrl } from "@/lib/cms";
import { GridCard } from "@/components/NewsCard";

export const revalidate = 120;
export const metadata: Metadata = { title: "Tüm Kategoriler" };

export default async function TumKategoriler() {
  const categories = await getCategories();
  const blocks = await Promise.all(
    categories.map(async (c) => ({ cat: c, news: (await getNewsByCategory(c.id, 1, 4)).docs })),
  );

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <header className="mb-6 border-b-[3px] border-sk-red pb-3">
        <h1 className="flex items-center gap-3 text-2xl font-black text-sk-ink">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-sk-red" />
          Tüm Kategoriler
        </h1>
      </header>

      <div className="space-y-10">
        {blocks
          .filter((b) => b.news.length > 0)
          .map(({ cat, news }) => (
            <section key={cat.id}>
              <div className="mb-4 flex items-center justify-between border-b border-sk-line pb-2">
                <h2 className="flex items-center gap-2 text-lg font-black text-sk-ink">
                  <span className="inline-block h-5 w-1.5 rounded bg-sk-red" />
                  {cat.name}
                </h2>
                <a href={categoryUrl(cat)} className="text-sm font-bold text-sk-red hover:underline">
                  Tümü →
                </a>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {news.map((n) => (
                  <GridCard key={n.id} news={n} />
                ))}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
