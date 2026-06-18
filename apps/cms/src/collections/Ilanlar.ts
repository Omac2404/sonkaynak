import type { CollectionConfig } from "payload";
import { editorialOnly, loggedIn, publishedOrLoggedIn } from "../access/roles";
import { slugField } from "../fields/slug";

/** Resmi İlanlar */
export const Ilanlar: CollectionConfig = {
  slug: "ilanlar",
  trash: true,
  labels: { singular: "İlan", plural: "İlanlar" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "_status", "createdAt"],
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
    { name: "title", label: "İlan Başlığı", type: "text", required: true },
    ...slugField("title"),
    {
      name: "coverImage",
      label: "Kapak Görseli",
      type: "upload",
      relationTo: "media",
      admin: { position: "sidebar" },
    },
    { name: "content", label: "İlan Metni (eski / Lexical)", type: "richText" },
    { name: "body", label: "İlan Metni (HTML)", type: "textarea" },
  ],
};
