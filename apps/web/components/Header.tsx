import { getCategories, getAnaMenu, getTicker, getSettings } from "@/lib/cms";
import { Ticker } from "./Ticker";
import { HeaderSearch } from "./HeaderSearch";

export async function Header() {
  const [menu, categories, ticker, settings] = await Promise.all([
    getAnaMenu(),
    getCategories(),
    getTicker(),
    getSettings(),
  ]);
  // Ana Menü global'i doluysa onu kullan, değilse tüm kategoriler
  const navCategories = menu.length ? menu : categories;

  const siteName = settings.siteName ?? "Son Kaynak";
  const today = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <>
      {/* Üst bilgi çubuğu */}
      <div className="border-b border-sk-line bg-neutral-50 text-xs text-sk-muted">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 py-2">
          <span className="capitalize">{today}</span>
          <nav className="hidden gap-4 sm:flex">
            <a href="/ara">Arama</a>
            <a href="/kunye">Künye</a>
            <a href="/iletisim">İletişim</a>
          </nav>
        </div>
      </div>

      {/* Son dakika */}
      <Ticker items={ticker.sonDakika ?? []} speed={ticker.sonDakikaSpeed ?? 10} />

      {/* Masthead */}
      <header className="border-b border-sk-line">
        <div className="mx-auto grid max-w-[1240px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-6">
          <div className="hidden md:block" />
          <a href="/" className="flex items-baseline justify-center gap-1" aria-label={siteName}>
            <span className="text-4xl font-black tracking-tight text-sk-ink">SON</span>
            <span className="text-4xl font-black tracking-tight text-sk-red">KAYNAK</span>
          </a>
          <div className="flex justify-end">
            <HeaderSearch />
          </div>
        </div>
      </header>

      {/* Kategori menüsü */}
      <nav className="sticky top-0 z-20 border-b border-sk-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1240px] items-center gap-1 overflow-x-auto px-4">
          <a
            href="/"
            className="whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-bold text-sk-ink transition hover:border-sk-red hover:text-sk-red"
          >
            Anasayfa
          </a>
          {navCategories.map((c) => (
            <a
              key={c.id}
              href={`/kategori/${c.slug}`}
              className="whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-bold text-sk-ink transition hover:border-sk-red hover:text-sk-red"
            >
              {c.name}
            </a>
          ))}
          <span className="mx-1 h-4 w-px self-center bg-sk-line" />
          {[
            { href: "/galeri", label: "Galeri" },
            { href: "/ilanlar", label: "İlanlar" },
            { href: "/firma-rehberi", label: "Firmalar" },
            { href: "/yazarlar", label: "Yazarlar" },
            { href: "/tum-kategoriler", label: "Tüm Kategoriler" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-bold text-sk-muted transition hover:border-sk-red hover:text-sk-red"
            >
              {l.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
