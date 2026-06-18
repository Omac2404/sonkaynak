import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthorBySlug, getNewsByAuthor, getAuthorsForSlider, mediaUrl, authorName } from "@/lib/cms";
import { GridCard } from "@/components/NewsCard";
import { AuthorsSlider } from "@/components/AuthorsSlider";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = await getAuthorBySlug(slug);
  if (!a) return { title: "Yazar bulunamadı" };
  return { title: authorName(a), description: a.bio ?? `${authorName(a)} köşe yazıları ve haberleri.` };
}

export default async function YazarPage({ params }: Props) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const [news, allAuthors] = await Promise.all([getNewsByAuthor(author.id, 24), getAuthorsForSlider(20)]);
  const others = allAuthors.filter((a) => a.id !== author.id);
  const avatar = mediaUrl(author.avatar, "thumbnail");

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <header className="mb-8 flex flex-col items-center gap-4 rounded-xl border border-sk-line bg-neutral-50 p-8 text-center">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={authorName(author)} className="h-24 w-24 rounded-full object-cover ring-4 ring-sk-red" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-sk-red text-3xl font-black text-white ring-4 ring-red-200">
            {author.name?.[0]}
            {author.surname?.[0]}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-black text-sk-ink">{authorName(author)}</h1>
          {author.title && <p className="text-sm font-semibold text-sk-red">{author.title}</p>}
          {author.bio && <p className="mx-auto mt-2 max-w-xl text-sm text-sk-muted">{author.bio}</p>}
        </div>
      </header>

      <h2 className="mb-4 text-lg font-black uppercase tracking-wide text-sk-ink">
        {authorName(author)} — Haberleri
      </h2>
      {news.length === 0 ? (
        <p className="py-12 text-center text-sk-muted">Bu yazara ait yayınlanmış haber yok.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {news.map((n) => (
            <GridCard key={n.id} news={n} />
          ))}
        </div>
      )}

      {others.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-black uppercase tracking-wide text-sk-ink">Diğer Yazarlar</h2>
          <AuthorsSlider authors={others} />
        </section>
      )}
    </div>
  );
}
