import { getLatestNews, getSettings, newsUrl, authorName, mediaUrl } from "@/lib/cms";

export const revalidate = 300;

function esc(s = ""): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
  const [news, settings] = await Promise.all([getLatestNews(50), getSettings()]);
  const siteName = settings.siteName ?? "Son Kaynak";

  const items = news
    .map((n) => {
      const url = `${base}${newsUrl(n)}`;
      const date = n.publishedAt ? new Date(n.publishedAt).toUTCString() : new Date().toUTCString();
      const desc = n.excerpt ?? "";
      const full = n.body || desc;
      const img = mediaUrl(n.coverImage, "feature");
      return `  <item>
    <title>${esc(n.title)}</title>
    <link>${esc(url)}</link>
    <guid isPermaLink="true">${esc(url)}</guid>
    <pubDate>${date}</pubDate>
    <dc:creator>${esc(authorName(n.author))}</dc:creator>
    <category>${esc(n.category?.name ?? "")}</category>
    <description><![CDATA[${desc}]]></description>
    <content:encoded><![CDATA[${full}]]></content:encoded>${
      img
        ? `
    <media:content url="${esc(img)}" medium="image"/>
    <media:thumbnail url="${esc(img)}"/>
    <enclosure url="${esc(img)}" type="image/jpeg" length="0"/>`
        : ""
    }
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(siteName)}</title>
  <link>${esc(base)}</link>
  <description>${esc(settings.siteDescription ?? siteName + " - Son Dakika Haberleri")}</description>
  <language>tr</language>
  <atom:link href="${esc(base)}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
