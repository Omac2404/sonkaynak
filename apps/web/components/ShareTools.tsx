"use client";

import { useState } from "react";

/* ── SVG yolları ── */
const P = {
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  fb: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  wa: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884",
  tg: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
  mail: "M0 3v18h24V3H0zm21.518 2L12 12.713 2.482 5h19.036zM2 7.183l10 8.104 10-8.104V19H2V7.183z",
  link: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
  check: "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
};

type IconDef = { name: string; d: string; color: string; href?: string; action?: "copy" };

function useShareLinks(url: string, title: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const items: IconDef[] = [
    { name: "X", d: P.x, color: "#000000", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { name: "Facebook", d: P.fb, color: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "WhatsApp", d: P.wa, color: "#25D366", href: `https://api.whatsapp.com/send?text=${t}%20${u}` },
    { name: "Telegram", d: P.tg, color: "#229ED9", href: `https://t.me/share/url?url=${u}&text=${t}` },
    { name: "E-posta", d: P.mail, color: "#EA4335", href: `mailto:?subject=${t}&body=${t}%0A%0A${u}` },
    { name: "Bağlantıyı kopyala", d: P.link, color: "#d4141c", action: "copy" },
  ];
  return items;
}

function IconLink({ item, size, onCopy, copied }: { item: IconDef; size: number; onCopy: () => void; copied: boolean }) {
  const isCopy = item.action === "copy";
  const showCheck = isCopy && copied;
  const cls = `sk-share grid place-items-center rounded-lg border border-sk-line text-neutral-600 transition hover:scale-105`;
  const style = { ["--c" as any]: showCheck ? "#16a34a" : item.color, width: size, height: size };
  const icon = (
    <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="currentColor">
      <path d={showCheck ? P.check : item.d} />
    </svg>
  );
  if (isCopy) {
    return (
      <button type="button" onClick={onCopy} aria-label={showCheck ? "Kopyalandı" : item.name} className={cls} style={style}>
        {icon}
      </button>
    );
  }
  return (
    <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.name} ile paylaş`} className={cls} style={style}>
      {icon}
    </a>
  );
}

/** Yatay, satır içi paylaşım barı (kopyala + toast dahil). */
export function ShareBar({ url, title, showLabel = true }: { url: string; title: string; showLabel?: boolean }) {
  const items = useShareLinks(url, title);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* yoksay */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="flex items-center gap-2">
      {showLabel && <span className="mr-1 text-[11px] font-bold uppercase tracking-wide text-neutral-400">Paylaş</span>}
      {items.map((it) => (
        <IconLink key={it.name} item={it} size={36} onCopy={copy} copied={copied} />
      ))}
    </div>
  );
}

/** Masaüstünde makalenin solunda sabit dikey paylaşım rayı. */
export function StickyShare({ url, title }: { url: string; title: string }) {
  const items = useShareLinks(url, title);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* yoksay */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="pointer-events-none fixed left-[max(1rem,calc(50%-620px))] top-1/2 z-40 hidden -translate-y-1/2 xl:block">
      <div className="pointer-events-auto flex flex-col gap-2">
        {items.map((it) => (
          <IconLink key={it.name} item={it} size={40} onCopy={copy} copied={copied} />
        ))}
      </div>
    </div>
  );
}
