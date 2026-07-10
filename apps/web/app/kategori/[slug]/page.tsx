import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getNewsByCategory, categoryColor } from "@/lib/cms";
import { GridCard, HeroCard, SideCard } from "@/components/NewsCard";
import { LoadMore } from "@/components/LoadMore";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ sort?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return { title: "Kategori bulunamadı" };
  return {
    title: cat.name,
    description: cat.description || `${cat.name} kategorisindeki son dakika haberleri ve güncel gelişmeler.`,
  };
}

export default async function KategoriPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();

  const sortKey = sort === "eski" ? "publishedAt" : "-publishedAt";
  const { docs, totalPages } = await getNewsByCategory(cat.id, 1, 12, sortKey);
  const color = categoryColor(cat);
  const seoText =
    cat.description ||
    `${cat.name} kategorisindeki son dakika haberleri, güncel gelişmeler ve öne çıkan başlıklar Son Kaynak'ta.`;

  const tab = (label: string, href: string, active: boolean) => (
    <a
      href={href}
      className={`rounded-full px-3.5 py-1 font-bold transition ${
        active ? "bg-sk-red text-white" : "border border-sk-line text-neutral-600 hover:border-sk-red hover:text-sk-red"
      }`}
    >
      {label}
    </a>
  );

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <header className="mb-5 border-b-[3px] pb-3" style={{ borderColor: color }}>
        <h1 className="flex items-center gap-3 text-2xl font-black text-sk-ink">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          {cat.name}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-neutral-500">{seoText}</p>
      </header>

      {/* Sıralama */}
      <div className="mb-6 flex items-center gap-2 text-[13px]">
        <span className="font-semibold text-neutral-400">Sırala:</span>
        {tab("En Yeni", `/kategori/${slug}`, sort !== "eski")}
        {tab("En Eski", `/kategori/${slug}?sort=eski`, sort === "eski")}
      </div>

      {docs.length === 0 ? (
        <p className="py-16 text-center text-sk-muted">Bu kategoride henüz haber yok.</p>
      ) : (
        <>
          {docs[0] && (
            <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
              <HeroCard news={docs[0]} />
              <aside className="flex flex-col divide-y divide-sk-line self-start overflow-hidden rounded-xl border border-sk-line">
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
          <LoadMore categoryId={cat.id} totalPages={totalPages} sort={sortKey} />
        </>
      )}
    </div>
  );
}
