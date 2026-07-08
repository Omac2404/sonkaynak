import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { getSettings, mediaUrl } from "@/lib/cms";

const inter = Inter({ subsets: ["latin", "latin-ext"], display: "swap", variable: "--font-inter" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "http://localhost:3101";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const siteName = s.siteName ?? "Son Kaynak";
  const desc = s.siteDescription ?? "Son Kaynak: gündem, ekonomi, spor, dünya ve yerel son dakika haberleri.";
  return {
    title: { default: `${siteName} — Son Dakika Haberleri`, template: `%s — ${siteName}` },
    description: desc,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: SITE_URL,
      types: { "application/rss+xml": `${SITE_URL}/rss.xml` },
    },
    openGraph: { type: "website", siteName, title: siteName, description: desc, url: SITE_URL, locale: "tr_TR" },
    ...(s.gscVerify ? { verification: { other: { "google-site-verification": s.gscVerify } } } : {}),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const siteName = s.siteName ?? "Son Kaynak";
  const logo = mediaUrl(s.logo, "feature");

  const sameAs = [
    s.twitter ? `https://twitter.com/${s.twitter.replace(/^@/, "")}` : null,
    s.facebook,
    s.instagram,
    s.youtube,
    s.linkedin,
  ].filter(Boolean);

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: siteName,
    url: SITE_URL,
    ...(logo ? { logo: { "@type": "ImageObject", url: logo } } : {}),
    ...(s.siteDescription ? { description: s.siteDescription } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <html lang="tr" className={inter.variable}>
      <body suppressHydrationWarning className="font-sans">
        {/* Karanlık mod tercihini boyamadan önce uygula (flash önleme) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia&&matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />

        {/* Bağlantıyı erken aç (doğrudan CMS'ten yüklenen görseller için) */}
        <link rel="preconnect" href={CMS_URL} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={CMS_URL} />

        {/* Site geneli Organization JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />

        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <BackToTop />

        {/* Google Analytics */}
        {s.gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${s.gaId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.gaId}');`,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
