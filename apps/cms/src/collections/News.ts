import type { CollectionConfig } from "payload";
import { isEditorial, publishedOrLoggedIn } from "../access/roles";
import { slugField } from "../fields/slug";
import { computeSeoScore, lexicalToPlainText } from "../lib/seo";
import { syncNewsToMeili, removeNewsFromMeili } from "../lib/meili";
import { revalidateWeb } from "../lib/revalidate";

/**
 * Haberler — platformun çekirdek koleksiyonu.
 *
 * Onay akışı:
 *  - Yazar haber oluşturur → her zaman TASLAK kalır (yayınlayamaz),
 *    `reviewState` = 'onaya_gonderildi' ile editöre gönderir.
 *  - Editör/Admin inceler → yayınlar (_status: published) veya reddeder.
 *  - Yalnızca yayınlanmış haberler public API'de görünür.
 */
export const News: CollectionConfig = {
  slug: "news",
  trash: true,
  labels: { singular: "Haber", plural: "Haberler" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "reviewState", "_status", "publishedAt"],
    group: "İçerik",
    preview: (doc) =>
      `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100"}/haber/${doc?.slug ?? ""}`,
  },
  versions: {
    drafts: {
      autosave: { interval: 800 },
    },
    maxPerDoc: 20,
  },
  access: {
    read: publishedOrLoggedIn,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (isEditorial(user)) return true;
      // Yazar yalnızca kendi haberlerini düzenleyebilir
      return { createdBy: { equals: user.id } };
    },
    delete: ({ req: { user } }) => isEditorial(user),
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        const user = req.user as any;

        // Oluşturan kullanıcıyı sabitle (sahiplik kontrolü için)
        if (operation === "create" && user) {
          data.createdBy = user.id;
        }

        // Yazar rolü asla yayınlayamaz — daima taslağa zorla
        if (user?.role === "yazar") {
          data._status = "draft";
        }

        // SEO skorunu hesapla (önce HTML body, yoksa Lexical content)
        const contentText = data.body
          ? String(data.body).replace(/<[^>]+>/g, " ")
          : lexicalToPlainText(data.content);
        data.seoScore = computeSeoScore({
          title: data.title,
          contentText,
          hasImage: Boolean(data.coverImage),
          focusKeyword: data.seo?.focusKeyword,
          metaDescription: data.seo?.metaDescription,
        });

        // Yayınlanınca yayın tarihini ata
        if (data._status === "published" && !data.publishedAt) {
          data.publishedAt = new Date().toISOString();
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        // Meili senkronu — kapalıysa kaydı bozmasın
        try {
          await syncNewsToMeili(req.payload, doc);
        } catch (e) {
          req.payload.logger.warn(`[meili] senkron başarısız: ${(e as Error).message}`);
        }
        // Web önbelleğini anında tazele (on-demand revalidation)
        await revalidateWeb();
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        try {
          await removeNewsFromMeili(doc.id);
        } catch {
          /* yoksay */
        }
        await revalidateWeb();
      },
    ],
  },
  fields: [
    {
      name: "title",
      label: "Başlık",
      type: "text",
      required: true,
      maxLength: 400,
    },
    ...slugField("title"),
    {
      name: "sonDakika",
      label: "Son Dakika",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Kartlarda kırmızı SON DAKİKA rozeti gösterir." },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "İçerik",
          fields: [
            {
              name: "excerpt",
              label: "Özet / Spot",
              type: "textarea",
              admin: { description: "1-2 cümle. Liste ve OG açıklamasında kullanılır." },
            },
            {
              name: "content",
              label: "Haber Metni (eski / Lexical)",
              type: "richText",
              admin: { description: "Yeni editör 'body' alanını kullanır; bu alan geriye dönük uyumluluk içindir." },
            },
            {
              // Özel admin editörünün ürettiği HTML gövde
              name: "body",
              label: "Haber Metni (HTML)",
              type: "textarea",
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "seo",
              type: "group",
              label: false,
              fields: [
                {
                  name: "focusKeyword",
                  label: "Odak Anahtar Kelime",
                  type: "text",
                },
                {
                  name: "metaDescription",
                  label: "Meta Açıklama",
                  type: "textarea",
                  maxLength: 200,
                  admin: { description: "İdeal: 100-160 karakter." },
                },
              ],
            },
            {
              name: "seoScore",
              label: "SEO Skoru (otomatik)",
              type: "number",
              admin: {
                readOnly: true,
                description: "Kaydederken otomatik hesaplanır (0-100).",
              },
            },
            {
              name: "sourceUrl",
              label: "Kaynak URL",
              type: "text",
            },
          ],
        },
      ],
    },
    // ── Kenar çubuğu ──
    {
      name: "category",
      label: "Kategori",
      type: "relationship",
      relationTo: "categories",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "tags",
      label: "Etiketler",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
      admin: { position: "sidebar" },
    },
    {
      name: "author",
      label: "Yazar",
      type: "relationship",
      relationTo: "authors",
      admin: { position: "sidebar" },
    },
    {
      name: "coverImage",
      label: "Kapak Görseli",
      type: "upload",
      relationTo: "media",
      admin: { position: "sidebar" },
    },
    {
      name: "reviewState",
      label: "Onay Durumu",
      type: "select",
      defaultValue: "hazirlaniyor",
      options: [
        { label: "Hazırlanıyor", value: "hazirlaniyor" },
        { label: "Onaya Gönderildi", value: "onaya_gonderildi" },
        { label: "Reddedildi", value: "reddedildi" },
      ],
      admin: {
        position: "sidebar",
        description: "Yazarlar 'Onaya Gönderildi' ile editöre iletir.",
      },
    },
    {
      name: "publishedAt",
      label: "Yayın Tarihi",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      name: "createdBy",
      type: "relationship",
      relationTo: "users",
      admin: { hidden: true },
    },
  ],
};
