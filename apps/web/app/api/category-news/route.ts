import { NextResponse } from "next/server";
import { getNewsByCategory } from "@/lib/cms";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cat = Number(searchParams.get("cat"));
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  if (!cat) return NextResponse.json({ docs: [], totalPages: 0 });
  const r = await getNewsByCategory(cat, page, 12);
  return NextResponse.json({ docs: r.docs, totalPages: r.totalPages });
}
