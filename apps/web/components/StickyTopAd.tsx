"use client";

import { useEffect, useState } from "react";
import { AdSlot } from "./AdSlot";
import type { Ad } from "@/lib/cms";

/**
 * Üst reklam: sayfayı aşağı kaydırınca ekranın en tepesine, düşük opaklıkta
 * siyah zeminle kayarak (slide-down) gelen sabit bar (Hürriyet tarzı). Kapatılabilir.
 */
export function StickyTopAd({ ads, intervalSec = 7 }: { ads: Ad[]; intervalSec?: number }) {
  const [show, setShow] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!ads?.length || closed) return null;

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[80] transition-transform duration-300 ease-out ${
        show ? "translate-y-0" : "pointer-events-none -translate-y-full"
      }`}
      aria-hidden={!show}
    >
      <div className="bg-black/55 backdrop-blur-sm shadow-lg">
        <div className="relative mx-auto max-w-[980px] px-3 py-2 sm:px-4">
          <AdSlot ads={ads} variant="banner" intervalSec={intervalSec} />
          <button
            type="button"
            onClick={() => setClosed(true)}
            aria-label="Reklamı kapat"
            className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-sm font-bold text-white transition hover:bg-black/80"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
