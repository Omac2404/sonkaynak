"use client";

import { useEffect } from "react";

/** Haber 4 sn görüntülendiyse okunma sayacını artırır (oturumda haber başına bir kez). */
export function ViewTracker({ id }: { id: number }) {
  useEffect(() => {
    if (!id) return;
    const key = `sk-viewed-${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      /* yoksay */
    }
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* yoksay */
      }
      fetch("/api/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        keepalive: true,
      }).catch(() => {});
    }, 4000);
    return () => clearTimeout(t);
  }, [id]);
  return null;
}
