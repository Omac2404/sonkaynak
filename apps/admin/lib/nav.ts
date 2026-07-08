export type Role = "admin" | "editor" | "editor_limited" | "yazar";
export type NavItem = { href: string; label: string; icon: string; roles?: Role[] };
export type NavGroup = { title: string; items: NavItem[] };

// Kısayollar
const EDITORIAL: Role[] = ["admin", "editor", "editor_limited"];
const SENIOR: Role[] = ["admin", "editor"];
const ADMIN_ONLY: Role[] = ["admin"];

/** Bir rolün göreceği menü gruplarını döndürür (admin her şeyi görür). */
export function navForRole(role: Role): NavGroup[] {
  return NAV.map((g) => ({
    ...g,
    items: g.items.filter((it) => role === "admin" || !it.roles || it.roles.includes(role)),
  })).filter((g) => g.items.length > 0);
}

/** İzin listesine göre menü (dinamik roller). '*' = hepsi. */
export function navForPerms(perms: string[]): NavGroup[] {
  const has = (key: string) => perms.includes("*") || perms.includes(key);
  return NAV.map((g) => ({
    ...g,
    items: g.items.filter((it) => it.href === "/" || has(it.href.replace(/^\//, ""))),
  })).filter((g) => g.items.length > 0);
}

/** Sol menü yapısı (sonkaynak-panel.php düzeninden ilham, modernleştirildi). */
export const NAV: NavGroup[] = [
  {
    title: "Genel",
    items: [{ href: "/", label: "Kontrol Paneli", icon: "grid" }],
  },
  {
    title: "İçerik",
    items: [
      { href: "/haberler", label: "Haberler", icon: "news" },
      { href: "/haberler/yeni", label: "Haber Yaz", icon: "pen" },
      { href: "/kategoriler", label: "Kategoriler", icon: "folder", roles: EDITORIAL },
      { href: "/etiketler", label: "Etiketler", icon: "tag", roles: EDITORIAL },
      { href: "/yazarlar", label: "Yazarlar", icon: "user", roles: SENIOR },
      { href: "/medya", label: "Medya", icon: "image" },
    ],
  },
  {
    title: "Diğer İçerik",
    items: [
      { href: "/ilanlar", label: "İlanlar", icon: "doc", roles: EDITORIAL },
      { href: "/firmalar", label: "Firmalar", icon: "building", roles: EDITORIAL },
      { href: "/galeriler", label: "Galeriler", icon: "images", roles: EDITORIAL },
    ],
  },
  {
    title: "Kürasyon",
    items: [
      { href: "/manset", label: "Manşet", icon: "star", roles: SENIOR },
      { href: "/sicak-gundem", label: "Sıcak Gündem", icon: "flame", roles: SENIOR },
      { href: "/secmece", label: "Seçmece", icon: "star", roles: SENIOR },
      { href: "/gozden-kacmasin", label: "Gözden Kaçmasın", icon: "star", roles: SENIOR },
      { href: "/ozel", label: "Özel Haberler", icon: "star", roles: SENIOR },
      { href: "/vitrin", label: "Kategori Vitrini", icon: "layout", roles: SENIOR },
      { href: "/ticker", label: "Kayan Şeritler", icon: "ticker", roles: SENIOR },
      { href: "/ana-menu", label: "Ana Menü", icon: "menu", roles: SENIOR },
      { href: "/storyler", label: "Storyler", icon: "circle", roles: SENIOR },
      { href: "/vefat", label: "Vefat İlanları", icon: "dove", roles: EDITORIAL },
    ],
  },
  {
    title: "Yönetim",
    items: [
      { href: "/onay-bekleyenler", label: "Onay Bekleyenler", icon: "check", roles: EDITORIAL },
      { href: "/arsiv", label: "Arşiv / Çöp Kutusu", icon: "doc", roles: EDITORIAL },
      { href: "/kullanicilar", label: "Kullanıcılar", icon: "users", roles: ADMIN_ONLY },
      { href: "/roller", label: "Roller", icon: "users", roles: ADMIN_ONLY },
      { href: "/ayarlar", label: "Site Ayarları", icon: "cog", roles: ADMIN_ONLY },
      { href: "/test-uret", label: "Test İçeriği Üret", icon: "grid", roles: ADMIN_ONLY },
    ],
  },
];
