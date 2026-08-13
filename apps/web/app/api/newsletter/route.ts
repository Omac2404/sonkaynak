import { NextRequest, NextResponse } from "next/server";
import { sadd } from "@/lib/redis";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Bülten kaydı — geçerli e-postayı Redis set'ine ekler. */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const e = String(email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(e)) {
      return NextResponse.json({ ok: false, error: "Geçersiz e-posta" }, { status: 400 });
    }
    await sadd("newsletter:emails", e);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Kayıt başarısız" }, { status: 500 });
  }
}
