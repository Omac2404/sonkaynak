"use client";

import { SubmitButton } from "../SubmitButton";

import { useMemo, useState } from "react";
import { saveCuration } from "@/lib/actions";

export type PickItem = { id: number; label: string; sub?: string };

export function OrderedPicker({
  slug,
  relKey,
  route,
  title,
  items,
  initialIds,
  max = 12,
  formAction,
}: {
  slug: string;
  relKey: "news" | "category";
  route: string;
  title: string;
  items: PickItem[];
  initialIds: number[];
  max?: number;
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const [selected, setSelected] = useState<number[]>(initialIds.filter((id) => byId.has(id)));
  const [q, setQ] = useState("");
  const [drag, setDrag] = useState<number | null>(null);

  const dropAt = (to: number) => {
    setSelected((s) => {
      if (drag === null || drag === to) return s;
      const c = [...s];
      const [moved] = c.splice(drag, 1);
      c.splice(to, 0, moved);
      return c;
    });
    setDrag(null);
  };

  const available = items
    .filter((i) => !selected.includes(i.id))
    .filter((i) => (q ? i.label.toLowerCase().includes(q.toLowerCase()) : true))
    .slice(0, 30);

  const add = (id: number) => selected.length < max && setSelected((s) => [...s, id]);
  const remove = (id: number) => setSelected((s) => s.filter((x) => x !== id));
  const move = (i: number, dir: -1 | 1) => {
    setSelected((s) => {
      const j = i + dir;
      if (j < 0 || j >= s.length) return s;
      const c = [...s];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  };

  return (
    <form action={formAction ?? saveCuration} className="mx-auto max-w-5xl">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="relKey" value={relKey} />
      <input type="hidden" name="route" value={route} />
      <input type="hidden" name="ids" value={JSON.stringify(selected)} />

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-ink">{title}</h1>
          <p className="mt-0.5 text-sm text-neutral-400">{selected.length} / {max} seçili</p>
        </div>
        <SubmitButton className="rounded-lg bg-sk-red px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-sk-red-dark disabled:opacity-60">Kaydet</SubmitButton>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Seçili */}
        <div className="sk-card p-4">
          <h2 className="mb-3 text-sm font-extrabold text-ink">Seçili (sıralı)</h2>
          {selected.length === 0 ? (
            <p className="py-6 text-sm text-neutral-400">Henüz seçim yok. Sağdan ekleyin.</p>
          ) : (
            <ul className="space-y-2">
              {selected.map((id, i) => {
                const it = byId.get(id);
                if (!it) return null;
                return (
                  <li
                    key={id}
                    draggable
                    onDragStart={() => setDrag(i)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => dropAt(i)}
                    onDragEnd={() => setDrag(null)}
                    className={`flex items-center gap-2 rounded-lg border bg-neutral-50/60 p-2 ${
                      drag === i ? "border-sk-red opacity-50" : "border-neutral-200"
                    }`}
                  >
                    <span className="cursor-grab select-none text-neutral-300" title="Sürükle">⠿</span>
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-sk-red text-[11px] font-black text-white">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-[13px] font-bold text-ink">{it.label}</span>
                      {it.sub && <span className="text-[11px] text-neutral-400">{it.sub}</span>}
                    </span>
                    <button type="button" onClick={() => move(i, -1)} className="grid h-7 w-7 place-items-center rounded-md text-neutral-500 hover:bg-neutral-200">↑</button>
                    <button type="button" onClick={() => move(i, 1)} className="grid h-7 w-7 place-items-center rounded-md text-neutral-500 hover:bg-neutral-200">↓</button>
                    <button type="button" onClick={() => remove(id)} className="grid h-7 w-7 place-items-center rounded-md text-neutral-400 hover:bg-red-50 hover:text-sk-red">✕</button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Ekle */}
        <div className="sk-card p-4">
          <h2 className="mb-3 text-sm font-extrabold text-ink">Ekle</h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ara…"
            className="mb-3 w-full rounded-lg border border-neutral-300 px-3.5 py-2 text-sm outline-none focus:border-sk-red focus:ring-4 focus:ring-sk-red/10"
          />
          <ul className="max-h-[420px] space-y-1.5 overflow-y-auto">
            {available.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => add(it.id)}
                  disabled={selected.length >= max}
                  className="flex w-full items-center gap-2 rounded-lg border border-neutral-200 p-2 text-left transition hover:border-sk-red hover:bg-red-50/40 disabled:opacity-40"
                >
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 text-[13px] font-semibold text-ink">{it.label}</span>
                    {it.sub && <span className="text-[11px] text-neutral-400">{it.sub}</span>}
                  </span>
                  <span className="text-sk-red">+</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </form>
  );
}
