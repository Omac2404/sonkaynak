import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { CookieBanner } from "@/components/CookieBanner";
import { FinanceTicker } from "@/components/FinanceTicker";
import { SonDakikaBar } from "@/components/SonDakikaBar";
import { AdSlot } from "@/components/AdSlot";
import { getSettings, getSonDakika, getAds, mediaUrl } from "@/lib/cms";
import { getFinanceView } from "@/lib/finance";

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
  const [s, financeView, sonDakika, headerAds] = await Promise.all([
    getSettings(),
    getFinanceView(),
    getSonDakika(8),
    getAds("header"),
  ]);
  const siteName = s.siteName ?? "Son Kaynak";
  const logo = mediaUrl(s.logo, "feature");

  // Piyasa bandı: admin kapatmadıysa göster (getFinanceView elle değerleri uygular)
  const financeEnabled = financeView.enabled;
  const financeMerged = financeView.finance;

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

  // WebSite + site içi arama kutusu (Google Sitelinks Searchbox)
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: SITE_URL,
    inLanguage: "tr-TR",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/ara?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
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

        {/* Site geneli Organization + WebSite JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd).replace(/</g, "\\u003c") }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd).replace(/</g, "\\u003c") }} />

        {financeEnabled && <FinanceTicker finance={financeMerged} />}
        <Header />
        <SonDakikaBar items={sonDakika} />
        {headerAds.length > 0 && (
          <div className="mx-auto max-w-[1360px] px-3 pt-4 sm:px-4">
            <AdSlot ads={headerAds} variant="banner" />
          </div>
        )}
        <main className="min-h-screen">{children}</main>
        <Footer />
        <BackToTop />
        <CookieBanner />

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
