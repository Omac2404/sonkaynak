import { NextRequest, NextResponse } from "next/server";

/**
 * Bakım modu: MAINTENANCE_MODE=true iken tüm public sayfalar "geliştiriliyor"
 * sayfasına kapatılır (mevcut site silinmez; anahtar kapanınca aynen döner).
 * Önizleme: ?preview=PREVIEW_SECRET ile çerez set edilir; o tarayıcı gerçek
 * siteyi görür, ziyaretçiler bakım sayfasını görür.
 */

const PREVIEW_COOKIE = "sk_preview";

const html = `<!doctype html>
<html lang="tr"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Çok Yakında — Son Kaynak</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;
    min-height:100vh;display:grid;place-items:center;
    background:radial-gradient(900px 500px at 50% -10%,rgba(212,20,28,.18),transparent 60%),#16181d;color:#e5e7eb;padding:24px}
  .card{max-width:560px;text-align:center}
  .logo{height:54px;width:auto;filter:brightness(0) invert(1);margin:0 auto 28px}
  .icon{width:72px;height:72px;margin:0 auto 22px;color:#d4141c}
  h1{font-size:30px;font-weight:900;letter-spacing:-.02em;color:#fff;margin-bottom:14px;line-height:1.2}
  p{font-size:16px;line-height:1.7;color:#9ca3af;max-width:440px;margin:0 auto}
  .bar{margin-top:30px;height:4px;width:140px;background:#d4141c;border-radius:99px;margin-left:auto;margin-right:auto;
    animation:pulse 1.8s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:.4;transform:scaleX(.7)}50%{opacity:1;transform:scaleX(1)}}
</style></head>
<body><div class="card">
  <img class="logo" src="/logo.png" alt="Son Kaynak" />
  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.7 2.7-2-2 2.7-2.7z"/>
  </svg>
  <h1>Çok yakında sizlerleyiz</h1>
  <p>Sitemiz şu anda geliştirilme aşamasındadır. Daha iyi bir deneyim için çalışıyoruz — kısa süre içinde yeniden yayındayız.</p>
  <div class="bar"></div>
</div></body></html>`;

export function middleware(req: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== "true") return NextResponse.next();

  const secret = process.env.PREVIEW_SECRET || "";
  const { searchParams } = req.nextUrl;

  // Önizleme linkiyle gelindiyse çerez bırak, temiz URL'e yönlendir
  if (secret && searchParams.get("preview") === secret) {
    const clean = req.nextUrl.clone();
    clean.searchParams.delete("preview");
    const res = NextResponse.redirect(clean);
    res.cookies.set(PREVIEW_COOKIE, secret, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      sameSite: "lax",
    });
    return res;
  }

  // Önizleme çerezi olan (sahip) gerçek siteyi görür
  if (secret && req.cookies.get(PREVIEW_COOKIE)?.value === secret) {
    return NextResponse.next();
  }

  // Herkese bakım sayfası
  return new NextResponse(html, {
    status: 503,
    headers: { "content-type": "text/html; charset=utf-8", "retry-after": "3600" },
  });
}

export const config = {
  // _next, api, logo ve statik dosyalar hariç tüm yollar
  matcher: ["/((?!_next/|api/|logo.png|favicon.ico|robots.txt).*)"],
};
