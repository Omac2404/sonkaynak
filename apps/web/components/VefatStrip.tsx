"use client";

type Item = { isim: string; aciklama?: string; haberUrl?: string };

/** Vefat ilanları — minimal/çizgisel kayan şerit. */
export function VefatStrip({ items }: { items: Item[] }) {
  if (!items?.length) return null;
  const duration = Math.max(20, items.length * 8);
  const row = (key: string) => (
    <div className="sk-ticker-row" aria-hidden={key === "clone" ? true : undefined}>
      {items.map((v, i) => {
        const content = (
          <span key={`${key}-${i}`} className="sk-ticker-item !font-normal">
            <span className="font-semibold text-neutral-800">{v.isim}</span>
            {v.aciklama ? ` — ${v.aciklama}` : ""}
            <span className="px-10 text-neutral-300">◆</span>
          </span>
        );
        return v.haberUrl ? (
          <a key={`${key}-${i}`} href={v.haberUrl} className="hover:text-sk-red">
            {content}
          </a>
        ) : (
          content
        );
      })}
    </div>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-sk-line bg-white text-neutral-600">
      <div className="flex items-stretch">
        <span className="flex shrink-0 items-center border-r border-sk-line px-4 text-[11px] font-bold uppercase tracking-wide text-sk-red">
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
