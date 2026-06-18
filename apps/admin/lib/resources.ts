/** Liste görünümleri için koleksiyon yapılandırması. */
export type Column = { key: string; label: string; type?: "text" | "image" | "status" | "date" | "rel" | "badge"; relField?: string };
export type Resource = {
  slug: string;
  title: string;
  singular: string;
  columns: Column[];
  depth?: number;
  sort?: string;
};

export const RESOURCES: Record<string, Resource> = {
  haberler: {
    slug: "news",
    title: "Haberler",
    singular: "Haber",
    depth: 1,
    sort: "-createdAt",
    columns: [
      { key: "coverImage", label: "", type: "image" },
      { key: "title", label: "Başlık", type: "text" },
      { key: "category", label: "Kategori", type: "rel", relField: "name" },
      { key: "reviewState", label: "Onay", type: "badge" },
      { key: "_status", label: "Durum", type: "status" },
      { key: "publishedAt", label: "Tarih", type: "date" },
    ],
  },
  kategoriler: {
    slug: "categories",
    title: "Kategoriler",
    singular: "Kategori",
    sort: "order",
    columns: [
      { key: "name", label: "Ad", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
      { key: "order", label: "Sıra", type: "text" },
    ],
  },
  etiketler: {
    slug: "tags",
    title: "Etiketler",
    singular: "Etiket",
    columns: [
      { key: "name", label: "Ad", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
    ],
  },
  yazarlar: {
    slug: "authors",
    title: "Yazarlar",
    singular: "Yazar",
    depth: 1,
    columns: [
      { key: "avatar", label: "", type: "image" },
      { key: "fullName", label: "Ad Soyad", type: "text" },
      { key: "title", label: "Unvan", type: "text" },
      { key: "slug", label: "Slug", type: "text" },
    ],
  },
  ilanlar: {
    slug: "ilanlar",
    title: "İlanlar",
    singular: "İlan",
    depth: 1,
    sort: "-createdAt",
    columns: [
      { key: "coverImage", label: "", type: "image" },
      { key: "title", label: "Başlık", type: "text" },
      { key: "_status", label: "Durum", type: "status" },
      { key: "createdAt", label: "Tarih", type: "date" },
    ],
  },
  firmalar: {
    slug: "firmalar",
    title: "Firmalar",
    singular: "Firma",
    depth: 1,
    columns: [
      { key: "logo", label: "", type: "image" },
      { key: "name", label: "Firma", type: "text" },
      { key: "category", label: "Kategori", type: "text" },
      { key: "phone", label: "Telefon", type: "text" },
      { key: "_status", label: "Durum", type: "status" },
    ],
  },
  galeriler: {
    slug: "galeriler",
    title: "Galeriler",
    singular: "Galeri",
    depth: 1,
    sort: "-createdAt",
    columns: [
      { key: "cover", label: "", type: "image" },
      { key: "title", label: "Başlık", type: "text" },
      { key: "category", label: "Kategori", type: "text" },
      { key: "_status", label: "Durum", type: "status" },
    ],
  },
  vefat: {
    slug: "vefat",
    title: "Vefat İlanları",
    singular: "Vefat İlanı",
    sort: "order",
    columns: [
      { key: "isim", label: "İsim", type: "text" },
      { key: "aciklama", label: "Açıklama", type: "text" },
      { key: "aktif", label: "Aktif", type: "badge" },
    ],
  },
  storyler: {
    slug: "stories",
    title: "Storyler",
    singular: "Story",
    depth: 2,
    sort: "order",
    columns: [
      { key: "news", label: "Haber", type: "rel", relField: "title" },
      { key: "order", label: "Sıra", type: "text" },
    ],
  },
  kullanicilar: {
    slug: "users",
    title: "Kullanıcılar",
    singular: "Kullanıcı",
    columns: [
      { key: "name", label: "Ad", type: "text" },
      { key: "email", label: "E-posta", type: "text" },
      { key: "role", label: "Rol", type: "badge" },
    ],
  },
};
