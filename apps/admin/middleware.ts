import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE = "sk_admin_token";

export function middleware(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  const { pathname } = req.nextUrl;

  // Yalnızca çerez YOKKEN koru. Çerez var ama geçersizse (token süresi dolmuş
  // veya CMS bir an ulaşılamamış) yönlendirmeyi /login sayfasına bırakıyoruz;
  // aksi halde layout (geçerlilik) ile middleware (varlık) çakışıp sonsuz
  // yönlendirme döngüsü (ERR_TOO_MANY_REDIRECTS) oluşuyordu.
  if (!token && pathname !== "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
