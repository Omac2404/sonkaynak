import { getCategories, getAnaMenu, getTicker, getSettings } from "@/lib/cms";
import { Ticker } from "./Ticker";
import { HeaderSearch } from "./HeaderSearch";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialIcons";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";
import { StickyHeader } from "./StickyHeader";

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
        <div className="mx-auto flex h-9 max-w-[1360px] items-center justify-between px-4 text-[12.5px] text-sk-muted">
          <span className="truncate capitalize">{today}</span>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-4 font-medium sm:flex">
              <a href="/kunye" className="transition hover:text-sk-red">Künye</a>
              <a href="/iletisim" className="transition hover:text-sk-red">İletişim</a>
            </nav>
            {social.length > 0 && <span className="hidden h-4 w-px bg-sk-line sm:block" />}
            <SocialLinks items={social} itemClassName="grid h-7 w-7 place-items-center rounded-full text-sk-muted transition hover:bg-sk-red hover:text-white" />
            <span className="h-4 w-px bg-sk-line" />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Scroll'da beliren yapışkan kompakt header */}
      <StickyHeader categories={navCategories} secondary={secondary} />

      {/* Son dakika */}
      <Ticker items={ticker.sonDakika ?? []} speed={ticker.sonDakikaSpeed ?? 10} />

      {/* Masthead + menü (tek satır) */}
      <header className="border-b border-sk-line bg-white">
        <div className="mx-auto flex max-w-[1360px] items-center gap-4 px-4 py-3">
          {/* Mobil hamburger */}
          <div className="lg:hidden">
            <MobileNav categories={navCategories} secondary={secondary} utility={utility} social={social} />
          </div>

          {/* Logo (mobilde ortalı, masaüstünde solda) */}
          <a href="/" aria-label="Son Kaynak — Anasayfa" className="mx-auto shrink-0 lg:mx-0">
            <Logo className="h-8 w-auto sm:h-9 lg:h-11" priority />
          </a>

          {/* Masaüstü menü — logonun yanında */}
          <nav className="hidden flex-1 items-center gap-0.5 overflow-x-auto lg:flex">
            <a
              href="/"
              className="whitespace-nowrap px-3 py-2 text-[14px] font-bold text-sk-ink transition hover:text-sk-red"
            >
              Anasayfa
            </a>
            {navCategories.map((c) => (
              <a
                key={c.id}
                href={`/kategori/${c.slug}`}
                className="whitespace-nowrap px-3 py-2 text-[14px] font-bold text-sk-ink transition hover:text-sk-red"
              >
                {c.name}
              </a>
            ))}
            {secondary.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="whitespace-nowrap px-3 py-2 text-[14px] font-semibold text-sk-muted transition hover:text-sk-red"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Masaüstü arama */}
          <div className="hidden shrink-0 lg:flex">
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
    </>
  );
}
