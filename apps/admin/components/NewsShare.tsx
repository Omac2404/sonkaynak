"use client";

import { useState } from "react";

const P = {
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  fb: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  ig1: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.38C1.35 2.67.94 3.34.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13.67.66 1.34 1.07 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.38.66-.67 1.07-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.31-.79-.72-1.46-1.38-2.13C21.33 1.35 20.66.94 19.86.63 19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0z",
  ig2: "M12 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84M12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4z",
  ig3: "M18.41 4.15a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z",
};

function XIcon({ s = 16 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d={P.x} />
    </svg>
  );
}
function FbIcon({ s = 16 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d={P.fb} />
    </svg>
  );
}
function IgIcon({ s = 16 }: { s?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor">
      <path d={P.ig1} />
      <path d={P.ig2} />
      <path d={P.ig3} />
    </svg>
  );
}

/** Haberi X / Facebook'ta paylaş, Instagram için başlık+linki panoya kopyala. */
export function NewsShare({ url, title, compact = false }: { url: string; title: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const xHref = `https://twitter.com/intent/tweet?text=${t}&url=${u}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${u}`;

  const igShare = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n${url}`);
    } catch {
      /* pano erişimi yoksa yoksay */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    window.open("https://www.instagram.com/", "_blank", "noopener");
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <a
          href={xHref}
          target="_blank"
          rel="noopener noreferrer"
          title="X'te paylaş"
          className="grid h-7 w-7 place-items-center rounded-md border border-neutral-200 text-neutral-600 transition hover:border-black hover:bg-black hover:text-white"
        >
          <XIcon s={13} />
        </a>
        <a
          href={fbHref}
          target="_blank"
          rel="noopener noreferrer"
          title="Facebook'ta paylaş"
          className="grid h-7 w-7 place-items-center rounded-md border border-neutral-200 text-neutral-600 transition hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white"
        >
          <FbIcon s={13} />
        </a>
        <button
          type="button"
          onClick={igShare}
          title={copied ? "Kopyalandı" : "Instagram için başlık+linki kopyala"}
          className="grid h-7 w-7 place-items-center rounded-md border border-neutral-200 text-neutral-600 transition hover:border-[#E4405F] hover:bg-[#E4405F] hover:text-white"
        >
          {copied ? <span className="text-[11px] font-black text-green-600">✓</span> : <IgIcon s={13} />}
        </button>
      </div>
    );
  }

  const btn =
    "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm font-bold transition";
  return (
    <div className="space-y-2">
      <a href={xHref} target="_blank" rel="noopener noreferrer" className={`${btn} border-neutral-200 text-neutral-700 hover:border-black hover:bg-black hover:text-white`}>
        <XIcon /> X&apos;te Paylaş
      </a>
      <a href={fbHref} target="_blank" rel="noopener noreferrer" className={`${btn} border-neutral-200 text-neutral-700 hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white`}>
        <FbIcon /> Facebook&apos;ta Paylaş
      </a>
      <button type="button" onClick={igShare} className={`${btn} w-full border-neutral-200 text-neutral-700 hover:border-[#E4405F] hover:bg-[#E4405F] hover:text-white`}>
        <IgIcon /> {copied ? "Kopyalandı ✓ — Instagram açıldı" : "Instagram için Kopyala"}
      </button>
      <p className="text-[11px] leading-snug text-neutral-400">
        Instagram hazır metinle paylaşıma izin vermez; başlık + link panoya kopyalanır, Instagram açılır, yapıştırıp paylaşırsınız.
      </p>
    </div>
  );
}
