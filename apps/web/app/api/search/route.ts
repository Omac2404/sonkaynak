import { NextResponse } from "next/server";
import { searchNews } from "@/lib/search";
import { newsUrl, mediaUrl } from "@/lib/cms";
import { cached } from "@/lib/redis";

/** Canlı arama (header dropdown). Sonuçlar Redis'te 30 sn cache'lenir. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ items: [], total: 0 });

  const data = await cached(`livesearch:${q.toLowerCase()}`, 30, async () => {
    const res = await searchNews(q, 1, 6);
    const items = res.hits.map((h: any) => ({
      url: newsUrl(h),
      title: h.title,
      titleHighlighted: h.titleHighlighted ?? h.title,
      category: h.categoryName ?? "",
      img: h.coverUrl ? mediaUrl({ id: 0, url: h.coverUrl } as any) : null,
    }));
    return { items, total: res.total, engine: res.engine };
  });

  return NextResponse.json(data);
}
