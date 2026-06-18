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
