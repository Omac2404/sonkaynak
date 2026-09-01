import type { CollectionConfig } from "payload";
import { isEditorial } from "../access/roles";
import { revalidateWeb } from "../lib/revalidate";

/**
 * Reklamlar — sponsorlu banner yönetimi (aktif/pasif, konuma göre).
 * Konumlar: üst geniş banner, yan sütun kulesi, haber arası.
 */
export const Reklamlar: CollectionConfig = {
  slug: "reklamlar",
  labels: { singular: "Reklam", plural: "Reklamlar" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "placement", "active", "order"],
    group: "İçerik",
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => isEditorial(user),
    update: ({ req: { user } }) => isEditorial(user),
    delete: ({ req: { user } }) => isEditorial(user),
  },
  hooks: {
    afterChange: [async () => { await revalidateWeb(); }],
    afterDelete: [async () => { await revalidateWeb(); }],
  },
  fields: [
    { name: "name", label: "Reklam Adı", type: "text", required: true },
    { name: "image", label: "Görsel", type: "upload", relationTo: "media", required: true },
    { name: "targetUrl", label: "Hedef Bağlantı (URL)", type: "text" },
    {
      name: "placement",
      label: "Konum",
      type: "select",
      defaultValue: "header",
      options: [
        { label: "Üst Banner (geniş)", value: "header" },
        { label: "Yan Sütun (kule)", value: "sidebar" },
        { label: "Haber Arası", value: "in-article" },
      ],
    },
    { name: "active", label: "Aktif", type: "checkbox", defaultValue: true },
    { name: "order", label: "Sıra", type: "number", defaultValue: 0 },
  ],
};
