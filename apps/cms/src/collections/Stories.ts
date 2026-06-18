import type { CollectionConfig } from "payload";
import { editorialOnly } from "../access/roles";

/** Web Stories — bir habere bağlı, sıralı hikâyeler */
export const Stories: CollectionConfig = {
  slug: "stories",
  labels: { singular: "Story", plural: "Storyler" },
  admin: {
    useAsTitle: "id",
    defaultColumns: ["news", "order"],
    group: "Kürasyon",
  },
  access: {
    read: () => true,
    create: editorialOnly,
    update: editorialOnly,
    delete: editorialOnly,
  },
  fields: [
    {
      name: "news",
      label: "Haber",
      type: "relationship",
      relationTo: "news",
      required: true,
    },
    {
      name: "order",
      label: "Sıra",
      type: "number",
      defaultValue: 0,
    },
  ],
};
