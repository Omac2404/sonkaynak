"use client";

import { useEffect, useState } from "react";
import { mediaUrl } from "@/lib/shared";
import type { Ad } from "@/lib/cms";

/**
 * Sponsorlu reklam alanı. Aynı konumda birden fazla reklam varsa alt alta
 * değil, tek slotta belirlenen saniyede otomatik geçişle (fade) dönüşümlü gösterir.
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
  const [i, setI] = useState(0);

  useEffect(() => {
    if (valid.length < 2) return;
    const ms = Math.max(3, intervalSec) * 1000;
    const t = setInterval(() => setI((p) => (p + 1) % valid.length), ms);
    return () => clearInterval(t);
  }, [valid.length, intervalSec]);

  if (valid.length === 0) return null;

  const ad = valid[i % valid.length];
  const src = mediaUrl(ad.image, "feature")!;
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={ad.name}
      loading="lazy"
      className={variant === "tower" ? "w-full rounded-lg" : "mx-auto max-w-full rounded-lg"}
    />
  );

  return (
    <div className={className}>
      <span className="mb-1 block text-center text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-300">
        Reklam
      </span>
      <div key={ad.id} className="animate-[skAdFade_.5s_ease]">
        {ad.targetUrl ? (
          <a href={ad.targetUrl} target="_blank" rel="noopener sponsored nofollow">
            {img}
          </a>
        ) : (
          img
        )}
      </div>
      {valid.length > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {valid.map((a, idx) => (
            <span
              key={a.id}
              className={`h-1.5 w-1.5 rounded-full transition ${idx === i % valid.length ? "bg-sk-red" : "bg-neutral-300"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
