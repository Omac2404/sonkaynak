"use client";

import { useState, useMemo, useRef } from "react";
import { RichEditor } from "./RichEditor";
import { SubmitButton } from "../SubmitButton";
import { ImageField } from "../ImageField";
import { saveNews } from "@/lib/actions";
import { lexicalToHtml } from "@/lib/lexical";
import { computeSeo, seoColor } from "@/lib/seo";
import { NewsShare } from "../NewsShare";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sonkaynak.com";

type Opt = { id: number; label: string };

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-neutral-400">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-sk-red focus:ring-4 focus:ring-sk-red/10";

// Etiket önerisinde elenecek yaygın Türkçe kelimeler
const TR_STOP = new Set([
  "ve", "ile", "için", "bir", "bu", "şu", "ki", "da", "de", "mi", "mu", "ama", "çok", "daha", "olarak",
  "göre", "kadar", "sonra", "önce", "gibi", "her", "en", "ya", "veya", "ancak", "ise", "var", "yok",
  "oldu", "olan", "olacak", "olduğu", "ediyor", "etti", "diye", "dedi", "yani", "hem", "tüm", "bütün",
  "kendi", "böyle", "şöyle", "hangi", "neden", "nasıl", "birlikte", "arasında", "üzerine", "içinde",
]);

export function NewsForm({
  news,
  categories,
  authors,
  canPublish,
  mediaUrl,
  inStory = false,
}: {
  news?: any;
  categories: Opt[];
  authors: Opt[];
  canPublish: boolean;
  mediaUrl?: string;
  inStory?: boolean;
}) {
  const initialBody = news?.body || (news?.content ? lexicalToHtml(news.content) : "");
  const [body, setBody] = useState<string>(initialBody);
  // intent'i submit butonu name/value yerine ref'li gizli alandan gönderiyoruz
  // (submitter değeri bazı durumlarda server action'a ulaşmıyordu)
  const intentRef = useRef<HTMLInputElement>(null);
  const [hasCover, setHasCover] = useState<boolean>(Boolean(mediaUrl));
  const [title, setTitle] = useState<string>(news?.title ?? "");
  const [excerpt, setExcerpt] = useState<string>(news?.excerpt ?? "");
  const [focusKeyword, setFocusKeyword] = useState<string>(news?.seo?.focusKeyword ?? "");
  const [metaDescription, setMetaDescription] = useState<string>(news?.seo?.metaDescription ?? "");

  const seo = useMemo(
    () => computeSeo({ title, bodyHtml: body, hasImage: hasCover, focusKeyword, metaDescription }),
    [title, body, hasCover, focusKeyword, metaDescription],
  );

  const tagNames =
    Array.isArray(news?.tags) ? news.tags.map((t: any) => (typeof t === "object" ? t.name : t)).join(", ") : "";
  const [tags, setTags] = useState<string>(tagNames);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const currentCoverId = news?.coverImage && typeof news.coverImage === "object" ? news.coverImage.id : news?.coverImage;

  const currentTagList = () =>
    tags.split(",").map((s) => s.trim()).filter(Boolean);

  const suggestTags = () => {
    const text = `${title} ${excerpt} ${body.replace(/<[^>]+>/g, " ")}`;
    const existing = new Set(currentTagList().map((s) => s.toLocaleLowerCase("tr")));
    const counts = new Map<string, { disp: string; n: number; proper: boolean }>();
    const words = text.replace(/[^\p{L}\s]/gu, " ").split(/\s+/).filter(Boolean);
    for (const w of words) {
      if (w.length < 4) continue;
      const lower = w.toLocaleLowerCase("tr");
      if (TR_STOP.has(lower)) continue;
      const proper = /^\p{Lu}/u.test(w);
      const e = counts.get(lower) ?? { disp: proper ? w : lower, n: 0, proper: false };
      e.n += 1;
      if (proper) { e.proper = true; e.disp = w; }
      counts.set(lower, e);
    }
    const out = [...counts.values()]
      .filter((e) => !existing.has(e.disp.toLocaleLowerCase("tr")))
      .sort((a, b) => (b.proper ? 100 : 0) + b.n - ((a.proper ? 100 : 0) + a.n))
      .slice(0, 8)
      .map((e) => e.disp);
    setSuggestions(out);
  };

  const addTag = (t: string) => {
    const list = currentTagList();
    if (!list.some((x) => x.toLocaleLowerCase("tr") === t.toLocaleLowerCase("tr"))) {
      setTags([...list, t].join(", "));
    }
    setSuggestions((prev) => (prev ? prev.filter((x) => x !== t) : prev));
  };

  return (
    <form action={saveNews} className="mx-auto max-w-5xl">
      <input type="hidden" name="id" value={news?.id ?? ""} />
      <input type="hidden" name="body" value={body} />
      <input ref={intentRef} type="hidden" name="intent" defaultValue="draft" />

      <div className="mb-5 flex items-center justify-between gap-3">
        <a href="/haberler" className="text-sm font-bold text-neutral-500 hover:text-sk-red">← Haberler</a>
        <div className="flex gap-2">
          <SubmitButton onClick={() => { if (intentRef.current) intentRef.current.value = "draft"; }} pendingText="Kaydediliyor…" className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60">
            Taslak Kaydet
          </SubmitButton>
          {canPublish ? (
            <SubmitButton onClick={() => { if (intentRef.current) intentRef.current.value = "publish"; }} pendingText="Yayınlanıyor…" className="rounded-lg bg-sk-red px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-sk-red-dark disabled:opacity-60">
              Yayınla
            </SubmitButton>
          ) : (
            <SubmitButton onClick={() => { if (intentRef.current) intentRef.current.value = "submit"; }} pendingText="Gönderiliyor…" className="rounded-lg bg-sk-red px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-sk-red-dark disabled:opacity-60">
              Onaya Gönder
            </SubmitButton>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Ana sütun */}
        <div className="space-y-5">
          <Field label="Başlık">
            <input name="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Haber başlığı" className={`${inputCls} text-base font-semibold`} />
          </Field>

          <Field label="Özet / Spot" hint="1-2 cümle. Liste ve paylaşımda görünür.">
            <textarea name="excerpt" rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={inputCls} />
          </Field>

          <div>
            <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">Haber Metni</span>
            <RichEditor value={initialBody} onChange={setBody} />
          </div>

          {/* SEO */}
          <details className="rounded-xl border border-neutral-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-bold text-neutral-700">SEO Ayarları</summary>
            <div className="mt-4 space-y-4">
              <Field label="Odak Anahtar Kelime">
                <input name="focusKeyword" value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Meta Açıklama" hint="İdeal: 100-160 karakter.">
                <textarea name="metaDescription" rows={2} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} className={inputCls} />
              </Field>
            </div>
          </details>
        </div>

        {/* Kenar çubuğu */}
        <div className="space-y-5">
          {/* Son Dakika */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4">
            <input type="checkbox" name="sonDakika" defaultChecked={Boolean(news?.sonDakika)} className="h-4 w-4 accent-sk-red" />
            <span className="text-sm font-bold text-ink">
              Son Dakika <span className="font-normal text-neutral-400">— kartlarda kırmızı rozet</span>
            </span>
          </label>

          {/* Sosyal medyada paylaş (kaydedilmiş haber) */}
          {news?.slug && (
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="mb-2.5 flex items-center gap-2">
                <span className="text-sm font-bold text-ink">Sosyal Medyada Paylaş</span>
              </div>
              {news?._status !== "published" && (
                <p className="mb-2.5 rounded-md bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700">
                  Bu haber henüz yayında değil; bağlantı yayınlandıktan sonra çalışır.
                </p>
              )}
              <NewsShare url={`${SITE_URL}/haber/${news.slug}`} title={news.title ?? title} />
            </div>
          )}

          {/* Hikayelere ekle (yalnızca editör/yayınlayabilenler) */}
          {canPublish && (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4">
              <input type="checkbox" name="addToStory" defaultChecked={inStory} className="h-4 w-4 accent-sk-red" />
              <span className="text-sm font-bold text-ink">
                Hikayelere ekle <span className="font-normal text-neutral-400">— anasayfa hikaye şeridinde göster</span>
              </span>
            </label>
          )}

          {/* Canlı SEO skoru */}
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-3">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-black text-white"
                style={{ background: seoColor(seo.score) }}
              >
                {seo.score}
              </div>
              <div>
                <div className="text-sm font-bold text-ink">SEO Skoru</div>
                <div className="text-[11px] text-neutral-400">Yazdıkça güncellenir</div>
              </div>
            </div>
            <ul className="space-y-1.5">
              {seo.checks.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-[12px]">
                  <span className={c.ok ? "text-green-600" : "text-neutral-300"}>{c.ok ? "✓" : "○"}</span>
                  <span className={c.ok ? "text-neutral-600" : "text-neutral-400"}>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <ImageField
              label="Kapak Görseli"
              fileName="cover"
              idName="currentCover"
              currentId={currentCoverId}
              currentUrl={mediaUrl}
              onChange={setHasCover}
            />
          </div>

          <div className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4">
            <Field label="Kategori">
              <select name="category" defaultValue={currentRel(news?.category)} className={inputCls}>
                <option value="">— Seç —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Yazar">
              <select name="author" defaultValue={currentRel(news?.author)} className={inputCls}>
                <option value="">— Seç —</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Etiketler" hint="Virgülle ayırın.">
              <input name="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Türkiye, Ankara" className={inputCls} />
              <button
                type="button"
                onClick={suggestTags}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-sk-red/30 bg-sk-red/5 px-3 py-1.5 text-[12px] font-bold text-sk-red transition hover:bg-sk-red/10"
              >
                🤖 AI Etiket Önerisi
              </button>
              {suggestions && (
                <div className="mt-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2.5">
                  {suggestions.length === 0 ? (
                    <p className="text-[12px] text-neutral-400">Öneri bulunamadı — başlık ve metni doldurduktan sonra tekrar deneyin.</p>
                  ) : (
                    <>
                      <p className="mb-1.5 text-[11px] font-bold text-neutral-400">Önerilen etiketler (eklemek için tıklayın):</p>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => addTag(sug)}
                            className="rounded-full border border-neutral-300 bg-white px-2.5 py-1 text-[12px] font-semibold text-neutral-600 transition hover:border-sk-red hover:bg-sk-red hover:text-white"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </Field>
          </div>
        </div>
      </div>
    </form>
  );
}

function currentRel(v: any): string {
  if (!v) return "";
  return String(typeof v === "object" ? v.id : v);
}
