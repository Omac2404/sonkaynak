import {
  getManset,
  getSicakGundem,
  getLatestNews,
  getVitrin,
  getGaleriler,
  getIlanlar,
  getFirmalar,
  getVefat,
  getStories,
  getSecmece,
  getOzel,
  getAuthorsForSlider,
  getTicker,
  mediaUrl,
  newsUrl,
  type News,
} from "@/lib/cms";
import { HeroCard, SideCard, GridCard } from "@/components/NewsCard";
import { categoryUrl } from "@/lib/cms";
import { VefatStrip } from "@/components/VefatStrip";
import { VitrinTabs } from "@/components/VitrinTabs";
import { InfoBar } from "@/components/InfoBar";
import { AuthorsSlider } from "@/components/AuthorsSlider";
import { Ticker } from "@/components/Ticker";
import { getFinance } from "@/lib/finance";

export const revalidate = 60;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-black uppercase tracking-wide text-sk-ink">
      <span className="inline-block h-5 w-1.5 rounded bg-sk-red" />
      {children}
    </h2>
  );
}

export default async function HomePage() {
  const [manset, sicak, latest, vitrin, galeriler, ilanlar, firmalar, vefat, stories, secmece, ozel, authors, ticker, finance] =
    await Promise.all([
      getManset(),
      getSicakGundem(),
      getLatestNews(12),
      getVitrin(),
      getGaleriler(3),
      getIlanlar(4),
      getFirmalar(),
      getVefat(),
      getStories(),
      getSecmece(),
      getOzel(),
      getAuthorsForSlider(20),
      getTicker(),
      getFinance(),
    ]);
  const storyItems = stories.map((s) => s.news).filter((n): n is News => Boolean(n));

  const hero = manset[0] ?? latest[0];
  const sideList = (manset.length > 1 ? manset.slice(1, 5) : latest.slice(1, 5)) as News[];

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      {/* Story'ler */}
      {storyItems.length > 0 && (
        <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
          {storyItems.map((n) => {
            const img = mediaUrl(n.coverImage, "thumbnail");
            return (
              <a key={n.id} href={newsUrl(n)} className="group flex w-20 shrink-0 flex-col items-center gap-1.5 text-center">
                <span className="rounded-full bg-gradient-to-tr from-sk-red to-orange-400 p-[2.5px]">
                  <span className="block rounded-full border-2 border-white">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img} alt={n.title} className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-xl">📰</span>
                    )}
                  </span>
                </span>
                <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-sk-ink group-hover:text-sk-red">{n.title}</span>
              </a>
            );
          })}
        </div>
      )}

      {/* Manşet */}
      {hero && (
        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <HeroCard news={hero} />
          <aside className="flex flex-col divide-y divide-sk-line rounded-xl border border-sk-line">
            {sideList.map((n) => (
              <SideCard key={n.id} news={n} />
            ))}
          </aside>
        </section>
      )}

      {/* İnfobar: hava + finans */}
      <div className="mt-6">
        <InfoBar finance={finance} />
      </div>

      {/* Editör Seçimi şeridi */}
      {ticker.editorSecimi && ticker.editorSecimi.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl">
          <Ticker
            label="Editör Seçimi"
            items={ticker.editorSecimi}
            speed={ticker.editorSecimiSpeed ?? 10}
            color="#1b5e20"
            labelColor="#0f3d15"
          />
        </div>
      )}

      {/* Vefat şeridi */}
      {vefat.length > 0 && (
        <div className="mt-6">
          <VefatStrip items={vefat} />
        </div>
      )}

      {/* Sıcak Gündem */}
      {sicak.length > 0 && (
        <section className="mt-12">
          <SectionTitle>Sıcak Gündem</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-3">
            {sicak.slice(0, 3).map((n) => (
              <GridCard key={n.id} news={n} />
            ))}
          </div>
        </section>
      )}

      {/* Kategori Vitrini (sekmeli) */}
      <VitrinTabs slots={vitrin} />

      {/* Son Haberler */}
      {latest.length > 0 && (
        <section className="mt-12">
          <SectionTitle>Son Haberler</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((n) => (
              <GridCard key={n.id} news={n} />
            ))}
          </div>
        </section>
      )}

      {/* Seçmece Haberler */}
      {secmece.length > 0 && (
        <section className="mt-12">
          <SectionTitle>Seçmece Haberler</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {secmece.slice(0, 8).map((n) => (
              <GridCard key={n.id} news={n} />
            ))}
          </div>
        </section>
      )}

      {/* Yazarlar */}
      {authors.length > 0 && (
        <section className="mt-12">
          <SectionTitle>Yazarlar</SectionTitle>
          <AuthorsSlider authors={authors} />
        </section>
      )}

      {/* Özel Haberler */}
      {ozel.length > 0 && (
        <section className="mt-12">
          <SectionTitle>Özel Haberler</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ozel.slice(0, 6).map((n) => (
              <GridCard key={n.id} news={n} />
            ))}
          </div>
        </section>
      )}

      {/* Foto Galeri */}
      {galeriler.length > 0 && (
        <section className="mt-12">
          <SectionTitle>
            <a href="/galeri" className="hover:text-sk-red">Foto Galeri</a>
          </SectionTitle>
          <div className="grid gap-5 sm:grid-cols-3">
            {galeriler.map((g) => {
              const cover = mediaUrl(g.cover, "card");
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
                    <span className="mb-1 inline-block rounded bg-sk-red px-2 py-0.5 text-[10px] font-bold text-white">📷 {g.items?.length ?? 0}</span>
                    <h3 className="text-base font-bold leading-snug text-white">{g.title}</h3>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Resmî İlanlar */}
      {ilanlar.length > 0 && (
        <section className="mt-12">
          <SectionTitle>
            <a href="/ilanlar" className="hover:text-sk-red">Resmî İlanlar</a>
          </SectionTitle>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ilanlar.map((il) => {
              const cover = mediaUrl(il.coverImage, "card");
              return (
                <a key={il.id} href={`/ilan/${il.slug}`} className="group overflow-hidden rounded-xl border border-sk-line">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt={il.title} className="aspect-[16/9] w-full object-cover" />
                  ) : (
                    <div className="flex aspect-[16/9] w-full items-center justify-center bg-neutral-100 text-3xl">📄</div>
                  )}
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-bold leading-snug text-sk-ink group-hover:text-sk-red">{il.title}</h3>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Firma Rehberi */}
      {firmalar.length > 0 && (
        <section className="mt-12">
          <SectionTitle>
            <a href="/firma-rehberi" className="hover:text-sk-red">Firma Rehberi</a>
          </SectionTitle>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {firmalar.slice(0, 12).map((f) => {
              const logo = mediaUrl(f.logo, "thumbnail");
              return (
                <a key={f.id} href={`/firma/${f.slug}`} className="group flex flex-col items-center gap-2 rounded-xl border border-sk-line p-4 text-center transition hover:shadow-md">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-sk-line bg-neutral-50">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt={f.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xl">🏢</span>
                    )}
                  </div>
                  <span className="line-clamp-2 text-xs font-bold text-sk-ink group-hover:text-sk-red">{f.name}</span>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {manset.length === 0 && latest.length === 0 && (
        <div className="rounded-xl border border-dashed border-sk-line bg-neutral-50 p-8 text-center text-sk-muted">
          Henüz yayınlanmış haber yok. CMS&apos;e içerik ekleyin veya{" "}
          <code>pnpm --filter @sonkaynak/cms seed</code> çalıştırın.
        </div>
      )}
    </div>
  );
}
