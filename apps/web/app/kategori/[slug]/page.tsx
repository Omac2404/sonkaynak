import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getNewsByCategory, categoryColor } from "@/lib/cms";
import { GridCard, HeroCard, SideCard } from "@/components/NewsCard";
import { LoadMore } from "@/components/LoadMore";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return { title: "Kategori bulunamadı" };
  return { title: cat.name, description: `${cat.name} kategorisindeki son haberler.` };
}

export default async function KategoriPage({ params }: Props) {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();

  const { docs, totalPages } = await getNewsByCategory(cat.id, 1, 12);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <header className="mb-6 border-b-[3px] pb-3" style={{ borderColor: categoryColor(cat) }}>
        <h1 className="flex items-center gap-3 text-2xl font-black text-sk-ink">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: categoryColor(cat) }} />
          {cat.name}
        </h1>
      </header>

      {docs.length === 0 ? (
        <p className="py-16 text-center text-sk-muted">Bu kategoride henüz haber yok.</p>
      ) : (
        <>
          {docs[0] && (
            <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
              <HeroCard news={docs[0]} />
              <aside className="flex flex-col divide-y divide-sk-line self-start rounded-xl border border-sk-line">
                {docs.slice(1, 5).map((n) => (
                  <SideCard key={n.id} news={n} />
                ))}
              </aside>
            </section>
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {docs.slice(5).map((n) => (
              <GridCard key={n.id} news={n} />
            ))}
          </div>
          <LoadMore categoryId={cat.id} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
