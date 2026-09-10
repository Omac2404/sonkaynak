/** Panel izin bölümleri (rol oluşturma ekranında gösterilir). */
export const SECTION_GROUPS: { title: string; perms: [string, string][] }[] = [
  {
    title: "İçerik",
    perms: [
      ["haberler", "Haberler"],
      ["haberler/yeni", "Haber Yaz"],
      ["kategoriler", "Kategoriler"],
      ["etiketler", "Etiketler"],
      ["yazarlar", "Yazarlar"],
      ["medya", "Medya"],
    ],
  },
  {
    title: "Diğer İçerik",
    perms: [
      ["ilanlar", "İlanlar"],
      ["firmalar", "Firmalar"],
      ["galeriler", "Galeriler"],
      ["reklamlar", "Reklamlar"],
    ],
  },
  {
    title: "Kürasyon",
    perms: [
      ["manset", "Manşet"],
      ["bugun-neler-oldu", "Bugün Neler Oldu"],
      ["sicak-gundem", "Sıcak Gündem"],
      ["secmece", "Seçmece"],
      ["gozden-kacmasin", "Gözden Kaçmasın"],
      ["ozel", "Özel Haberler"],
      ["vitrin", "Vitrin"],
      ["ticker", "Ticker"],
      ["ana-menu", "Ana Menü"],
      ["storyler", "Storyler"],
      ["vefat", "Vefat"],
    ],
  },
  {
    title: "Yönetim",
    perms: [
      ["onay-bekleyenler", "Onay Bekleyenler"],
      ["arsiv", "Arşiv"],
      ["kullanicilar", "Kullanıcılar"],
      ["roller", "Roller"],
      ["ajanslar", "Haber Ajansları"],
      ["ayarlar", "Site Ayarları"],
    ],
  },
];

export const ALL_PERMS = SECTION_GROUPS.flatMap((g) => g.perms.map((p) => p[0]));

/** Sistem rolleri için varsayılan izinler (roleRef yoksa kullanılır). */
export const DEFAULT_PERMS: Record<string, string[]> = {
  admin: ["*"],
  editor: ALL_PERMS.filter((p) => !["kullanicilar", "roller", "ayarlar", "ajanslar"].includes(p)),
  editor_limited: ["haberler", "haberler/yeni", "medya", "ilanlar", "galeriler", "onay-bekleyenler", "arsiv"],
  yazar: ["haberler", "haberler/yeni", "medya"],
};

export function hasPerm(perms: string[], key: string): boolean {
  return perms.includes("*") || perms.includes(key);
}
