import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIlanBySlug, getIlanlar, mediaUrl } from "@/lib/cms";
import { RichText } from "@/lib/lexical";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const il = await getIlanBySlug(slug);
  if (!il) return { title: "İlan bulunamadı" };
  return { title: il.title };
}

export default async function IlanDetay({ params }: Props) {
  const { slug } = await params;
  const il = await getIlanBySlug(slug);
  if (!il) notFound();
  const cover = mediaUrl(il.coverImage, "feature");
  const others = (await getIlanlar(7)).filter((x) => x.id !== il.id).slice(0, 6);

  return (
    <div className="mx-auto max-w-[820px] px-4 py-8">
      <article className="rounded-xl border border-sk-line p-8 shadow-sm">
        <span className="inline-block rounded bg-sk-ink px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white">
          Resmî İlan
        </span>
        <h1 className="mt-4 text-3xl font-black leading-tight text-sk-ink">{il.title}</h1>
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={il.title} className="mt-6 w-full rounded-lg object-cover" />
        )}
        <div className="sk-article-body mt-6">
          {il.body ? (
            <div dangerouslySetInnerHTML={{ __html: il.body.replace(/<script[\s\S]*?<\/script>/gi, "") }} />
          ) : (
            <RichText data={il.content} />
          )}
        </div>
      </article>
      <a href="/ilanlar" className="mt-6 inline-block text-sm font-bold text-sk-red hover:underline">
        ← Tüm İlanlar
      </a>

      {others.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-base font-black uppercase tracking-wide text-sk-ink">Diğer İlanlar</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => {
              const oc = mediaUrl(o.coverImage, "card");
              return (
                <a key={o.id} href={`/ilan/${o.slug}`} className="group overflow-hidden rounded-xl border border-sk-line">
                  {oc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={oc} alt={o.title} className="aspect-[16/9] w-full object-cover" />
                  ) : (
                    <div className="flex aspect-[16/9] w-full items-center justify-center bg-neutral-100 text-2xl">📄</div>
                  )}
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-sk-ink group-hover:text-sk-red">{o.title}</h3>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
