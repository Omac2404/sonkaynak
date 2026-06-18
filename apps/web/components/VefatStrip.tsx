"use client";

type Item = { isim: string; aciklama?: string; haberUrl?: string };

/** Vefat ilanları — kayan şerit (ticker animasyonunu yeniden kullanır). */
export function VefatStrip({ items }: { items: Item[] }) {
  if (!items?.length) return null;
  const duration = Math.max(20, items.length * 8);
  const row = (key: string) => (
    <div className="sk-ticker-row" aria-hidden={key === "clone" ? true : undefined}>
      {items.map((v, i) => {
        const content = (
          <span key={`${key}-${i}`} className="sk-ticker-item">
            🕊 <strong>{v.isim}</strong>
            {v.aciklama ? ` — ${v.aciklama}` : ""}
            <span className="sk-ticker-sep">◆</span>
          </span>
        );
        return v.haberUrl ? (
          <a key={`${key}-${i}`} href={v.haberUrl}>
            {content}
          </a>
        ) : (
          content
        );
      })}
    </div>
  );

  return (
    <div className="overflow-hidden rounded-lg bg-neutral-800 text-white">
      <div className="flex items-stretch">
        <span className="flex shrink-0 items-center bg-black px-4 text-[11px] font-extrabold uppercase tracking-wide">
          Vefat
        </span>
        <div className="sk-ticker-viewport">
          <div className="sk-ticker-track" style={{ animationDuration: `${duration}s` }}>
            {row("a")}
            {row("clone")}
          </div>
        </div>
      </div>
    </div>
  );
}
