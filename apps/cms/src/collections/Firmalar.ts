import type { CollectionConfig } from "payload";
import { editorialOnly, publishedOrLoggedIn } from "../access/roles";
import { slugField } from "../fields/slug";

/** Firma Rehberi */
export const Firmalar: CollectionConfig = {
  slug: "firmalar",
  trash: true,
  labels: { singular: "Firma", plural: "Firmalar" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "category", "phone", "_status"],
    group: "İçerik",
  },
  versions: { drafts: true },
  access: {
    read: publishedOrLoggedIn,
    create: editorialOnly,
    update: editorialOnly,
    delete: editorialOnly,
  },
  fields: [
    { name: "name", label: "Firma Adı", type: "text", required: true },
    ...slugField("name"),
    {
      name: "logo",
      label: "Logo",
      type: "upload",
      relationTo: "media",
      admin: { position: "sidebar" },
    },
    { name: "category", label: "Kategori", type: "text" },
    {
      type: "row",
      fields: [
        { name: "phone", label: "Telefon", type: "text" },
        { name: "email", label: "E-posta", type: "email" },
      ],
    },
    { name: "website", label: "Web Sitesi", type: "text" },
    { name: "address", label: "Adres", type: "textarea" },
    { name: "description", label: "Firma Hakkında", type: "textarea" },
  ],
};
