import type { CollectionConfig } from "payload";

/**
 * Medya kütüphanesi. Faz 2'de yerel diske yazar;
 * Faz 5'te MinIO (S3) storage adapter'ına geçirilecek.
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "Medya",
    plural: "Medya",
  },
  access: {
    read: () => true,
  },
  admin: {
    group: "İçerik",
  },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 768, height: 512, position: "centre" },
      { name: "feature", width: 1200, height: 675, position: "centre" },
    ],
  },
  fields: [
    {
      name: "alt",
      label: "Alternatif metin",
      type: "text",
    },
    {
      name: "caption",
      label: "Açıklama / Kaynak",
      type: "text",
    },
  ],
};
