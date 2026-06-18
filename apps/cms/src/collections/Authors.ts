import type { CollectionConfig } from "payload";
import { editorialOnly } from "../access/roles";
import { slugify } from "../fields/slug";

/**
 * Yazarlar (köşe/imza). Profil + sosyal bağlantılar.
 * İsteğe bağlı olarak bir Users kaydına bağlanır (panele giriş için).
 */
export const Authors: CollectionConfig = {
  slug: "authors",
  labels: { singular: "Yazar", plural: "Yazarlar" },
  admin: {
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "title", "slug"],
    group: "İçerik",
  },
  access: {
    read: () => true,
    create: editorialOnly,
    update: editorialOnly,
    delete: editorialOnly,
  },
  hooks: {
    // fullName + slug'ı koleksiyon seviyesinde, alan hook'larından bağımsız üret
    beforeValidate: [
      ({ data, originalDoc }) => {
        if (!data) return data;
        const name = data.name ?? originalDoc?.name ?? "";
        const surname = data.surname ?? originalDoc?.surname ?? "";
        const full = `${name} ${surname}`.trim();
        data.fullName = full;
        if (!data.slug && full) data.slug = slugify(full);
        return data;
      },
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", label: "Ad", type: "text", required: true },
        { name: "surname", label: "Soyad", type: "text", required: true },
      ],
    },
    { name: "fullName", type: "text", admin: { hidden: true } },
    {
      name: "slug",
      label: "Slug (URL)",
      type: "text",
      index: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    { name: "title", label: "Unvan", type: "text" },
    { name: "email", label: "E-posta", type: "email" },
    { name: "bio", label: "Biyografi", type: "textarea" },
    {
      name: "avatar",
      label: "Profil Görseli",
      type: "upload",
      relationTo: "media",
    },
    {
      label: "Sosyal Medya",
      type: "collapsible",
      fields: [
        { name: "twitter", label: "X / Twitter", type: "text" },
        { name: "instagram", label: "Instagram", type: "text" },
        { name: "facebook", label: "Facebook", type: "text" },
        { name: "linkedin", label: "LinkedIn", type: "text" },
      ],
    },
    {
      name: "user",
      label: "Panel Kullanıcısı",
      type: "relationship",
      relationTo: "users",
      admin: {
        position: "sidebar",
        description: "Bu yazar panele giriş yapacaksa ilgili kullanıcıyı seçin.",
      },
    },
  ],
};
