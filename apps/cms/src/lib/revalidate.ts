/**
 * İçerik değişince web uygulamasının on-demand revalidation ucunu tetikler.
 * WEB_URL (dahili, örn. http://sonkaynak_web:3100) ve REVALIDATE_SECRET
 * tanımlı değilse sessizce hiçbir şey yapmaz (örn. seed/lokal).
 */
export async function revalidateWeb(): Promise<void> {
  const base = process.env.WEB_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!base || !secret) return;
  try {
    await fetch(`${base}/api/revalidate?secret=${encodeURIComponent(secret)}`, {
      method: "POST",
      cache: "no-store",
    });
  } catch {
    /* web ulaşılamazsa içeriği kaydetmeyi engelleme */
  }
}
