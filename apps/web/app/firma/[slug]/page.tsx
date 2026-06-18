import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFirmaBySlug, getFirmalar, mediaUrl } from "@/lib/cms";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const f = await getFirmaBySlug(slug);
  if (!f) return { title: "Firma bulunamadı" };
  return { title: f.name, description: f.description };
}

function Row({ label, value, href }: { label: string; value?: string; href?: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 border-b border-sk-line py-2.5 last:border-0">
      <span className="w-24 shrink-0 text-xs font-bold uppercase text-sk-muted">{label}</span>
      {href ? (
        <a href={href} className="text-sm font-semibold text-sk-red hover:underline" target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      ) : (
        <span className="text-sm text-sk-ink">{value}</span>
      )}
    </div>
  );
}

export default async function FirmaDetay({ params }: Props) {
  const { slug } = await params;
  const f = await getFirmaBySlug(slug);
  if (!f) notFound();
  const logo = mediaUrl(f.logo, "card");
  const related = f.category ? (await getFirmalar(f.category)).filter((x) => x.id !== f.id).slice(0, 8) : [];

  return (
    <div className="mx-auto max-w-[820px] px-4 py-8">
      <div className="flex flex-col items-center gap-5 rounded-xl border border-sk-line p-8 sm:flex-row sm:items-start">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sk-line bg-neutral-50">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={f.name} className="max-h-full max-w-full object-contain" />
          ) : (
            <span className="text-4xl">🏢</span>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-black text-sk-ink">{f.name}</h1>
          {f.category && <span className="mt-1 inline-block rounded-full bg-red-50 px-3 py-0.5 text-xs font-bold uppercase text-sk-red">{f.category}</span>}
          {f.description && <p className="mt-3 text-sm leading-relaxed text-sk-muted">{f.description}</p>}
          <div className="mt-4">
            <Row label="Telefon" value={f.phone} href={f.phone ? `tel:${f.phone.replace(/\s/g, "")}` : undefined} />
            <Row label="E-posta" value={f.email} href={f.email ? `mailto:${f.email}` : undefined} />
            <Row label="Web" value={f.website} href={f.website} />
            <Row label="Adres" value={f.address} />
          </div>
        </div>
      </div>
      <a href="/firma-rehberi" className="mt-6 inline-block text-sm font-bold text-sk-red hover:underline">
        ← Firma Rehberi
      </a>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-base font-black uppercase tracking-wide text-sk-ink">İlgili Firmalar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {related.map((r) => {
              const rl = mediaUrl(r.logo, "thumbnail");
              return (
                <a key={r.id} href={`/firma/${r.slug}`} className="group flex flex-col items-center gap-2 rounded-xl border border-sk-line p-4 text-center transition hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-sk-line bg-neutral-50">
                    {rl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={rl} alt={r.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-lg">🏢</span>
                    )}
                  </div>
                  <span className="line-clamp-2 text-xs font-bold text-sk-ink group-hover:text-sk-red">{r.name}</span>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
