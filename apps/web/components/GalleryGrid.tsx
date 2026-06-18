"use client";

import { useEffect, useState } from "react";

type Item = { url?: string; thumb?: string; caption?: string };

export function GalleryGrid({ items, title }: { items: Item[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % items.length));
      else if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, items.length]);

  const cur = open !== null ? items[open] : null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((it, i) => (
          <button key={i} onClick={() => setOpen(i)} className="group block overflow-hidden rounded-xl border border-sk-line text-left">
            {it.thumb || it.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.thumb ?? it.url} alt={it.caption ?? title} loading="lazy" className="w-full object-cover transition group-hover:opacity-90" />
            ) : null}
            {it.caption && <div className="bg-neutral-50 px-4 py-2 text-sm text-sk-muted">{it.caption}</div>}
          </button>
        ))}
      </div>

      {cur && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setOpen(null)}>
          <button className="absolute right-5 top-5 text-3xl text-white/80 hover:text-white" onClick={() => setOpen(null)} aria-label="Kapat">×</button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl text-white/70 hover:text-white"
            onClick={(e) => { e.stopPropagation(); setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length)); }}
            aria-label="Önceki"
          >
            ‹
          </button>
          <figure className="max-h-[88vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cur.url ?? cur.thumb} alt={cur.caption ?? title} className="mx-auto max-h-[80vh] w-auto rounded-lg object-contain" />
            <figcaption className="mt-3 text-center text-sm text-white/70">
              {cur.caption ? `${cur.caption} · ` : ""}
              {(open ?? 0) + 1} / {items.length}
            </figcaption>
          </figure>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl text-white/70 hover:text-white"
            onClick={(e) => { e.stopPropagation(); setOpen((i) => (i === null ? i : (i + 1) % items.length)); }}
            aria-label="Sonraki"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
