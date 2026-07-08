import { getCategories, getSettings } from "@/lib/cms";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialIcons";

export async function Footer() {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  const columns =
    settings.footerColumns && settings.footerColumns.length
      ? settings.footerColumns
      : [
          {
            title: "Kategoriler",
            links: categories.slice(0, 8).map((c) => ({ label: c.name, url: `/kategori/${c.slug}` })),
          },
          {
            title: "Keşfet",
            links: [
              { label: "Son Haberler", url: "/" },
              { label: "Tüm Kategoriler", url: "/tum-kategoriler" },
              { label: "Foto Galeri", url: "/galeri" },
              { label: "Resmî İlanlar", url: "/ilanlar" },
              { label: "Firma Rehberi", url: "/firma-rehberi" },
              { label: "Yazarlar", url: "/yazarlar" },
            ],
          },
          {
            title: "Kurumsal",
            links: [
              { label: "Hakkımızda", url: "/hakkimizda" },
              { label: "Künye", url: "/kunye" },
              { label: "İletişim", url: "/iletisim" },
              { label: "RSS", url: "/rss.xml" },
              { label: "Site Haritası", url: "/sitemap.xml" },
            ],
          },
        ];

  const social = [
    { key: "twitter", url: settings.twitter },
    { key: "facebook", url: settings.facebook },
    { key: "instagram", url: settings.instagram },
    { key: "youtube", url: settings.youtube },
    { key: "linkedin", url: settings.linkedin },
  ].filter((s): s is { key: string; url: string } => Boolean(s.url));

  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-sk-ink text-neutral-300">
      {/* Üst kırmızı vurgu */}
      <div className="h-1 bg-sk-red" />

      <div className="mx-auto max-w-[1280px] px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          {/* Marka */}
          <div>
            <Logo className="h-12 w-auto" variant="white" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">
              {settings.footerAbout ??
                "Son Kaynak — gündemi, ekonomiyi ve yereli tarafsız ve hızlı biçimde aktaran yeni nesil haber platformu."}
            </p>
            {social.length > 0 && (
              <div className="mt-5">
                <SocialLinks
                  items={social}
                  itemClassName="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-neutral-300 transition hover:bg-sk-red hover:text-white"
                  iconClassName="h-4 w-4"
                />
              </div>
            )}
          </div>

          {/* Bağlantı sütunları */}
          {columns.map((col, i) => (
            <div key={i}>
              <h4 className="mb-4 text-[13px] font-extrabold uppercase tracking-wider text-white">{col.title}</h4>
              <ul className="space-y-2.5 text-sm">
                {(col.links ?? []).map((l, j) => (
                  <li key={j}>
                    <a
                      href={l.url}
                      className="inline-flex items-center text-neutral-400 transition hover:translate-x-0.5 hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Alt bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-neutral-500 sm:flex-row">
          <p>{settings.footerCopyright ?? `© ${year} Son Kaynak. Tüm hakları saklıdır.`}</p>
          <div className="flex items-center gap-5">
            <a href="/kunye" className="transition hover:text-white">Künye</a>
            <a href="/hakkimizda" className="transition hover:text-white">Hakkımızda</a>
            <a href="/iletisim" className="transition hover:text-white">İletişim</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
