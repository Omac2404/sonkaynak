import type { CollectionConfig } from "payload";
import { isAdmin, adminFieldOnly } from "../access/roles";

/**
 * Panel kullanıcıları (admin / editör / sınırlı editör / yazar).
 * Kullanıcı yönetimi yalnızca admin'e açıktır; herkes kendi kaydını okuyabilir.
 */
export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "Kullanıcı",
    plural: "Kullanıcılar",
  },
  auth: true,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role"],
    group: "Yönetim",
  },
  access: {
    read: ({ req: { user } }) => {
      if (isAdmin(user)) return true;
      // Kullanıcı yalnızca kendi kaydını görür
      return { id: { equals: user?.id } };
    },
    create: ({ req: { user } }) => isAdmin(user),
    update: ({ req: { user } }) => {
      if (isAdmin(user)) return true;
      return { id: { equals: user?.id } };
    },
    delete: ({ req: { user } }) => isAdmin(user),
  },
  fields: [
    {
      name: "name",
      label: "Ad Soyad",
      type: "text",
      required: true,
    },
    {
      name: "role",
      label: "Rol",
      type: "select",
      required: true,
      defaultValue: "yazar",
      access: {
        create: adminFieldOnly,
        update: adminFieldOnly,
      },
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editör", value: "editor" },
        { label: "Sınırlı Editör", value: "editor_limited" },
        { label: "Yazar", value: "yazar" },
      ],
    },
    {
      name: "roleRef",
      label: "Özel Rol (panel izinleri)",
      type: "relationship",
      relationTo: "roles",
      admin: {
        description: "Seçilirse panel menü/erişim izinleri bu rolden alınır. Boşsa yukarıdaki temel rol kullanılır.",
      },
    },
  ],
};
