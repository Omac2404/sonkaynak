import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGaleriBySlug, mediaUrl } from "@/lib/cms";
import { GalleryGrid } from "@/components/GalleryGrid";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = await getGaleriBySlug(slug);
  if (!g) return { title: "Galeri bulunamadı" };
  return { title: g.title, description: g.excerpt };
}

export default async function GaleriDetay({ params }: Props) {
  const { slug } = await params;
  const g = await getGaleriBySlug(slug);
  if (!g) notFound();

  const items = (g.items ?? []).filter((it) => it.image);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8">
      <header className="mb-6">
        {g.category && (
          <span className="inline-block rounded bg-sk-red px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
            {g.category}
          </span>
        )}
        <h1 className="mt-3 text-3xl font-black text-sk-ink">{g.title}</h1>
        {g.excerpt && <p className="mt-2 text-base text-sk-muted">{g.excerpt}</p>}
      </header>

      {items.length === 0 ? (
        <p className="py-12 text-center text-sk-muted">Bu galeride fotoğraf yok.</p>
      ) : (
        <GalleryGrid
          title={g.title}
          items={items.map((it) => ({
            url: mediaUrl(it.image, "feature"),
            thumb: mediaUrl(it.image, "card"),
            caption: it.caption,
          }))}
        />
      )}
    </div>
  );
}
