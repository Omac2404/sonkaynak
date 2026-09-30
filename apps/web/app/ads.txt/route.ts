import { getSettings } from "@/lib/cms";

export const revalidate = 3600;

/** AdSense için ads.txt — panelde girilen içerik, yoksa ca-pub'dan otomatik satır. */
export async function GET() {
  const s = await getSettings();
  let body = (s.adsTxt ?? "").trim();
  if (!body) {
    const caPub = (s.adsenseCode ?? "").match(/pub-\d+/)?.[0];
    if (caPub) body = `google.com, ${caPub}, DIRECT, f08c47fec0942fa0`;
  }
  return new Response(body || "", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
