import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTagBySlug, getNewsByTag } from "@/lib/cms";
import { GridCard } from "@/components/NewsCard";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "Etiket bulunamadı" };
  return { title: `#${tag.name}`, description: `${tag.name} etiketli haberler.` };
}

export default async function EtiketPage({ params }: Props) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const news = await getNewsByTag(tag.id, 36);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <header className="mb-6 border-b-[3px] border-sk-red pb-3">
        <h1 className="flex items-center gap-2 text-2xl font-black text-sk-ink">
          <span className="text-sk-red">#</span>
          {tag.name}
        </h1>
      </header>

      {news.length === 0 ? (
        <p className="py-16 text-center text-sk-muted">Bu etiketle haber yok.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {news.map((n) => (
            <GridCard key={n.id} news={n} />
          ))}
        </div>
      )}
    </div>
  );
}
