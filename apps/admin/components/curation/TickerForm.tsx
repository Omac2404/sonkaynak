"use client";

import { SubmitButton } from "../SubmitButton";

import { useState } from "react";
import { saveTicker } from "@/lib/actions";

type Row = { text: string; url?: string };

function ListEditor({ rows, setRows, accent }: { rows: Row[]; setRows: (r: Row[]) => void; accent: string }) {
  const update = (i: number, key: keyof Row, val: string) => {
    const c = [...rows];
    c[i] = { ...c[i], [key]: val };
    setRows(c);
  };
  const inp = "rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-sk-red focus:ring-2 focus:ring-sk-red/10";
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={r.text} onChange={(e) => update(i, "text", e.target.value)} placeholder="Metin" className={`${inp} flex-1`} />
          <input value={r.url ?? ""} onChange={(e) => update(i, "url", e.target.value)} placeholder="Bağlantı (ops.)" className={`${inp} w-40`} />
          <button type="button" onClick={() => setRows(rows.filter((_, j) => j !== i))} className="grid h-8 w-8 place-items-center rounded-md text-neutral-400 hover:bg-red-50 hover:text-sk-red">✕</button>
        </div>
      ))}
      <button type="button" onClick={() => setRows([...rows, { text: "", url: "" }])} className="text-sm font-bold" style={{ color: accent }}>
        + Madde ekle
      </button>
    </div>
  );
}

export function TickerForm({ initial }: { initial: any }) {
  const [sd, setSd] = useState<Row[]>(initial?.sonDakika ?? []);
  const [es, setEs] = useState<Row[]>(initial?.editorSecimi ?? []);

  return (
    <form action={saveTicker} className="mx-auto max-w-3xl">
      <input type="hidden" name="sonDakika" value={JSON.stringify(sd.filter((r) => r.text))} />
      <input type="hidden" name="editorSecimi" value={JSON.stringify(es.filter((r) => r.text))} />

      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight text-ink">Kayan Şeritler</h1>
        <SubmitButton className="rounded-lg bg-sk-red px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-sk-red-dark disabled:opacity-60">Kaydet</SubmitButton>
      </div>

      <div className="space-y-5">
        <div className="sk-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-ink">🔴 Son Dakika Şeridi</h2>
            <label className="flex items-center gap-2 text-xs font-bold text-neutral-500">
              Hız (sn)
              <input name="sonDakikaSpeed" type="number" defaultValue={initial?.sonDakikaSpeed ?? 10} className="w-16 rounded-md border border-neutral-300 px-2 py-1 text-sm" />
            </label>
          </div>
          <ListEditor rows={sd} setRows={setSd} accent="#e0142c" />
        </div>

        <div className="sk-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-ink">🟢 Editör Seçimi Şeridi</h2>
            <label className="flex items-center gap-2 text-xs font-bold text-neutral-500">
              Hız (sn)
              <input name="editorSecimiSpeed" type="number" defaultValue={initial?.editorSecimiSpeed ?? 10} className="w-16 rounded-md border border-neutral-300 px-2 py-1 text-sm" />
            </label>
          </div>
          <ListEditor rows={es} setRows={setEs} accent="#16a34a" />
        </div>
      </div>
    </form>
  );
}
