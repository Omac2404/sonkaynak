"use client";

import { useEffect, useState } from "react";
import { mediaUrl } from "@/lib/shared";
import type { Ad } from "@/lib/cms";

/**
 * Sponsorlu reklam alanı — kayan slider.
 * Aynı konumda birden fazla reklam varsa yatay kayarak (slide) geçer; sonsuz
 * döngü için ilk reklamın klonu sona eklenir ve döngü başa sessizce sıçrar.
 * variant: banner (geniş) veya tower (yan kule).
 */
export function AdSlot({
  ads,
  variant = "banner",
  className = "",
  intervalSec = 7,
}: {
  ads: Ad[];
  variant?: "banner" | "tower";
  className?: string;
  intervalSec?: number;
}) {
  const valid = (ads ?? []).filter((a) => mediaUrl(a.image, "feature"));
  const multi = valid.length > 1;
  // Sonsuz döngü için ilk slaytın klonunu sona ekle
  const slides = multi ? [...valid, valid[0]] : valid;

  const [i, setI] = useState(0);
  const [anim, setAnim] = useState(true);

  // Otomatik ilerleme
  useEffect(() => {
    if (!multi) return;
    const ms = Math.max(3, intervalSec) * 1000;
    const t = setInterval(() => setI((p) => p + 1), ms);
    return () => clearInterval(t);
  }, [multi, intervalSec]);

  // Klona ulaşınca (geçiş bitince) animasyonsuz başa dön
  useEffect(() => {
    if (!multi) return;
    if (i === slides.length - 1) {
      const t = setTimeout(() => {
        setAnim(false);
        setI(0);
      }, 650); // geçiş süresiyle uyumlu
      return () => clearTimeout(t);
    }
  }, [i, multi, slides.length]);

  // Animasyonu bir sonraki karede yeniden aç (sıçrama görünmesin)
  useEffect(() => {
    if (anim) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnim(true)));
    return () => cancelAnimationFrame(id);
  }, [anim]);

  if (valid.length === 0) return null;

  const active = i % valid.length;

  const renderSlide = (ad: Ad, key: number) => {
    const src = mediaUrl(ad.image, "feature")!;
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={ad.name} loading="lazy" className="block w-full" />
    );
    return (
      <div key={key} className="w-full shrink-0">
        {ad.targetUrl ? (
          <a href={ad.targetUrl} target="_blank" rel="noopener sponsored nofollow" className="block">
            {img}
          </a>
        ) : (
          img
        )}
      </div>
    );
  };

  return (
    <div className={className}>
      <span className="mb-1 block text-center text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
        Reklam
      </span>
      <div className="overflow-hidden rounded-xl">
        <div
          className="flex"
          style={{
            transform: `translateX(-${i * 100}%)`,
            transition: anim ? "transform 0.6s cubic-bezier(0.4,0,0.2,1)" : "none",
          }}
        >
          {slides.map((ad, idx) => renderSlide(ad, idx))}
        </div>
      </div>
      {multi && (
        <div className="mt-2 flex justify-center gap-1.5">
          {valid.map((a, idx) => (
            <span
              key={a.id}
              className={`h-1.5 rounded-full transition-all ${idx === active ? "w-4 bg-sk-red" : "w-1.5 bg-neutral-300"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
