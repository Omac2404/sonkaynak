import { getCategories, getSettings } from "@/lib/cms";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialIcons";

export async function Footer() {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  const social = [
    { key: "twitter", url: settings.twitter },
    { key: "facebook", url: settings.facebook },
    { key: "instagram", url: settings.instagram },
    { key: "youtube", url: settings.youtube },
    { key: "linkedin", url: settings.linkedin },
  ].filter((s): s is { key: string; url: string } => Boolean(s.url));

  const year = new Date().getFullYear();

  const columns: { title: string; links: { label: string; url: string }[] }[] = [
    {
      title: "Kategoriler",
      links: categories.slice(0, 9).map((c) => ({ label: c.name, url: `/kategori/${c.slug}` })),
    },
    {
      title: "Keşfet",
      links: [
        { label: "Son Haberler", url: "/" },
        { label: "Tüm Kategoriler", url: "/tum-kategoriler" },
        { label: "Foto Galeri", url: "/galeri" },
        { label: "Yazarlar", url: "/yazarlar" },
        { label: "Firma Rehberi", url: "/firma-rehberi" },
        { label: "Resmî İlanlar", url: "/ilanlar" },
        { label: "Vefat İlanları", url: "/" },
      ],
    },
    {
      title: "Canlı Veri",
      links: [
        { label: "Piyasalar", url: "/piyasalar" },
        { label: "Döviz Kuru", url: "/piyasalar" },
        { label: "Altın Fiyatları", url: "/piyasalar" },
        { label: "BİST 100", url: "/piyasalar" },
        { label: "Bitcoin", url: "/piyasalar" },
        { label: "Kripto Paralar", url: "/piyasalar" },
      ],
    },
    {
      title: "Kurumsal",
      links: [
        { label: "Hakkımızda", url: "/hakkimizda" },
        { label: "Künye", url: "/kunye" },
        { label: "İletişim", url: "/iletisim" },
        { label: "Reklam Ver", url: "/reklam" },
        { label: "Hata Bildir", url: "/hata-bildir" },
      ],
    },
    {
      title: "Yasal & Yardımcı",
      links: [
        { label: "Gizlilik & KVKK", url: "/gizlilik" },
        { label: "Çerez Politikası", url: "/cerez-politikasi" },
        { label: "Kullanım Koşulları", url: "/kullanim-kosullari" },
        { label: "RSS", url: "/rss.xml" },
        { label: "Site Haritası", url: "/sitemap.xml" },
      ],
    },
  ];

  const corporate = [
    { label: "Reklam Ver", url: "/reklam" },
    { label: "Bize Ulaşın", url: "/iletisim" },
    { label: "Kurumsal", url: "/hakkimizda" },
    { label: "Hata Bildirimi", url: "/hata-bildir" },
    { label: "Künye", url: "/kunye" },
  ];

  return (
    <footer className="mt-16 border-t-2 border-sk-red bg-white text-neutral-600">
      <div className="mx-auto max-w-[1360px] px-4">
        {/* Üst satır: logo + telif + sosyal */}
        <div className="flex flex-col items-center justify-between gap-4 border-b border-sk-line py-6 sm:flex-row">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <a href="/" aria-label="Anasayfa">
              <Logo className="h-8 w-auto" />
            </a>
            <span className="text-[12px] text-neutral-400">
              {settings.footerCopyright ?? `© ${year} Son Kaynak Gazetecilik. Tüm hakları saklıdır.`}
            </span>
          </div>
          {social.length > 0 && (
            <SocialLinks
              items={social}
              itemClassName="grid h-9 w-9 place-items-center rounded-full border border-sk-line text-neutral-500 transition hover:border-sk-red hover:bg-sk-red hover:text-white"
              iconClassName="h-4 w-4"
            />
          )}
        </div>

        {/* Bağlantı sütunları */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-9 sm:grid-cols-3 lg:grid-cols-5">
          {columns.map((col, i) => (
            <div key={i}>
              <h4 className="mb-3.5 text-[13px] font-extrabold uppercase tracking-wide text-sk-ink">{col.title}</h4>
              <ul className="space-y-2.5 text-[13.5px]">
                {col.links.map((l, j) => (
                  <li key={j}>
                    <a href={l.url} className="text-neutral-600 transition hover:text-sk-red">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Kurumsal satır */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-sk-line py-5 text-[13px] font-bold text-sk-ink">
          {corporate.map((l) => (
            <a key={l.url} href={l.url} className="transition hover:text-sk-red">
              {l.label}
            </a>
          ))}
        </div>

        {/* Telif paragrafı */}
        <p className="border-t border-sk-line py-5 text-[12px] leading-relaxed text-neutral-400">
          Türkiye&apos;den ve dünyadan son dakika haberleri, köşe yazıları, ekonomiden spora tüm içerikler Son Kaynak&apos;ta.
          Son Kaynak haber içerikleri, kaynak gösterilse dahi izin alınmadan iktibas edilemez; kanuna aykırı ve izinsiz olarak
          kopyalanamaz, başka yerde yayınlanamaz.
        </p>
      </div>
    </footer>
  );
}
