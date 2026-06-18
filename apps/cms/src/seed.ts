import config from "./payload.config";
import { getPayload } from "payload";
import { slugify } from "./fields/slug";

/**
 * Demo içerik seed script'i.
 * Çalıştır:  pnpm --filter @sonkaynak/cms seed
 *
 * Tekrar çalıştırılabilir: önce demo koleksiyonlarını temizler, sonra üretir.
 */

const CATEGORIES = [
  "Gündem",
  "Ekonomi",
  "Spor",
  "Dünya",
  "Siyaset",
  "Teknoloji",
  "Sağlık",
  "Yaşam",
  "Kültür-Sanat",
  "Yerel",
];

/* Kategori başına çok sayıda benzersiz başlık üretmek için özne + yüklem havuzları */
const SUBJECTS: Record<string, string[]> = {
  Gündem: ["Bakanlık", "Valilik", "Belediye", "Kaymakamlık", "Kurul", "Komisyon", "Meclis", "Müdürlük", "Yetkililer", "Vatandaşlar"],
  Ekonomi: ["Merkez Bankası", "Borsa", "Sanayi Odası", "İhracatçılar", "Piyasalar", "Bakanlık", "Ekonomistler", "Yatırımcılar", "Esnaf", "Şirketler"],
  Spor: ["Millî takım", "Teknik direktör", "Kulüp yönetimi", "Federasyon", "Taraftarlar", "Oyuncular", "Transfer komitesi", "Antrenör", "Kaptan", "Yönetim"],
  Dünya: ["Liderler", "Zirve", "Komşu ülke", "Uluslararası kurul", "Diplomatlar", "Büyükelçilik", "Heyet", "Konsey", "Bakanlar", "Gözlemciler"],
  Siyaset: ["Meclis", "Komisyon", "Parti", "Bakanlık", "Liderler", "Kurul", "Sözcü", "Heyet", "Grup", "Yetkililer"],
  Teknoloji: ["Mühendisler", "Girişim", "Araştırmacılar", "Üniversite", "Geliştiriciler", "Şirket", "Laboratuvar", "Ekip", "Uzmanlar", "Kurum"],
  Sağlık: ["Bakanlık", "Hekimler", "Hastane", "Uzmanlar", "Araştırmacılar", "Sağlık kurulu", "Eczacılar", "Klinik", "Doktorlar", "Kurum"],
  Yaşam: ["Uzmanlar", "Araştırma", "Belediye", "Dernek", "Vatandaşlar", "Topluluk", "Kurum", "Ekip", "Gönüllüler", "Yetkililer"],
  "Kültür-Sanat": ["Sanatçılar", "Müze", "Festival", "Yönetmen", "Yazarlar", "Galeri", "Topluluk", "Sahne", "Kurum", "Ekip"],
  Yerel: ["Belediye", "Muhtarlık", "Valilik", "Kaymakamlık", "Esnaf", "Vatandaşlar", "Kurum", "Müdürlük", "Meclis", "Kooperatif"],
};
const PREDICATES = [
  "harekete geçti",
  "kritik karar aldı",
  "açıklama yaptı",
  "uyarıda bulundu",
  "yeni adım attı",
  "çalışma başlattı",
  "duyuru yayımladı",
  "toplantı düzenledi",
  "rapor hazırladı",
  "inceleme başlattı",
  "destek paketi açıkladı",
  "gündemi değerlendirdi",
  "planını paylaştı",
  "sürece dahil oldu",
  "öneri sundu",
];
const PER_CATEGORY = 15;

const PARAGRAPHS = [
  "Konuya ilişkin yapılan açıklamada, sürecin yakından takip edildiği ve gerekli adımların kısa sürede atılacağı vurgulandı.",
  "Yetkililer, vatandaşların mağdur olmaması için tüm tedbirlerin alındığını belirtti.",
  "Uzmanlar, gelişmelerin önümüzdeki dönemde sektörü olumlu etkileyeceğini ifade etti.",
  "Yapılan değerlendirmede, atılan adımların uzun vadede fayda sağlayacağı ortaya kondu.",
  "Görüşmelerin yapıcı bir atmosferde geçtiği ve ortak bir mutabakata varıldığı kaydedildi.",
];

const AUTHORS = [
  { name: "Ahmet", surname: "Yılmaz", title: "Genel Yayın Yönetmeni" },
  { name: "Elif", surname: "Demir", title: "Ekonomi Editörü" },
  { name: "Mehmet", surname: "Kaya", title: "Spor Muhabiri" },
  { name: "Zeynep", surname: "Şahin", title: "Köşe Yazarı" },
];

const TAGS = ["Türkiye", "Ankara", "İstanbul", "Ekonomi", "Seçim", "Teknoloji", "Sağlık"];

// Basit deterministik PRNG (tekrarlanabilir sonuç)
let _seed = 42;
const rnd = () => {
  _seed = (_seed * 1103515245 + 12345) & 0x7fffffff;
  return _seed / 0x7fffffff;
};
const pick = <T>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const pickN = <T>(arr: T[], n: number): T[] => {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) out.push(copy.splice(Math.floor(rnd() * copy.length), 1)[0]);
  return out;
};

function genTitles(cat: string, n: number): string[] {
  const subs = SUBJECTS[cat] ?? SUBJECTS["Gündem"];
  const out: string[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (out.length < n && guard < n * 25) {
    guard++;
    const s = subs[Math.floor(rnd() * subs.length)];
    const p = PREDICATES[Math.floor(rnd() * PREDICATES.length)];
    const t = `${s} ${p}`;
    if (!seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

const lexical = (paragraphs: string[]) => ({
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr" as const,
    children: paragraphs.map((p) => ({
      type: "paragraph",
      format: "",
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: [
        { type: "text", text: p, format: 0, style: "", mode: "normal", detail: 0, version: 1 },
      ],
    })),
  },
});

async function fetchImage(seed: number): Promise<Buffer | null> {
  try {
    const res = await fetch(`https://picsum.photos/seed/sk${seed}/1200/675`, {
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

const seed = async () => {
  const payload = await getPayload({ config });
  payload.logger.info("🌱 Seed başlıyor…");

  // 1) Temizlik — önce haberlere referans veren global'leri boşalt (FK'ler kalksın)
  const emptyGlobals: [string, any][] = [
    ["manset", { items: [] }],
    ["sicak-gundem", { items: [] }],
    ["secmece", { items: [] }],
    ["ozel", { items: [] }],
    ["vitrin", { slots: [] }],
    ["ana-menu", { items: [] }],
  ];
  for (const [slug, data] of emptyGlobals) {
    try {
      await payload.updateGlobal({ slug: slug as any, data });
    } catch {
      /* yoksay */
    }
  }
  // Sonra bağımlılık sırasına göre koleksiyonları sil
  // (stories → news; sonra news; sonra news'in referansları)
  const clearOrder = [
    "stories",
    "news",
    "ilanlar",
    "galeriler",
    "firmalar",
    "vefat",
    "tags",
    "authors",
    "categories",
    "media",
  ];
  for (const c of clearOrder) {
    try {
      await payload.delete({ collection: c as any, where: { id: { exists: true } } });
    } catch (e) {
      payload.logger.warn(`temizle ${c}: ${(e as Error).message}`);
    }
  }
  payload.logger.info("🧹 Eski demo veriler temizlendi.");

  // 2) Görseller (Media)
  const mediaIds: number[] = [];
  for (let i = 1; i <= 10; i++) {
    const buf = await fetchImage(i);
    if (!buf) continue;
    const doc = await payload.create({
      collection: "media",
      data: { alt: `Demo görsel ${i}` },
      file: { data: buf, mimetype: "image/jpeg", name: `demo-${i}.jpg`, size: buf.length },
    });
    mediaIds.push(doc.id as number);
  }
  payload.logger.info(`🖼  ${mediaIds.length} görsel yüklendi.`);
  const anyMedia = () => (mediaIds.length ? pick(mediaIds) : undefined);

  // 3) Kategoriler
  const catIds: Record<string, number> = {};
  for (let i = 0; i < CATEGORIES.length; i++) {
    const doc = await payload.create({
      collection: "categories",
      data: { name: CATEGORIES[i], order: i },
    });
    catIds[CATEGORIES[i]] = doc.id as number;
  }
  payload.logger.info(`🗂  ${CATEGORIES.length} kategori oluşturuldu.`);

  // 4) Etiketler
  const tagIds: number[] = [];
  for (const t of TAGS) {
    const doc = await payload.create({ collection: "tags", data: { name: t } });
    tagIds.push(doc.id as number);
  }

  // 5) Yazarlar
  const authorIds: number[] = [];
  for (const a of AUTHORS) {
    const doc = await payload.create({
      collection: "authors",
      data: { name: a.name, surname: a.surname, title: a.title, avatar: anyMedia() },
    });
    authorIds.push(doc.id as number);
  }
  payload.logger.info(`✍  ${AUTHORS.length} yazar oluşturuldu.`);

  // 6) Haberler — kategori başına PER_CATEGORY adet benzersiz haber
  const newsIds: number[] = [];
  let counter = 0;
  const now = Date.now();
  for (const cat of CATEGORIES) {
    const titles = genTitles(cat, PER_CATEGORY);
    for (const title of titles) {
      counter++;
      const paras = pickN(PARAGRAPHS, 3 + Math.floor(rnd() * 3));
      const publishedAt = new Date(now - counter * 3600_000 * 3).toISOString();
      const doc = await payload.create({
        collection: "news",
        data: {
          title,
          slug: `${slugify(title)}-${counter}`,
          category: catIds[cat],
          author: pick(authorIds),
          coverImage: anyMedia(),
          excerpt: paras[0].slice(0, 140),
          content: lexical(paras),
          tags: pickN(tagIds, 2),
          reviewState: "hazirlaniyor",
          publishedAt,
          _status: "published",
          seo: {
            focusKeyword: cat.toLowerCase(),
            metaDescription: paras[0].slice(0, 155),
          },
        } as any,
      });
      newsIds.push(doc.id as number);
    }
    payload.logger.info(`  ${cat}: ${titles.length} haber`);
  }
  payload.logger.info(`📰 Toplam ${newsIds.length} haber oluşturuldu.`);

  // 7) İlanlar
  for (let i = 1; i <= 4; i++) {
    await payload.create({
      collection: "ilanlar",
      data: {
        title: `Resmî İlan ${i}: İhale duyurusu`,
        coverImage: anyMedia(),
        content: lexical([pick(PARAGRAPHS), pick(PARAGRAPHS)]),
        _status: "published",
      } as any,
    });
  }

  // 8) Firmalar
  const firmaCats = ["Restoran", "Otomotiv", "Sağlık", "Eğitim", "İnşaat", "Teknoloji"];
  for (let i = 1; i <= 18; i++) {
    await payload.create({
      collection: "firmalar",
      data: {
        name: `Demo Firma ${i}`,
        logo: anyMedia(),
        category: pick(firmaCats),
        phone: `0312 ${100 + i} ${10 + i} ${20 + i}`,
        email: `info${i}@demofirma.com`,
        website: "https://example.com",
        address: "Kızılay Mah. Atatürk Bulvarı No:1, Ankara",
        description: "Sektöründe öncü, müşteri memnuniyeti odaklı hizmet.",
        _status: "published",
      } as any,
    });
  }

  // 9) Galeriler
  for (let i = 1; i <= 6; i++) {
    await payload.create({
      collection: "galeriler",
      data: {
        title: `Demo Galeri ${i}: Haftanın kareleri`,
        category: pick(CATEGORIES),
        cover: anyMedia(),
        excerpt: "Haftaya damga vuran fotoğraflar bir arada.",
        items: pickN(mediaIds, Math.min(4, mediaIds.length)).map((m) => ({
          image: m,
          caption: "Demo fotoğraf",
        })),
        _status: "published",
      } as any,
    });
  }

  // 10) Vefat
  const vefatIsimler = ["Hüseyin Aksoy", "Fatma Çelik", "Ali Korkmaz", "Ayşe Tunç"];
  for (let i = 0; i < vefatIsimler.length; i++) {
    await payload.create({
      collection: "vefat",
      data: { isim: vefatIsimler[i], aciklama: "Vefat etmiştir. Ailesine başsağlığı dileriz.", aktif: true, order: i },
    });
  }

  // 11) Story'ler
  for (let i = 0; i < 5 && i < newsIds.length; i++) {
    await payload.create({ collection: "stories", data: { news: newsIds[i], order: i } });
  }

  // 12) Global'ler — kürasyon
  await payload.updateGlobal({
    slug: "manset",
    data: { items: pickN(newsIds, 6).map((n) => ({ news: n })) } as any,
  });
  await payload.updateGlobal({
    slug: "sicak-gundem",
    data: { items: pickN(newsIds, 3).map((n) => ({ news: n })) } as any,
  });
  await payload.updateGlobal({
    slug: "secmece",
    data: { items: pickN(newsIds, 8).map((n) => ({ news: n })) } as any,
  });
  await payload.updateGlobal({
    slug: "ozel",
    data: { items: pickN(newsIds, 6).map((n) => ({ news: n })) } as any,
  });
  await payload.updateGlobal({
    slug: "vitrin",
    data: { slots: CATEGORIES.slice(0, 5).map((c) => ({ category: catIds[c] })) } as any,
  });
  await payload.updateGlobal({
    slug: "ana-menu",
    data: { items: CATEGORIES.map((c) => ({ category: catIds[c] })) } as any,
  });
  await payload.updateGlobal({
    slug: "ticker",
    data: {
      sonDakika: pickN(newsIds, 4).map((n) => ({ text: "Son dakika gelişmesi", url: `/haber/${n}` })),
      sonDakikaSpeed: 10,
      editorSecimi: [
        { text: "Editörün seçtiği analiz yayında", url: "/" },
        { text: "Haftanın öne çıkan dosyası", url: "/" },
      ],
      editorSecimiSpeed: 12,
    } as any,
  });
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      siteName: "Son Kaynak",
      siteDescription: "Gündem, ekonomi, spor, dünya ve yerel son dakika haberleri.",
      twitter: "@sonkaynak",
      footerAbout: "Son Kaynak Haber — yeni nesil haber platformu.",
      footerCopyright: `© ${new Date().getFullYear()} Son Kaynak. Tüm hakları saklıdır.`,
      footerColumns: [
        {
          title: "Haberler",
          links: CATEGORIES.slice(0, 5).map((c) => ({ label: c, url: "/kategori/" + c.toLowerCase() })),
        },
        { title: "Kurumsal", links: [{ label: "Hakkımızda", url: "/hakkimizda" }, { label: "İletişim", url: "/iletisim" }] },
      ],
    } as any,
  });

  payload.logger.info("✅ Seed tamamlandı.");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
