import path from "path";
import { fileURLToPath } from "url";
import { config as loadEnv } from "dotenv";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { s3Storage } from "@payloadcms/storage-s3";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { tr } from "@payloadcms/translations/languages/tr";
import { en } from "@payloadcms/translations/languages/en";
import sharp from "sharp";

// Koleksiyonlar
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Categories } from "./collections/Categories";
import { Tags } from "./collections/Tags";
import { Authors } from "./collections/Authors";
import { News } from "./collections/News";
import { Ilanlar } from "./collections/Ilanlar";
import { Firmalar } from "./collections/Firmalar";
import { Galeriler } from "./collections/Galeriler";
import { Stories } from "./collections/Stories";
import { Vefat } from "./collections/Vefat";
import { Roles } from "./collections/Roles";

// Sistem rolleri (varsayılan izinler)
const SYSTEM_ROLES = [
  { name: "admin", label: "Admin", permissions: ["*"], isSystem: true },
  {
    name: "editor",
    label: "Editör",
    permissions: [
      "haberler", "haberler/yeni", "kategoriler", "etiketler", "yazarlar", "medya",
      "ilanlar", "firmalar", "galeriler", "manset", "sicak-gundem", "secmece", "ozel",
      "vitrin", "ticker", "ana-menu", "storyler", "vefat", "onay-bekleyenler", "arsiv",
    ],
    isSystem: true,
  },
  {
    name: "editor_limited",
    label: "Sınırlı Editör",
    permissions: ["haberler", "haberler/yeni", "medya", "ilanlar", "galeriler", "onay-bekleyenler", "arsiv"],
    isSystem: true,
  },
  { name: "yazar", label: "Yazar", permissions: ["haberler", "haberler/yeni", "medya"], isSystem: true },
];

// Global'ler
import { SiteSettings } from "./globals/SiteSettings";
import {
  Manset,
  SicakGundem,
  Vitrin,
  AnaMenu,
  Ticker,
  Secmece,
  Ozel,
} from "./globals/Curation";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Monorepo kök .env'ini yükle (apps/cms/../../.env)
loadEnv({ path: path.resolve(dirname, "../../../.env") });

// Production yardımcıları
const SERVER_URL = process.env.SERVER_URL || process.env.NEXT_PUBLIC_CMS_URL || undefined;
const ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const S3_ENABLED = Boolean(process.env.S3_BUCKET);

export default buildConfig({
  ...(SERVER_URL ? { serverURL: SERVER_URL } : {}),
  ...(ORIGINS.length ? { cors: ORIGINS, csrf: ORIGINS } : {}),
  admin: {
    user: Users.slug,
    theme: "light",
    meta: {
      titleSuffix: " — Son Kaynak Yönetim",
      description: "Son Kaynak Haber Yönetim Paneli",
    },
    components: {
      graphics: {
        Logo: "/components/admin/Logo#Logo",
        Icon: "/components/admin/Icon#Icon",
      },
      beforeLogin: ["/components/admin/BeforeLogin#BeforeLogin"],
      beforeDashboard: ["/components/admin/DashboardHome#DashboardHome"],
    },
  },

  // Türkçe yönetim paneli (varsayılan), İngilizce yedek
  i18n: {
    supportedLanguages: { tr, en },
    fallbackLanguage: "tr",
  },

  collections: [
    News,
    Categories,
    Tags,
    Authors,
    Ilanlar,
    Firmalar,
    Galeriler,
    Stories,
    Vefat,
    Media,
    Roles,
    Users,
  ],

  globals: [Manset, SicakGundem, Secmece, Ozel, Vitrin, AnaMenu, Ticker, SiteSettings],

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET || "dev-secret-change-me",

  db: postgresAdapter({
    // Şemayı veritabanına otomatik uygula (production'da da). Migrasyon dosyası
    // tutmuyoruz; tablolar açılışta drizzle push ile oluşturulur/güncellenir.
    push: true,
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
  }),

  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  sharp,

  // Medya: S3/MinIO ayarlandıysa oraya yükle (prod), yoksa yerel disk (dev)
  plugins: S3_ENABLED
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.S3_BUCKET as string,
          config: {
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION || "us-east-1",
            forcePathStyle: true, // MinIO için gerekli
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY as string,
              secretAccessKey: process.env.S3_SECRET_KEY as string,
            },
          },
        }),
      ]
    : [],

  onInit: async (payload) => {
    // 1) Sistem rollerini garanti et (idempotent)
    for (const r of SYSTEM_ROLES) {
      try {
        const ex = await payload.find({ collection: "roles", where: { name: { equals: r.name } }, limit: 1 });
        if (!ex.docs.length) await payload.create({ collection: "roles", data: r as any });
      } catch {
        /* roles tablosu henüz hazır değilse yoksay */
      }
    }
    // 2) İlk admin kullanıcısını env'den oluştur (yalnızca hiç kullanıcı yoksa)
    try {
      const email = process.env.ADMIN_EMAIL;
      const pwd = process.env.ADMIN_PASSWORD;
      if (email && pwd) {
        const users = await payload.find({ collection: "users", limit: 1 });
        if (!users.docs.length) {
          await payload.create({
            collection: "users",
            data: { name: "Admin", email, password: pwd, role: "admin" } as any,
          });
          payload.logger.info(`✓ İlk admin oluşturuldu: ${email}`);
        }
      }
    } catch (e) {
      payload.logger.warn(`İlk admin oluşturulamadı: ${(e as Error).message}`);
    }
  },
});
