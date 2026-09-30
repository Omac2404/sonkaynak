"use client";

import { useEffect } from "react";

/**
 * Panelden girilen serbest head kodunu (doğrulama meta'sı, analitik, piksel vb.)
 * çalışır şekilde <head>'e enjekte eder (script'leri yeniden oluşturarak).
 */
export function RawHead({ html }: { html?: string }) {
  useEffect(() => {
    const code = (html ?? "").trim();
    if (!code) return;
    const tmp = document.createElement("div");
    tmp.innerHTML = code;
    const added: Node[] = [];
    Array.from(tmp.childNodes).forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const src = (node as HTMLScriptElement).src;
        const s = document.createElement("script");
        Array.from((node as HTMLElement).attributes).forEach((a) => s.setAttribute(a.name, a.value));
        if (!src) s.textContent = (node as HTMLScriptElement).textContent;
        document.head.appendChild(s);
        added.push(s);
      } else {
        const clone = node.cloneNode(true);
        document.head.appendChild(clone);
        added.push(clone);
      }
    });
    return () => added.forEach((n) => n.parentNode?.removeChild(n));
  }, [html]);
  return null;
}
