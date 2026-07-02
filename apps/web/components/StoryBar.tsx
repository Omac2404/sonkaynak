"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { News } from "@/lib/shared";
import { mediaUrl, newsUrl, categoryColor } from "@/lib/shared";

const DURATION = 5000; // her story süresi (ms)

export function StoryBar({ items }: { items: News[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => {
      if (c < items.length - 1) return c + 1;
      setOpen(false);
      return c;
    });
  }, [items.length]);

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);

  const openAt = (i: number) => {
    setCurrent(i);
    setOpen(true);
  };

  // Otomatik geçiş + klavye + arka plan kilidi
  useEffect(() => {
    if (!open) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(next, DURATION);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (timer.current) clearTimeout(timer.current);
    };
  }, [open, current, next, prev, close]);

  if (!items.length) return null;

  const goArticle = () => {
    const n = items[current];
    close();
    router.push(newsUrl(n));
  };

  return (
    <>
      {/* Halka şeridi — yalnızca mobil/tablet */}
      <div className="mb-6 flex gap-4 overflow-x-auto pb-2 lg:hidden">
        {items.map((n, i) => {
          const img = mediaUrl(n.coverImage, "thumbnail");
          return (
            <button
              key={n.id}
              onClick={() => openAt(i)}
              className="group flex w-[74px] shrink-0 flex-col items-center gap-1.5 text-center"
            >
              <span className="rounded-full bg-gradient-to-tr from-sk-red to-orange-400 p-[2.5px]">
                <span className="block rounded-full border-2 border-white">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt={n.title} className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-xl">📰</span>
                  )}
                </span>
              </span>
              <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-sk-ink">{n.title}</span>
            </button>
          );
        })}
      </div>

      {/* Tam ekran görüntüleyici */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
          {(() => {
            const n = items[current];
            const big = mediaUrl(n.coverImage, "feature") || mediaUrl(n.coverImage);
            return (
              <div className="relative h-full w-full max-w-[500px] overflow-hidden bg-neutral-900">
                {/* Görsel: bulanık arka plan + tam sığan asıl görsel */}
                {big ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={big} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl brightness-50" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={big} alt={n.title} className="absolute inset-0 h-full w-full object-contain" />
                  </>
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-6xl">📰</div>
                )}
                {/* Üst-alt karartma */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />

                {/* İlerleme çubukları */}
                <div className="absolute inset-x-0 top-0 z-20 flex gap-1 p-3">
                  {items.map((_, i) => (
                    <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{
                          width: i < current ? "100%" : i === current ? undefined : "0%",
                          animation: i === current ? `storyProgress ${DURATION}ms linear forwards` : undefined,
                        }}
                        key={i === current ? `p-${current}` : `s-${i}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Üst bilgi + kapat */}
                <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-3 pt-7">
                  <span
                    className="rounded px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white"
                    style={{ backgroundColor: categoryColor(n.category) }}
                  >
                    {typeof n.category === "object" && n.category ? n.category.name : "Haber"}
                  </span>
                  <button onClick={close} aria-label="Kapat" className="grid h-9 w-9 place-items-center rounded-full text-white/90 hover:bg-white/10">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Başlık */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-5 pb-8">
                  <h3 className="text-lg font-black leading-snug text-white drop-shadow">{n.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-white/70">Habere gitmek için ortaya dokun</p>
                </div>

                {/* Dokunma bölgeleri: sol=önceki, orta=habere git, sağ=sonraki */}
                <div className="absolute inset-0 z-10 flex">
                  <button aria-label="Önceki" className="h-full w-1/3" onClick={prev} />
                  <button aria-label="Habere git" className="h-full w-1/3" onClick={goArticle} />
                  <button aria-label="Sonraki" className="h-full w-1/3" onClick={next} />
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </>
  );
}
