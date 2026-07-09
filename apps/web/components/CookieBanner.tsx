"use client";

import { useEffect, useState } from "react";

export function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem("cookieConsent")) setShow(true);
    } catch {
      /* yoksay */
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem("cookieConsent", "1");
    } catch {
      /* yoksay */
    }
    setShow(false);
  };

  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-sk-line bg-white p-4 shadow-2xl">
      <div className="mx-auto flex max-w-[1360px] flex-col items-center gap-3 sm:flex-row">
        <p className="text-[13px] leading-relaxed text-neutral-600">
          Deneyiminizi iyileştirmek, içerikleri kişiselleştirmek ve trafiği analiz etmek için çerezler kullanıyoruz.
          Detaylar için{" "}
          <a href="/cerez-politikasi" className="font-semibold text-sk-red underline">
            Çerez Politikası
          </a>{" "}
          ve{" "}
          <a href="/gizlilik" className="font-semibold text-sk-red underline">
            KVKK
          </a>{" "}
          metnini inceleyebilirsiniz.
        </p>
        <div className="flex shrink-0 gap-2 sm:ml-auto">
          <a
            href="/cerez-politikasi"
            className="rounded-lg border border-sk-line px-4 py-2 text-[13px] font-bold text-neutral-600 transition hover:bg-neutral-50"
          >
            Detaylar
          </a>
          <button
            onClick={accept}
            className="rounded-lg bg-sk-red px-5 py-2 text-[13px] font-bold text-white transition hover:bg-sk-red-dark"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
