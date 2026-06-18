export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "status"
  | "checkbox"
  | "image"
  | "images"
  | "richtext"
  | "email"
  | "url"
  | "password"
  | "reldropdown";

export type FormField = {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  side?: boolean; // kenar çubuğuna yerleştir
};

export type FormSchema = {
  slug: string;
  title: string;
  singular: string;
  fields: FormField[];
};

const STATUS: FormField = {
  name: "_status",
  label: "Durum",
  type: "status",
  side: true,
  options: [
    { value: "published", label: "Yayında" },
    { value: "draft", label: "Taslak" },
  ],
};

export const FORM_SCHEMAS: Record<string, FormSchema> = {
  kategoriler: {
    slug: "categories",
    title: "Kategoriler",
    singular: "Kategori",
    fields: [
      { name: "name", label: "Kategori Adı", type: "text", required: true },
      { name: "description", label: "Açıklama", type: "textarea" },
      { name: "order", label: "Menü Sırası", type: "number", side: true },
    ],
  },
  etiketler: {
    slug: "tags",
    title: "Etiketler",
    singular: "Etiket",
    fields: [{ name: "name", label: "Etiket Adı", type: "text", required: true }],
  },
  yazarlar: {
    slug: "authors",
    title: "Yazarlar",
    singular: "Yazar",
    fields: [
      { name: "name", label: "Ad", type: "text", required: true },
      { name: "surname", label: "Soyad", type: "text", required: true },
      { name: "title", label: "Unvan", type: "text" },
      { name: "email", label: "E-posta", type: "email" },
      { name: "bio", label: "Biyografi", type: "textarea" },
      { name: "avatar", label: "Profil Görseli", type: "image", side: true },
      { name: "twitter", label: "X / Twitter", type: "text" },
      { name: "instagram", label: "Instagram", type: "text" },
      { name: "facebook", label: "Facebook", type: "text" },
      { name: "linkedin", label: "LinkedIn", type: "text" },
    ],
  },
  firmalar: {
    slug: "firmalar",
    title: "Firmalar",
    singular: "Firma",
    fields: [
      { name: "name", label: "Firma Adı", type: "text", required: true },
      { name: "category", label: "Kategori", type: "text" },
      { name: "description", label: "Firma Hakkında", type: "textarea" },
      { name: "address", label: "Adres", type: "textarea" },
      { name: "logo", label: "Logo", type: "image", side: true },
      STATUS,
      { name: "phone", label: "Telefon", type: "text" },
      { name: "email", label: "E-posta", type: "email" },
      { name: "website", label: "Web Sitesi", type: "url" },
    ],
  },
  ilanlar: {
    slug: "ilanlar",
    title: "İlanlar",
    singular: "İlan",
    fields: [
      { name: "title", label: "İlan Başlığı", type: "text", required: true },
      { name: "body", label: "İlan Metni", type: "richtext" },
      { name: "coverImage", label: "Kapak Görseli", type: "image", side: true },
      STATUS,
    ],
  },
  galeriler: {
    slug: "galeriler",
    title: "Galeriler",
    singular: "Galeri",
    fields: [
      { name: "title", label: "Galeri Başlığı", type: "text", required: true },
      { name: "excerpt", label: "Özet", type: "textarea" },
      { name: "category", label: "Kategori", type: "text" },
      { name: "items", label: "Fotoğraflar", type: "images" },
      { name: "cover", label: "Kapak Görseli", type: "image", side: true },
      STATUS,
    ],
  },
  vefat: {
    slug: "vefat",
    title: "Vefat İlanları",
    singular: "Vefat İlanı",
    fields: [
      { name: "isim", label: "İsim", type: "text", required: true },
      { name: "aciklama", label: "Açıklama", type: "text" },
      { name: "haberUrl", label: "Haber Bağlantısı (URL)", type: "url" },
      { name: "aktif", label: "Aktif", type: "checkbox", side: true },
      { name: "order", label: "Sıra", type: "number", side: true },
    ],
  },
  kullanicilar: {
    slug: "users",
    title: "Kullanıcılar",
    singular: "Kullanıcı",
    fields: [
      { name: "name", label: "Ad Soyad", type: "text", required: true },
      { name: "email", label: "E-posta", type: "email", required: true },
      { name: "password", label: "Şifre", type: "password", hint: "Düzenlemede boş bırakılırsa değişmez." },
      {
        name: "role",
        label: "Temel Rol (API güvenliği)",
        type: "select",
        side: true,
        options: [
          { value: "admin", label: "Admin" },
          { value: "editor", label: "Editör" },
          { value: "editor_limited", label: "Sınırlı Editör" },
          { value: "yazar", label: "Yazar" },
        ],
      },
      {
        name: "roleRef",
        label: "Özel Rol (panel izinleri)",
        type: "reldropdown",
        side: true,
        hint: "Boşsa temel rolün varsayılan izinleri kullanılır.",
      },
    ],
  },
};
