import type { CollectionConfig } from "payload";
import {
  editorialOnly,
  loggedIn,
  publishedOrLoggedIn,
} from "../access/roles";
import { slugField } from "../fields/slug";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: { singular: "Kategori", plural: "Kategoriler" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug"],
    group: "İçerik",
  },
  access: {
    read: () => true,
    create: editorialOnly,
    update: editorialOnly,
    delete: editorialOnly,
  },
  fields: [
    {
      name: "name",
      label: "Kategori Adı",
      type: "text",
      required: true,
    },
    ...slugField("name"),
    {
      name: "description",
      label: "Açıklama",
      type: "textarea",
    },
    {
      name: "order",
      label: "Menü Sırası",
      type: "number",
      defaultValue: 0,
      admin: { description: "Küçük sayı önce gelir." },
    },
  ],
};
