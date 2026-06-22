import type { GlobalConfig } from "payload";
import { editorialOnly } from "../access/roles";
import { revalidateWeb } from "../lib/revalidate";

const baseAccess = {
  read: () => true,
  update: editorialOnly,
};

// Kürasyon değişince web önbelleğini anında tazele (anasayfa manşet/vitrin vb.)
const curationHooks = { afterChange: [async () => { await revalidateWeb(); }] };

/** Manşet — anasayfa büyük slider sırası */
export const Manset: GlobalConfig = {
  slug: "manset",
  label: "Manşet",
  admin: { group: "Kürasyon" },
  access: baseAccess,
  hooks: curationHooks,
  fields: [
    {
      name: "items",
      label: "Manşet Haberleri",
      type: "array",
      maxRows: 10,
      labels: { singular: "Haber", plural: "Haberler" },
      fields: [
        { name: "news", type: "relationship", relationTo: "news", required: true },
      ],
    },
  ],
};

/** Sıcak Gündem — 3 öne çıkan haber */
export const SicakGundem: GlobalConfig = {
  slug: "sicak-gundem",
  label: "Sıcak Gündem",
  admin: { group: "Kürasyon" },
  access: baseAccess,
  hooks: curationHooks,
  fields: [
    {
      name: "items",
      label: "Sıcak Gündem Haberleri",
      type: "array",
      maxRows: 6,
      fields: [
        { name: "news", type: "relationship", relationTo: "news", required: true },
      ],
    },
  ],
};

/** Seçmece Haberler — anasayfa seçmece bloğu */
export const Secmece: GlobalConfig = {
  slug: "secmece",
  label: "Seçmece Haberler",
  admin: { group: "Kürasyon" },
  access: baseAccess,
  hooks: curationHooks,
  fields: [
    {
      name: "items",
      label: "Seçmece Haberler",
      type: "array",
      maxRows: 12,
      fields: [{ name: "news", type: "relationship", relationTo: "news", required: true }],
    },
  ],
};

/** Özel Haberler — anasayfa özel bloğu */
export const Ozel: GlobalConfig = {
  slug: "ozel",
  label: "Özel Haberler",
  admin: { group: "Kürasyon" },
  access: baseAccess,
  hooks: curationHooks,
  fields: [
    {
      name: "items",
      label: "Özel Haberler",
      type: "array",
      maxRows: 12,
      fields: [{ name: "news", type: "relationship", relationTo: "news", required: true }],
    },
  ],
};

/** Kategori Vitrini — 5 sekmeli */
export const Vitrin: GlobalConfig = {
  slug: "vitrin",
  label: "Kategori Vitrini",
  admin: { group: "Kürasyon" },
  access: baseAccess,
  hooks: curationHooks,
  fields: [
    {
      name: "slots",
      label: "Vitrin Sekmeleri",
      type: "array",
      maxRows: 5,
      fields: [
        {
          name: "category",
          label: "Kategori",
          type: "relationship",
          relationTo: "categories",
          required: true,
        },
        {
          name: "pinnedNews",
          label: "Öne Çıkan Haber (boşsa en yeni)",
          type: "relationship",
          relationTo: "news",
        },
      ],
    },
  ],
};

/** Ana Menü — sıralı kategoriler */
export const AnaMenu: GlobalConfig = {
  slug: "ana-menu",
  label: "Ana Menü",
  admin: { group: "Kürasyon" },
  access: baseAccess,
  hooks: curationHooks,
  fields: [
    {
      name: "items",
      label: "Menü Kategorileri",
      type: "array",
      maxRows: 12,
      fields: [
        {
          name: "category",
          type: "relationship",
          relationTo: "categories",
          required: true,
        },
      ],
    },
  ],
};

/** Kayan şeritler (ticker) */
export const Ticker: GlobalConfig = {
  slug: "ticker",
  label: "Kayan Şeritler",
  admin: { group: "Kürasyon" },
  access: baseAccess,
  hooks: curationHooks,
  fields: [
    {
      label: "Son Dakika Şeridi",
      type: "collapsible",
      fields: [
        {
          name: "sonDakika",
          label: "Maddeler",
          type: "array",
          fields: [
            { name: "text", label: "Metin", type: "text", required: true },
            { name: "url", label: "Bağlantı", type: "text" },
          ],
        },
        { name: "sonDakikaSpeed", label: "Hız (sn)", type: "number", defaultValue: 10 },
      ],
    },
    {
      label: "Editör Seçimi Şeridi",
      type: "collapsible",
      fields: [
        {
          name: "editorSecimi",
          label: "Maddeler",
          type: "array",
          fields: [
            { name: "text", label: "Metin", type: "text", required: true },
            { name: "url", label: "Bağlantı", type: "text" },
          ],
        },
        { name: "editorSecimiSpeed", label: "Hız (sn)", type: "number", defaultValue: 10 },
      ],
    },
  ],
};
