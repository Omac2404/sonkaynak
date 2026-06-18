"use client";

import { useEffect, useRef, useState } from "react";

type Item = { url: string; title: string; titleHighlighted: string; category: string; img: string | null };

export function HeaderSearch() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setItems([]);
      setTotal(0);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        setOpen(true);
      } catch {
        /* yoksay */
      }
    }, 300);
  }, [q]);

  return (
    <div ref={boxRef} className="relative w-full max-w-xs">
      <form action="/ara" className="flex items-center">
        <input
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => items.length && setOpen(true)}
          placeholder="Ara…"
          autoComplete="off"
          className="w-full rounded-l-md border border-sk-line border-r-0 bg-neutral-50 px-3 py-1.5 text-sm outline-none focus:border-sk-red"
        />
        <button type="submit" aria-label="Ara" className="rounded-r-md border border-sk-red bg-sk-red px-3 py-1.5 text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </form>

      {open && items.length > 0 && (
        <div className="absolute right-0 top-full z-50 mt-1 max-h-[360px] w-[340px] overflow-y-auto rounded-lg border border-sk-line bg-white shadow-xl">
          {items.map((it, i) => (
            <a key={i} href={it.url} className="flex items-center gap-3 border-b border-sk-line px-3 py-2 last:border-0 hover:bg-neutral-50">
              {it.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.img} alt="" className="h-9 w-12 shrink-0 rounded object-cover" />
              ) : (
                <div className="h-9 w-12 shrink-0 rounded bg-neutral-100" />
              )}
              <div className="min-w-0">
                <div
                  className="truncate text-sm font-semibold text-sk-ink [&_mark]:bg-yellow-200 [&_mark]:text-sk-ink"
                  dangerouslySetInnerHTML={{ __html: it.titleHighlighted }}
                />
                {it.category && <div className="text-[11px] font-bold uppercase text-sk-red">{it.category}</div>}
              </div>
            </a>
          ))}
          <a href={`/ara?q=${encodeURIComponent(q.trim())}`} className="block bg-neutral-50 px-3 py-2 text-center text-sm font-bold text-sk-red hover:underline">
            Tüm sonuçları gör ({total})
          </a>
        </div>
      )}
    </div>
  );
}
