import { NextRequest, NextResponse } from "next/server";
import { getNextArticle } from "@/lib/cms";

/**
 * Kesintisiz okuma: verilen etiket/kategoriye göre, gösterilmemiş bir sonraki
 * yayınlanmış haberi döndürür. Hata durumunda article:null (istemci durur).
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const tagIds = (sp.get("tags") ?? "").split(",").map(Number).filter(Boolean);
    const categoryId = Number(sp.get("category")) || null;
    const exclude = (sp.get("exclude") ?? "").split(",").map(Number).filter(Boolean);
    const article = await getNextArticle(tagIds, categoryId, exclude);
    return NextResponse.json({ article });
  } catch {
    return NextResponse.json({ article: null });
  }
}
