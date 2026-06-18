/**
 * Lexical richText JSON'undan düz metin çıkarır (kelime sayımı / SEO için).
 */
export function lexicalToPlainText(node: any): string {
  if (!node) return "";
  if (typeof node === "string") return node;
  let out = "";
  if (typeof node.text === "string") out += node.text + " ";
  const children = node.children ?? node.root?.children;
  if (Array.isArray(children)) {
    for (const child of children) out += lexicalToPlainText(child);
  }
  return out;
}

type SeoInput = {
  title?: string;
  contentText?: string;
  hasImage?: boolean;
  focusKeyword?: string;
  metaDescription?: string;
};

/**
 * 0-100 arası SEO skoru. WP eklentisindeki mantığın düzeltilmiş hâli
 * (mb_substr_count bug'ı giderildi).
 */
export function computeSeoScore(input: SeoInput): number {
  const title = (input.title ?? "").trim();
  const text = (input.contentText ?? "").trim();
  const kw = (input.focusKeyword ?? "").trim().toLowerCase();
  const meta = (input.metaDescription ?? "").trim();
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;

  let score = 0;

  // Başlık uzunluğu (maks 15)
  if (title.length >= 40 && title.length <= 65) score += 15;
  else if (title.length >= 20) score += 7;

  // İçerik uzunluğu (maks 20)
  if (words >= 300) score += 20;
  else if (words >= 150) score += 10;

  // Kapak görseli (15)
  if (input.hasImage) score += 15;

  // Anahtar kelime başlıkta (15)
  if (kw && title.toLowerCase().includes(kw)) score += 15;

  // Anahtar kelime içerikte 2+ kez (10)
  if (kw) {
    const count = text.toLowerCase().split(kw).length - 1;
    if (count >= 2) score += 10;
  }

  // Meta açıklama (maks 15)
  if (meta.length >= 100 && meta.length <= 160) score += 15;
  else if (meta.length > 0) score += 7;

  // Bonuslar
  if (kw) score += 5;
  if (meta) score += 5;

  return Math.min(100, score);
}
