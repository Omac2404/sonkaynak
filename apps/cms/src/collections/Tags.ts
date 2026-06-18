import type { CollectionConfig } from "payload";
import { loggedIn, editorialOnly } from "../access/roles";
import { slugField } from "../fields/slug";

export const Tags: CollectionConfig = {
  slug: "tags",
  labels: { singular: "Etiket", plural: "Etiketler" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug"],
    group: "İçerik",
  },
  access: {
    read: () => true,
    create: loggedIn,
    update: editorialOnly,
    delete: editorialOnly,
  },
  fields: [
    {
      name: "name",
      label: "Etiket",
      type: "text",
      required: true,
    },
    ...slugField("name"),
  ],
};
