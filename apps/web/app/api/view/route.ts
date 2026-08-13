import { NextRequest, NextResponse } from "next/server";
import { zincr } from "@/lib/redis";

/** Haber okunma sayacı — ViewTracker istemcisinden POST edilir (Redis sorted set). */
export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    const n = Number(id);
    if (Number.isFinite(n) && n > 0) await zincr("news:views", String(n), 1);
  } catch {
    /* yoksay */
  }
  return NextResponse.json({ ok: true });
}
