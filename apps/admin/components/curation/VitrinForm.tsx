"use client";

import { SubmitButton } from "../SubmitButton";

import { saveVitrin } from "@/lib/actions";

type Opt = { id: number; label: string };

export function VitrinForm({ categories, news, slots }: { categories: Opt[]; news: Opt[]; slots: any[] }) {
  const get = (i: number, key: string) => {
    const s = slots[i];
    if (!s) return "";
    const v = s[key];
    return v ? String(typeof v === "object" ? v.id : v) : "";
  };
  const sel = "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-sk-red focus:ring-4 focus:ring-sk-red/10";

  return (
    <form action={saveVitrin} className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink">Kategori Vitrini</h1>
          <p className="mt-0.5 text-sm text-neutral-400">Anasayfada 5 kategori bölümü</p>
        </div>
        <SubmitButton className="rounded-lg bg-sk-red px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-sk-red-dark disabled:opacity-60">Kaydet</SubmitButton>
      </div>

      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="sk-card grid items-end gap-3 p-4 sm:grid-cols-[40px_1fr_1fr]">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-neutral-100 text-sm font-black text-neutral-400">{i + 1}</span>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-neutral-500">Kategori</span>
              <select name={`cat${i}`} defaultValue={get(i, "category")} className={sel}>
                <option value="">— Boş —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-neutral-500">Öne Çıkan Haber</span>
              <select name={`pin${i}`} defaultValue={get(i, "pinnedNews")} className={sel}>
                <option value="">En yeni (otomatik)</option>
                {news.map((n) => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
              </select>
            </label>
          </div>
        ))}
      </div>
    </form>
  );
}
