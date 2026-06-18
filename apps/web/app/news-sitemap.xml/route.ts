import { getAllNewsForSitemap, getSettings } from "@/lib/cms";

export const revalidate = 300;

function esc(s = ""): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Google News sitemap — yalnızca son 2 günün haberleri (Google News spec). */
export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
  const [news, settings] = await Promise.all([getAllNewsForSitemap(1000), getSettings()]);
  const siteName = settings.siteName ?? "Son Kaynak";

  const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
  const recent = news.filter((n) => {
    const t = n.publishedAt ? new Date(n.publishedAt).getTime() : 0;
    return t >= twoDaysAgo;
  });

  const entries = recent
    .map((n) => {
      const url = `${base}/haber/${n.slug}`;
      const date = n.publishedAt ? new Date(n.publishedAt).toISOString() : new Date().toISOString();
      return `  <url>
    <loc>${esc(url)}</loc>
    <news:news>
      <news:publication>
        <news:name>${esc(siteName)}</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${date}</news:publication_date>
      <news:title>${esc(n.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
