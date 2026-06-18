"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const MESSAGES: Record<string, string> = {
  saved: "Kaydedildi ✓",
  deleted: "Çöp kutusuna taşındı",
  removed: "Silindi",
  approved: "Onaylandı ✓",
  rejected: "Reddedildi",
  restored: "Geri yüklendi ✓",
  purged: "Kalıcı olarak silindi",
  uploaded: "Yüklendi ✓",
};

export function Toaster() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [toast, setToast] = useState<{ text: string; kind: "ok" | "err" } | null>(null);

  useEffect(() => {
    const m = params.get("m");
    const e = params.get("e");
    if (!m && !e) return;
    setToast(e ? { text: e, kind: "err" } : { text: MESSAGES[m ?? ""] ?? "İşlem tamamlandı", kind: "ok" });
    // URL'i temizle
    const sp = new URLSearchParams(params.toString());
    sp.delete("m");
    sp.delete("e");
    router.replace(`${pathname}${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, pathname]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-[skToast_.2s_ease-out]">
      <div
        className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-2xl ${
          toast.kind === "err" ? "bg-sk-red" : "bg-neutral-900"
        }`}
      >
        <span className="text-base">{toast.kind === "err" ? "⚠️" : "✅"}</span>
        {toast.text}
      </div>
    </div>
  );
}
