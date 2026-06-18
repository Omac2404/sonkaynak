import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Payload'ın kendi admin arayüzü KAPALI — /admin/* özel panele yönlendirilir.
 * Payload REST/GraphQL API'si (/api/*) etkilenmez.
 * Acil durumda açmak için ENABLE_PAYLOAD_ADMIN=true yapın.
 */
export function middleware(req: NextRequest) {
  if (process.env.ENABLE_PAYLOAD_ADMIN === "true") return NextResponse.next();
  const target = process.env.ADMIN_URL ?? "http://localhost:3102";
  return NextResponse.redirect(target);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
