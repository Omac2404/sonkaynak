"use client";

import { useState } from "react";
import { saveKunye } from "@/lib/actions";
import { SubmitButton } from "../SubmitButton";

type Row = { baslik: string; metin: string };

const inputCls =
  "w-full rounded-lg border border-neutral-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-sk-red focus:ring-4 focus:ring-sk-red/10";

export function KunyeForm({ title, rows }: { title: string; rows: Row[] }) {
  const [list, setList] = useState<Row[]>(rows.length ? rows : [{ baslik: "", metin: "" }]);

  const setField = (i: number, k: keyof Row, v: string) =>
    setList((l) => l.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const addRow = () => setList((l) => [...l, { baslik: "", metin: "" }]);
  const removeRow = (i: number) => setList((l) => l.filter((_, idx) => idx !== i));
  const move = (i: number, d: number) =>
    setList((l) => {
      const j = i + d;
      if (j < 0 || j >= l.length) return l;
      const c = [...l];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });

  return (
    <form action={saveKunye} className="mx-auto max-w-3xl space-y-5">
      <input type="hidden" name="rows" value={JSON.stringify(list)} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink">Künye Sayfası</h1>
          <p className="mt-0.5 text-sm text-neutral-400">
            Başlıkları ve metinleri düzenleyin. Metni boş bırakılan satır sitede gösterilmez.
          </p>
        </div>
        <SubmitButton className="rounded-lg bg-sk-red px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-sk-red-dark disabled:opacity-60">
          Kaydet
        </SubmitButton>
      </div>

      <label className="block sk-card p-5">
        <span className="mb-1.5 block text-[13px] font-bold text-neutral-700">Sayfa Başlığı</span>
        <input name="kunyeTitle" defaultValue={title} className={inputCls} />
      </label>

      <div className="space-y-3">
        {list.map((r, i) => (
          <div key={i} className="sk-card space-y-3 p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-neutral-100 text-xs font-black text-neutral-400">
                {i + 1}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Yukarı" className="grid h-7 w-7 place-items-center rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} title="Aşağı" className="grid h-7 w-7 place-items-center rounded-md border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30">↓</button>
                <button type="button" onClick={() => removeRow(i)} title="Sil" className="grid h-7 w-7 place-items-center rounded-md border border-neutral-200 text-neutral-500 hover:border-red-300 hover:bg-red-50 hover:text-sk-red">✕</button>
              </div>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-bold text-neutral-600">Başlık</span>
              <input value={r.baslik} onChange={(e) => setField(i, "baslik", e.target.value)} placeholder="ör. Yayın Sahibi" className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-bold text-neutral-600">Metin <span className="font-normal text-neutral-400">(boş bırakırsan bu satır gizlenir)</span></span>
              <textarea value={r.metin} onChange={(e) => setField(i, "metin", e.target.value)} rows={2} className={inputCls} />
            </label>
          </div>
        ))}
      </div>

      <button type="button" onClick={addRow} className="w-full rounded-lg border border-dashed border-neutral-300 py-2.5 text-sm font-bold text-neutral-500 hover:border-sk-red hover:text-sk-red">
        + Satır Ekle
      </button>
    </form>
  );
}
