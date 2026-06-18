export type SeoCheck = { label: string; ok: boolean; points: number };
export type SeoResult = { score: number; checks: SeoCheck[] };

export function computeSeo(input: {
  title: string;
  bodyHtml: string;
  hasImage: boolean;
  focusKeyword: string;
  metaDescription: string;
}): SeoResult {
  const title = (input.title ?? "").trim();
  const text = (input.bodyHtml ?? "").replace(/<[^>]+>/g, " ").trim();
  const kw = (input.focusKeyword ?? "").trim().toLowerCase();
  const meta = (input.metaDescription ?? "").trim();
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;

  const checks: SeoCheck[] = [];
  const add = (label: string, ok: boolean, points: number) => checks.push({ label, ok, points });

  add("Başlık 40-65 karakter", title.length >= 40 && title.length <= 65, 15);
  add("İçerik en az 300 kelime", words >= 300, 20);
  add("Kapak görseli var", input.hasImage, 15);
  add("Anahtar kelime başlıkta", Boolean(kw) && title.toLowerCase().includes(kw), 15);
  add("Anahtar kelime metinde 2+ kez", Boolean(kw) && text.toLowerCase().split(kw).length - 1 >= 2, 10);
  add("Meta açıklama 100-160 karakter", meta.length >= 100 && meta.length <= 160, 15);
  add("Anahtar kelime girildi", Boolean(kw), 5);
  add("Meta açıklama girildi", Boolean(meta), 5);

  const score = Math.min(100, checks.reduce((s, c) => (c.ok ? s + c.points : s), 0));
  return { score, checks };
}

export function seoColor(score: number): string {
  if (score >= 75) return "#16a34a";
  if (score >= 45) return "#ca8a04";
  return "#e0142c";
}
