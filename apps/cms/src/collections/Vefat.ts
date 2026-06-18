import type { CollectionConfig } from "payload";
import { editorialOnly } from "../access/roles";

/** Vefat ilanları — anasayfada kayan şeritte gösterilir */
export const Vefat: CollectionConfig = {
  slug: "vefat",
  trash: true,
  labels: { singular: "Vefat İlanı", plural: "Vefat İlanları" },
  admin: {
    useAsTitle: "isim",
    defaultColumns: ["isim", "aktif", "order"],
    group: "Kürasyon",
  },
  access: {
    read: () => true,
    create: editorialOnly,
    update: editorialOnly,
    delete: editorialOnly,
  },
  fields: [
    { name: "isim", label: "İsim", type: "text", required: true },
    { name: "aciklama", label: "Açıklama", type: "text" },
    { name: "haberUrl", label: "Haber Bağlantısı (URL)", type: "text" },
    {
      type: "row",
      fields: [
        { name: "aktif", label: "Aktif", type: "checkbox", defaultValue: true },
        { name: "order", label: "Sıra", type: "number", defaultValue: 0 },
      ],
    },
  ],
};
