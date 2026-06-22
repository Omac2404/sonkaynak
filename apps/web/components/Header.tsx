import { getCategories, getAnaMenu, getTicker, getSettings } from "@/lib/cms";
import { Ticker } from "./Ticker";
import { HeaderSearch } from "./HeaderSearch";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialIcons";
import { MobileNav } from "./MobileNav";

export async function Header() {
  const [menu, categories, ticker, settings] = await Promise.all([
    getAnaMenu(),
    getCategories(),
    getTicker(),
    getSettings(),
  ]);
  const navCategories = menu.length ? menu : categories;

  const today = new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const social = [
    { key: "twitter", url: settings.twitter },
    { key: "facebook", url: settings.facebook },
    { key: "instagram", url: settings.instagram },
    { key: "youtube", url: settings.youtube },
  ].filter((s): s is { key: string; url: string } => Boolean(s.url));

  const secondary = [
    { href: "/galeri", label: "Galeri" },
    { href: "/ilanlar", label: "İlanlar" },
    { href: "/firma-rehberi", label: "Firmalar" },
    { href: "/yazarlar", label: "Yazarlar" },
    { href: "/tum-kategoriler", label: "Tümü" },
  ];
  const utility = [
    { href: "/kunye", label: "Künye" },
    { href: "/iletisim", label: "İletişim" },
  ];

  return (
    <>
      {/* Üst bilgi çubuğu */}
      <div className="border-b border-sk-line bg-white">
        <div className="mx-auto flex h-9 max-w-[1280px] items-center justify-between px-4 text-[12.5px] text-sk-muted">
          <span className="truncate capitalize">{today}</span>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-4 font-medium sm:flex">
              <a href="/kunye" className="transition hover:text-sk-red">Künye</a>
              <a href="/iletisim" className="transition hover:text-sk-red">İletişim</a>
            </nav>
            {social.length > 0 && <span className="hidden h-4 w-px bg-sk-line sm:block" />}
            <SocialLinks items={social} itemClassName="grid h-7 w-7 place-items-center rounded-full text-sk-muted transition hover:bg-sk-red hover:text-white" />
          </div>
        </div>
      </div>

      {/* Son dakika */}
      <Ticker items={ticker.sonDakika ?? []} speed={ticker.sonDakikaSpeed ?? 10} />

      {/* Masthead */}
      <header className="border-b border-sk-line bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center gap-3 px-4 py-4 sm:py-5">
          {/* Mobil hamburger */}
          <div className="lg:hidden">
            <MobileNav categories={navCategories} secondary={secondary} utility={utility} social={social} />
          </div>

          {/* Logo (mobilde ortalı, masaüstünde solda) */}
          <a href="/" aria-label="Son Kaynak — Anasayfa" className="mx-auto lg:mx-0">
            <Logo className="h-9 w-auto sm:h-11 lg:h-14" priority />
          </a>

          {/* Masaüstü arama */}
          <div className="hidden flex-1 justify-end lg:flex">
            <HeaderSearch />
          </div>

          {/* Mobil arama ikonu */}
          <a
            href="/ara"
            aria-label="Ara"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sk-ink transition hover:bg-neutral-100 lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </a>
        </div>
      </header>

      {/* Kategori menüsü — yalnızca masaüstü (mobilde hamburger var) */}
      <nav className="sticky top-0 z-30 hidden border-b border-sk-line bg-white/90 backdrop-blur lg:block">
        <div className="mx-auto flex max-w-[1280px] items-center gap-1 px-4">
          <a href="/" aria-label="Anasayfa" className="mr-1 shrink-0 py-2">
            <Logo className="h-6 w-auto" />
          </a>
          <div className="flex flex-1 items-center gap-0.5 overflow-x-auto">
            <a
              href="/"
              className="whitespace-nowrap border-b-[3px] border-transparent px-3 py-3 text-[13.5px] font-bold text-sk-ink transition hover:border-sk-red hover:text-sk-red"
            >
              Anasayfa
            </a>
            {navCategories.map((c) => (
              <a
                key={c.id}
                href={`/kategori/${c.slug}`}
                className="whitespace-nowrap border-b-[3px] border-transparent px-3 py-3 text-[13.5px] font-bold text-sk-ink transition hover:border-sk-red hover:text-sk-red"
              >
                {c.name}
              </a>
            ))}
            <span className="mx-1.5 h-4 w-px shrink-0 self-center bg-sk-line" />
            {secondary.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="whitespace-nowrap border-b-[3px] border-transparent px-3 py-3 text-[13.5px] font-semibold text-sk-muted transition hover:border-sk-red hover:text-sk-red"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
