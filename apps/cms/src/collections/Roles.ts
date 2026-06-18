import type { CollectionConfig } from "payload";
import { adminOnly, loggedIn } from "../access/roles";

/**
 * Dinamik roller — panelden özel rol oluşturma.
 * permissions: panel bölüm anahtarları dizisi (['*'] = hepsi).
 * Payload API güvenliği yine Users.role enum'una dayanır; bu roller
 * özel admin panelinin menü/erişim izinlerini yönetir.
 */
export const Roles: CollectionConfig = {
  slug: "roles",
  labels: { singular: "Rol", plural: "Roller" },
  admin: { useAsTitle: "label", group: "Yönetim", defaultColumns: ["label", "name", "isSystem"] },
  access: {
    read: loggedIn,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: "name", label: "Anahtar", type: "text", required: true, unique: true, index: true },
    { name: "label", label: "Görünen Ad", type: "text", required: true },
    { name: "permissions", label: "İzinler", type: "text", hasMany: true },
    { name: "isSystem", label: "Sistem Rolü", type: "checkbox", defaultValue: false },
  ],
};
