"use client";

import { useEffect, useState } from "react";

const LEVELS = ["sm", "md", "lg", "xl"] as const;
type Level = (typeof LEVELS)[number];
const KEY = "sk-read-size";

/** Haber gövdesi yazı boyutu A− / A+ (documentElement[data-read] üzerinden CSS). */
export function ArticleFontSize() {
  const [idx, setIdx] = useState(1); // md varsayılan

  useEffect(() => {
    let saved: Level | null = null;
    try {
      saved = localStorage.getItem(KEY) as Level | null;
    } catch {
      /* çerez/site-verisi engelli olabilir — yoksay */
    }
    const start = saved ? LEVELS.indexOf(saved) : 1;
    if (start >= 0) setIdx(start);
  }, []);

  useEffect(() => {
    const lvl = LEVELS[idx];
    document.documentElement.dataset.read = lvl;
    try {
      localStorage.setItem(KEY, lvl);
    } catch {
      /* yoksay */
    }
  }, [idx]);

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-sk-line bg-white px-1 py-1">
      <button
        type="button"
        onClick={() => setIdx((i) => Math.max(0, i - 1))}
        disabled={idx === 0}
        aria-label="Yazıyı küçült"
        className="grid h-9 w-9 place-items-center rounded-md text-sm font-black text-neutral-500 transition hover:bg-neutral-100 hover:text-sk-red disabled:opacity-30"
      >
        A<span className="text-[10px]">−</span>
      </button>
      <span className="px-0.5 text-[10px] font-bold uppercase tracking-wide text-sk-muted">Aa</span>
      <button
        type="button"
        onClick={() => setIdx((i) => Math.min(LEVELS.length - 1, i + 1))}
        disabled={idx === LEVELS.length - 1}
        aria-label="Yazıyı büyült"
        className="grid h-9 w-9 place-items-center rounded-md text-base font-black text-neutral-500 transition hover:bg-neutral-100 hover:text-sk-red disabled:opacity-30"
      >
        A<span className="text-[11px]">+</span>
      </button>
    </div>
  );
}
