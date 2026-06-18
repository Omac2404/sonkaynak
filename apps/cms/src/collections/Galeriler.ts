import type { CollectionConfig } from "payload";
import { editorialOnly, loggedIn, publishedOrLoggedIn } from "../access/roles";
import { slugField } from "../fields/slug";

/** Foto Galeriler */
export const Galeriler: CollectionConfig = {
  slug: "galeriler",
  trash: true,
  labels: { singular: "Galeri", plural: "Galeriler" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "_status"],
    group: "İçerik",
  },
  versions: { drafts: true },
  access: {
    read: publishedOrLoggedIn,
    create: loggedIn,
    update: editorialOnly,
    delete: editorialOnly,
  },
  fields: [
    { name: "title", label: "Galeri Başlığı", type: "text", required: true },
    ...slugField("title"),
    { name: "excerpt", label: "Özet", type: "textarea" },
    { name: "category", label: "Kategori", type: "text" },
    {
      name: "cover",
      label: "Kapak Görseli",
      type: "upload",
      relationTo: "media",
      admin: { position: "sidebar" },
    },
    {
      name: "items",
      label: "Fotoğraflar",
      type: "array",
      labels: { singular: "Fotoğraf", plural: "Fotoğraflar" },
      fields: [
        {
          name: "image",
          label: "Görsel",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        { name: "caption", label: "Açıklama", type: "text" },
      ],
    },
  ],
};
