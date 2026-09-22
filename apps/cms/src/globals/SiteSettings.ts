import type { GlobalConfig } from "payload";
import { adminOnly } from "../access/roles";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site Ayarları",
  admin: { group: "Yönetim" },
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Kimlik",
          fields: [
            { name: "siteName", label: "Site Adı", type: "text", defaultValue: "Son Kaynak" },
            { name: "siteDescription", label: "Site Açıklaması", type: "textarea" },
            { name: "logo", label: "Logo", type: "upload", relationTo: "media" },
            { name: "defaultCategory", label: "Varsayılan Kategori", type: "text", defaultValue: "Gündem" },
            {
              name: "adRotateSeconds",
              label: "Reklam Dönüş Süresi (sn)",
              type: "number",
              defaultValue: 7,
              admin: { description: "Aynı konumda birden fazla reklam varsa kaç saniyede bir değişsin." },
            },
          ],
        },
        {
          label: "Sosyal & Analitik",
          fields: [
            { name: "twitter", label: "X / Twitter", type: "text" },
            { name: "facebook", label: "Facebook", type: "text" },
            { name: "instagram", label: "Instagram", type: "text" },
            { name: "youtube", label: "YouTube", type: "text" },
            { name: "linkedin", label: "LinkedIn", type: "text" },
            { name: "gaId", label: "Google Analytics ID", type: "text" },
            { name: "gscVerify", label: "Search Console Doğrulama Kodu", type: "text" },
          ],
        },
        {
          label: "Piyasa Bandı",
          fields: [
            {
              name: "financeEnabled",
              label: "Piyasa bandını göster (sitenin tepesi)",
              type: "checkbox",
              defaultValue: true,
            },
            {
              name: "financeOverride",
              label: "Elle Değerler",
              type: "group",
              admin: {
                description:
                  "Canlı veri kaynağı çökerse buraya elle değer girin (yalnızca sayı, ör. 48.24). Boş bırakılan alan canlı veriden gelir.",
              },
              fields: [
                { name: "usd", label: "Dolar (₺)", type: "text" },
                { name: "eur", label: "Euro (₺)", type: "text" },
                { name: "gbp", label: "Sterlin (₺)", type: "text" },
                { name: "gold", label: "Gram Altın (₺)", type: "text" },
                { name: "goldOz", label: "Ons Altın", type: "text" },
                { name: "bist", label: "BİST 100", type: "text" },
                { name: "btc", label: "Bitcoin (₺)", type: "text" },
                { name: "eth", label: "Ethereum (₺)", type: "text" },
              ],
            },
          ],
        },
        {
          label: "Künye",
          fields: [
            { name: "kunyeTitle", label: "Sayfa Başlığı", type: "text", defaultValue: "Künye" },
            {
              name: "kunyeRows",
              label: "Künye Satırları",
              type: "array",
              admin: { description: "Başlık + metin. Metni boş bırakılan satır sitede gösterilmez." },
              defaultValue: [
                { baslik: "Yayın Sahibi", metin: "SONKAYNAK" },
                { baslik: "Sorumlu Müdür / Yazı İşleri Müdürü", metin: "" },
                { baslik: "Yönetim Yeri", metin: "Gürler Mh. 668. Sk. Yaprak Yapı Koop. A Blok No:10 Merkez / Kırıkkale" },
                { baslik: "İletişim / WhatsApp İhbar Hattı", metin: "0538 441 07 71" },
                { baslik: "Kurumsal E-Posta", metin: "info@sonkaynak.com" },
              ],
              fields: [
                { name: "baslik", label: "Başlık", type: "text", required: true },
                { name: "metin", label: "Metin (boşsa gizlenir)", type: "textarea" },
              ],
            },
          ],
        },
        {
          label: "Footer",
          fields: [
            { name: "footerAbout", label: "Site Hakkında", type: "textarea" },
            { name: "footerCopyright", label: "Telif Metni", type: "text" },
            {
              name: "footerColumns",
              label: "Footer Sütunları",
              type: "array",
              maxRows: 4,
              fields: [
                { name: "title", label: "Sütun Başlığı", type: "text" },
                {
                  name: "links",
                  label: "Bağlantılar",
                  type: "array",
                  fields: [
                    { name: "label", label: "Etiket", type: "text", required: true },
                    { name: "url", label: "URL", type: "text", required: true },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
