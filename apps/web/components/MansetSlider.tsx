"use client";

import { useEffect, useState } from "react";
import type { News } from "@/lib/shared";
import { mediaUrl, newsUrl, categoryColor } from "@/lib/shared";

const INTERVAL = 5000;

export function MansetSlider({ items }: { items: News[] }) {
  const [i, setI] = useState(0);

  // Otomatik geçiş; her değişimde (otomatik ya da tıklama) süre sıfırlanır
  useEffect(() => {
    if (items.length <= 1) return;
    const t = setTimeout(() => setI((p) => (p + 1) % items.length), INTERVAL);
    return () => clearTimeout(t);
  }, [i, items.length]);

  if (!items.length) return null;
  const n = items[Math.min(i, items.length - 1)];
  const src = mediaUrl(n.coverImage, "feature");

  return (
    <div>
      <a
        href={newsUrl(n)}
        className="group relative block aspect-[16/10] overflow-hidden rounded-lg bg-neutral-800 sm:aspect-[16/9]"
      >
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={n.id}
            src={src}
            alt={n.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          {n.category && (
            <span
              className="inline-block rounded px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-white"
              style={{ background: categoryColor(n.category) }}
            >
              {n.category.name}
            </span>
          )}
          <h2 className="mt-2.5 line-clamp-3 text-2xl font-black leading-tight text-white drop-shadow-sm sm:text-[34px] md:text-[40px]">
            {n.title}
          </h2>
          {n.excerpt && (
            <p className="mt-2 hidden max-w-2xl line-clamp-2 text-[15px] leading-relaxed text-white/80 sm:block">
              {n.excerpt}
            </p>
          )}
        </div>
      </a>

      {/* Numaralı geçiş butonları */}
      {items.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              aria-label={`${idx + 1}. haber`}
              className={`grid h-9 w-9 place-items-center rounded-full border text-sm font-bold transition ${
                idx === i
                  ? "border-sk-red bg-sk-red text-white"
                  : "border-sk-line bg-white text-sk-ink hover:border-sk-red hover:text-sk-red"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
