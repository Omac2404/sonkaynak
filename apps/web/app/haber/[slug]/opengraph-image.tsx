import { ImageResponse } from "next/og";
import { getNewsBySlug, categoryColor } from "@/lib/cms";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Son Kaynak";

async function loadFont(weight: 400 | 800): Promise<ArrayBuffer | null> {
  try {
    const url = `https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-ext-${weight}-normal.woff`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  const title = news?.title ?? "Son Kaynak";
  const cat = news?.category?.name ?? "Haber";
  const color = categoryColor(news?.category ?? undefined);

  const [reg, bold] = await Promise.all([loadFont(400), loadFont(800)]);
  const fonts = [
    ...(reg ? [{ name: "Inter", data: reg, weight: 400 as const, style: "normal" as const }] : []),
    ...(bold ? [{ name: "Inter", data: bold, weight: 800 as const, style: "normal" as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "64px 72px",
          fontFamily: fonts.length ? "Inter" : "sans-serif",
        }}
      >
        <div style={{ display: "flex" }}>
          <div
            style={{
              background: color,
              color: "#fff",
              fontSize: 28,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 2,
              padding: "10px 26px",
              borderRadius: 10,
            }}
          >
            {cat}
          </div>
        </div>

        <div style={{ display: "flex", fontSize: title.length > 80 ? 56 : 68, fontWeight: 800, color: "#14161c", lineHeight: 1.15 }}>
          {title.length > 140 ? title.slice(0, 137) + "…" : title}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 40, fontWeight: 800 }}>
            <span style={{ color: "#14161c" }}>SON</span>
            <span style={{ color: "#d4141c" }}>KAYNAK</span>
          </div>
          <div style={{ height: 8, width: 220, background: "#d4141c", borderRadius: 8 }} />
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
