import type { CollectionConfig } from "payload";
import { adminOnly } from "../access/roles";

/**
 * Haber Ajansı RSS/besleme kaynakları (İHA / AA / DHA / ANKA).
 * Anahtar/izin olmadan alanlar boş kalır → kaynak pasif ve hiçbir şey çekilmez.
 * Site sahibi abonelik bilgilerini girip "Aktif" edince 30 dk'da bir otomatik çekilir.
 */
export const AjansKaynaklari: CollectionConfig = {
  slug: "ajans-kaynaklari",
  labels: { singular: "Ajans Kaynağı", plural: "Haber Ajansları" },
  admin: {
    useAsTitle: "name",
    group: "Yönetim",
    defaultColumns: ["name", "active", "lastStatus", "lastFetchedAt"],
  },
  access: {
    read: adminOnly,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: "name", label: "Ajans Adı", type: "text", required: true },
    { name: "code", label: "Kod", type: "text", required: true, unique: true, admin: { readOnly: true } },
    {
      name: "active",
      label: "Aktif",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Bilgiler girilip aktif edilene kadar çekim yapılmaz." },
    },
    { name: "feedUrl", label: "Besleme (RSS/API) URL'si", type: "text" },
    { name: "username", label: "Kullanıcı Adı", type: "text" },
    { name: "password", label: "Şifre", type: "text" },
    { name: "apiKey", label: "API Anahtarı", type: "text" },
    {
      name: "category",
      label: "Hedef Kategori",
      type: "relationship",
      relationTo: "categories",
      admin: { description: "Çekilen haberler bu kategoriye eklenir (zorunlu)." },
    },
    {
      name: "autoPublish",
      label: "Otomatik Yayınla",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Kapalıysa haberler taslak gelir; editör onaylayıp yayınlar." },
    },
    { name: "lastFetchedAt", label: "Son Çekim", type: "date", admin: { readOnly: true } },
    { name: "lastStatus", label: "Son Durum", type: "text", admin: { readOnly: true } },
  ],
};
