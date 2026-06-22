import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * On-demand revalidation: CMS bir içerik değiştiğinde buraya POST atar; ilgili
 * sayfaların önbelleği anında temizlenir, böylece içerik ~60 sn beklemeden çıkar.
 * Güvenlik: REVALIDATE_SECRET ile korunur (CMS ile paylaşılan gizli anahtar).
 */

// Her zaman tazelenecek dinamik rota desenleri (tüm slug'lar)
const DYNAMIC_PAGES = ["/haber/[slug]", "/kategori/[slug]", "/yazar/[slug]", "/etiket/[slug]"];
// Sabit listeleme sayfaları + beslemeler
const STATIC_PAGES = ["/", "/galeri", "/yazarlar", "/tum-kategoriler", "/rss.xml", "/news-sitemap.xml", "/sitemap.xml"];

export async function POST(req: NextRequest) {
  const secret =
    req.nextUrl.searchParams.get("secret") || req.headers.get("x-revalidate-secret") || "";
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  for (const p of DYNAMIC_PAGES) {
    try {
      revalidatePath(p, "page");
    } catch {
      /* yoksay */
    }
  }
  for (const p of STATIC_PAGES) {
    try {
      revalidatePath(p);
    } catch {
      /* yoksay */
    }
  }

  return NextResponse.json({ ok: true, revalidated: true, at: Date.now() });
}
