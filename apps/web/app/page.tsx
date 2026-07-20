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
  getGozdenKacmasin,
  getAuthorsForSlider,
  getTicker,
  getTrendingTags,
  getCategories,
  getNewsByCategory,
  categoryUrl,
  categoryColor,
  mediaUrl,
  newsUrl,
  type News,
} from "@/lib/cms";
import { PosterCard, SideCard, GridCard } from "@/components/NewsCard";
import { MansetSlider } from "@/components/MansetSlider";
import { VefatStrip } from "@/components/VefatStrip";
import { VitrinTabs } from "@/components/VitrinTabs";
import { InfoBar } from "@/components/InfoBar";
import { AuthorsSlider } from "@/components/AuthorsSlider";
import { StoryBar } from "@/components/StoryBar";
import { TrendBar } from "@/components/TrendBar";
import { Ticker } from "@/components/Ticker";
import { getFinance } from "@/lib/finance";

export const revalidate = 60;

function SectionTitle({ children, href, color = "#d4141c" }: { children: React.ReactNode; href?: string; color?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3 border-b-2 border-sk-ink pb-1.5">
      <h2 className="text-[17px] font-black uppercase leading-none tracking-tight text-sk-ink sm:text-xl">
        <span className="inline-block border-b-[3px] pb-[7px]" style={{ borderColor: color }}>{children}</span>
      </h2>
      {href && (
        <a href={href} className="shrink-0 pb-0.5 text-[12px] font-bold transition hover:underline" style={{ color }}>
          Tümü ›
        </a>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [manset, sicak, latest, vitrin, galeriler, ilanlar, firmalar, vefat, stories, secmece, ozel, gozden, authors, ticker, finance, trending] =
    await Promise.all([
      getManset(),
      getSicakGundem(),
      getLatestNews(24),
      getVitrin(),
      getGaleriler(4),
      getIlanlar(4),
      getFirmalar(),
      getVefat(),
      getStories(),
      getSecmece(),
      getOzel(),
      getGozdenKacmasin(),
      getAuthorsForSlider(20),
      getTicker(),
      getFinance(),
      getTrendingTags(8),
    ]);
  const storyItems = stories.map((s) => s.news).filter((n): n is News => Boolean(n));

  // Manşet slider: önce manşet kürasyonu, ardından en yeni haberlerle 19'a tamamla
  const sliderPool: News[] = [...(manset as News[])];
  for (const n of latest) {
    if (sliderPool.length >= 19) break;
    if (!sliderPool.some((p) => p.id === n.id)) sliderPool.push(n);
  }
  const sliderItems = sliderPool.slice(0, 19);
  // Yan kartlar: slider'da olmayan en yeni haberler
  const sideList = latest.filter((n) => !sliderItems.some((s) => s.id === n.id)).slice(0, 5);
  // Sıcak Gündem: kürasyon boşsa en yeni haberlerle doldur
  const sicakItems = (sicak.length ? sicak : latest).slice(0, 3);

  // Her kategoriden en son 5 haber
  const categories = await getCategories();
  const categoryBlocks = (
    await Promise.all(
      categories.map(async (c) => ({ cat: c, items: (await getNewsByCategory(c.id, 1, 5)).docs })),
    )
  ).filter((b) => b.items.length > 0);

  return (
    <>
      {/* Bugün neler oldu? — tam genişlik, kayan trend etiketler */}
      {trending.length > 0 && <TrendBar tags={trending} />}

      <div className="mx-auto max-w-[1360px] px-3 py-4 sm:px-4 sm:py-6">
      {/* Story'ler — yalnızca mobil, tıklayınca tam ekran görüntüleyici */}
      {storyItems.length > 0 && <StoryBar items={storyItems} />}

      {/* Sıcak Gündem — desenli kırmızı zemin üstünde 3 büyük poster */}
      {sicakItems.length > 0 && (
        <section className="sk-hot-bg mb-6 overflow-hidden rounded-lg p-3 shadow-sm sm:p-4">
          <div className="mb-3 flex items-center gap-2 text-white">
            <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-white shadow" />
            <span className="text-[15px] font-black uppercase tracking-wide drop-shadow-sm">Sıcak Gündem</span>
            <span className="ml-1 h-px flex-1 bg-white/25" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {sicakItems.map((n) => (
              <PosterCard key={n.id} news={n} />
            ))}
          </div>
        </section>
      )}

      {/* Manşet slider (sol) + yan kartlar (sağ) */}
      {sliderItems.length > 0 && (
        <section className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <MansetSlider items={sliderItems} />
          <aside className="flex flex-col divide-y divide-sk-line overflow-hidden rounded-lg border border-sk-line">
            {sideList.map((n) => (
              <SideCard key={n.id} news={n} />
            ))}
          </aside>
        </section>
      )}

      {/* İnfobar: hava + finans */}
      <div className="mt-5">
        <InfoBar finance={finance} />
      </div>

      {/* Editör Seçimi şeridi */}
      {ticker.editorSecimi && ticker.editorSecimi.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-lg">
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
        <div className="mt-5">
          <VefatStrip items={vefat} />
        </div>
      )}

      {/* Gözden Kaçmasın (admin'den seçilir) */}
      {gozden.length > 0 && (
        <section className="mt-8">
          <SectionTitle color="#0891b2">Gözden Kaçmasın</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {gozden.slice(0, 10).map((n) => (
              <GridCard key={n.id} news={n} />
            ))}
          </div>
        </section>
      )}

      {/* Kategori Vitrini (sekmeli) */}
      <VitrinTabs slots={vitrin} />

      {/* Son Haberler */}
      {latest.length > 0 && (
        <section className="mt-8">
          <SectionTitle color="#16181d">Son Haberler</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {latest.slice(0, 15).map((n) => (
              <GridCard key={n.id} news={n} />
            ))}
          </div>
        </section>
      )}

      {/* Her kategoriden son 5 haber */}
      {categoryBlocks.map(({ cat, items }) => (
        <section key={cat.id} className="mt-8">
          <SectionTitle href={categoryUrl(cat)} color={categoryColor(cat)}>
            {cat.name}
          </SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {items.map((n) => (
              <GridCard key={n.id} news={n} />
            ))}
          </div>
        </section>
      ))}

      {/* Seçmece Haberler */}
      {secmece.length > 0 && (
        <section className="mt-8">
          <SectionTitle color="#1d4ed8">Seçmece Haberler</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {secmece.slice(0, 10).map((n) => (
              <GridCard key={n.id} news={n} />
            ))}
          </div>
        </section>
      )}

      {/* Yazarlar */}
      {authors.length > 0 && (
        <section className="mt-8">
          <SectionTitle href="/yazarlar">Yazarlar</SectionTitle>
          <AuthorsSlider authors={authors} />
        </section>
      )}

      {/* Özel Haberler */}
      {ozel.length > 0 && (
        <section className="mt-8">
          <SectionTitle color="#7c3aed">Özel Haberler</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ozel.slice(0, 8).map((n) => (
              <GridCard key={n.id} news={n} />
            ))}
          </div>
        </section>
      )}

      {/* Foto Galeri */}
      {galeriler.length > 0 && (
        <section className="mt-8">
          <SectionTitle href="/galeri" color="#16a34a">Foto Galeri</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {galeriler.map((g) => {
              const cover = mediaUrl(g.cover, "card");
              return (
                <a key={g.id} href={`/galeri/${g.slug}`} className="group relative block overflow-hidden rounded-lg">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt={g.title} className="aspect-[4/3] w-full object-cover transition group-hover:scale-105" />
                  ) : (
                    <div className="aspect-[4/3] w-full bg-neutral-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 15l4-4 5 5M14 13l3-3 4 4" />
                      <circle cx="8.5" cy="9.5" r="1.5" />
                    </svg>
                  </span>
                  <div className="absolute bottom-0 p-4">
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
        <section className="mt-8">
          <SectionTitle href="/ilanlar" color="#b45309">Resmî İlanlar</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ilanlar.map((il) => {
              const cover = mediaUrl(il.coverImage, "card");
              return (
                <a key={il.id} href={`/ilan/${il.slug}`} className="group overflow-hidden rounded-lg border border-sk-line">
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
        <section className="mt-8">
          <SectionTitle href="/firma-rehberi" color="#0d9488">Firma Rehberi</SectionTitle>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {firmalar.slice(0, 16).map((f) => {
              const logo = mediaUrl(f.logo, "thumbnail");
              return (
                <a key={f.id} href={`/firma/${f.slug}`} className="group flex flex-col items-center gap-2 rounded-lg border border-sk-line p-3 text-center transition hover:shadow-md">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-sk-line bg-neutral-50">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt={f.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xl">🏢</span>
                    )}
                  </div>
                  <span className="line-clamp-2 text-[11px] font-bold text-sk-ink group-hover:text-sk-red">{f.name}</span>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {manset.length === 0 && latest.length === 0 && (
        <div className="rounded-xl border border-dashed border-sk-line bg-neutral-50 p-8 text-center text-sk-muted">
          İçerikler çok yakında burada olacak.
        </div>
      )}
      </div>
    </>
  );
}
