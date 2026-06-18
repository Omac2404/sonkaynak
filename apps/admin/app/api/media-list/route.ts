import { NextResponse } from "next/server";
import { pf } from "@/lib/payload";
import { mediaUrl } from "@/lib/media";

/** Medya kütüphanesi listesi (kütüphaneden seçme modalı için). */
export async function GET() {
  const r = await pf("/media?limit=200&sort=-createdAt");
  const items = (r.data?.docs ?? []).map((m: any) => ({
    id: m.id,
    url: mediaUrl(m, "thumbnail") ?? mediaUrl(m),
    alt: m.alt ?? m.filename ?? `#${m.id}`,
  }));
  return NextResponse.json({ items });
}
