"use client";

import { useState } from "react";

type State = "idle" | "loading" | "ok" | "error";

/** Bülten kayıt bloğu (footer + haber altı). compact=footer için ince varyant. */
export function Newsletter({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("ok");
        setMsg("Teşekkürler! Bültene kaydoldunuz.");
        setEmail("");
      } else {
        setState("error");
        setMsg(data?.error || "Kayıt başarısız oldu.");
      }
    } catch {
      setState("error");
      setMsg("Bağlantı hatası.");
    }
  };

  if (state === "ok") {
    return (
      <p className={`flex items-center gap-2 font-bold ${compact ? "text-sm text-white/90" : "text-sk-ink"}`}>
        <span className="text-green-500">✓</span> {msg}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? "" : "rounded-xl border border-sk-line bg-white p-5"}>
      {!compact && (
        <>
          <h3 className="text-lg font-black text-sk-ink">📩 Günün özeti e-postanızda</h3>
          <p className="mt-1 text-sm text-neutral-500">Öne çıkan haberleri her sabah alın. İstediğiniz an çıkabilirsiniz.</p>
        </>
      )}
      <div className={`flex gap-2 ${compact ? "mt-0" : "mt-3"}`}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresiniz"
          className={`min-w-0 flex-1 rounded-lg border px-3.5 py-2.5 text-sm outline-none transition focus:border-sk-red focus:ring-4 focus:ring-sk-red/10 ${
            compact
              ? "border-white/20 bg-white/10 text-white placeholder:text-white/50"
              : "border-sk-line bg-white text-sk-ink placeholder:text-neutral-500"
          }`}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="shrink-0 rounded-lg bg-sk-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-sk-red-dark disabled:opacity-60"
        >
          {state === "loading" ? "…" : "Abone Ol"}
        </button>
      </div>
      {state === "error" && <p className="mt-2 text-xs font-semibold text-sk-red">{msg}</p>}
    </form>
  );
}
