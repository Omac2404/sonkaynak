"use client";

import { useEffect, useState } from "react";

/** Haber gövdesindeki görsellere tıklayınca tam ekran büyütür. */
export function ArticleLightbox() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(".sk-article-body img"));
    const handlers: [HTMLImageElement, (e: Event) => void][] = [];
    imgs.forEach((img) => {
      img.style.cursor = "zoom-in";
      const h = (e: Event) => {
        e.preventDefault();
        setSrc((e.currentTarget as HTMLImageElement).currentSrc || (e.currentTarget as HTMLImageElement).src);
      };
      img.addEventListener("click", h);
      handlers.push([img, h]);
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSrc(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      handlers.forEach(([img, h]) => img.removeEventListener("click", h));
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = src ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [src]);

  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      onClick={() => setSrc(null)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="max-h-full max-w-full object-contain" />
      <button
        aria-label="Kapat"
        onClick={() => setSrc(null)}
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full text-white/90 transition hover:bg-white/10"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
