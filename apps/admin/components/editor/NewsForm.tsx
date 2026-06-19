"use client";

import { useState, useMemo, useRef } from "react";
import { RichEditor } from "./RichEditor";
import { SubmitButton } from "../SubmitButton";
import { ImageField } from "../ImageField";
import { saveNews } from "@/lib/actions";
import { lexicalToHtml } from "@/lib/lexical";
import { computeSeo, seoColor } from "@/lib/seo";

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

export function NewsForm({
  news,
  categories,
  authors,
  canPublish,
  mediaUrl,
}: {
  news?: any;
  categories: Opt[];
  authors: Opt[];
  canPublish: boolean;
  mediaUrl?: string;
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
  const currentCoverId = news?.coverImage && typeof news.coverImage === "object" ? news.coverImage.id : news?.coverImage;

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
              <input name="tags" defaultValue={tagNames} placeholder="Türkiye, Ankara" className={inputCls} />
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
